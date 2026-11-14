// join puts the separator between every two elements, an empty first one included
function main() {
    assert(["", "a", "b"].join(",") == ",a,b", "a leading empty string");
    assert(["", ""].join("-") == "-", "two empty strings");
    assert(["a"].join(",") == "a", "one element");
    const none: string[] = [];
    assert(none.join(",") == "", "no elements");
    assert([1, 2, 3].join() == "1,2,3", "numbers, default separator");
    assert([1, 2, 3].join("") == "123", "no separator");

    const many: string[] = [];
    for (let i = 0; i < 20000; i++) many.push("item");
    assert(many.join(",").length == 20000 * 5 - 1, "a long array");

    console.log("ALL DONE");
}
