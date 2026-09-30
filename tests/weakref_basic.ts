// gc only: WeakRef is built on the collector's weak links, and this calls GC_gcollect() itself.
// Under any other model the compiler rejects both.
class Foo {
    constructor(public value: int) {
    }
}

function makeAndDrop(): WeakRef<Foo> {
    const obj = new Foo(42);
    const ref = new WeakRef<Foo>(obj);
    return ref;
}

// in a function of its own, so no pointer to the object stays in main's frame for the
// collector's conservative stack scan to find
function aliveValue(ref: WeakRef<Foo>): int {
    const target = ref.deref();
    return target != undefined ? target.value : -1;
}

function main() {
    const ref = makeAndDrop();

    // nothing has collected yet
    assert(aliveValue(ref) == 42, "deref before a collection gives the object");

    // one that is still held
    const kept = new Foo(7);
    const keptRef = new WeakRef<Foo>(kept);

    GC_gcollect();
    GC_gcollect();

    assert(ref.deref() == undefined, "deref after the last reference went and a collection ran");
    assert(aliveValue(keptRef) == 7, "a held object survives the collection");
    assert(kept.value == 7);

    console.log("ALL DONE");
}
