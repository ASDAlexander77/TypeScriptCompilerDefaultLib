// Worker.terminate() and Worker.dispatch(). Most browser workers never call close(); the creating
// thread takes what they post with dispatch() in its own loop, and ends them with terminate().
// terminate() stops the worker between handlers (a running handler finishes first), drops what was
// queued for it and what it posted that was not yet delivered, and ends its thread.

class Log {
    lines: string[] = [];
    add(line: string) {
        this.lines.push(line);
    }
}

// an echo worker that never closes: dispatch() delivers its replies, terminate() ends it
function dispatchThenTerminate() {
    const worker = new Worker<int, int>((self: WorkerScope<int, int>) => {
        self.onmessage = (e: MessageEvent<int>) => {
            self.postMessage(e.data * 2);
        };
    });

    const log = new Shared(new Log());
    worker.onmessage = (e: MessageEvent<int>) => {
        log.value.add(`${e.data}`);
    };

    // nothing posted yet: dispatch() without a timeout does not wait
    assert(worker.dispatch() == 0, "nothing to deliver yet");

    worker.postMessage(1);
    worker.postMessage(2);
    worker.postMessage(3);

    // each dispatch waits up to 100 ms for the first event, then delivers whatever is queued
    let delivered = 0;
    for (let i = 0; i < 100 && delivered < 3; i++) {
        delivered += worker.dispatch(100);
    }

    assert(delivered == 3, "three replies delivered");
    assert(log.value.lines.join(",") == "2,4,6", "in order");
    assert(!worker.closed, "the worker is still running");

    worker.terminate();
    assert(worker.closed, "terminated");

    // after terminate: postMessage is ignored, nothing is delivered, terminate again does nothing
    worker.postMessage(4);
    assert(worker.dispatch(20) == 0, "nothing after terminate");
    assert(worker.receive() == undefined, "receive gives nothing after terminate");
    worker.terminate();
    worker.join();
    assert(log.value.lines.length == 3, "onmessage was not called again");
}

// terminate while messages are still queued for a slow worker: the rest are dropped. The worker
// counts what it handled in an array the creating thread shares with it.
function terminateDropsQueuedMessages() {
    const handled = new Shared(new Int32Array(1));
    const worker = new Worker<int, int>((self: WorkerScope<int, int>) => {
        // a handle of the worker's own for its handler: under -mm=own the function only lends what it
        // captured from the creating thread, and the handler is kept past the call. (Under -mm=own a
        // handler of a worker whose function captured something can't also capture `self`, so this
        // one doesn't post: see docs/worker-design.md.)
        const counter = handled;
        self.onmessage = (e: MessageEvent<int>) => {
            sleep(1);
            Atomics.add(counter.value, 0, 1);
        };
    });

    for (let i = 0; i < 1000; i++) worker.postMessage(i);
    worker.terminate();

    const count = Atomics.load(handled.value, 0);
    assert(count < 1000, "the messages still queued were dropped");
    assert(worker.closed, "terminated");
}

// terminate while a slow worker's replies are still arriving: none of them is delivered afterwards
function terminateDropsUndeliveredReplies() {
    const worker = new Worker<int, int>((self: WorkerScope<int, int>) => {
        self.onmessage = (e: MessageEvent<int>) => {
            sleep(1);
            self.postMessage(e.data);
        };
    });

    for (let i = 0; i < 1000; i++) worker.postMessage(i);
    // let some replies arrive, undelivered
    sleep(20);

    const log = new Shared(new Log());
    worker.onmessage = (e: MessageEvent<int>) => {
        log.value.add(`${e.data}`);
    };
    worker.terminate();

    assert(worker.dispatch() == 0, "the replies not yet delivered were dropped");
    assert(worker.receive(0) == undefined, "receive finds none either");
    assert(log.value.lines.length == 0, "onmessage was never called");
    assert(worker.closed, "terminated");
}

// terminate a worker waiting for its first message, and one that already closed itself
function terminateIdleAndClosed() {
    const idle = new Worker<int, int>((self: WorkerScope<int, int>) => {
        self.onmessage = (e: MessageEvent<int>) => {
            self.postMessage(e.data);
        };
    });
    idle.terminate();
    assert(idle.closed, "an idle worker ends");

    const closing = new Worker<int, int>((self: WorkerScope<int, int>) => {
        self.close();
    });
    closing.join();
    closing.terminate();
    assert(closing.closed, "terminate after join does nothing more");
}

function main() {
    dispatchThenTerminate();
    terminateDropsQueuedMessages();
    terminateDropsUndeliveredReplies();
    terminateIdleAndClosed();
    print("ALL DONE");
}
