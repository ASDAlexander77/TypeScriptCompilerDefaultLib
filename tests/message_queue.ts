// MessageQueue<T>: a one-way queue between threads, what Worker will be built on. Each side holds the
// queue through a Shared both functions capture, as threads sharing an array do. Items arrive in
// the order they were pushed; take() waits for one, or gives undefined once the queue is closed and
// empty, or when its timeout passes.

class Parcel {
    constructor(public id: int, public label: string) {}
}

function numbersInOrder() {
    const queue = new Shared(new MessageQueue<int>());
    const producer = Thread.spawn((): int => {
        for (let i = 0; i < 10000; i++) queue.value.push(i);
        queue.value.close();
        return 0;
    });

    let expected = 0;
    while (true) {
        const item = queue.value.take();
        if (item == undefined) break;
        assert(item == expected, "numbers arrive in order");
        expected++;
    }

    producer.join();
    assert(expected == 10000, "every number arrived");
}

function stringsInOrder() {
    const queue = new Shared(new MessageQueue<string>());
    const producer = Thread.spawn((): int => {
        for (let i = 0; i < 10000; i++) queue.value.push(`item ${i}`);
        queue.value.close();
        return 0;
    });

    let count = 0;
    while (true) {
        const item = queue.value.take();
        if (item == undefined) break;
        assert(item == `item ${count}`, "strings arrive in order");
        count++;
    }

    producer.join();
    assert(count == 10000, "every string arrived");
}

// objects both ways: the main thread sends parcels, the other thread relabels each and sends it back
function objectsBothWays() {
    const requests = new Shared(new MessageQueue<Parcel>());
    const replies = new Shared(new MessageQueue<Parcel>());
    const worker = Thread.spawn((): int => {
        let handled = 0;
        while (true) {
            const parcel = requests.value.take();
            if (parcel == undefined) break;
            replies.value.push(new Parcel(parcel.id * 2, `${parcel.label} done`));
            handled++;
        }

        replies.value.close();
        return handled;
    });

    for (let i = 0; i < 10000; i++) requests.value.push(new Parcel(i, `parcel ${i}`));
    requests.value.close();

    let count = 0;
    while (true) {
        const reply = replies.value.take();
        if (reply == undefined) break;
        assert(reply.id == count * 2, "replies arrive in order");
        assert(reply.label == `parcel ${count} done`, "the reply carries its label");
        count++;
    }

    assert(worker.join() == 10000, "the worker handled every parcel");
    assert(count == 10000, "every reply arrived");
}

function timeoutAndClose() {
    const queue = new MessageQueue<int>();

    // nothing pushed: take gives up after its timeout
    assert(queue.take(20) == undefined, "take times out on an empty queue");

    queue.push(1);
    assert(queue.length == 1, "one item queued");
    queue.close();
    assert(queue.closed, "closed");

    // what was pushed before close still comes out; a push after close is dropped
    assert(!queue.push(2), "push after close is refused");
    assert(queue.take() == 1, "an item pushed before close");
    assert(queue.take() == undefined, "closed and empty");

    // clear drops what is queued
    const other = new MessageQueue<string>();
    other.push("a");
    other.push("b");
    other.clear();
    assert(other.length == 0, "clear empties the queue");
    assert(other.take(0) == undefined, "nothing left after clear");
}

function main() {
    numbersInOrder();
    stringsInOrder();
    objectsBothWays();
    timeoutAndClose();
    print("ALL DONE");
}
