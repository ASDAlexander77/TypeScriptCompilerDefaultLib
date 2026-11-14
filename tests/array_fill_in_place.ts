// fill fills the array itself and gives it back, as in JavaScript: it filled a copy
function main() {
    const a = [1, 2, 3, 4];
    a.fill(0);
    assert(a[0] == 0 && a[1] == 0 && a[2] == 0 && a[3] == 0, "the array itself is filled");

    a.fill(7, 1, 3);
    assert(a[0] == 0 && a[1] == 7 && a[2] == 7 && a[3] == 0, "a range");

    a.fill(9, -1);
    assert(a[2] == 7 && a[3] == 9, "a negative start counts from the end");

    a.fill(5, 10);
    assert(a[3] == 9, "a start past the end fills nothing");

    const flags: boolean[] = [];
    flags.length = 3;
    flags.fill(true);
    assert(flags[0] && flags[1] && flags[2], "a new array filled");

    console.log("ALL DONE");
}
