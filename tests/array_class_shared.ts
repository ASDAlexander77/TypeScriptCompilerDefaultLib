// The Array<T> class (not T[]) of Shared<T> handles: the way to keep objects in an Array<T> under
// -mm=own. A walk over the handles counts each one it reads, so it frees nothing the array holds,
// and a callback is given a count of its own for the call.

class Item {
    constructor(public name: string) {
    }

    get toStringTag(): string {
        return "Item";
    }

    toString() {
        return this.name;
    }
}

function item(name: string) {
    return new Shared<Item>(new Item(name));
}

function names(a: Array<Shared<Item>>) {
    let s = "";
    for (const v of a) s += v.value.name;
    return s;
}

function main() {
    const a = new Array<Shared<Item>>();
    a.push(item("a"), item("bb"), item("ccc"));
    assert(a.length == 3 && names(a) == "abbccc");
    assert(a.at(1).value.name == "bb");

    assert(a.every((v) => v.value.name.length > 0));
    assert(a.some((v) => v.value.name == "bb"));
    assert(a.find((v) => v.value.name.length == 3).value.name == "ccc");
    assert(a.findIndex((v) => v.value.name == "bb") == 1);
    assert(a.filter((v) => v.value.name.length > 1).length == 2);

    let longer = "";
    for (const v of a.filter2((v) => v.value.name.length > 1)) longer += v.value.name;
    assert(longer == "bbccc");

    let each = "";
    a.forEach((v) => {
        each += v.value.name;
    });
    assert(each == "abbccc");

    const removed = a.splice(1, 1, item("x"), item("y"));
    assert(removed.length == 1 && removed[0].value.name == "bb");
    assert(names(a) == "axyccc");

    a.unshift(item("p"));
    const first = a.shift();
    assert(first.value.name == "p" && names(a) == "axyccc");
    assert(a.pop().value.name == "ccc" && names(a) == "axy");

    console.log("ALL DONE");
}
