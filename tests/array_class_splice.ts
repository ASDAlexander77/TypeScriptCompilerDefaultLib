// splice, shift and unshift on an Array<T> (the class, not T[]): they were missing, so
// `childNodes: Array<Node>` could not remove a child (TypeScriptCompiler #231).

class Item {
    get toStringTag(): string {
        return "Item";
    }

    constructor(public name: string) {
    }
}

function names(a: Array<Item>) {
    let s = "";
    for (let i = 0; i < a.length; i++)
        s += a[i].name;
    return s;
}

function main() {
    const a = new Array<Item>();
    a.push(new Item("a"), new Item("b"), new Item("c"), new Item("d"));

    // remove one in the middle
    const removed = a.splice(1, 1);
    assert(removed.length == 1 && removed[0].name == "b");
    assert(names(a) == "acd");

    // insert without removing
    a.splice(1, 0, new Item("x"), new Item("y"));
    assert(names(a) == "axycd");

    // negative start counts from the end
    a.splice(-1, 1);
    assert(names(a) == "axyc");

    // a left-out delete count removes to the end
    const tail = a.splice(2);
    assert(tail.length == 2 && names(a) == "ax");

    // a delete count past the end is clamped
    a.splice(1, 10);
    assert(names(a) == "a");

    a.unshift(new Item("p"), new Item("q"));
    assert(names(a) == "pqa");

    const first = a.shift();
    assert(first.name == "p" && names(a) == "qa");

    console.log("ALL DONE");
}
