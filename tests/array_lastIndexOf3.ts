// The fromIndex of lastIndexOf, as in JavaScript: at or past the end the search starts at the last
// element (it gave -1), and before the start there is nothing to search (it searched element 0)
function main() {
    const numbers = [2, 5, 9, 2];
    assert(numbers.lastIndexOf(2) == 3);
    assert(numbers.lastIndexOf(7) == -1);
    assert(numbers.lastIndexOf(2, 3) == 3);
    assert(numbers.lastIndexOf(2, 2) == 0);
    assert(numbers.lastIndexOf(2, -2) == 0);
    assert(numbers.lastIndexOf(2, -1) == 3);
    assert(numbers.lastIndexOf(2, 4) == 3, "the length");
    assert(numbers.lastIndexOf(2, 100) == 3, "past the end");
    assert(numbers.lastIndexOf(2, -4) == 0, "the first element, from the end");
    assert(numbers.lastIndexOf(2, -5) == -1, "before the start");
    assert(numbers.lastIndexOf(2, -100) == -1, "far before the start");

    const none: int[] = [];
    assert(none.lastIndexOf(1) == -1, "an empty array");

    console.log("ALL DONE");
}
