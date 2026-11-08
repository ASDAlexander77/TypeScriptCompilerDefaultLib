// Atomics.wait sleeps while an element holds a value, until Atomics.notify wakes it or the timeout
// ends; notify says how many it woke. A worker thread and the main thread hand a turn back and forth
// through one Int32Array element, held in a Shared so that under -mm=own both can reach it.

function main() {
    // no other thread: the value differs, or nothing wakes the wait before its timeout
    const state = new Shared(new Int32Array([0, 0]));
    assert(Atomics.wait(state.value, 0, 1) == "not-equal", "not-equal at once");
    assert(Atomics.wait(state.value, 0, 0, 10) == "timed-out", "timed-out");
    assert(Atomics.notify(state.value, 0) == 0, "nobody to wake");

    const wide = new BigInt64Array([5]);
    assert(Atomics.wait(wide, 0, 6) == "not-equal", "a 64-bit element");
    assert(Atomics.wait(wide, 0, 5, 1) == "timed-out", "a 64-bit wait times out");

    // ping-pong: element 0 is whose turn it is (0 main, 1 worker), element 1 counts the rounds
    const rounds = 200;
    const worker = Thread.spawn((): int => {
        for (let i = 0; i < rounds; i++) {
            while (Atomics.load(state.value, 0) != 1) {
                Atomics.wait(state.value, 0, 0);
            }
            Atomics.add(state.value, 1, 1);
            Atomics.store(state.value, 0, 0);
            Atomics.notify(state.value, 0);
        }
        return rounds;
    });

    for (let i = 0; i < rounds; i++) {
        Atomics.store(state.value, 0, 1);
        Atomics.notify(state.value, 0);
        while (Atomics.load(state.value, 0) != 0) {
            Atomics.wait(state.value, 0, 1);
        }
    }

    assert(worker.join() == rounds, "the worker finished");
    assert(Atomics.load(state.value, 1) == rounds, "every round was played");

    // notify wakes no more than it is asked to, and says how many
    const gate = new Shared(new Int32Array([0, 0]));
    const sleepers: ThreadHandle<string>[] = [];
    for (let t = 0; t < 3; t++) {
        sleepers.push(Thread.spawn((): string => {
            Atomics.add(gate.value, 1, 1);
            return Atomics.wait(gate.value, 0, 0, 10000);
        }));
    }

    // every sleeper has said it is about to wait; give them time to start waiting
    while (Atomics.load(gate.value, 1) != 3) sleep(1);
    sleep(100);

    Atomics.store(gate.value, 0, 1);
    const first = Atomics.notify(gate.value, 0, 1);
    const rest = Atomics.notify(gate.value, 0);
    assert(first == 1, "notify wakes only as many as asked");
    assert(first + rest == 3, "then the rest");
    for (const sleeper of sleepers) {
        assert(sleeper.join() == "ok", "each sleeper was woken");
    }

    print("ALL DONE");
}
