// not own: Reflect reads keys through `any`, which has none under -mm=own
// Reflect.get, set, has, ownKeys and deleteProperty: the keys are looked up at run time, by the type the
// target has when it is boxed as `any` - of a class, its actual class's.
class Point {
    constructor(public x: number, protected y: number) {}

    get sum() {
        return this.x + this.y;
    }

    norm() {
        return this.x * this.x + this.y * this.y;
    }
}

class Point3 extends Point {
    label?: string;

    constructor(x: number, y: number, public z: number) {
        super(x, y);
    }
}

interface Named {
    name: string;
}

function main() {
    // an object literal: read, but not written, since `any` holds a copy of it
    const o = { a: 1, b: "two" };
    assert(<number>Reflect.get(o, "a") == 1, "get of a literal");
    assert(<string>Reflect.get(o, "b") == "two", "get of a literal's string");
    assert(typeof Reflect.get(o, "c") == "undefined", "get of a missing key");
    assert(Reflect.has(o, "a") && !Reflect.has(o, "c"), "has of a literal");
    assert(Reflect.ownKeys(o).join(",") == "a,b", "ownKeys of a literal");
    assert(!Reflect.set(o, "a", 5) && o.a == 1, "set of a literal is false");

    // a class: public fields, accessors and methods; a protected field is not seen
    const p = new Point(3, 4);
    let key = "x";
    assert(<number>Reflect.get(p, key) == 3, "get by a run-time key");
    assert(<number>Reflect.get(p, "sum") == 7, "get of an accessor");
    assert(typeof Reflect.get(p, "norm") == "function", "get of a method");
    assert(typeof Reflect.get(p, "y") == "undefined", "a protected field is not read");
    assert(Reflect.has(p, "norm") && Reflect.has(p, "sum"), "has of a method and an accessor");
    assert(!Reflect.has(p, "y") && !Reflect.has(p, "w"), "has of a protected and a missing key");
    assert(Reflect.ownKeys(p).join(",") == "x", "ownKeys: fields, not accessors or methods");

    // set writes through to the object
    assert(Reflect.set(p, "x", 30) && p.x == 30, "set of a field");
    assert(<number>Reflect.get(p, "sum") == 34, "an accessor sees the field set");
    // a value the field's type does not take, and a key the object has not, are false
    assert(!Reflect.set(p, "x", "thirty") && p.x == 30, "set of a wrong type is false");
    assert(!Reflect.set(p, "w", 1), "set of a missing key is false");

    // held as its base class, an object shows its actual class's keys
    const q: Point = new Point3(1, 2, 3);
    assert(Reflect.ownKeys(q).join(",") == "x,z", "ownKeys of the actual class");
    assert(<number>Reflect.get(q, "z") == 3, "get of the actual class's field");
    assert(Reflect.has(q, "z"), "has of the actual class's field");

    // an optional field is a key once it is set
    const r = new Point3(1, 2, 3);
    assert(!Reflect.has(r, "label"), "an optional field not set");
    r.label = "r";
    assert(Reflect.has(r, "label") && <string>Reflect.get(r, "label") == "r", "an optional field set");

    // an object held through an interface is written through
    const n: Named = { name: "n" };
    assert(Reflect.set(n, "name", "m") && n.name == "m", "set through an interface");

    // an array: its indices
    const a = [10, 20, 30];
    assert(<number>Reflect.get(a, 1) == 20, "get of an index");
    assert(Reflect.has(a, 2) && !Reflect.has(a, 3), "has of an index");
    assert(Reflect.ownKeys(a).join(",") == "0,1,2", "ownKeys of an array");

    // a key can't be removed: deleteProperty is true only of a key that is not there
    assert(!Reflect.deleteProperty(p, "x") && p.x == 30, "deleteProperty of a field");
    assert(Reflect.deleteProperty(p, "w"), "deleteProperty of a missing key");

    // null is not an object
    let threw = false;
    try {
        Reflect.ownKeys(null);
    } catch (e) {
        threw = true;
    }
    assert(threw, "ownKeys of null throws");

    threw = false;
    try {
        Reflect.set(null, "x", 1);
    } catch (e) {
        threw = true;
    }
    assert(threw, "set of null throws, not false");

    print("ALL DONE");
}
