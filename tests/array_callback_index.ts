// An array's callbacks take the element and its index, as JavaScript gives them (`xs.map((x, i) => x + i)`);
// one that takes the element only still works.
function main() {
    const xs = [10, 20, 30];
    const k = 1;
    assert(xs.map((x, i) => x + i)[2] == 32, "map with index");
    assert(xs.map((x) => x * 2)[1] == 40, "map without index");
    assert(xs.filter((x, i) => i > 0).length == 2, "filter");
    assert(xs.find((x, i) => i == 1) == 20, "find");
    assert(xs.findIndex((x, i) => x == 20 && i == 1) == 1, "findIndex");
    assert(xs.findLastIndex((x, i) => i < 2) == 1, "findLastIndex");
    let s: number = 0;
    xs.forEach((x, i) => { s += x * i; });
    assert(s == 80, "forEach");
    assert(xs.some((x, i) => i == 2 && x == 30), "some");
    assert(xs.every((x, i) => x > i + k), "every");
    console.log("ALL DONE");
}
