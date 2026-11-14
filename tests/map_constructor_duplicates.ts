// A key given twice to the Map constructor keeps its last value and its first place; a value given
// twice to the Set constructor is in the set once.
function main() {
    const map = new Map<string, number>([["a", 1], ["b", 2], ["a", 3]]);
    assert(map.size == 2, "two keys");
    assert(map.get("a") == 3, "the last value given for a key");
    assert(map.get("b") == 2, "the others as they were");
    let order = "";
    for (const [k, v] of map) order += `${k}${v}`;
    assert(order == "a3b2", "the key keeps its first place");

    const numbers = new Map<number, string>([[1, "one"], [1, "uno"], [2, "two"], [1, "ein"]]);
    assert(numbers.size == 2 && numbers.get(1) == "ein", "number keys");

    const set = new Set<string>(["x", "y", "x"]);
    assert(set.size == 2 && set.has("x") && set.has("y"), "a set of two");
    set.add("x");
    assert(set.size == 2, "add of a value already there");

    console.log("ALL DONE");
}
