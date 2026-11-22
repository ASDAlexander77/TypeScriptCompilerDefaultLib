// Generator<T>: return(value)
// finishes a paused generator (its finally blocks run), throw(e) throws at its yield. An
// array given to an Iterable<T> is iterated (under -mm=own its copy).

let cleaned = 0;

function* guarded(): Generator<number> {
    try {
        yield 1;
        yield 2;
        yield 3;
    } finally {
        cleaned++;
    }
}

function* caught(): Generator<number> {
    let stopped = false;
    try {
        yield 1;
        yield 2;
    } catch (e) {
        stopped = true;
    }

    if (stopped) {
        yield 100;
    }
}

function sum(values: Iterable<number>) {
    let s: number = 0;
    for (const v of values) {
        s += v;
    }

    return s;
}

function main() {
    const g = guarded();
    assert(g.next().value == 1, "first");
    const f = g.return(7);
    assert(f.done && f.value == 7, "return(value)");
    assert(cleaned == 1, "finally ran on return()");
    assert(g.next().done, "finished after return()");

    const c = caught();
    c.next();
    const h = c.throw("stop");
    assert(h.value == 100 && !h.done, "throw(e) caught at the yield");
    assert(c.next().done, "finished after throw()");

    const a = [1, 2, 3.5];
    assert(sum(a) == 6.5, "an array as an Iterable");
    a.push(4);
    assert(sum(a) == 10.5, "the array still the caller's");

    print("ALL DONE");
}
