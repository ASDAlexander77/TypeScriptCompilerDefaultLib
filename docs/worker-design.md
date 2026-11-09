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
| `constructor(body: (self: WorkerScope<In, Out>) => void)` | Starts the thread (through `Thread.spawn` or the same native entry). |
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
| `name: string` | From an optional `{ name }` second constructor argument, as MDN's `options.name`. |

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
explicit retain/release under `rc`). If the TS queue can't be made to hold objects under `-mm=own`,
the builder should fall back to the C++ queue for the locking and waiting only, still keeping the
events themselves in a TS array.

The queue is its own class (`MessageQueue<T>` or similar, not exported in the README at first) so
`MessageChannel` / `MessagePort` can be built on it later.

### Messages: handed over, not copied

`postMessage(m)` puts `m` itself in the queue. Under `-mm=own` that is expected to be a move, so the
sender can't use `m` afterwards. Not yet checked: whether a method parameter stored into a field
(the queue's array) moves or is only lent (the README says `ThreadHandle.join()` *lends* its result);
this is on the `own` find-out list below. Under `gc`, `rc` and `none` the sender *can* still reach
`m`, and the README says not to change a message after posting it (the same as passing an object
in a browser's transfer list). Under `-mm=rc` the message is `Shared.share`d before it is queued, so
its count changes atomically.

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
| Handlers capturing creator-side objects | allowed | allowed (shared) | allowed | captured values move into the worker; sharing goes through a `Shared<T>`, as with `Thread` |

What the `own` column can actually do is the main thing to find out first: an object as `In`/`Out`
(the README says `own` array elements are "values, strings, `any` or `Shared<T>` handles", so an
object may have to go in as a `Shared<T>`), whether `postMessage` moves its argument into the queue
or only lends it, and a handler stored in a field and called later; anything that does not work goes in the README
as a limit, as the `Thread` notes do today.

## Order of work

1. The queue, with a test that two threads pass 10 000 numbers, strings and class instances
   through it in order, under all four models. The class instances are there to settle the `own`
   questions above before anything is built on the queue.
2. `Worker` / `WorkerScope` with `postMessage`, `onmessage`, `receive`, `join`, `close`.
3. Errors: `onerror`, throws from `body` and from handlers.
4. `terminate()` and `dispatch(timeout)`.
5. README section, next to `Thread`, and the CI matrix picking up the new tests.

## Tests (each runs under gc, rc, none and own unless it says otherwise)

- `worker_echo`: the example above; numbers in, strings out, order kept, `close()` from inside.
- `worker_objects`: a class instance as a message both ways (lists the `own` limit if there is one).
- `worker_errors`: a throw from `body`, a throw from a handler (the worker keeps going), no
  `onerror` set (printed to stderr).
- `worker_terminate`: terminate a waiting worker; terminate while messages are queued (they are
  dropped); `postMessage` after terminate is ignored; terminate twice.
- `worker_many`: `Thread.hardwareConcurrency()` workers each summing a slice, results gathered with
  `receive()`.
- `worker_gc_collect` (gc only): `GC_gcollect()` while messages are queued; they arrive intact.

## Where the code goes

`Worker`, `WorkerScope`, `MessageEvent` and the queue are generic and go in
`src/generics/lib.generics.ts` next to `Thread`. `ErrorEvent` is not generic, so it goes in
`src/lib.ts` with the other non-generic classes (`JsonValue`, `Response`), or in `src/core/core.ts`
next to `Error` (every class and namespace function in `lib.generics.ts` carries a type parameter;
see the comment on `Atomics.isLockFree`).

## Left to the builder

- Exact names of the queue class and its internals; whether the worker's entry reuses
  `ThreadHandle` or calls `tslang_thread_spawn` directly.
- Whether `onmessage` / `onerror` are optional fields or fields with no-op defaults (whichever the
  compiler handles in a generic class; note the known crash with `cond ? <T>x : undefined` in a
  generic class, use `if`/`else`).
- How `receive` returns "nothing" if `MessageEvent<Out> | undefined` doesn't compile in a generic
  class under some model (a `tryReceive` returning a boolean plus an out field is fine).
- The `{ name }` option can be dropped if it costs anything.
