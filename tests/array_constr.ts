
function main() {
    const a = new Array<int>(10);
    assert(a.length == 10 && a[0] == 0);

    const b = new Array<string>("a", "b", "c");
    assert(b.length == 3 && b[0] == "a" && b[1] == "b" && b[2] == "c");

    console.log("ALL DONE");
}
