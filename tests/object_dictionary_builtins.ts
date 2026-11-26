// Object's functions of a dictionary (`{ [key: string]: T }`), the one object that gains and loses keys:
// keys, values and entries in the order its entries were added, hasOwn, assign, fromEntries; closed by
// preventExtensions, seal and freeze, after which a write it no longer takes throws a TypeError. Of any
// other object, whose keys are fixed when it is made, isExtensible is false and isSealed true; an array
// grows, so it is extensible; what is no object is frozen.
function entriesAndAssign() {
    const d: { [key: string]: number } = { a: 1, b: 2 };
    d["c"] = 3;

    assert(Object.keys(d).join(",") == "a,b,c", "keys");
    assert(Object.getOwnPropertyNames(d).join(",") == "a,b,c", "getOwnPropertyNames");
    assert(Object.values(d).join(",") == "1,2,3", "values");

    const entries = Object.entries(d);
    assert(entries.length == 3 && entries[1][0] == "b" && entries[1][1] == 2, "entries");

    assert(Object.hasOwn(d, "a") && !Object.hasOwn(d, "z"), "hasOwn");

    const more: { [key: string]: number } = { c: 30, d: 4 };
    const same = Object.assign(d, more, { e: 5 });
    assert(Object.keys(same).join(",") == "a,b,c,d,e", "assign adds the sources' keys, in order");
    assert(d["c"] == 30 && d["e"] == 5, "assign writes over a key it has");

    const pairs: [string, number][] = [["x", 1], ["y", 2], ["x", 3]];
    const fromPairs = Object.fromEntries(pairs);
    assert(Object.keys(fromPairs).join(",") == "x,y" && fromPairs["x"] == 3, "fromEntries: a later value in place");

    const back = Object.fromEntries(Object.entries(d));
    assert(Object.values(back).join(",") == "1,2,30,4,5", "fromEntries of entries");
}

function closing() {
    const open: { [key: string]: number } = { a: 1 };
    assert(Object.isExtensible(open) && !Object.isSealed(open) && !Object.isFrozen(open), "a dictionary is open");

    const noMore: { [key: string]: number } = { a: 1, b: 2 };
    Object.preventExtensions(noMore);
    assert(!Object.isExtensible(noMore) && !Object.isSealed(noMore), "preventExtensions");
    let caught = "";
    try {
        noMore["c"] = 3;
    } catch (e) {
        caught = (<TypeError>e).message;
    }
    assert(caught == "Cannot add property c, object is not extensible", "no key added");
    noMore["a"] = 10;
    delete noMore["b"];
    assert(noMore["a"] == 10 && !Object.hasOwn(noMore, "b"), "a key written and deleted");

    const sealed: { [key: string]: number } = { a: 1 };
    assert(Object.seal(sealed) === sealed, "seal is its object");
    assert(Object.isSealed(sealed) && !Object.isFrozen(sealed), "sealed");
    sealed["a"] = 2;
    caught = "";
    try {
        delete sealed["a"];
    } catch (e) {
        caught = (<TypeError>e).message;
    }
    assert(caught == "Cannot delete property 'a' of object", "no key deleted");
    assert(sealed["a"] == 2, "a key written");

    const frozen: { [key: string]: number } = { a: 1 };
    Object.freeze(frozen);
    assert(Object.isFrozen(frozen) && Object.isSealed(frozen) && !Object.isExtensible(frozen), "frozen");
    caught = "";
    try {
        frozen["a"] = 2;
    } catch (e) {
        caught = (<TypeError>e).message;
    }
    assert(caught == "Cannot assign to read only property 'a' of object", "no value written");
    assert(frozen["a"] == 1, "the value is as it was");

    // closed no less than it was
    Object.preventExtensions(frozen);
    assert(Object.isFrozen(frozen), "still frozen");

    // one that takes no key and has none is sealed and frozen too
    const empty: { [key: string]: number } = {};
    Object.preventExtensions(empty);
    assert(Object.isSealed(empty) && Object.isFrozen(empty), "an empty one closed");
}

class Point {
    constructor(public x: number) {}

    get twice() {
        return this.x * 2;
    }

    norm() {
        return this.x;
    }
}

function others() {
    const p = new Point(1);
    assert(!Object.isExtensible(p) && Object.isSealed(p) && !Object.isFrozen(p), "an object's keys are fixed");
    assert(Object.freeze(p) === p && p.x == 1, "freeze of an object is the object");
    assert(Object.hasOwn(p, "x") && !Object.hasOwn(p, "norm") && !Object.hasOwn(p, "twice"),
           "hasOwn: a field, not a method or an accessor");

    const o = { a: 1 };
    assert(!Object.isExtensible(o) && Object.isSealed(o), "an object literal's keys are fixed");
    assert(Object.hasOwn(o, "a") && !Object.hasOwn(o, "b"), "hasOwn of an object literal");

    const a = [1, 2];
    assert(Object.isExtensible(a) && !Object.isSealed(a) && !Object.isFrozen(a), "an array grows");
    assert(Object.hasOwn(a, 1) && !Object.hasOwn(a, 2), "hasOwn of an array's index");

    assert(Object.isFrozen(5) && Object.isFrozen("s") && !Object.isExtensible(true), "what is no object is frozen");
}

function main() {
    entriesAndAssign();
    closing();
    others();
    print("ALL DONE");
}
