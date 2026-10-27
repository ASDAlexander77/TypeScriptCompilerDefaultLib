// reverse over class instances, in place: under -mm=own the elements are exchanged, which moves
// nothing
class Item {
    constructor(public key: number, public name: string) {}
}

function main() {
    const items = [new Item(1, "a"), new Item(2, "b"), new Item(3, "c"), new Item(4, "d"), new Item(5, "e")];

    const reversed = items.reverse();
    console.log(reversed[0].name, reversed[2].name, reversed[4].name);
    // Expected output: "e c a"
    assert(items[0].key == 5 && items[1].key == 4 && items[2].key == 3 && items[4].key == 1, "reversed in place");

    items.reverse();
    assert(items[0].name == "a" && items[4].name == "e", "reversed back");

    console.log("ALL DONE");
}
