// types: byte, short, ushort, int, uint, long, ulong, char, i8, i16, i32, i64, u8, u16, u32, u64, s8, s16, s32, s64, f16, f32, f64, f128, half, float, double

type IterateResult<T> = { value: T, done: boolean };

interface Iterator<T> {
    next: () => IterateResult<T>;
}

interface ClassIterator<T> {
    next(): IterateResult<T>;
}

// TypeScript's iteration types, as far as a generator here can be one. A generator function returns
// an object with next(), and for...of takes any object with next(), so here an Iterable is such an
// object too (not one with [Symbol.iterator]): `function* g(): Generator<number>`, and a generator
// given to an Iterable<T> or Iterator<T> parameter, work, and so does an array or a string given to an
// Iterable<T>. A returned value of a type other than T is an error. return(value) and throw(e) resume a paused generator finishing (its finally blocks
// run) or throwing at its yield. IteratorResult is an alias, not an interface, so a generator's next()
// matches it.
type IteratorResult<T, TReturn = any> = IterateResult<T>;

interface Iterable<T> {
    next: () => IterateResult<T>;
}

interface IterableIterator<T> {
    next: () => IterateResult<T>;
}

interface Generator<T = unknown, TReturn = any, TNext = any> {
    // next() takes no value here: a Generator is given to an Iterable<T> as it is, so their next() must be one
    // function type - `(value?: TNext) =>` called as an Iterable's `() =>` was a call of another signature (wasm's
    // "function signature mismatch"; natively the yield read a value never given). Not declared here yet:
    // next(value) (TSLANG 153).
    next: () => IterateResult<T>;
    // a generator declared to return a Generator has them (-mm=own: return() only for a T that owns nothing, a
    // number or a boolean); one declared otherwise, or not at all, is a Generator without them
    return?: (value: T) => IterateResult<T>;
    throw?: (e: any) => IterateResult<T>;
}

// Promise<T> is T: an async generator's next() gives the result itself
interface AsyncIterator<T> {
    next: () => Promise<IteratorResult<T>>;
}

interface AsyncIterable<T> {
    next: () => Promise<IteratorResult<T>>;
}

interface AsyncIterableIterator<T> {
    next: () => Promise<IteratorResult<T>>;
}

interface AsyncGenerator<T = unknown, TReturn = any, TNext = any> {
    next: () => Promise<IteratorResult<T>>;
}

type time_t = long;