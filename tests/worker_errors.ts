// Worker errors: what a worker throws reaches the creating thread as an ErrorEvent, given to
// worker.onerror by join() and receive(). A throw from a handler leaves the worker running, as in a
// browser; a throw from the worker's function ends the worker. (With no onerror set, the error is
// printed to stderr, which the test runner counts as a failure, so it is not exercised here.)

class Log {
    lines: string[] = [];
    add(line: string) {
        this.lines.push(line);
    }
}

// a handler that throws on some messages: each throw is an error event, in order with the replies,
// and the worker goes on to the next message
function handlerThrows() {
    const worker = new Worker<int, int>((self: WorkerScope<int, int>) => {
        self.onmessage = (e: MessageEvent<int>) => {
            if (e.data < 0) {
                self.close();
                return;
            }

            if (e.data % 2 == 1) {
                throw new RangeError(`odd: ${e.data}`);
            }

            self.postMessage(e.data * 10);
        };
    });

    for (let i = 0; i < 6; i++) worker.postMessage(i);
    worker.postMessage(-1);

    const log = new Shared(new Log());
    worker.onmessage = (e: MessageEvent<int>) => {
        log.value.add(`message ${e.data}`);
    };
    worker.onerror = (e: ErrorEvent) => {
        log.value.add(`error ${e.message}`);
    };
    worker.join();

    const lines = log.value.lines;
    assert(lines.length == 6, "three replies and three errors");
    assert(lines[0] == "message 0", "in order");
    assert(lines[1] == "error odd: 1", "the error between the replies");
    assert(lines[2] == "message 20", "the worker went on");
    assert(lines[3] == "error odd: 3", "a second error");
    assert(lines[4] == "message 40", "and on");
    assert(lines[5] == "error odd: 5", "the last error");
    assert(worker.closed, "the worker has ended");
}

// the worker's function throws: an error event, and the worker ends
function bodyThrows() {
    const worker = new Worker<int, int>((self: WorkerScope<int, int>) => {
        self.postMessage(1);
        throw new Error("setup failed");
    });

    const log = new Shared(new Log());
    worker.onerror = (e: ErrorEvent) => {
        log.value.add(e.message);
    };

    // receive gives the message, then hands the error to onerror and finds the worker ended
    const first = worker.receive();
    assert(first != undefined && first.data == 1, "what was posted before the throw");
    assert(worker.receive() == undefined, "nothing more: the worker ended");
    assert(log.value.lines.length == 1 && log.value.lines[0] == "setup failed", "onerror got the error");

    // join does not throw: the error was reported
    worker.join();
    assert(worker.closed, "the worker has ended");
}

// something thrown that is not an Error still reaches onerror, as its text
function throwsAString() {
    const worker = new Worker<int, int>((self: WorkerScope<int, int>) => {
        self.onmessage = (e: MessageEvent<int>) => {
            self.close();
            throw "plain text";
        };
    });

    worker.postMessage(0);
    const log = new Shared(new Log());
    worker.onerror = (e: ErrorEvent) => {
        log.value.add(e.message);
    };
    worker.join();
    assert(log.value.lines.length == 1 && log.value.lines[0] == "plain text", "a thrown string");
}

function main() {
    handlerThrows();
    bodyThrows();
    throwsAString();
    print("ALL DONE");
}
