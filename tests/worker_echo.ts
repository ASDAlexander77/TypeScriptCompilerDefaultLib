// Worker: a function on its own thread that talks to the thread that made it only through messages.
// The worker sets self.onmessage and returns; the library then hands it each message until it calls
// self.close(). The creating thread has no event loop to deliver the replies, so it asks for them:
// receive() takes the next one, and join() hands every one to onmessage until the worker has closed.

function squares() {
    const worker = new Worker<int, string>((self: WorkerScope<int, string>) => {
        self.onmessage = (e: MessageEvent<int>) => {
            self.postMessage(`squared: ${e.data * e.data}`);
            if (e.data == 3) self.close();
        };
    });

    worker.postMessage(1);
    worker.postMessage(2);
    worker.postMessage(3);
    // after close(): dropped, as in a browser
    worker.postMessage(4);

    const first = worker.receive();
    assert(first != undefined && first.data == "squared: 1", "the first reply");

    // the rest go to onmessage; what it collects lives in a Shared the handler captures, so it is
    // still the creator's to read afterwards under -mm=own as well
    const replies = new Shared(new Collected());
    worker.onmessage = (e: MessageEvent<string>) => {
        replies.value.add(e.data);
    };
    worker.join();

    assert(replies.value.items.length == 2, "two more replies");
    assert(replies.value.items[0] == "squared: 4", "in order");
    assert(replies.value.items[1] == "squared: 9", "in order, to the last");
    assert(worker.closed, "the worker has ended");
    assert(worker.receive() == undefined, "nothing more after the worker ended");
}

class Collected {
    items: string[] = [];
    add(item: string) {
        this.items.push(item);
    }
}

// a worker that posts from its body, before any message reaches it, and closes there
function postsFromBody() {
    const worker = new Worker<int, string>((self: WorkerScope<int, string>) => {
        self.postMessage(`hello from ${self.name}`);
        self.close();
    }, "greeter");

    const greeting = worker.receive();
    assert(greeting != undefined && greeting.data == "hello from greeter", "a message posted from the body");
    worker.join();
}

// receive with a timeout gives undefined when nothing came in time
function receiveTimesOut() {
    const worker = new Worker<int, int>((self: WorkerScope<int, int>) => {
        self.onmessage = (e: MessageEvent<int>) => {
            if (e.data < 0) {
                self.close();
                return;
            }

            self.postMessage(e.data + 1);
        };
    });

    assert(worker.receive(20) == undefined, "nothing posted yet");
    worker.postMessage(41);
    const answer = worker.receive();
    assert(answer != undefined && answer.data == 42, "the reply");
    worker.postMessage(-1);
    worker.join();
}

function main() {
    squares();
    postsFromBody();
    receiveTimesOut();
    print("ALL DONE");
}
