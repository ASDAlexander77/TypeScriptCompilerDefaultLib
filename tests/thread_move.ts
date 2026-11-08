// Thread.spawn with data the function owns: what it captures moves into the thread, and its result
// comes back through join. This is the shape -mm=own takes as well - one owner at a time - so it
// runs under every model. Threads sharing one array, and a thread returning an object (which -mm=own
// can't yet prove the thread's function gives up), are in thread_spawn.ts and atomics_wait.ts.

class Batch {
    constructor(public label: string, public items: number[]) {}
}

function makeBatch(n: int) {
    const items: number[] = [];
    for (let i = 1; i <= n; i++) items.push(i);
    return new Batch(`batch ${n}`, items);
}

function main() {
    const batch = makeBatch(100);
    const worker = Thread.spawn(() => {
        let total = 0;
        for (const item of batch.items) total += item;
        return `${batch.label}: ${total}`;
    });
    assert(worker.join() == "batch 100: 5050", "the thread got the batch");

    // a thread that throws
    const failing = Thread.spawn((): int => {
        throw new Error("thread failed");
    });
    let caught = "";
    try {
        failing.join();
    } catch (e: Error) {
        caught = e.message;
    }
    assert(caught == "thread failed", "join throws what the thread threw");

    print("ALL DONE");
}
