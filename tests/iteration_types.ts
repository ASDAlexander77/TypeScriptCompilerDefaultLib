// TypeScript's iteration type names: a generator function can be declared to return a Generator,
// IterableIterator or Iterator, an async one an AsyncGenerator, and a generator is given to
// Iterable / AsyncIterable parameters (here an Iterable is an object with next(), as for...of takes).
// Number elements: under -mm=own, a generator returned as an interface of owned elements is not
// followed yet (a compiler limit, as for any interface declared outside the library).

function* numbers(): Generator<number> {
    yield 1.5;
    yield 2;
}

function* counted(n: int): IterableIterator<number> {
    // a number: the declared element type does not convert a yielded int yet (compiler)
    for (let i: number = 0; i < n; i++) {
        yield i;
    }
}

function* typed(): Generator<number, void, undefined> {
    yield 4;
    yield 5.5;
}

async function* later(): AsyncGenerator<number> {
    yield 0.5;
    yield 1;
}

function sum(values: Iterable<number>) {
    let s: number = 0;
    for (const v of values) {
        s += v;
    }

    return s;
}

function sumOf(it: Iterator<number>) {
    let s: number = 0;
    for (const v of it) {
        s += v;
    }

    return s;
}

async function sumLater(values: AsyncIterable<number>) {
    let s: number = 0;
    for await (const v of values) {
        s += v;
    }

    return s;
}

function main() {
    assert(sum(numbers()) == 3.5, "Generator as an Iterable");
    assert(sum(counted(4)) == 6, "IterableIterator as an Iterable");
    assert(sumOf(typed()) == 9.5, "Generator<T, TReturn, TNext> as an Iterator");

    const it = numbers();
    const first: IteratorResult<number> = it.next();
    assert(first.value == 1.5 && !first.done, "IteratorResult");
    it.next();
    assert(it.next().done, "finished");

    assert(await sumLater(later()) == 1.5, "AsyncGenerator as an AsyncIterable");

    print("ALL DONE");
}
