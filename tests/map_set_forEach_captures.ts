// Callbacks over a Map or a Set that keep what they are given: the keys and values pushed into a
// captured array, by callbacks that declare fewer parameters than forEach passes. Under -mm=own each
// gets a copy of the string it keeps.
function main() {
    for (let round = 0; round < 100; round++) {
        const m = new Map<string, string>();
        m.set("a", "x");
        m.set("b", "y");
        const keys: string[] = [];
        m.forEach((v, k) => { keys.push(k); });
        const values: string[] = [];
        m.forEach((v) => { values.push(v); });
        let total = 0;
        const counts = new Map<string, number>();
        counts.set("one", 1);
        counts.set("two", 2);
        counts.forEach((v) => { total += v; });

        const s = new Set<string>(["p", "q", "r"]);
        const items: string[] = [];
        s.forEach((v) => { items.push(v); });

        m.delete("a");
        s.delete("p");
        assert(keys.length == 2 && keys[0] == "a" && keys[1] == "b", "keys");
        assert(values.length == 2 && values[0] == "x" && values[1] == "y", "values");
        assert(total == 3, "total");
        assert(items.length == 3 && items[0] == "p" && items[2] == "r", "items");
    }

    print("done.");
}
