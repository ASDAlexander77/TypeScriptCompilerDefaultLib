// What Reflect can't do here throws a TypeError naming the method, rather than giving a made-up answer:
// deleteProperty (an object's keys are fixed), defineProperty and getOwnPropertyDescriptor (no property
// descriptors), getPrototypeOf and setPrototypeOf (no prototypes).
class Point {
    constructor(public x: number) {}
}

function main() {
    const p = new Point(1);

    let message = "";
    try {
        Reflect.deleteProperty(p, "x");
    } catch (e) {
        message = (<TypeError>e).message;
    }
    assert(message == "Reflect.deleteProperty is not available: an object's keys are fixed when it is made", "deleteProperty");
    assert(p.x == 1, "the field is still there");

    let threw = 0;
    try {
        Reflect.defineProperty(p, "y", { value: 2 });
    } catch (e) {
        threw++;
    }
    try {
        Reflect.getOwnPropertyDescriptor(p, "x");
    } catch (e) {
        threw++;
    }
    try {
        Reflect.getPrototypeOf(p);
    } catch (e) {
        threw++;
    }
    try {
        Reflect.setPrototypeOf(p, null);
    } catch (e) {
        threw++;
    }
    assert(threw == 4, "defineProperty, getOwnPropertyDescriptor, getPrototypeOf and setPrototypeOf throw");

    print("ALL DONE");
}
