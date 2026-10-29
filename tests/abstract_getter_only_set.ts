// A getter alone implements an abstract field: a write through the base throws a TypeError, as JavaScript's write
// to a property with only a getter does, and a `catch` takes it. A setter that throws is caught as well.
abstract class Shape {
    abstract name: string;
}

class Circle extends Shape {
    get name() { return "circle"; }
}

function main() {
    const s: Shape = new Circle();
    assert(s.name == "circle", "read through the base");

    let message = "";
    try {
        s.name = "square";
    } catch (e) {
        if (e instanceof TypeError) {
            message = e.message;
        }
    }

    assert(message == "Cannot set property name of Circle which has only a getter", "write through the base");
    assert(s.name == "circle", "unchanged");

    console.log("ALL DONE");
}
