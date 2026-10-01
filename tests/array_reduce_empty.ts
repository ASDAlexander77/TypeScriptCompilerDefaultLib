// reduce / reduceRight of an empty array with no initial value throw a TypeError, as in JavaScript; with an
// initial value they return it
function main() {
    const empty: number[] = [];

    let reduceThrew = false;
    try {
        empty.reduce((x, y) => x + y);
    } catch {
        reduceThrew = true;
    }

    assert(reduceThrew, "reduce of empty array throws");

    let reduceRightThrew = false;
    try {
        empty.reduceRight((x, y) => x + y);
    } catch {
        reduceRightThrew = true;
    }

    assert(reduceRightThrew, "reduceRight of empty array throws");

    assert(empty.reduce((x, y) => x + y, 5) == 5, "initial value");

    const values = [1.5, 2.5, 3];
    const sum: number = values.reduce((x, y) => x + y);
    assert(sum == 7, "sum");
    assert(values.reduce((x, y) => x + y) * 2 == 14, "arithmetic on the result");

    console.log("ALL DONE");
}
