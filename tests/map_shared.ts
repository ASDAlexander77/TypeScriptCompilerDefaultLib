// Objects in a Map or a Set go through Shared<T>: under -mm=own a plain object or `any` element is
// a compile error. Under rc and own Shared.count counts: the containers give every count back.
class Node {
    constructor(public n: number) {}
}

function counted() {
    return __MEMORY_MODEL__ === "rc" || __MEMORY_MODEL__ === "own";
}

function fill(x: Shared<Node>, y: Shared<Node>) {
    const m = new Map<string, Shared<Node>>();
    m.set("a", x);
    m.set("b", x);
    m.set("a", y);
    const got = m.get("b")!;
    assert(got.value.n == 7);

    let total = 0;
    for (const [k, v] of m) total += v.value.n;
    assert(total == 15);

    total = 0;
    for (const v of m.values()) total += v.value.n;
    assert(total == 15);

    for (const v of m.values()) {
        if (v.value.n == 8) break;
    }

    assert(m.delete("a"));
    assert(m.size == 1);
}

function sets(x: Shared<Node>, y: Shared<Node>) {
    const a = new Set<Shared<Node>>();
    a.add(x);
    a.add(y);
    const b = new Set<Shared<Node>>();
    b.add(x);
    const u = a.union(b);
    assert(u.size == 2);
    assert(a.intersection(b).size == 1);

    let total = 0;
    for (const v of u) total += v.value.n;
    assert(total == 15);
}

const x = new Shared(new Node(7));
const y = new Shared(new Node(8));

fill(x, y);
assert(!counted() || (Shared.count(x) == 1 && Shared.count(y) == 1));

sets(x, y);
assert(!counted() || (Shared.count(x) == 1 && Shared.count(y) == 1));

console.log("ALL DONE");
