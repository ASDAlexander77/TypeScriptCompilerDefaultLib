// not rc: FinalizationRegistry is built on WeakRef, which the compiler gives under gc, own and none.
// What every one of those models does alike, and under -mm=own a callback for a target its owner gave
// up, at the registry's next use.
class Foo {
    constructor(public value: int) {
    }
}

let cleaned = "";

// -mm=own frees an object when its owner gives it up: only there is a dropped target certainly gone
function freesAtOnce() {
    return Shared.count(new Shared(0)) >= 0;
}

function registerDropped(registry: FinalizationRegistry<string, Foo>, held: string) {
    const obj = new Foo(1);
    registry.register(obj, held);
}

function main() {
    const registry = new FinalizationRegistry<string, Foo>((held: string) => { cleaned += held; });

    const kept = new Foo(2);
    const other = new Foo(3);
    registry.register(kept, "k", kept);
    registry.register(other, "o", kept);
    registry.cleanupSome();
    assert(cleaned == "", "no callback for a live target");

    // both registrations made with the token go
    assert(registry.unregister(kept), "unregister finds the token");
    assert(!registry.unregister(kept), "and has nothing more for it");
    assert(!registry.unregister(other), "a target that was not a token unregisters nothing");

    registerDropped(registry, "d");
    let given = "";
    registry.cleanupSome((held: string) => { given += held; });
    if (freesAtOnce()) {
        assert(given == "d", "under own, the dropped target's value, to the callback given");
        assert(cleaned == "", "not to the registry's own");
    }

    assert(kept.value == 2 && other.value == 3);
    console.log("ALL DONE");
}
