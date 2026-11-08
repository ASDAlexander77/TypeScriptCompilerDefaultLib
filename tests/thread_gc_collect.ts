// gc only: a thread Thread.spawn starts registers itself with the collector, which then stops it
// and scans its stack during a collection. This calls GC_gcollect() itself, which the compiler
// rejects under any other model.
//
// The worker builds a list that only its own stack points at while the main thread collects over
// and over. Unregistered, the collector would neither stop the worker nor see its stack, and free
// the list under it.

class Node {
    constructor(public value: int, public next: Node | null) {}
}

function main() {
    const phase = new Int32Array([0]);
    const worker = Thread.spawn((): int => {
        let head: Node | null = null;
        for (let i = 0; i < 20000; i++) {
            head = new Node(i, head);
            if (i == 100) Atomics.store(phase, 0, 1);
        }

        let count = 0;
        let sum = 0;
        for (let node = head; node != null; node = node.next) {
            count++;
            sum += node.value;
        }

        Atomics.store(phase, 0, 2);
        return count == 20000 && sum == 20000 * 19999 / 2 ? 1 : 0;
    });

    while (Atomics.load(phase, 0) == 0) sleep(0);
    while (Atomics.load(phase, 0) != 2) {
        GC_gcollect();
        const churn: Node[] = [];
        for (let i = 0; i < 100; i++) churn.push(new Node(i, null));
    }

    assert(worker.join() == 1, "the worker's list survived the collections");

    print("ALL DONE");
}
