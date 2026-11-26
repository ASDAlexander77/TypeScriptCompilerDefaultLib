// Reflect.apply and Reflect.construct: a call and a `new` with their arguments given as an array,
// of one type or several; isExtensible and preventExtensions of an object, whose keys are fixed when it is made.
class Counter {
    constructor(public n: number, public up: boolean) {}
}

class Empty {
    made = true;
}

function add(x: number, y: number) {
    return x + y;
}

function main() {
    assert(Reflect.apply(add, undefined, [2, 5]) == 7, "apply of a function");
    assert(Reflect.apply((s: string) => s + "!", null, ["hi"]) == "hi!", "apply of an arrow");
    assert(Reflect.apply(() => 42, undefined, []) == 42, "apply with no arguments");
    assert(Reflect.apply((a: number, s: string) => s + a, undefined, [1, "x"]) == "x1", "apply with arguments of two types");

    const base = 10;
    assert(Reflect.apply((x: number) => x + base, undefined, [5]) == 15, "apply of a capturing arrow");

    const counter = Reflect.construct(Counter, [3, true]);
    assert(counter.n == 3 && counter.up, "construct with arguments of two types");
    assert(counter instanceof Counter, "construct makes the class");
    assert(Reflect.construct(Empty, []).made, "construct with no arguments");

    assert(!Reflect.isExtensible(counter), "no object can gain a key");
    assert(!Reflect.isExtensible({ a: 1 }), "an object literal can't either");
    assert(Reflect.preventExtensions(counter), "preventExtensions succeeds");

    let threw = false;
    try {
        Reflect.isExtensible(null);
    } catch (e) {
        threw = true;
    }
    assert(threw, "isExtensible of null throws");

    print("ALL DONE");
}
