// What Reflect can't do here throws a TypeError naming the method, rather than giving a made-up answer:
// defineProperty and getOwnPropertyDescriptor (no property descriptors), getPrototypeOf and setPrototypeOf
// (no prototypes). (deleteProperty of an object, whose keys are fixed as a sealed object's, is false:
// reflect_dictionary.ts.)
class Point {
    constructor(public x: number) {}
}

function main() {
    const p = new Point(1);

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
