# Worker: design

Date: 2026-11-09. Status: draft for review.

## Intent

Give tslang programs the shape of the Web Worker API from MDN
(<https://developer.mozilla.org/en-US/docs/Web/API/Worker>): a worker that runs on its own thread
and talks to the thread that made it only through messages, with `postMessage`, `onmessage`,
`onerror`, `close()` and `terminate()`. Code written against the browser API should port with
small, mechanical changes, and code that needs plain threads keeps using `Thread.spawn`.

It sits on what is already on `main`: `Thread.spawn` / `join` (`src/generics/lib.generics.ts`,
`src/wrappers/thread.cpp`), `Atomics.wait` / `notify`, and the compiler's `Shared<T>`.

## What tslang does not have, and what that forces

- **No event loop.** There is no `setTimeout`, no microtask queue, and `Promise<T>` is taken as
  `T`. In a browser, messages arrive "later" on the main thread by themselves; here nothing runs
  unless the program calls something. So the main thread has to *ask* for its messages (see
  "Delivery on the creating thread"). Inside the worker the library owns the thread, so it can run
  the loop for the program.
- **No scripts or URLs to load.** `new Worker("worker.js")` has nothing to load. The worker's code
  is a function, as with `Thread.spawn`.
- **No structured clone.** There is no run-time reflection to deep-copy an arbitrary object. A
  message is handed over instead of copied (see "Messages").
- **Four memory models.** Everything must build and pass under `-mm=gc`, `rc`, `none` and `own`,
  as the thread tests do.

## Goals

1. `new Worker<In, Out>(body)` starts a worker on a new thread. `body(self)` runs first on that
   thread, sets `self.onmessage` (and may post), and returns; the library then delivers messages to
   `self.onmessage` until the worker closes.
2. Both directions: `worker.postMessage(m: In)` and `self.postMessage(m: Out)`; messages arrive in
   the order they were posted.
3. Creating-thread delivery to `worker.onmessage` / `worker.onerror` by an explicit call, plus a
   blocking pull for programs that prefer it.
4. `self.close()` (worker ends itself after the current handler) and `worker.terminate()` (creator
   ends it); both join the native thread so nothing is left running.
5. An exception thrown out of `body` or out of a worker-side `onmessage` reaches the creator as an
   error event with the message; the worker keeps handling later messages, as browsers do.
6. Works under all four memory models, with any per-model limits written down, as `Thread` does.

## Non-goals (this design)

- Loading a script by URL, module workers, `importScripts`, `SharedWorker`, `ServiceWorker`.
- Deep-copy structured clone and the transfer list argument of `postMessage`.
- `MessageChannel` / `MessagePort` as separate objects (the queue type below is built so they can
  be added later).
- `addEventListener` / `removeEventListener` / `EventTarget`. Only the `on...` properties.
- `Atomics.waitAsync`, timers, a general event loop.
- Stopping a worker in the middle of running code.

## Anti-goals (would be a failure even if it ran)

- A worker that can keep the process alive or crash it at exit because nobody joined it, without
  the README saying so plainly.
- A message object reachable only from C++ memory: under `-mm=gc` the collector cannot see it and
  frees it while it is queued; under `-mm=rc` nothing holds a count on it.
- Silently different behaviour per memory model. Where a model can't do something, it must fail
  to compile or be listed in the README, as the `Thread` notes are.
- A busy-wait: a worker with no messages, or a creator waiting for one, must sleep
  (`Atomics.wait`), not spin.

## The API

```ts
const worker = new Worker<int, string>((self: WorkerScope<int, string>) => {
    self.onmessage = (e: MessageEvent<int>) => {
        self.postMessage(`squared: ${e.data * e.data}`);
        if (e.data == 3) self.close();
    };
});

worker.onmessage = (e: MessageEvent<string>) => print(e.data);
worker.onerror = (e: ErrorEvent) => print(`worker failed: ${e.message}`);

worker.postMessage(1);
worker.postMessage(2);
worker.postMessage(3);

worker.join();     // delivers every message until the worker closes, then joins its thread
```

### `Worker<In, Out>` (the creating thread's side)

| Member | Behaviour |
|---|---|
| `constructor(body: (self: WorkerScope<In, Out>) => void, name?: string)` | Starts the thread through the same native entry `Thread.spawn` uses. `name` is a plain string, not MDN's `{ name }` options object (my call in step 2: the options object had nothing else in it). |
| `postMessage(message: In): void` | Queues the message for the worker. After `terminate()` or after the worker closed, it is dropped silently, as in browsers. |
| `onmessage: (e: MessageEvent<Out>) => void` | Called by `dispatch()` / `join()` for each message from the worker. |
| `onerror: (e: ErrorEvent) => void` | Called the same way for each error the worker reported. With no handler, the error is printed to stderr and dropped (browsers log it to the console). |
| `dispatch(timeout?: number): int` | Delivers every event already queued; if none is queued, waits up to `timeout` ms (none given: does not wait) for one. Returns how many it delivered. |
| `receive(timeout?: number): MessageEvent<Out> \| undefined` | The pull form: takes the next message without calling `onmessage`; `undefined` on timeout or when the worker has closed and its queue is empty. Errors still go to `onerror`. |
| `join(): void` | Delivers events until the worker has closed, then joins the thread. Waits forever for a worker that never calls `close()`, which is most browser code; such a worker is ended with `terminate()`. |
| `terminate(): void` | Asks the worker to stop, drops the messages toward the worker it has not handled yet, and joins the thread. Waits for a running handler to return. Events the worker posted toward the creator and not yet delivered are dropped too: after `terminate()` returns, `onmessage` / `onerror` are never called again for this worker (as in browsers). Idempotent. |
| `closed: boolean` (read-only) | True once the worker has ended and its queue toward the creator is empty. |

`dispatch`, `receive` and `join` are not in the browser API; they stand in for the event loop. Two
shapes:

- the worker ends itself with `self.close()`: the creator calls `worker.join()` at the end;
- the worker never closes (the usual browser shape): the creator calls `dispatch(timeout)` in its
  own loop until it has what it needs, then `worker.terminate()`.

### `WorkerScope<In, Out>` (the worker's side, MDN's `DedicatedWorkerGlobalScope`)

| Member | Behaviour |
|---|---|
| `postMessage(message: Out): void` | Queues the message for the creator. |
| `onmessage: (e: MessageEvent<In>) => void` | Called by the library's loop for each message. |
| `close(): void` | The loop stops after the handler that called it returns; messages still queued for the worker are dropped. Messages it already posted still reach the creator. |
| `name: string` | The constructor's optional second argument, as MDN's `options.name`. |

It is passed to `body` as a parameter instead of being the global `self`, because there is one
program-wide global scope here. Naming the parameter `self` keeps ported code reading the same.

### Events

- `MessageEvent<T>`: `data: T`. (`origin`, `ports`, `source` are not provided.)
- `ErrorEvent`: `message: string`. (`filename`, `lineno`, `colno` are not provided.) Built from a
  message string, never from the thrown object, for the same reason `ThreadHandle.join` builds a
  new `Error`: under `-mm=own` the thrown object belongs to the worker thread.

## How it works

### The worker thread

The constructor spawns a thread whose entry does:

1. call `body(scope)`; if it throws, post an error event to the creator and stop the worker
   (browsers fail the worker when its script throws at top level).
2. loop: wait for the next message toward the worker, or for a stop request; call
   `scope.onmessage(event)` inside a `try`; on a throw, post an error event and continue.
3. leave the loop when `close()` or `terminate()` was called; then mark the worker ended and wake
   the creator. (Nothing notices a creator that dropped its `Worker` without ending it: there is no
   finalizer to rely on under every model. See "Ending the program".)

A worker whose `body` sets no `onmessage` still runs `body` and then waits for messages; messages
that arrive with no handler are dropped. (My call: matches browsers, where a worker with no
handler simply ignores messages.)

### The queues

Two one-way queues per worker: creator → worker and worker → creator. Each queue holds events
(a message or an error) in order, and has one lock word and one "something changed" word.

**My call: build the queue in TypeScript**, as a class in `lib.generics.ts` that keeps its events in
an ordinary TS array, guarded by a lock taken with `Atomics.compareExchange` on an `Int32Array`
held in a `Shared`, and sleeps with `Atomics.wait` / wakes with `Atomics.notify`. The reason is the
anti-goal above: events kept in TS memory stay visible to the collector under `gc`, keep their
counts under `rc` (`Shared.share`), and move under `own`, with no new runtime code. A C++ queue
(mutex and condition variable in `thread.cpp`) would be simpler to make correct, but every pointer
it holds would need extra handling per memory model (an uncollectable allocation under `gc`, an
explicit retain/release under `rc`). Step 1 built it this way and it holds objects under every
model, `own` included (see "Memory models"), so the C++ fallback is not needed.

The queue is its own class (`MessageQueue<T>` or similar, not exported in the README at first) so
`MessageChannel` / `MessagePort` can be built on it later.

### Messages: handed over, not copied

`postMessage(m)` puts `m` itself in the queue. Under `-mm=own` that is a move, so the sender can't
use `m` afterwards: `MessageQueue.push` keeps its argument, and using it after the push is a compile
error ("used here after its value was moved"; checked in step 1). Under `gc`, `rc` and `none` the sender *can* still reach
`m`, and the README says not to change a message after posting it (the same as passing an object
in a browser's transfer list). Under `-mm=rc` the message is `Shared.share`d before it is queued, so
its count changes atomically. `Shared.share` marks every counted block the value reaches (the
compiler's `mlirGenSharedShare`), so a message's fields are covered too, not just the object itself.

Numbers, booleans and strings behave the same as in a browser, since they are values or immutable.
For a real copy the program can post `JSON.stringify(x)` and `JSON.parse` it on the other side; the
README shows that. A deep `structuredClone` is a non-goal here.

### `terminate()` without killing a thread

A native thread can't be stopped safely in the middle of TypeScript code (it may hold a lock or be
mid-allocation). So `terminate()` sets the stop flag, wakes the worker if it is waiting, drops the
queued messages toward the worker, and joins. A handler that never returns makes `terminate()`
wait forever; the README says so. This is the one place the behaviour differs in kind from
browsers, which kill the worker at once.

### Ending the program

Every worker has to be joined or terminated before `main` returns, as every `Thread` has to be
joined today. (My call: there is no finalizer to rely on under every memory model, so this is a
documented rule, not enforced.) A test checks that `join()` and `terminate()` each leave nothing
running.

## Memory models

| | gc | rc | none | own |
|---|---|---|---|---|
| Thread registration | as `Thread` (registered with the collector) | as `Thread` | as `Thread` | as `Thread` |
| Messages | shared object, collector sees it in the TS queue | `Shared.share`d before queuing | shared object, never freed | moved into the queue, moved out to the event |
| Handlers capturing creator-side objects | allowed | allowed (shared) | allowed | captured values move with the handler; a local used again after the handler is set is a compile error, so shared state goes through a `Shared<T>` |

What step 1 (`MessageQueue<T>`, `tests/message_queue.ts`) settled, in release builds, compiled and
under the JIT:

- **Objects as messages work under `own`**, without `Shared<T>`: class instances go through a plain
  `T[]` inside the queue and come out whole, both ways between two threads.
- **A push moves** under `own` (above).
- **Both threads reach the queue through a `const` `Shared<MessageQueue<T>>`** each function
  captures, under every model, as threads sharing an `Int32Array` do.

What step 2 (`Worker`, `WorkerScope`, `MessageEvent`; `tests/worker_echo.ts`,
`tests/worker_objects.ts`) settled, the same way:

- **The browser shape works in the worker under every model**, `own` included: `body` sets
  `self.onmessage = (e) => { self.postMessage(...); self.close(); }`, a handler capturing `self`.
- **The worker can't start through a closure given to `Thread.spawn` under `own`**: the closure
  can't take `body`, a parameter of the `Worker` constructor, with it ("its value is the caller's").
  So `Worker` keeps a `WorkerStart` object (the function, both queue handles, the name) and starts
  the thread with `tslang_thread_spawn` itself, as `ThreadHandle` does with its `ThreadStart`. The
  constructor is `@keeps("body", "name")`.
- **`onmessage` is always a function** (a no-op until set), on both sides, not an optional field:
  calling it only when set moves the message on some paths only, which `own` rejects.
- **(Step 2 only, replaced by step 3:)** a throw ended the worker and `join()` threw it. The queues
  are closed in a `finally`, so a throw never leaves the creator waiting; that part stays.
- **A tslang crash** found on the way: the first `Worker` started its thread from a closure in the
  constructor; with a field initializer (`private joined = false`) in that class, the program died
  with an access violation under `gc`, `rc` and `none`, and assigning the field in the constructor
  instead made it run. A cut-down class does not show it, so the repro is the full one:
  [known-issues-worker-ctor-initializer.md](known-issues-worker-ctor-initializer.md). The
  `WorkerStart` shape does not hit it.

What step 3 (`ErrorEvent`, `onerror`; `tests/worker_errors.ts`) settled, the same way:

- **One queue toward the creator carries both kinds of event**, as the event objects themselves:
  `MessageQueue<MessageEvent<Out> | ErrorEvent>` (`type WorkerPost<Out>`). Errors arrive in order
  with the messages, and `join()` / `receive()` tell them apart with `instanceof ErrorEvent`.
- **An envelope with a `data: T | undefined` field does not work under `own`**: the message can't be
  moved out of the field (a plain move is "borrows a field"; a destructuring swap works for a string
  but not for a class instance). Queueing the events themselves moves nothing out of a field.
- **What is thrown becomes text**: an `Error`'s `message`, or anything else as `${e}`. Under `own`
  the text is borrowed from the thrown object, so `WorkerScope.postError` copies it.
- **The default `onerror` writes `Worker error: <message>` to stderr** with `console.error`. The
  test runner counts any stderr as a failure, so `worker_errors` sets `onerror` everywhere.
- `ErrorEvent` is in `src/core/core.ts` and `core.d.ts`, next to `SyntaxError`.
- `receive(timeout)` hands errors to `onerror` on the way to the next message and waits up to
  `timeout` again after each; the timeout is per wait, not overall.

What step 4 (`terminate()`, `dispatch()`; `tests/worker_terminate.ts`) settled, the same way:

- **`terminate()` stops the worker by closing its queue, not by a flag**: `MessageQueue.discard()`
  closes the queue toward the worker and drops what is in it under one lock, so the worker's next
  `take()` gives nothing and its loop ends after the handler running now. Then the thread is joined
  and the queue toward the creator is discarded the same way, so nothing it posted is delivered
  afterwards and `closed` is true. `postMessage` after it is ignored (the queue is closed), and a
  second `terminate()` or a `join()` after it does nothing.
- **`dispatch(timeout?)`** waits up to `timeout` for the first event only (none given: no wait),
  then delivers whatever else has already arrived, and returns how many it delivered.
- **Under `own`, sharing state with a worker's handler** (checked on the tslang of 2026-11-09,
  16:05):
  - the handler can't capture what the worker's function captured from the creating thread (the
    function only lends its captures, and the handler is kept past the call: "borrows a field");
  - taking a second handle inside the function first works: `const counter = handled;` (a
    `Shared<T>`), then the handler captures `counter`;
  - but **once the worker's function captures anything from the creating thread, a handler that
    captures `self` does not compile** ("a closure that escapes owns what it captures, but -mm=own
    cannot move this variable into it: its value is the caller's"), whether or not it also captures
    `counter`. A worker whose function captures nothing (all of `worker_echo`) is fine.

  So under `own` a worker's handler can use state shared with the creator, or post with `self`, not
  both. `worker_terminate` tests each shape on its own. Ways out, none taken yet: give `onmessage` the
  scope as a second argument again (step 2 had it), so a handler can post without capturing `self`;
  or pass the shared state in a message. The README should name the limit. It looks like a compiler
  limit rather than a rule, so it may be worth taking to the compiler repo.

Still open: **a handler on the creating thread that captures a local.** Under `-mm=own` a closure
stored in an object takes what it captures with it, so this is a compile error:

```ts
let total = 0;
worker.onmessage = (e) => { total += e.data; };   // the closure escapes into the Worker
print(total);   // error: 'total' is captured by a closure that escapes, and is still used here
```

The creator's handler has to keep its state somewhere both can reach: a `Shared<T>` it captures, or
a field of an object the handler alone owns, or it can use `receive()` instead of `onmessage`.
`tests/worker_echo.ts` collects into a `Shared<T>` the handler captures, which works under every
model; the README example should do the same and name the limit.

## Order of work

1. **Done:** `MessageQueue<T>` (`push`, `take(timeout?)`, `close`, `clear`, `closed`, `length`) in
   `lib.generics.ts`, and `tests/message_queue.ts`, where two threads pass 10 000 numbers, strings
   and class instances through it in order, under all four models.
2. **Done:** `Worker` / `WorkerScope` / `MessageEvent` with `postMessage`, `onmessage`, `receive`,
   `join`, `close`, `closed`, `name`, in `lib.generics.ts`; `tests/worker_echo.ts` (numbers in,
   strings out, posting from `body`, `receive` timing out, a handler that throws) and
   `tests/worker_objects.ts` (1 000 class instances each way).
3. **Done:** `ErrorEvent`, `Worker.onerror`; a throw from a handler is an error event and the worker
   goes on, a throw from `body` is an error event and the worker ends; `tests/worker_errors.ts`.
4. **Done:** `terminate()`, `dispatch(timeout)`, `MessageQueue.discard()`;
   `tests/worker_terminate.ts`.
5. README section, next to `Thread`, and the CI matrix picking up the new tests.

## Tests (each runs under gc, rc, none and own unless it says otherwise)

- `worker_echo`: the example above; numbers in, strings out, order kept, `close()` from inside.
- `worker_objects`: a class instance as a message both ways (lists the `own` limit if there is one).
- `worker_errors`: a throw from `body`, a throw from a handler (the worker keeps going), a thrown
  string. (No `onerror` set, printed to stderr, is not in the test: the runner fails on stderr.)
- `worker_terminate`: `dispatch()` from the creator's loop, then terminate a worker that never
  closes; terminate while 1 000 messages are queued for a slow worker (most are dropped); terminate
  while a slow worker's replies are arriving (none is delivered afterwards); `postMessage`,
  `dispatch`, `receive`, `join` and `terminate` after terminate; terminate an idle worker and one that
  already closed.
- `worker_many`: `Thread.hardwareConcurrency()` workers each summing a slice, results gathered with
  `receive()`.
- `worker_gc_collect` (gc only): `GC_gcollect()` while messages are queued; they arrive intact.

## Where the code goes

`Worker`, `WorkerScope`, `MessageEvent` and the queue are generic and go in
`src/generics/lib.generics.ts` next to `Thread`. `ErrorEvent` is not generic, so it is in
`src/core/core.ts` next to `Error`, declared in `core.d.ts` (every class and namespace function in
`lib.generics.ts` carries a type parameter; see the comment on `Atomics.isLockFree`).

## Left to the builder

- `MessageQueue.take` takes items out with `shift()`, which is O(n) in what is queued. Fine at
  10 000 items; a ring buffer is the change if a worker ever falls far behind.
- (Settled: `receive` returns `MessageEvent<Out> | undefined` as written; `MessageQueue.take`
  returns `T | undefined` and compiles under every model.)
