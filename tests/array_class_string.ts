// The Array<T> class (not T[]) of strings: every method that walks, copies or fills the elements.
// Under -mm=own a string is copied where it is stored again, so `fill` gives each element its own.

function main() {
    const a = new Array<string>();
    assert(a.push("a", "bb", "ccc") == 3);
    assert(a.join("-") == "a-bb-ccc");
    assert(a.at(1) == "bb" && a.get(2) == "ccc");

    a.set(0, "x");
    assert(a.toString() == "x,bb,ccc");

    assert(a.every((v) => v.length > 0));
    assert(a.some((v) => v == "bb"));
    assert(a.find((v) => v.length == 3) == "ccc");
    assert(a.findIndex((v) => v == "bb") == 1);
    assert(a.findLast((v) => v.length < 3) == "bb");
    assert(a.findLastIndex((v) => v.length > 5) == -1);
    assert(a.includes("ccc") && a.indexOf("bb") == 1 && a.lastIndexOf("x") == 0);

    assert(a.filter((v) => v.length > 1).join() == "bb,ccc");
    let longer = "";
    for (const v of a.filter2((v) => v.length > 1)) longer += v;
    assert(longer == "bbccc");

    assert(a.map<string>((v) => v + "!").join() == "x!,bb!,ccc!");
    assert(a.reduce<string>((s, v) => s + v, "") == "xbbccc");

    let each = "";
    a.forEach((v) => {
        each += v;
    });
    assert(each == "xbbccc");

    let walked = "";
    for (const v of a) walked += v;
    assert(walked == "xbbccc");

    assert(a.slice(1).join() == "bb,ccc");
    assert(a.concat(["d"]).join() == "x,bb,ccc,d");
    assert(a.toReversed().join() == "ccc,bb,x");
    assert(a.toSorted().join() == "bb,ccc,x");

    const filled = a.fill("z", 1);
    assert(filled.join() == "x,z,z");

    assert(a.pop() == "ccc" && a.shift() == "x" && a.length == 1);
    a.unshift("p", "q");
    assert(a.join() == "p,q,bb");

    const removed = a.splice(1, 1, "r", "s");
    assert(removed.join() == "q" && a.join() == "p,r,s,bb");

    console.log("ALL DONE");
}
