// A map or a set is used again after clear(): looked up while empty, then filled past its first size.
function main() {
    const map = new Map<string, number>();
    map.set("a", 1);
    map.set("b", 2);
    map.clear();
    assert(map.size == 0, "empty after clear");

    assert(!map.has("a"), "has, on a cleared map");
    assert(map.get("a") == undefined, "get, on a cleared map");
    assert(!map.delete("a"), "delete, on a cleared map");
    let seen = 0;
    map.forEach((v: number, k: string, m: Map<string, number>) => { seen++; });
    for (const [k, v] of map) seen++;
    assert(seen == 0, "nothing to walk");

    map.set("c", 3);
    assert(map.size == 1 && map.get("c") == 3, "set after clear");
    assert(!map.has("a"), "what was cleared stays gone");
    for (let i = 0; i < 100; i++) map.set(`k${i}`, i);
    assert(map.size == 101 && map.get("k99") == 99 && map.get("c") == 3, "and grows again");

    // cleared with deleted entries on the free list
    map.delete("k1");
    map.delete("k2");
    map.clear();
    map.set("d", 4);
    assert(map.size == 1 && map.get("d") == 4 && !map.has("k3"), "clear after deletes");

    // clearing an empty map, twice
    map.clear();
    map.clear();
    assert(map.size == 0 && !map.has("d"), "clear twice");

    const numbers = new Map<number, string>();
    numbers.set(-5, "minus");
    numbers.clear();
    assert(!numbers.has(-5), "number keys");
    numbers.set(7, "seven");
    assert(numbers.get(7) == "seven", "number keys, set after clear");

    const set = new Set<string>();
    set.add("a");
    set.add("b");
    set.clear();
    assert(set.size == 0 && !set.has("a"), "has, on a cleared set");
    assert(!set.delete("a"), "delete, on a cleared set");
    for (const v of set) seen++;
    assert(seen == 0, "nothing to walk in the set");
    set.add("c");
    for (let i = 0; i < 100; i++) set.add(`k${i}`);
    assert(set.size == 101 && set.has("c") && set.has("k99") && !set.has("a"), "the set grows again");
    set.delete("k1");
    set.clear();
    set.clear();
    set.add("d");
    assert(set.size == 1 && set.has("d"), "set: clear after a delete");

    console.log("ALL DONE");
}
