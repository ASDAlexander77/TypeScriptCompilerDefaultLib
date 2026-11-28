// Object.create(null) is an object of no keys that takes any, a dictionary of `any` (TSLANG 222).
function main() {
    const o = Object.create(null);
    o["k"] = 5;
    o["s"] = "t";
    assert(o["k"] == 5 && o["s"] == "t", "create(null)");
    assert(Object.keys(o).length == 2, "create(null) keys");
    console.log("ALL DONE");
}
