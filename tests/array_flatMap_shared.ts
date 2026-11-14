// not own: a callback there cannot return an array it does not own ("borrows a captured variable")
// flatMap reads the array its callback gives: one the callback did not make is left as it was.
function main() {
    const ones: number[] = [1, 2, 3];

    // the same array for every element
    const pair: number[] = [7, 8];
    const repeated = ones.flatMap((v: number, i: number) => pair);
    assert(repeated.join(",") == "7,8,7,8,7,8", "flatMap of one array given three times");
    assert(pair.length == 2 && pair.join(",") == "7,8", "flatMap leaves the array it was given");

    // rows of a table
    const rows: string[][] = [["a", "b"], ["c"]];
    const cells = [1, 0, 1].flatMap((v: number, i: number) => rows[v]);
    assert(cells.join(",") == "c,a,b,c", "flatMap of arrays held elsewhere");
    assert(rows[0].length == 2 && rows[1].length == 1, "which stay as they were");

    // the Array<T> class
    const a = new Array<number>();
    a.push(1, 2);
    assert(a.flatMap((v: number, i: number) => pair).join(",") == "7,8,7,8", "Array<T>.flatMap");
    assert(pair.length == 2, "Array<T>.flatMap leaves it too");

    console.log("ALL DONE");
}
