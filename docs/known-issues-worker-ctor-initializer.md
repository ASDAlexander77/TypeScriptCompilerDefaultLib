# Known issue: a field initializer crashes a generic class that spawns a thread from its constructor

## Status: open, not fixed; worked around in `Worker`

## Summary

Under `-mm=gc`, `rc` and `none` (release, `tslang` of 2026-11-09), the program below dies with an
access violation (exit code -1073741819) before it prints anything. The class `W` has a field
initializer, `private joined = false`, and its constructor starts a thread from a closure that
captures the constructor's parameters. Move the initializer into the constructor
(`private joined: boolean;` and `this.joined = false;`) and the same program prints `ALL DONE`.
Under `-mm=own` the program doesn't compile, for a different reason: the closure can't take
`body` with it.

Cut-down versions run without crashing: the same shape with a simpler helper in place of
`__worker_run`, or a class that only spawns `body` with the initializer present. So the repro is
the whole program as it was when the crash was found.

## How it was found

The first `Worker` (step 2 of [worker-design.md](worker-design.md)) had this shape. `Worker` now
keeps a `WorkerStart` object and starts its thread with `tslang_thread_spawn`, as `ThreadHandle`
does, which does not hit the crash (checked with `private joined = false` put back).

## Repro

Put it in `tests\`, build the default library for `gc`, and run it as the tests are run
(`tslang --nowarn -mm=gc --opt --opt_level=3 --emit=exe`). It uses `MessageQueue`, `WorkerScope`
and `MessageEvent` from the library.

```ts
function __worker_run<In, Out>(body: (self: WorkerScope<In, Out>) => void, toWorker: Shared<MessageQueue<In>>,
                               toCreator: Shared<MessageQueue<Out>>, name: string): int {
    const scope = new WorkerScope<In, Out>(toCreator, name);
    try {
        body(scope);
        while (!scope.closed) {
            const message = toWorker.value.take();
            if (message == undefined) {
                break;
            }
            scope.onmessage(new MessageEvent<In>(message));
        }
    } finally {
        toWorker.value.close();
        toWorker.value.clear();
        toCreator.value.close();
    }
    return 0;
}
class W<In, Out> {
    private a: Shared<MessageQueue<In>>;
    private b: Shared<MessageQueue<Out>>;
    private t: ThreadHandle<int>;
    private joined = false;
    constructor(body: (self: WorkerScope<In, Out>) => void, name: string) {
        const a = new Shared(new MessageQueue<In>());
        const b = new Shared(new MessageQueue<Out>());
        this.a = a;
        this.b = b;
        this.t = Thread.spawn((): int => __worker_run<In, Out>(body, a, b, name));
    }
    join() { this.t.join(); }
}
function main() {
    const h = new W<int, int>((self: WorkerScope<int, int>) => { self.close(); }, "n");
    h.join();
    print("ALL DONE");
}
```
