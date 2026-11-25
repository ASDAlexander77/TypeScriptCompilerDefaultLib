// Readonly<C> and Required<C> of a class are the class itself: mapped, a class became an object of
// its fields, a copy without its methods (Readonly<C> of a class with methods came out empty). Of
// an object type they are still mapped.
class Counter {
    count = 1;

    bump() {
        this.count++;
    }
}

class Opt {
    y?: number;

    show() {
        return "opt";
    }
}

class Base {
    constructor(public x: number) {}
}

class Derived extends Base {
    twice() {
        return this.x * 2;
    }
}

class Box<T> {
    constructor(public value: T) {}

    get() {
        return this.value;
    }
}

interface Point {
    x: number;
    y?: number;
}

function main() {
    // the same instance: a call through it reaches the original
    const c = new Counter();
    const r: Readonly<Counter> = c;
    r.bump();
    assert(c.count == 2 && r.count == 2, "Readonly of a class is the class");

    const o = new Opt();
    const q: Required<Opt> = o;
    assert(q.show() == "opt", "Required of a class is the class");

    // a class whose constructor takes arguments, a derived one, a generic one
    const d: Readonly<Derived> = new Derived(3);
    assert(d.twice() == 6, "Readonly of a derived class");

    const b: Required<Box<string>> = new Box<string>("v");
    assert(b.get() == "v", "Required of a generic class");

    // object types are mapped as before
    const p: Readonly<{ a: number }> = { a: 5 };
    assert(p.a == 5, "Readonly of an object type");

    const pt: Required<Point> = { x: 1, y: 2 };
    assert(pt.x == 1 && pt.y == 2, "Required of an interface");

    print("ALL DONE");
}
