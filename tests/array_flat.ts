// flat, flatMap and toSpliced, on T[] and on the Array<T> class.
function main() {
    // flat: one level of nesting taken away
    const nested: number[][] = [[1, 2], [], [3]];
    const flat = nested.flat();
    assert(flat.length == 3 && flat.join(",") == "1,2,3", "flat");
    assert(nested.length == 3, "flat leaves the array as it was");

    const words: string[][] = [["a", "b"], ["c"]];
    assert(words.flat().join("") == "abc", "flat, strings");

    // flatMap: map, then flat
    // each callback takes the index too, and the arrays are typed: a literal [1, 2, 3] is an s32[],
    // which a callback taking a number does not match
    const ones: number[] = [1, 2, 3];
    const doubled = ones.flatMap((v: number, i: number) => [v, v * 10]);
    assert(doubled.join(",") == "1,10,2,20,3,30", "flatMap");
    const indexes = ["x", "y"].flatMap((v: string, i: number) => [`${v}${i}`]);
    assert(indexes.join(",") == "x0,y1", "flatMap with the index");
    const none = ones.flatMap((v: number, i: number) => { const empty: number[] = []; return empty; });
    assert(none.length == 0, "flatMap to nothing");
    const split = ["a b", "c"].flatMap((v: string, i: number) => v.split(" "));
    assert(split.join(",") == "a,b,c", "flatMap of strings made at run time");

    // toSpliced: splice on a copy
    const months = ["Jan", "Mar", "Apr", "May"];
    const inserted = months.toSpliced(1, 0, "Feb");
    assert(inserted.join(",") == "Jan,Feb,Mar,Apr,May", "toSpliced inserts");
    assert(months.join(",") == "Jan,Mar,Apr,May", "and leaves the array as it was");
    assert(months.toSpliced(1, 2).join(",") == "Jan,May", "toSpliced removes");
    assert(months.toSpliced(1, 1, "Feb", "Mar").join(",") == "Jan,Feb,Mar,Apr,May", "toSpliced replaces");
    assert(months.toSpliced(2).join(",") == "Jan,Mar", "no deleteCount: to the end");
    assert(months.toSpliced(-1, 1).join(",") == "Jan,Mar,Apr", "a negative start counts from the end");
    assert(months.toSpliced(10, 1, "Jun").join(",") == "Jan,Mar,Apr,May,Jun", "a start past the end");
    assert(months.toSpliced(0, 99).length == 0, "a deleteCount past the end");

    // the Array<T> class
    const a = new Array<string>();
    a.push("a", "b", "c");
    assert(a.toSpliced(1, 1, "x", "y").join(",") == "a,x,y,c", "Array<T>.toSpliced");
    assert(a.length == 3, "Array<T> as it was");
    assert(a.flatMap((v: string, i: number) => [v, v]).join("") == "aabbcc", "Array<T>.flatMap");

    console.log("ALL DONE");
}
