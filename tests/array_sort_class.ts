// not own: the comparison is forwarded through sort's optional parameter to its helper, and a callback
// given on through a parameter has no facts under -mm=own yet, so the call with two elements is a use
// of them after a call that may release them
// sort over class instances, in place. sort's default comparison (compiled even when a comparison is
// given) converts an element to a string, which needs a class to say how.
class Item {
    constructor(public key: number, public name: string) {}

    toString() {
        return this.name;
    }
}

function main() {
    const items = [new Item(3, "c"), new Item(1, "a"), new Item(4, "d"), new Item(2, "b")];

    const sorted = items.sort((p, q) => p.key - q.key);
    console.log(sorted[0].name, sorted[1].name, sorted[2].name, sorted[3].name);
    // Expected output: "a b c d"
    assert(items[0].key == 1 && items[3].key == 4, "sorted in place");

    console.log("ALL DONE");
}
