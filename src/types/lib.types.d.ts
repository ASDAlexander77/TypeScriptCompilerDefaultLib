// types: byte, short, ushort, int, uint, long, ulong, char, i8, i16, i32, i64, u8, u16, u32, u64, s8, s16, s32, s64, f16, f32, f64, f128, half, float, double

type IterateResult<T> = { value: T, done: boolean };

interface Iterator<T> {
    next: () => IterateResult<T>;
}

interface ClassIterator<T> {
    next(): IterateResult<T>;
}

type time_t = long;