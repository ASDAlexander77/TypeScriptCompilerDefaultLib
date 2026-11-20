// gc only: this calls GC_gcollect() itself, which the compiler rejects under any other model.
// FinalizationRegistry calls its callback with the held value of a target the collector has freed,
// when the registry is next used.
class Foo {
    constructor(public value: int) {
    }
}

const DROPPED = 200;
const KEPT = -1;

// how many times the callback has run for each held value; KEPT's count is in keptCalls
let calls: int[] = [];
let keptCalls = 0;
let total = 0;

function onCleanup(held: int) {
    if (held == KEPT) {
        keptCalls++;
    } else {
        calls[held] = calls[held] + 1;
    }

    total++;
}

// in a function of its own, so no pointer to the object stays in main's frame for the collector's
// conservative stack scan to find (see weakref_basic.ts)
function registerDropped(registry: FinalizationRegistry<int, Foo>, held: int, withToken: boolean) {
    const obj = new Foo(held);
    if (withToken) {
        registry.register(obj, held, obj);
    } else {
        registry.register(obj, held);
    }
}

function clearStack(depth: int): int {
    const a = depth;
    const b = depth + 1;
    const c = depth + 2;
    const d = depth + 3;
    return depth > 0 ? clearStack(depth - 1) + a + b + c + d : 0;
}

function countFreed(): int {
    let freed = 0;
    for (let i = 0; i < DROPPED; i++) {
        assert(calls[i] <= 1, "a callback for each freed target, once");
        if (calls[i] == 1) freed++;
    }

    return freed;
}

function main() {
    for (let i = 0; i < DROPPED; i++) {
        calls.push(0);
    }

    const registry = new FinalizationRegistry<int, Foo>(onCleanup);
    // every other one with itself as the unregister token
    for (let i = 0; i < DROPPED; i++) {
        registerDropped(registry, i, i % 2 == 1);
    }

    const kept = new Foo(2);
    registry.register(kept, KEPT, kept);

    clearStack(200);
    const before = total;
    GC_gcollect();
    GC_gcollect();

    // the callbacks run when the registry is next used, never on their own
    assert(total == before, "no callback until the registry is used");
    registry.cleanupSome();

    // not all of them: the collector scans the stack conservatively, and a stray word there can keep
    // one alive (see weakmap_weakset.ts)
    const freed = countFreed();
    assert(freed >= DROPPED * 9 / 10, "a callback for the freed targets");
    assert(total == freed, "and for nothing else");

    registry.cleanupSome();
    assert(total == freed && countFreed() == freed, "not again");

    // a held object is not freed, and unregister forgets it
    assert(keptCalls == 0, "no callback for a held target");
    assert(registry.unregister(kept), "unregister finds the token");
    assert(!registry.unregister(kept), "and has nothing more for it");
    assert(kept.value == 2);

    console.log("ALL DONE");
}
