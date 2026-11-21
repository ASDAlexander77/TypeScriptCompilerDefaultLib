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
// given to an Iterable<T> or Iterator<T> parameter, work. TReturn and TNext are taken but not used:
// next() takes no value, and a returned value is one more value. IteratorResult is an alias, not an
// interface, so a generator's next() matches it.
// Not yet (compiler): an array or a string as an Iterable<T>, next(value), return() and throw().
type IteratorResult<T, TReturn = any> = IterateResult<T>;

interface Iterable<T> {
    next: () => IterateResult<T>;
}

interface IterableIterator<T> {
    next: () => IterateResult<T>;
}

interface Generator<T = unknown, TReturn = any, TNext = any> {
    next: () => IterateResult<T>;
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