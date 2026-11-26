// not own: Reflect reads keys through `any`, which has none under -mm=own
// Reflect of a dictionary (`{ [key: string]: T }`), the one object that gains and loses keys: set adds one,
// deleteProperty removes one, isExtensible until preventExtensions closes it. Any other object's keys are
// fixed when it is made, as a sealed object's: deleteProperty of a key it has is false. Through `any`,
// `delete x[k]` and Object.isFrozen and its kin look at the value at run time.
class Point {
    constructor(public x: number) {}
}

function dictionary() {
    const d: { [key: string]: number } = { a: 1 };

    assert(Reflect.set(d, "b", 2) && d["b"] == 2, "set adds a key");
    assert(Reflect.ownKeys(d).join(",") == "a,b", "ownKeys");

    assert(Reflect.deleteProperty(d, "a") && !Reflect.has(d, "a"), "deleteProperty removes a key");
    assert(Reflect.deleteProperty(d, "none"), "deleteProperty of a key it has not got");

    assert(Reflect.isExtensible(d), "a dictionary is extensible");
    assert(Reflect.preventExtensions(d) && !Reflect.isExtensible(d), "until preventExtensions");
    assert(!Reflect.set(d, "c", 3) && !Reflect.has(d, "c"), "then set of a new key is false");
    assert(Reflect.set(d, "b", 20) && d["b"] == 20, "a key it has is written");
    assert(Reflect.deleteProperty(d, "b"), "and deleted");

    const sealed: { [key: string]: number } = { a: 1 };
    Object.seal(sealed);
    assert(!Reflect.deleteProperty(sealed, "a") && sealed["a"] == 1, "deleteProperty of a sealed one is false");

    const frozen: { [key: string]: number } = { a: 1 };
    Object.freeze(frozen);
    assert(!Reflect.set(frozen, "a", 2) && frozen["a"] == 1, "set of a frozen one is false");
}

function objects() {
    const p = new Point(1);
    assert(!Reflect.deleteProperty(p, "x") && p.x == 1, "an object's key is not deleted");
    assert(Reflect.deleteProperty(p, "y"), "nor is there one it has not got");
    assert(!Reflect.isExtensible(p) && Reflect.preventExtensions(p), "an object's keys are fixed");

    const a = [1, 2];
    assert(Reflect.isExtensible(a) && !Reflect.preventExtensions(a), "an array grows and can't be closed");
}

function throughAny() {
    const d: { [key: string]: number } = { a: 1, b: 2 };
    const x: any = d;
    delete x["a"];
    assert(Object.keys(d).join(",") == "b", "delete through any deletes the entry");
    assert(Object.isExtensible(x) && !Object.isFrozen(x), "an open dictionary through any");
    Object.freeze(x);
    assert(Object.isFrozen(d), "freeze through any closes the dictionary");

    const p: any = new Point(1);
    assert(Object.isSealed(p) && !Object.isExtensible(p) && !Object.isFrozen(p), "an object through any is sealed");
    let threw = false;
    try {
        delete p["x"];
    } catch (e) {
        threw = true;
    }
    assert(threw, "delete of an object's key through any throws");

    const n: any = 5;
    assert(Object.isFrozen(n), "a number through any is frozen");
}

function main() {
    dictionary();
    objects();
    throughAny();
    print("ALL DONE");
}
