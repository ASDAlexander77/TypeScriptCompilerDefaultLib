// Thread.spawn runs a function on a new thread; join waits for it and gives back what it returned,
// or throws an Error with the message of what it threw. The threads here share an Int32Array held in
// a Shared the functions captured, and change it only through Atomics: N threads adding to one element
// must sum exactly.

function sumOf(values: number[]) {
    let total = 0;
    for (const v of values) total += v;
    return total;
}

function main() {
    // a result, from a function that reads what it captured
    const numbers = [1, 2, 3, 4];
    const summing = Thread.spawn(() => sumOf(numbers));
    assert(summing.join() == 10, "join gives back the result");

    // a string made on the thread outlives it
    const naming = Thread.spawn(() => `thread ${7 * 6}`);
    assert(naming.join() == "thread 42", "a string the thread made");

    // an object the thread made comes back whole
    const building = Thread.spawn(() => new Int32Array([4, 5, 6]));
    const built = building.join();
    assert(built.length == 3 && built[2] == 6, "an object made on the thread");

    // join again gives the same result, and waits for nothing
    assert(naming.join() == "thread 42", "join twice");

    // what the function threw comes back from join as an Error
    const failing = Thread.spawn((): int => {
        throw new RangeError("out of range on the thread");
    });
    let caught = "";
    try {
        failing.join();
    } catch (e: Error) {
        caught = e.message;
    }
    assert(caught == "out of range on the thread", "join throws what the thread threw");

    // N threads, each adding to one shared element: atomic adds lose nothing
    const counter = new Shared(new Int32Array([0]));
    const threads: ThreadHandle<int>[] = [];
    const perThread = 20000;
    for (let t = 0; t < 4; t++) {
        threads.push(Thread.spawn((): int => {
            for (let i = 0; i < perThread; i++) {
                Atomics.add(counter.value, 0, 1);
            }
            return perThread;
        }));
    }

    let added = 0;
    for (const thread of threads) added += thread.join();
    assert(added == 4 * perThread, "every thread ran");
    assert(Atomics.load(counter.value, 0) == 4 * perThread, "no add was lost");

    assert(Thread.hardwareConcurrency() >= 0, "hardwareConcurrency");

    print("ALL DONE");
}
