// Object.defineProperty of a dictionary given a literal descriptor of a `value` is `d[k] = value` (writable,
// enumerable and configurable are not kept); `s.description` of a symbol known only at run time is its text
// without `Symbol(` and `)` (TSLANG 222).
function pick(b: boolean): symbol {
    return b ? Symbol("a") : Symbol("bb");
}

function defineProperty() {
    const d: { [key: string]: number } = {};
    const same = Object.defineProperty(d, "x", { value: 42, writable: true });
    Object.defineProperty(d, "y", { value: 7 });
    assert(d["x"] == 42 && d["y"] == 7 && same["x"] == 42, "defineProperty");
    assert(Object.keys(d).join(",") == "x,y", "defineProperty keys");
}

function symbolDescription() {
    const r = pick(false);
    assert(r.toString() == "Symbol(bb)", "run-time toString");
    assert(r.description == "bb" && r.description.length == 2, "run-time description");
    const q = pick(true);
    assert(q.description == "a", "another run-time description");
}

function main() {
    defineProperty();
    symbolDescription();
    console.log("ALL DONE");
}
