// sort is a merge sort: stable, as JavaScript's is, and quick enough for a large array.
function main() {
    // pairs sorted by their first half only: equal ones keep the order they came in
    const pairs = [31, 12, 33, 11, 21, 32, 13, 22];
    pairs.sort((a: int, b: int) => <int>(a / 10) - <int>(b / 10));
    const wanted = [12, 11, 13, 21, 22, 31, 33, 32];
    for (let i = 0; i < wanted.length; i++) {
        assert(pairs[i] == wanted[i], "stable order");
    }

    const empty: int[] = [];
    empty.sort((a: int, b: int) => a - b);
    assert(empty.length == 0, "empty");

    const one = [5];
    one.sort((a: int, b: int) => a - b);
    assert(one[0] == 5, "one element");

    const big: int[] = [];
    let x = 12345;
    for (let i = 0; i < 20000; i++) {
        x = (x * 1103515245 + 12345) & 0x7fffffff;
        big.push(x % 1000);
    }

    big.sort((a: int, b: int) => a - b);
    for (let i = 1; i < big.length; i++) {
        assert(big[i - 1] <= big[i], "in order");
    }

    const words = ["pear", "apple", "fig", "banana"];
    words.sort();
    assert(words.join(",") == "apple,banana,fig,pear", "default order");

    const sorted = words.toSorted((a: string, b: string) => a.length - b.length);
    assert(sorted.join(",") == "fig,pear,apple,banana", "toSorted, stable by length");
    assert(words[0] == "apple", "toSorted leaves the array");

    console.log("ALL DONE");
}
