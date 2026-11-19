// gc only: this calls GC_gcollect() itself, which the compiler rejects under any other model.
// FinalizationRegistry calls its callback with the held value of a target the collector has freed,
// when the registry is next used.
class Foo {
    constructor(public value: int) {
    }
}

let cleaned = "";

// in a function of its own, so no pointer to the object stays in main's frame for the collector's
// conservative stack scan to find (see weakref_basic.ts)
function registerDropped(registry: FinalizationRegistry<string, Foo>, held: string, withToken: boolean) {
    const obj = new Foo(1);
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

function main() {
    const registry = new FinalizationRegistry<string, Foo>((held: string) => { cleaned += held; });
    registerDropped(registry, "a", false);
    registerDropped(registry, "b", true);

    const kept = new Foo(2);
    registry.register(kept, "k", kept);

    // nothing has collected yet
    registry.cleanupSome();
    assert(cleaned == "", "no callback before a collection");

    clearStack(200);
    GC_gcollect();
    GC_gcollect();

    // the callbacks run when the registry is next used, never on their own
    assert(cleaned == "", "no callback until the registry is used");
    registry.cleanupSome();
    assert(cleaned.length == 2 && cleaned.indexOf("a") >= 0 && cleaned.indexOf("b") >= 0,
        "a callback for each freed target, once");
    registry.cleanupSome();
    assert(cleaned.length == 2, "not again");

    // a held object is not freed, and unregister forgets it
    assert(registry.unregister(kept), "unregister finds the token");
    assert(!registry.unregister(kept), "and has nothing more for it");
    assert(kept.value == 2);

    console.log("ALL DONE");
}
