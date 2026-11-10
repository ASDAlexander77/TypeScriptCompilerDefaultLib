// not own: Map.groupBy gives arrays as a Map's values, which -mm=own does not take.
function main() {
    const items = ["apple", "avocado", "banana", "blueberry", "cherry"];
    // substring, not item[0]: a string key, as get("a") gives
    const byLetter = Map.groupBy(items, (item: string, i: number) => item.substring(0, 1));
    assert(byLetter.size == 3, "three groups");
    for (const [key, group] of byLetter) {
        console.log(key, group.join(","));
    }

    const a = byLetter.get("a");
    assert(a != undefined && a.join(",") == "apple,avocado", "the items, in their order");
    const b = byLetter.get("b");
    assert(b != undefined && b.join(",") == "banana,blueberry", "group b");
    const c = byLetter.get("c");
    assert(c != undefined && c.length == 1, "group c");
    assert(!byLetter.has("d"), "no group without items");

    // the groups in the order their keys first come
    let order = "";
    for (const key of byLetter.keys()) order += key;
    assert(order == "abc", "the order of the keys");

    // a number key, and the index
    const evenOdd = Map.groupBy([10, 11, 12, 13, 14], (v: number, i: number) => i % 2);
    const even = evenOdd.get(0);
    assert(even != undefined && even.join(",") == "10,12,14", "by index");

    const empty: number[] = [];
    assert(Map.groupBy(empty, (v: number, i: number) => v).size == 0, "nothing to group");

    console.log("ALL DONE");
}
