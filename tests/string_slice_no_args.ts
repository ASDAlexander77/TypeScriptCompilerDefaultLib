// slice() with no arguments copies the whole string: indexStart defaults to 0, as in JavaScript.

function main() {
    const str = "abc" + 1;

    assert(str.slice() == "abc1", "slice()");
    assert(str.slice(undefined, 2) == "ab", "slice(undefined, 2)");
    assert("".slice() == "", "empty slice()");

    let x = str;
    for (let i = 0; i < 3; i++) {
        x = x.slice();
    }

    assert(x == "abc1", "slice() in a loop");

    print("ALL DONE");
}
