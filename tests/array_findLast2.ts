// findLast gives undefined when no element passes, as find does: it gave -1
function main() {
    const numbers = [5, 12, 50, 130, 44];
    assert(numbers.findLast((v) => v > 45) == 130, "the last that passes");
    assert(numbers.findLast((v) => v > 1000) == undefined, "undefined when none does");
    assert(numbers.findLast((v, i) => i == 0) == 5, "the index is given too");

    const words = ["a", "bb", "cc"];
    assert(words.findLast((v) => v.length == 2) == "cc", "strings");
    assert(words.findLast((v) => v.length == 9) == undefined, "no string");

    console.log("ALL DONE");
}
