type Record<K extends string | number | symbol, T> = { [P in K]: T; };
type Partial<T> = { [P in keyof T]?: T[P] | undefined; }
type Required<T> = { [P in keyof T]-?: T[P]; }
type Readonly<T> = { readonly [P in keyof T]: T[P]; }
type Pick<T, K extends keyof T> = { [P in K]: T[P]; }
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type Omit<T, K extends string | number | symbol> = Pick<T, Exclude<keyof T, K>>;
type NonNullable<T> = T & {};
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
type ConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never;
type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any;
type ThisParameterType<T> = T extends (this: infer U, ...args: never) => any ? U : unknown
type OmitThisParameterType<T> = T extends (this: never, ...args: infer A) => infer R ? (...args: A) => R : T;

type ThisType<T> = T;

function __is<V extends T, T>(t: T): t is V {
    return true;
}

// Route through the native wrapper 'std_this_thread_sleep_for' (milliseconds). Defining the body
// here (instead of a `declare function sleep` in lib.d.ts) keeps user code from
// emitting a bare external `@sleep`, which the JIT would otherwise bind to
// glibc's seconds-based sleep(3) -> sleep(1000) hangs for ~16 minutes.
// Me:
// we need to make it generic to prevent multiple declaration of the same reference name
function sleep<T = u32>(milliseconds: T): void {
    std_this_thread_sleep_for(milliseconds);
}

function __is_any<V extends never>(t: V): t is V {
    return true;
}

// What toSpliced gives, for T[] and Array<T> alike: a copy of `source` with `deleteCount` elements at
// `start` replaced by `items`. A negative start counts from the end; both are clamped into range.
// The items are moved in (their caller gives them up, as push's do); the rest are shared, as slice's.
function __toSpliced<T>(source: T[], start: int, deleteCount: int, items: T[]): T[] {
    const length = source.length;
    if (start < 0) {
        start = start + length < 0 ? 0 : start + length;
    } else if (start > length) {
        start = length;
    }

    let count = deleteCount;
    if (count < 0) {
        count = 0;
    } else if (count > length - start) {
        count = length - start;
    }

    const result: T[] = [];
    for (let i = 0; i < start; i++) result.push(source[i]);
    __moveAll(items, result);
    for (let i = start + count; i < length; i++) result.push(source[i]);
    return result;
}

// The elements [from, to) of `a` in reverse order, by exchanges, which move nothing: through a
// local, under -mm=own an object element would have two owners (see __Array.reverse).
function __reverseRange<T>(a: T[], from: int, to: int): void {
    let i = from;
    let j = to - 1;
    while (i < j) {
        [a[i], a[j]] = [a[j], a[i]];
        i++;
        j--;
    }
}

// Every element of `source` moved onto the end of `target`, in order; `source` is left empty.
// Reversed once so each comes off the end: a shift for each one moved all the rest down every
// time, which made n elements cost n * n.
function __moveAll<T>(source: T[], target: T[]): void {
    __reverseRange(source, 0, source.length);
    while (source.length > 0) target.push(source.pop());
}

namespace __Array {
    function at<T>(this: T[], index: int) {
        return this[index];
    }

    @sharesElements
    function copyWithin<T>(this: T[], target: int, start: int, end = this.length) {

        if (target < 0) {
            if (-this.length <= target) {
                target = target + this.length;
            } else if (target < -this.length) {
                target = 0;
            }
        } else if (target >= this.length) {
            return this;
        }

        if (start < 0) {
            if (-this.length <= start) {
                start = start + this.length;
            } else if (start < -this.length) {
                start = 0;
            }
        } else if (start >= this.length) {
            return this;
        }

        if (end < 0) {
            if (-this.length <= end) {
                end = end + this.length;
            } else if (end < -this.length) {
                end = 0;
            }
        } else if (end >= this.length) {
            end = this.length;
        }

        // element by element, not memmove: under rc an element may own what it holds, and an
        // assignment is what takes a reference to the copy and gives up the one overwritten.
        // Backwards when the ranges overlap that way, as memmove would.
        let count = end - start;
        if (count > this.length - target) count = this.length - target;
        if (target > start) {
            for (let i = count - 1; i >= 0; i--) this[target + i] = this[start + i];
        } else {
            for (let i = 0; i < count; i++) this[target + i] = this[start + i];
        }

        return this;
    }

    // to prevent cycling initialization of T[][] as Array<Array<....>> which causes inf. cycle
    @sharesElements
    function concat<T>(this: T[], ...other: T[][]) {
        let count = this.length;
        for (const item of other)
            count += item.length;
        let newArray: T[] = [];
        newArray.length = count;
        // element by element, not memcpy: under rc an element may own what it holds, and the new
        // array's store is what takes the reference its release will give back
        let index = 0;
        for (const v of this) newArray[index++] = v;
        for (const item of other) {
            for (const v of item) newArray[index++] = v;
        }

        return newArray;
    }

    @sharesElements
    function* entries<T>(this: T[]) {
        for (let i = 0; i in this; i++) {
            // under -mm=own the element is read into the state before the yield: a tuple made from
            // a borrow of it in the yield itself is not one own can follow yet
            const v = this[i];
            yield [i, v];
        }
    }

    function toString<T>(this: T[]) {
        return this.join();
    }

    // A callback takes the element and its index, as JavaScript gives them; one that takes the element only
    // is given as one taking both (the compiler's fewer-parameters thunk).
    function every<T>(this: T[], func: (v: T, i: number) => boolean) {
        for (let i = 0; i < this.length; i++) if (!func(this[i], i)) return false;
        return true;
    }

    // Fills the array itself and gives it back, as JavaScript does: it used to fill a copy and leave
    // the array as it was.
    @sharesElements
    function fill<T>(this: T[], value: T, start = 0, end = this.length) {
        if (start < 0) {
            if (-this.length <= start) {
                start = start + this.length;
            } else if (start < -this.length) {
                start = 0;
            }
        } else if (start >= this.length) {
            return this;
        }

        if (end < 0) {
            if (-this.length <= end) {
                end = end + this.length;
            } else if (end < -this.length) {
                end = 0;
            }
        } else if (end >= this.length) {
            end = this.length;
        }

        for (let i = start; i < end; i++)
            this[i] = value;

        return this;
    }

    @sharesElements
    function filter<T>(this: T[], func: (v: T, i: number) => boolean) {
        let result: T[] = [];
        for (let i = 0; i < this.length; i++) if (func(this[i], i)) result.push(this[i]);
        return result;
    }

    @sharesElements
    function* filter2<T>(this: T[], func: (v: T, i: number) => boolean) {
        for (let i = 0; i < this.length; i++) if (func(this[i], i)) yield this[i];
    }

    function find<T>(this: T[], func: (v: T, i: number) => boolean): T | undefined {
        for (let i = 0; i < this.length; i++) if (func(this[i], i)) return this[i];
        return undefined;
    }

    function findIndex<T>(this: T[], func: (v: T, i: number) => boolean) {
        for (let i = 0; i < this.length; i++) if (func(this[i], i)) return i;
        return -1;
    }

    // undefined when there is none, as find gives: it gave -1, which is findLastIndex's answer
    function findLast<T>(this: T[], func: (v: T, i: number) => boolean): T | undefined {
        for (let i = this.length - 1; i >= 0; i--) if (func(this[i], i)) return this[i];
        return undefined;
    }

    function findLastIndex<T>(this: T[], func: (v: T, i: number) => boolean) {
        for (let i = this.length - 1; i >= 0; i--) {
            const v = this[i];
            if (func(v, i)) return i;
        }

        return -1;
    }

    function forEach<T>(this: T[], func: (v: T, i: number) => void) {
        for (let i = 0; i < this.length; i++) func(this[i], i);
    }

    function includes<T>(this: T[], searchElement: T, fromIndex = 0) {
        if (fromIndex < 0) {
            if (-this.length <= fromIndex) {
                fromIndex = fromIndex + this.length;
            } else if (fromIndex < -this.length) {
                fromIndex = 0;
            }
        } else if (fromIndex >= this.length) {
            return false;
        }

        if (fromIndex < 0)
            fromIndex = 0;

        for (let i = fromIndex; i in this; i++) {
            if (searchElement === this[i]) return true;
        }

        return false;
    }

    function indexOf<T>(this: T[], searchElement: T, fromIndex = 0) {
        if (fromIndex < 0) {
            if (-this.length <= fromIndex) {
                fromIndex = fromIndex + this.length;
            } else if (fromIndex < -this.length) {
                fromIndex = 0;
            }
        } else if (fromIndex >= this.length) {
            return -1;
        }

        if (fromIndex < 0)
            fromIndex = 0;

        for (let i = fromIndex; i in this; i++) {
            if (searchElement === this[i]) return i;
        }

        return -1;
    }

    // Each element's text with the separator before it, then one string of them all. Adding each to
    // one result copied what was there for every element, and asked its length (a walk to its end)
    // to know whether a separator was due - which also lost the separator after a leading "".
    function join<T>(this: T[], separator = ",") {
        const parts: string[] = [];
        const length = this.length;
        for (let i = 0; i < length; i++) {
            if (i > 0) {
                parts.push(separator + this[i]);
            } else {
                parts.push("" + this[i]);
            }
        }

        return "".concat(...parts);
    }

    function* keys<T>(this: T[]) {
        for (let i = 0; i in this; i++) {
            yield i;
        }
    }

    // The search goes backwards from `fromIndex`. As in JavaScript, one at or past the end starts at
    // the last element (it gave -1), a negative one counts from the end, and one before the start
    // finds nothing (it searched element 0).
    function lastIndexOf<T>(this: T[], searchElement: T, fromIndex = this.length - 1) {
        const length: int = this.length;
        let from: int = <int>fromIndex;
        if (from < 0) {
            from = from + length;
        } else if (from >= length) {
            from = length - 1;
        }

        for (let i = from; i >= 0; i--) {
            if (searchElement === this[i]) return i;
        }

        return -1;
    }

    function map<T, V>(this: T[], func: (v: T, i: number) => V) {
        let result: V[] = [];
        result.length = this.length;
        for (let i = 0; i in this; i++) result[i] = func(this[i], i);
        return result;
    }

    // -mm=own: with no initial value the accumulator starts as an element, which has an owner: it
    // starts from a copy of it instead (@copies), when the elements are values, strings or arrays of values
    @copies
    function reduce<T, V = T>(this: T[], func: (v: V, t: T) => V, initial?: V): V {
        if (initial == undefined) {
            if (this.length <= 0) {
                // as in JavaScript: there is no first value to start from
                throw new TypeError("Reduce of empty array with no initial value");
            }

            if (__is<V, T>(this[0])) {
                let result = <V>this[0];
                for (let i = 1; i in this; i++) result = func(result, this[i]);
                return result;
            }
        }
        else {
            let result = initial;
            for (const v of this) result = func(result, v);
            return result;
        }
    }

    // -mm=own: with no initial value the accumulator starts as an element, which has an owner: it
    // starts from a copy of it instead (@copies), when the elements are values, strings or arrays of values
    @copies
    function reduceRight<T, V = T>(this: T[], func: (v: V, t: T) => V, initial?: V): V {
        if (initial == undefined) {
            if (this.length <= 0) {
                // as in JavaScript: there is no first value to start from
                throw new TypeError("Reduce of empty array with no initial value");
            }

            if (__is<V, T>(this[0])) {
                let result = <V>this[this.length - 1];
                for (let i = this.length - 2; i in this; i--) result = func(result, this[i]);
                return result;
            }
        }
        else {
            let result = initial;
            for (let i = this.length - 1; i in this; i--) result = func(result, this[i]);
            return result;
        }
    }

    function reverse<T>(this: T[]) {
        const shift = this.length - 1;
        const size = this.length >> 1;
        for (let i = 0; i < size; i++) {
            // an exchange of the two elements, which moves nothing: through a local, under -mm=own
            // an object element would have two owners
            [this[i], this[shift - i]] = [this[shift - i], this[i]];
        }

        return this;
    }

    @sharesElements
    function slice<T>(this: T[], start = 0, end = this.length) {
        if (start < 0) {
            if (-this.length <= start) {
                start = start + this.length;
            } else if (start < -this.length) {
                start = 0;
            }
        } else if (start >= this.length) {
            return <T[]>[];
        }

        if (end < 0) {
            if (-this.length <= end) {
                end = end + this.length;
            } else if (end < -this.length) {
                end = 0;
            }
        } else if (end >= this.length) {
            end = this.length;
        }

        let newArray: T[] = [];
        newArray.length = end - start;
        // element by element, not memcpy (see concat)
        for (let i = start; i < end; i++) newArray[i - start] = this[i];
        return newArray;
    }

    function some<T>(this: T[], func: (v: T, i: number) => boolean) {
        for (let i = 0; i < this.length; i++) if (func(this[i], i)) return true;
        return false;
    }

    // The comparison is a parameter the sort only calls, never one it assigns: under -mm=own what a
    // callback may release is known from the functions given for it, and a parameter assigned a
    // default is one nothing knows - so a call of it with two elements would be a use of them after
    // it may release them.
    //
    // A merge sort of the elements' positions, then the elements exchanged into that order: about
    // n log n comparisons where a selection sort made n * n, and stable, as JavaScript's sort is.
    // The elements themselves only ever change places (an exchange, as in reverse).
    function mergeSort<T>(a: T[], compare: (value1: T, value2: T) => int) {
        const len: int = a.length;
        let order: int[] = [];
        order.length = len;
        let merged: int[] = [];
        merged.length = len;
        for (let i = 0; i < len; i++) order[i] = i;

        // runs of `width` positions, each in order, merged two by two
        for (let width = 1; width < len; width *= 2) {
            for (let lo = 0; lo < len; lo += 2 * width) {
                let mid = lo + width;
                if (mid > len) mid = len;
                let hi = mid + width;
                if (hi > len) hi = len;

                let i = lo;
                let j = mid;
                let k = lo;
                while (i < mid && j < hi) {
                    // the right one goes first only when the left one is greater: equal elements
                    // keep the order they came in
                    if (compare(a[order[i]], a[order[j]]) > 0) {
                        merged[k] = order[j];
                        j++;
                    } else {
                        merged[k] = order[i];
                        i++;
                    }

                    k++;
                }

                while (i < mid) {
                    merged[k] = order[i];
                    i++;
                    k++;
                }

                while (j < hi) {
                    merged[k] = order[j];
                    j++;
                    k++;
                }
            }

            for (let i = 0; i < len; i++) order[i] = merged[i];
        }

        // order[i] is where the element that belongs at i is now: each cycle of positions is
        // walked once, an exchange putting one element in its place
        for (let i = 0; i < len; i++) {
            let current = i;
            while (order[current] != i) {
                const next = order[current];
                [a[current], a[next]] = [a[next], a[current]];
                order[current] = current;
                current = next;
            }

            order[current] = current;
        }
    }

    function sort<T>(this: T[], callbackfn?: (value1: T, value2: T) => int): T[] {
        if (this.length <= 0) {
            return this;
        }

        if (callbackfn) {
            mergeSort(this, callbackfn);
        } else {
            mergeSort(this, (a: T, b: T) => {
                const sa = <string>a;
                const sb = <string>b;
                if (sa == sb) return 0;
                return sa > sb ? 1 : -1;
            });
        }

        return this;
    }

    // the iterator borrows the array, as values() does: under -mm=own the result may not outlive it
    @borrows("this")
    function iterator<T>(this: T[]) {
        return this.values();
    }

    @sharesElements
    function toReversed<T>(this: T[]) {
        let newArray = this.slice();
        newArray.reverse();
        return newArray;
    }

    @sharesElements
    function toSorted<T>(this: T[], callbackfn?: (value1: T, value2: T) => int): T[] {
        let newArray = this.slice();
        newArray.sort(callbackfn);
        return newArray;
    }

    @sharesElements
    function* values<T>(this: T[]) {
        for (const v of this) {
            yield v;
        }
    }

    @sharesElements
    function _with<T>(this: T[], index: int, value: T) {
        if (index < 0) {
            if (-this.length <= index) {
                index = index + this.length;
            }
        }

        if (index < 0 || index >= this.length) {
            throw new RangeError();
        }

        let newArray = this.slice();
        newArray[index] = value;
        return newArray;
    }

    // One level of nesting taken away: [[1, 2], [3]].flat() is [1, 2, 3]. Only one level: a depth
    // would make the result's type depend on a number.
    @sharesElements
    function flat<T>(this: T[][]): T[] {
        const result: T[] = [];
        for (const inner of this) {
            for (const v of inner) result.push(v);
        }

        return result;
    }

    // map, then flat: each element becomes the elements of the array `func` gives for it
    @sharesElements
    function flatMap<T, V>(this: T[], func: (v: T, i: number) => V[]): V[] {
        const result: V[] = [];
        for (let i = 0; i < this.length; i++) {
            // read, as flat reads: func may give an array it holds on to (the same one for every
            // element, a row of a table), so nothing is moved out of it
            const mapped = func(this[i], i);
            for (const v of mapped) result.push(v);
        }

        return result;
    }

    // splice on a copy: the array itself stays as it is. Without deleteCount every element from
    // `start` on goes.
    @sharesElements
    function toSpliced<T>(this: T[], start: int, deleteCount?: int, ...items: T[]): T[] {
        return __toSpliced(this, start, deleteCount === undefined ? this.length : deleteCount, items);
    }
}

// -mm=own: the array owns its elements. push, unshift and splice take what they are given (their
// callers give it up) and splice and shift give back what they remove; an element read is a borrow.
class Array<T> {

    // protected: TypedArray takes a reference to an element of it for Atomics
    constructor(protected data: T[] = []) {
    }

    constructor(count: int = 0) {
        this.data = [];
        this.data.length = count;
    }

    constructor(...args: T[]) {
        this.data = args;
    }

    public [index: int]: T;

    public get(index: int): T {
        return this.data[index];
    }

    public set(index: int, value: T) {
        this.data[index] = value;
    }

    // each element is moved out of `args`, not read: -mm=own then keeps them, and the callers give
    // them up
    public push(...args: T[]): int {
        __moveAll(args, this.data);
        return this.data.length;
    }

    public pop(): T {
        return this.data.pop();
    }

    public shift(): T {
        return this.data.shift();
    }

    // A few go in one at a time, each a single move of the elements already there. Many are moved
    // onto the end, and the two parts then change places: one pass over the elements, by exchanges,
    // which costs about what eight of those moves do.
    public unshift(...args: T[]): int {
        if (args.length < 8) {
            while (args.length > 0)
                this.data.unshift(args.pop());
            return this.data.length;
        }

        const before: int = this.data.length;
        __moveAll(args, this.data);
        const after: int = this.data.length;
        if (before > 0 && after > before) {
            __reverseRange(this.data, 0, before);
            __reverseRange(this.data, before, after);
            __reverseRange(this.data, 0, after);
        }

        return after;
    }

    // Removes `deleteCount` elements at `start` (all of them to the end when it is left out),
    // inserts `items` there, and returns the removed ones. A negative start counts from the end.
    public splice(start: int, deleteCount?: int, ...items: T[]): T[] {
        const length = this.data.length;
        if (start < 0) {
            start = start + length < 0 ? 0 : start + length;
        } else if (start > length) {
            start = length;
        }

        let count = deleteCount === undefined ? length - start : deleteCount;
        if (count < 0) {
            count = 0;
        } else if (count > length - start) {
            count = length - start;
        }

        // The removed elements are moved out, not read: they go to the end, the first of them
        // last, and are popped off in order. Two reversals take them there - of everything from
        // `start`, then of what stays - where each used to be swapped down one place at a time.
        const end: int = length;
        const from: int = start;
        const kept: int = end - count;
        if (count > 0) {
            __reverseRange(this.data, from, end);
            __reverseRange(this.data, from, kept);
        }

        const removed: T[] = [];
        for (let k = 0; k < count; k++)
            removed.push(this.data.pop());

        // a few items go in one at a time, as in unshift
        if (items.length < 8) {
            for (let i = 0; items.length > 0; i++)
                this.data.splice(start + i, 0, items.shift());
            return removed;
        }

        // many go on at the end, then change places with what followed `start`
        __moveAll(items, this.data);
        const total: int = this.data.length;
        if (total > kept && kept > from) {
            __reverseRange(this.data, from, kept);
            __reverseRange(this.data, kept, total);
            __reverseRange(this.data, from, total);
        }

        return removed;
    }

    public get length() {
        return this.data.length;
    }

    public set length(val: int) {
        this.data.length = val;
    }

    public at(index: int) {
        return this[index];
    }

    @sharesElements
    public copyWithin(target: int, start: int, end = this.length) {
        return this.data.copyWithin(target, start, end);
    }

    // not `this.data.concat(...other)`: under -mm=own the spread would move other's arrays into a new one
    @sharesElements
    public concat(...other: T[][]) {
        let result = this.data.slice();
        for (const item of other) {
            for (const v of item) result.push(v);
        }

        return result;
    }

    // the iterators borrow the array, as T[]'s do: under -mm=own they may not outlive it
    @borrows("this")
    @sharesElements
    public entries() {
        return this.data.entries();
    }

    public toString() {
        return this.join();
    }

    public every(func: (v: T, i: number) => boolean) {
        return this.data.every(func);
    }

    @sharesElements
    public fill(value: T, start = 0, end = this.length) {
        return this.data.fill(value, start, end);
    }

    @sharesElements
    public filter(func: (v: T, i: number) => boolean) {
        return this.data.filter(func);
    }

    @borrows("this", "func")
    @sharesElements
    public filter2(func: (v: T, i: number) => boolean) {
        return this.data.filter2(func);
    }

    public find(func: (v: T, i: number) => boolean) {
        return this.data.find(func);
    }

    public findIndex(func: (v: T, i: number) => boolean) {
        return this.data.findIndex(func);
    }

    public findLast(func: (v: T, i: number) => boolean) {
        return this.data.findLast(func);
    }

    public findLastIndex(func: (v: T, i: number) => boolean) {
        return this.data.findLastIndex(func);
    }

    public forEach(func: (v: T, i: number) => void) {
        this.data.forEach(func);
    }

    public includes(searchElement: T, fromIndex = 0) {
        return this.data.includes(searchElement, fromIndex);
    }

    public indexOf(searchElement: T, fromIndex = 0) {
        return this.data.indexOf(searchElement, fromIndex);
    }

    public join(separator = ",") {
        return this.data.join(separator);
    }

    @borrows("this")
    public keys() {
        return this.data.keys();
    }

    public lastIndexOf(searchElement: T, fromIndex = this.length - 1) {
        return this.data.lastIndexOf(searchElement, fromIndex);
    }

    public map<V>(func: (v: T, i: number) => V) {
        return this.data.map<V>(func);
    }

    public reduce<V = T>(func: (v: V, t: T) => V, initial?: V) {
        return this.data.reduce<V>(func, initial);
    }

    public reduceRight<V = T>(func: (v: V, t: T) => V, initial?: V) {
        return this.data.reduceRight<V>(func, initial);
    }

    public reverse() {
        return this.data.reverse();
    }

    @sharesElements
    public slice(start = 0, end = this.length) {
        return this.data.slice(start, end);
    }

    public some(func: (v: T, i: number) => boolean) {
        return this.data.some(func);
    }

    public sort(callbackfn?: (value1: T, value2: T) => int): T[] {
        return this.data.sort(callbackfn);
    }

    @borrows("this")
    @sharesElements
    public [Symbol.iterator]() {
        return this.data.values();
    }

    @sharesElements
    public toReversed() {
        return this.data.toReversed();
    }

    @sharesElements
    public toSorted(callbackfn?: (value1: T, value2: T) => int): T[] {
        return this.data.toSorted(callbackfn);
    }

    @borrows("this")
    @sharesElements
    public values() {
        return this.data.values();
    }

    @sharesElements
    public _with(index: int, value: T) {
        return this.data._with(index, value);
    }

    @sharesElements
    public flatMap<V>(func: (v: T, i: number) => V[]): V[] {
        return this.data.flatMap<V>(func);
    }

    @sharesElements
    public toSpliced(start: int, deleteCount?: int, ...items: T[]): T[] {
        return __toSpliced(this.data, start, deleteCount === undefined ? this.data.length : deleteCount, items);
    }
}

static class Array {
    public of(...arg) {
        return arg;
    }

    public from(arrayLike) {
        return [...arrayLike];
    }
}

class TypedArray<T> extends Array<T> {
    constructor(data: T[] = []) {
        super(data);
    }

    // `length` elements, each 0, as in JavaScript: new Uint8Array(4096) is a buffer for Stdio.read
    constructor(length: int) {
        super();
        this.data.length = length;
        for (let i = 0; i < length; i++) {
            this.data[i] = <T>0;
        }
    }

    // The element itself, for Atomics. Only the reference is taken here, never an atomic operation:
    // every method of a generic class is built for each T it is used with, and Float32Array and
    // Float64Array are TypedArrays too, which LLVM's integer atomics do not take.
    public __elementRef(index: int): Reference<T> {
        if (index < 0 || index >= this.data.length) {
            throw new RangeError();
        }

        return Ref(this.data[index]);
    }
}

type Int8Array = TypedArray<s8>;

type Uint8Array = TypedArray<u8>;

type Int16Array = TypedArray<s16>;

type Uint16Array = TypedArray<u16>;

type Int32Array = TypedArray<s32>;

type Uint32Array = TypedArray<u32>;

type BigInt64Array = TypedArray<s64>;

type BigUint64Array = TypedArray<u64>;

type Float32Array = TypedArray<f32>;

type Float64Array = TypedArray<f64>;

// Atomic operations on an integer TypedArray's elements, each sequentially consistent, as in
// JavaScript. Each is one LLVM atomic `load`, `store`, `atomicrmw` or `cmpxchg` on the element. The
// operation codes are written out, not passed in: the builtins take them only as constants. The
// value is a `number`, as in JavaScript, and wraps to the element's width (300 added to a Uint8Array
// element adds 44). There is no SharedArrayBuffer and a TypedArray is not a view over a buffer, so an
// operation acts on the array's own elements: threads share the array itself (see Thread.spawn).
// `waitAsync` is not here: there is no event loop to resolve its promise.
namespace Atomics {
    // atomicrmw operations: 0 xchg, 1 add, 2 sub, 3 and, 5 or, 6 xor; ordering 7: seq_cst

    function add<T>(typedArray: TypedArray<T>, index: int, value: number): T {
        return atomicrmw(1, typedArray.__elementRef(index), <T>value, 7);
    }

    function sub<T>(typedArray: TypedArray<T>, index: int, value: number): T {
        return atomicrmw(2, typedArray.__elementRef(index), <T>value, 7);
    }

    function and<T>(typedArray: TypedArray<T>, index: int, value: number): T {
        return atomicrmw(3, typedArray.__elementRef(index), <T>value, 7);
    }

    function or<T>(typedArray: TypedArray<T>, index: int, value: number): T {
        return atomicrmw(5, typedArray.__elementRef(index), <T>value, 7);
    }

    function xor<T>(typedArray: TypedArray<T>, index: int, value: number): T {
        return atomicrmw(6, typedArray.__elementRef(index), <T>value, 7);
    }

    function exchange<T>(typedArray: TypedArray<T>, index: int, value: number): T {
        return atomicrmw(0, typedArray.__elementRef(index), <T>value, 7);
    }

    // the value that was there; the replacement is written only when that was `expectedValue`
    function compareExchange<T>(typedArray: TypedArray<T>, index: int, expectedValue: number, replacementValue: number): T {
        return cmpxchg(typedArray.__elementRef(index), <T>expectedValue, <T>replacementValue, 7, 7)[0];
    }

    function load<T>(typedArray: TypedArray<T>, index: int): T {
        return atomicload(typedArray.__elementRef(index), 7);
    }

    // returns the value stored, as JavaScript does, not the one it replaced
    function store<T>(typedArray: TypedArray<T>, index: int, value: number): T {
        const stored = <T>value;
        atomicstore(typedArray.__elementRef(index), stored, 7);
        return stored;
    }

    // generic, like `sleep`: a plain function here is built into the library and into every
    // program too, and a debug link then finds it defined twice
    function isLockFree<T = int>(size: T): boolean {
        return size == 1 || size == 2 || size == 4 || size == 8;
    }

    // Sleeps until notify wakes it, while the element is `value`: "not-equal" at once when it is
    // not, "timed-out" after `timeout` milliseconds (none: forever). Int32Array and BigInt64Array
    // only, as in JavaScript - any other 4- or 8-byte array is compared as the integer it holds.
    function wait<T>(typedArray: TypedArray<T>, index: int, value: number, timeout?: number): string {
        const element = typedArray.__elementRef(index);
        const timeoutMs = timeout == undefined ? Infinity : timeout;
        let result = 0;
        switch (sizeof<T>()) {
            case 4:
                result = tslang_atomics_wait32(<Reference<s32>>element, <s32>value, timeoutMs);
                break;
            case 8:
                result = tslang_atomics_wait64(<Reference<s64>>element, <s64>value, timeoutMs);
                break;
            default:
                throw new TypeError("Atomics.wait takes an Int32Array or a BigInt64Array");
        }

        return result == 0 ? "ok" : result == 1 ? "not-equal" : "timed-out";
    }

    // wakes the first `count` threads waiting on the element (none given: all of them), in the
    // order they began to wait, and says how many it woke
    function notify<T>(typedArray: TypedArray<T>, index: int, count?: number): int {
        const element = typedArray.__elementRef(index);
        return tslang_atomics_notify(<Opaque>element, count == undefined ? -1 : <int>count);
    }
}

// What a thread runs: the function, then its result or what it threw. The thread reaches it only
// through the Opaque handed to the native side, so the ThreadHandle keeps it until join.
class ThreadStart<R> {
    result: R;
    failed = false;
    message: string = "";

    constructor(public fn: () => R) {}

    run() {
        try {
            const result = this.fn();
            this.result = result;
        } catch (e) {
            this.failed = true;
            this.message = e instanceof Error ? (<Error>e).message : `${e}`;
        }
    }
}

// the native thread's entry point: generic, as `sleep` is, so it is built into the program that
// spawns and not twice into a debug link
function __thread_entry<R>(arg: Opaque): u32 {
    const start = <ThreadStart<R>>arg;
    start.run();
    return 0;
}

// A running thread. join() waits for it to end and gives back what its function returned, or
// throws an Error with the message of what the function threw. Join every thread: the function and
// what it captured live until then.
class ThreadHandle<R> {
    private handle: Opaque;
    private joined = false;

    constructor(private start: ThreadStart<R>) {
        // -mm=rc: the thread takes and drops references to what the function captured while this
        // thread does too, so their counts change atomically from here on (erased under the
        // other models)
        Shared.share(this.start);
        this.handle = tslang_thread_spawn(__thread_entry<R>, <Opaque>this.start);
    }

    join(): R {
        if (!this.joined) {
            tslang_thread_join(this.handle);
            this.joined = true;
        }

        // a new Error, not the one thrown: under -mm=own what the thread threw belongs to its
        // ThreadStart and can't be thrown again from here
        if (this.start.failed) {
            throw new Error(this.start.message);
        }

        return this.start.result;
    }
}

namespace Thread {
    // runs `fn` on a new thread. Shared memory is what both threads reach: an Int32Array the
    // function captured, say, used through Atomics.
    function spawn<R>(fn: () => R): ThreadHandle<R> {
        return new ThreadHandle<R>(new ThreadStart<R>(fn));
    }

    // how many threads the machine runs at once (0 when it can't tell)
    function hardwareConcurrency<T = int>(): u32 {
        return tslang_thread_hardware_concurrency();
    }
}

// A one-way queue between threads: one side pushes, the other takes, in the order pushed. Both
// threads reach it through a Shared each function captures (see Thread.spawn). What is pushed is
// handed over, not copied: under -mm=own it moves in and out; elsewhere the pusher should leave it
// alone. The items stay in a TypeScript array, so the collector sees them under -mm=gc and they keep
// their counts under -mm=rc. Worker is built on it (docs/worker-design.md).
class MessageQueue<T> {
    private items: T[] = [];
    // What take hands out, the oldest last: filled from `items` when it runs empty, so each item
    // is moved once. Shifting them off `items` moved every item left down for each one taken.
    private outbox: T[] = [];
    // [0] the lock (1 taken); [1] bumped on each push and on close, which a taker waits on;
    // [2] closed (1)
    private sync = new Int32Array(3);

    // queues the item and wakes a taker; false, and the item is dropped, once the queue is closed
    push(item: T): boolean {
        // -mm=rc: the taker drops what the pusher made, so its count changes atomically from here
        // (erased under the other models)
        Shared.share(item);

        this.lock();
        if (this.sync[2] != 0) {
            this.unlock();
            return false;
        }

        this.items.push(item);
        Atomics.add(this.sync, 1, 1);
        this.unlock();
        Atomics.notify(this.sync, 1);
        return true;
    }

    // The next item. Waits for one up to `timeout` milliseconds (none: as long as it takes); undefined
    // when the time is up, or once the queue is closed and nothing is left in it.
    take(timeout?: number): T | undefined {
        const forever = timeout == undefined;
        const deadline = forever ? 0 : Date.now() + timeout;
        while (true) {
            this.lock();
            if (this.outbox.length == 0) {
                while (this.items.length > 0) this.outbox.push(this.items.pop());
            }

            if (this.outbox.length > 0) {
                const item = this.outbox.pop();
                this.unlock();
                return item;
            }

            const closed = this.sync[2] != 0;
            const seen = Atomics.load(this.sync, 1);
            this.unlock();
            if (closed) {
                return undefined;
            }

            if (forever) {
                Atomics.wait(this.sync, 1, seen);
            } else {
                const left = deadline - Date.now();
                if (left <= 0) {
                    return undefined;
                }

                Atomics.wait(this.sync, 1, seen, left);
            }
        }
    }

    // no more pushes; a taker gets what is left, then undefined
    close() {
        this.lock();
        this.sync[2] = 1;
        Atomics.add(this.sync, 1, 1);
        this.unlock();
        Atomics.notify(this.sync, 1);
    }

    // drops every item still queued
    clear() {
        this.lock();
        this.items.length = 0;
        this.outbox.length = 0;
        this.unlock();
    }

    // close() and clear() at once: a taker gets nothing more, not even what was queued before
    discard() {
        this.lock();
        this.sync[2] = 1;
        this.items.length = 0;
        this.outbox.length = 0;
        Atomics.add(this.sync, 1, 1);
        this.unlock();
        Atomics.notify(this.sync, 1);
    }

    get closed() {
        return Atomics.load(this.sync, 2) != 0;
    }

    get length() {
        this.lock();
        const length = this.items.length + this.outbox.length;
        this.unlock();
        return length;
    }

    private lock() {
        while (Atomics.compareExchange(this.sync, 0, 0, 1) != 0) {
            Atomics.wait(this.sync, 0, 1);
        }
    }

    private unlock() {
        Atomics.store(this.sync, 0, 0);
        Atomics.notify(this.sync, 0, 1);
    }
}

// A message as a handler gets it (MDN's MessageEvent; `origin`, `ports` and `source` are not here)
class MessageEvent<T> {
    constructor(public data: T) {}
}

// What a worker posts toward the thread that made it: a message, or an error for something it threw.
// One queue carries both, as the events themselves, so errors arrive in order with the messages and
// each is taken out whole (under -mm=own nothing has to move out of a field).
type WorkerPost<Out> = MessageEvent<Out> | ErrorEvent;

// The worker's side of a Worker (MDN's DedicatedWorkerGlobalScope). The worker's function gets it as
// its parameter, `self` by convention, since a program has one global scope here; a handler that
// captures `self` posts and closes through it, as worker code in a browser does.
class WorkerScope<In, Out> {
    // none set: a message is dropped. Always a function, so a message is handed to it on every path,
    // which -mm=own needs to know where the message goes.
    onmessage: (e: MessageEvent<In>) => void;
    private closing: boolean;

    constructor(private toCreator: Shared<MessageQueue<WorkerPost<Out>>>, public name: string) {
        this.onmessage = (e: MessageEvent<In>) => {};
        this.closing = false;
    }

    // queues the message for the thread that made the worker
    postMessage(message: Out) {
        this.toCreator.value.push(new MessageEvent<Out>(message));
    }

    // ends the worker once the handler running now returns; messages still queued for it are dropped
    close() {
        this.closing = true;
    }

    get closed() {
        return this.closing;
    }

    // queues an error event for the thread that made the worker. A copy of the text: under -mm=own the
    // caller's text is borrowed from what was thrown.
    postError(text: string) {
        this.toCreator.value.push(new ErrorEvent(text + ""));
    }
}

// What a worker's thread runs: the function, then each message to onmessage until the worker closes.
// The thread reaches it only through the Opaque handed to the native side, so the Worker keeps it
// until join, as ThreadHandle keeps its ThreadStart. (A closure given to Thread.spawn can't do this
// under -mm=own: it can't take `body`, a parameter of the Worker's constructor, with it.)
//
// What the worker throws becomes an error event, as in a browser: a throw from a handler, and the
// worker goes on to the next message; a throw from `body`, and the worker ends. The event carries
// the text alone: under -mm=own the thrown object is the worker's.
class WorkerStart<In, Out> {
    constructor(public body: (self: WorkerScope<In, Out>) => void, public toWorker: Shared<MessageQueue<In>>,
                public toCreator: Shared<MessageQueue<WorkerPost<Out>>>, public name: string) {}

    run() {
        // the scope keeps a second handle to the queue, and a string of its own: under -mm=own a
        // string kept by a callee is copied by hand (this object keeps its `name` until join)
        const scope = new WorkerScope<In, Out>(this.toCreator, this.name + "");
        try {
            let started = true;
            try {
                this.body(scope);
            } catch (e) {
                scope.postError(e instanceof Error ? `${(<Error>e).message}` : `${e}`);
                started = false;
            }

            while (started && !scope.closed) {
                const message = this.toWorker.value.take();
                if (message == undefined) {
                    break;
                }

                try {
                    scope.onmessage(new MessageEvent<In>(message));
                } catch (e) {
                    scope.postError(e instanceof Error ? `${(<Error>e).message}` : `${e}`);
                }
            }
        } finally {
            // nothing more reaches the worker, and the creator sees it end
            this.toWorker.value.close();
            this.toWorker.value.clear();
            this.toCreator.value.close();
        }
    }
}

// the native thread's entry point for a worker: generic, as `sleep` is: see there
function __worker_entry<In, Out>(arg: Opaque): u32 {
    const start = <WorkerStart<In, Out>>arg;
    start.run();
    return 0;
}

// A worker (MDN's Worker): `body` runs on a new thread with the worker's scope, sets its onmessage,
// and returns; the worker then handles each message posted to it until it calls close(). There is no
// event loop to deliver what the worker posts back, so the creating thread asks: receive() takes the
// next message, dispatch() hands what has arrived to onmessage, join() does so until the worker has
// closed and then ends its thread. What the worker throws goes to onerror. A worker that never
// closes, as most browser workers, is ended with terminate(). Join or terminate every worker. A
// message is handed over, not copied: under -mm=own it moves; elsewhere the sender should leave it
// alone. See docs/worker-design.md.
class Worker<In, Out> {
    // none set: join() drops what the worker posts. Always a function: see WorkerScope.onmessage.
    onmessage: (e: MessageEvent<Out>) => void;
    // none set: the error is printed to stderr, as a browser logs it to the console
    onerror: (e: ErrorEvent) => void;
    private toWorker: Shared<MessageQueue<In>>;
    private toCreator: Shared<MessageQueue<WorkerPost<Out>>>;
    private start: WorkerStart<In, Out>;
    private handle: Opaque;
    private joined: boolean;

    // -mm=own: the worker keeps `body` and `name` until join, so the caller gives them up
    @keeps("body", "name")
    constructor(body: (self: WorkerScope<In, Out>) => void, name: string = "") {
        // each side holds its own handle to both queues: the fields keep one pair, the WorkerStart
        // the other
        const toWorker = new Shared(new MessageQueue<In>());
        const toCreator = new Shared(new MessageQueue<WorkerPost<Out>>());
        this.toWorker = toWorker;
        this.toCreator = toCreator;
        this.start = new WorkerStart<In, Out>(body, toWorker, toCreator, name);
        this.onmessage = (e: MessageEvent<Out>) => {};
        this.onerror = (e: ErrorEvent) => {
            console.error(`Worker error: ${e.message}`);
        };
        this.joined = false;
        // -mm=rc: both threads take and drop references to what the worker reaches, so their counts
        // change atomically from here on (erased under the other models)
        Shared.share(this.start);
        this.handle = tslang_thread_spawn(__worker_entry<In, Out>, <Opaque>this.start);
    }

    // queues the message for the worker; dropped once the worker has closed
    postMessage(message: In) {
        this.toWorker.value.push(message);
    }

    // The next message from the worker, without calling onmessage; an error the worker reported on
    // the way is handed to onerror. Waits up to `timeout` milliseconds for each (none: as long as it
    // takes); undefined when the time is up, or once the worker has ended and everything it posted has
    // been taken.
    receive(timeout?: number): MessageEvent<Out> | undefined {
        while (true) {
            const post = this.toCreator.value.take(timeout);
            if (post == undefined) {
                return undefined;
            }

            if (post instanceof ErrorEvent) {
                this.onerror(<ErrorEvent>post);
                continue;
            }

            return <MessageEvent<Out>>post;
        }
    }

    // hands each message from the worker to onmessage, and each error to onerror, until the worker has
    // closed; then ends its thread
    join() {
        while (true) {
            const post = this.toCreator.value.take();
            if (post == undefined) {
                break;
            }

            if (post instanceof ErrorEvent) {
                this.onerror(<ErrorEvent>post);
            } else {
                this.onmessage(<MessageEvent<Out>>post);
            }
        }

        this.endThread();
    }

    // Hands each message and error that has arrived from the worker to onmessage / onerror, and says
    // how many. With nothing arrived yet, waits up to `timeout` milliseconds for the first (none: does
    // not wait). This is the creating thread's event loop, called from its own loop.
    dispatch(timeout?: number): int {
        let count = 0;
        let wait = timeout == undefined ? 0 : timeout;
        while (true) {
            const post = this.toCreator.value.take(wait);
            if (post == undefined) {
                return count;
            }

            if (post instanceof ErrorEvent) {
                this.onerror(<ErrorEvent>post);
            } else {
                this.onmessage(<MessageEvent<Out>>post);
            }

            count++;
            wait = 0;
        }
    }

    // Ends the worker: what was queued for it is dropped, it stops once the handler running now
    // returns (it is not interrupted: a handler that never returns makes this wait for good), its
    // thread ends, and what it posted that was not yet delivered is dropped. After this, onmessage and
    // onerror are not called again for this worker and postMessage is ignored. Again: does nothing.
    terminate() {
        this.toWorker.value.discard();
        this.endThread();
        this.toCreator.value.discard();
    }

    // true once the worker has ended and everything it posted has been taken
    get closed() {
        return this.toCreator.value.closed && this.toCreator.value.length == 0;
    }

    private endThread() {
        if (!this.joined) {
            this.joined = true;
            tslang_thread_join(this.handle);
        }
    }
}

// Bytes to and from the standard streams, as they are: on Windows each call puts its stream in
// binary mode and back, so a "\n" stays one byte and a 0x1A does not end the input (console.log
// and console.readLine keep text mode). A Uint8Array is not a view over a buffer here, so `read`
// fills the array's own elements. Each is generic, as `sleep` is: see there. See src/wrappers/io.cpp.
namespace Stdio {
    // Reads stdin into `buffer` and says how many bytes it read: it fills the buffer unless the
    // input ends first, so fewer than buffer.length means the input has ended, and 0 that nothing
    // was left.
    function read<T = u8>(buffer: Uint8Array): int {
        if (buffer.length == 0) {
            return 0;
        }

        return stdio_read(<Opaque>buffer.__elementRef(0), buffer.length);
    }

    // the rest of stdin, to its end
    function readAll<T = u8>(): Uint8Array {
        const bytes: u8[] = [];
        const chunk: u8[] = [];
        chunk.length = 4096;
        let count = 0;
        while ((count = stdio_read(<Opaque>Ref(chunk[0]), chunk.length)) > 0) {
            for (let i = 0; i < count; i++) {
                bytes.push(chunk[i]);
            }
        }

        return new Uint8Array(bytes);
    }

    // writes the bytes to stdout and flushes them; says how many it wrote
    function write<T = u8>(bytes: Uint8Array): int {
        if (bytes.length == 0) {
            return 0;
        }

        return stdio_write_bytes(1, <Opaque>bytes.__elementRef(0), bytes.length);
    }

    // the same, to stderr
    function writeError<T = u8>(bytes: Uint8Array): int {
        if (bytes.length == 0) {
            return 0;
        }

        return stdio_write_bytes(2, <Opaque>bytes.__elementRef(0), bytes.length);
    }
}

// The text an os call left (wrappers/os.cpp), `length` bytes of it, as a string of its own.
// T is the length's type, taken from the argument: a type parameter nothing names can't be
// worked out where one generic function calls another.
function __os_text<T = int>(length: T): string {
    const buffer: u8[] = [];
    buffer.length = length + 1;
    buffer[length] = 0;
    if (length > 0) {
        tslang_os_result_copy_to(<Opaque>Ref(buffer[0]), length);
    }

    // a copy: buffer goes with this function
    return <string><Opaque>Ref(buffer[0]) + "";
}

// The same, as bytes.
function __os_bytes<T = int>(length: T): Uint8Array {
    const bytes: u8[] = [];
    bytes.length = length;
    if (length > 0) {
        tslang_os_result_copy_to(<Opaque>Ref(bytes[0]), length);
    }

    return new Uint8Array(bytes);
}

// The error an os call ran into, in Node's words: "ENOENT: no such file or directory, open 'a.txt'".
// `length` is tslang_os_result_length()
function __os_error<T = int>(length: T): Error {
    return new Error(__os_text(length));
}

// The process, as Node's `process` has it, with functions where Node has properties: process.argv()
// rather than process.argv. See docs/process-fs.md.
namespace process {
    // The command line: argv()[0] is the program. Under the JIT the program is tslang, so its
    // options come next, then the script, then the script's arguments - as with `node script.js`.
    function argv<T = int>(): string[] {
        const args: string[] = [];
        const count = tslang_process_argc();
        for (let i = 0; i < count; i++) {
            args.push(__os_text(tslang_process_argv(i)));
        }

        return args;
    }

    // the variable's value, or undefined when it is not set
    function getEnv<T = int>(name: string): string | undefined {
        const length = tslang_process_getenv(name);
        if (length < 0) {
            return undefined;
        }

        return __os_text(length);
    }

    // sets the variable for this process and the processes it starts; an empty name, or one with
    // an "=", is an Error
    function setEnv<T = int>(name: string, value: string): void {
        if (tslang_process_setenv(name, value) != 0) {
            throw __os_error(tslang_os_result_length());
        }
    }

    // a variable that is not set is not an error
    function unsetEnv<T = int>(name: string): void {
        if (tslang_process_unsetenv(name) != 0) {
            throw __os_error(tslang_os_result_length());
        }
    }

    // Every variable, [name, value]. Not a Map: this is above the Map class, and naming
    // Map<string, string> here made that type before Map was declared - the program's own
    // Map<string, string> then had no members.
    function env<T = int>(): [string, string][] {
        const vars: [string, string][] = [];
        const count = tslang_process_env_count();
        for (let i = 0; i < count; i++) {
            const entry = __os_text(tslang_os_entry(i));
            const equals = entry.indexOf("=");
            if (equals > 0) {
                // typed: a bare literal is a string[], not a pair
                const pair: [string, string] = [entry.substring(0, equals), entry.substring(equals + 1)];
                vars.push(pair);
            }
        }

        return vars;
    }

    // the working directory
    function cwd<T = int>(): string {
        const length = tslang_process_cwd();
        if (length < 0) {
            throw __os_error(tslang_os_result_length());
        }

        return __os_text(length);
    }

    function chdir<T = int>(directory: string): void {
        if (tslang_process_chdir(directory) != 0) {
            throw __os_error(tslang_os_result_length());
        }
    }

    function pid<T = int>(): int {
        return tslang_process_pid();
    }

    // "win32", "linux", "android" or "darwin", as Node's process.platform
    function platform<T = int>(): string {
        return __os_text(tslang_process_platform());
    }

    // Ends the process with `code`, once every stream is flushed. Nothing after it runs: no
    // finally block, no destructor.
    function exit<T = int>(code = 0): void {
        tslang_process_exit(code);
    }
}

// What fs.statSync tells of a path; symbolic links are followed.
interface FileStats {
    isFile: boolean;
    isDirectory: boolean;
    // in bytes
    size: number;
    // the last modification, in milliseconds since 1970 as Date takes them
    mtimeMs: number;
}

interface MkdirOptions {
    // every missing parent too, and a directory already there is no error
    recursive?: boolean;
}

interface RmOptions {
    // a directory, and all it holds
    recursive?: boolean;
    // nothing there is no error
    force?: boolean;
}

// The file system, synchronously, by Node's names: readFileSync gives bytes, readTextFileSync (as
// Deno names it) a string. An error is an Error with Node's message. Paths are UTF-8.
// See docs/process-fs.md.
namespace fs {
    function existsSync<T = int>(path: string): boolean {
        let size: number = 0;
        let mtimeMs: number = 0;
        return tslang_fs_stat(path, Ref(size), Ref(mtimeMs)) > 0;
    }

    function statSync<T = int>(path: string): FileStats {
        let size: number = 0;
        let mtimeMs: number = 0;
        const kind = tslang_fs_stat(path, Ref(size), Ref(mtimeMs));
        if (kind < 0) {
            throw __os_error(tslang_os_result_length());
        }

        return { isFile: kind == 1, isDirectory: kind == 2, size: size, mtimeMs: mtimeMs };
    }

    // the file's bytes
    function readFileSync<T = u8>(path: string): Uint8Array {
        const length = tslang_fs_read_file(path);
        if (length < 0) {
            throw __os_error(tslang_os_result_length());
        }

        return __os_bytes(length);
    }

    // The file as text, UTF-8. A string ends at its first 0, so a 0 byte ends the text there:
    // readFileSync for a file that is not text.
    function readTextFileSync<T = int>(path: string): string {
        const length = tslang_fs_read_file(path);
        if (length < 0) {
            throw __os_error(tslang_os_result_length());
        }

        return __os_text(length);
    }

    // Writes the bytes to the file, which it creates or else empties first.
    function writeFileSync<T = u8>(path: string, data: Uint8Array): void {
        const empty = "";
        const status = data.length > 0
            ? tslang_fs_write_file(path, <Opaque>data.__elementRef(0), data.length, 0)
            : tslang_fs_write_file(path, <Opaque>empty, 0, 0);
        if (status != 0) {
            throw __os_error(tslang_os_result_length());
        }
    }

    function writeTextFileSync<T = int>(path: string, text: string): void {
        if (tslang_fs_write_file(path, <Opaque>text, text.length, 0) != 0) {
            throw __os_error(tslang_os_result_length());
        }
    }

    // Adds the bytes at the file's end; a file that is not there is created.
    function appendFileSync<T = u8>(path: string, data: Uint8Array): void {
        if (data.length == 0) {
            const empty = "";
            if (tslang_fs_write_file(path, <Opaque>empty, 0, 1) != 0) {
                throw __os_error(tslang_os_result_length());
            }

            return;
        }

        if (tslang_fs_write_file(path, <Opaque>data.__elementRef(0), data.length, 1) != 0) {
            throw __os_error(tslang_os_result_length());
        }
    }

    function appendTextFileSync<T = int>(path: string, text: string): void {
        if (tslang_fs_write_file(path, <Opaque>text, text.length, 1) != 0) {
            throw __os_error(tslang_os_result_length());
        }
    }

    // the names in the directory, sorted; not "." or ".."
    function readdirSync<T = int>(path: string): string[] {
        const count = tslang_fs_read_dir(path);
        if (count < 0) {
            throw __os_error(tslang_os_result_length());
        }

        const names: string[] = [];
        for (let i = 0; i < count; i++) {
            names.push(__os_text(tslang_os_entry(i)));
        }

        return names;
    }

    function mkdirSync<T = int>(path: string, options?: MkdirOptions): void {
        let recursive = false;
        if (options != undefined) {
            if (options.recursive != undefined) {
                recursive = options.recursive;
            }
        }

        if (tslang_fs_mkdir(path, recursive ? 1 : 0) != 0) {
            throw __os_error(tslang_os_result_length());
        }
    }

    // A file, or with `recursive` a directory and all it holds. With `force` a path that is not
    // there is no error.
    function rmSync<T = int>(path: string, options?: RmOptions): void {
        let recursive = false;
        let force = false;
        if (options != undefined) {
            if (options.recursive != undefined) {
                recursive = options.recursive;
            }

            if (options.force != undefined) {
                force = options.force;
            }
        }

        if (tslang_fs_remove(path, recursive ? 1 : 0, force ? 1 : 0) != 0) {
            throw __os_error(tslang_os_result_length());
        }
    }

    // an empty directory
    function rmdirSync<T = int>(path: string): void {
        if (tslang_fs_rmdir(path) != 0) {
            throw __os_error(tslang_os_result_length());
        }
    }

    // a file already at `newPath` is replaced
    function renameSync<T = int>(oldPath: string, newPath: string): void {
        if (tslang_fs_rename(oldPath, newPath) != 0) {
            throw __os_error(tslang_os_result_length());
        }
    }

    // a file already at `dest` is replaced
    function copyFileSync<T = int>(src: string, dest: string): void {
        if (tslang_fs_copy_file(src, dest) != 0) {
            throw __os_error(tslang_os_result_length());
        }
    }
}

// Strings are UTF-8 already, so encoding is a copy of their bytes. UTF-8 only, as in JavaScript.
// Generic, as every class here is: a plain one would be built into the library and into every
// program, and a debug link then finds it twice. `new TextEncoder()` takes the default.
class TextEncoder<T = u8> {
    get encoding() {
        return "utf-8";
    }

    // the string's UTF-8 bytes
    encode(input = ""): Uint8Array {
        const bytes: u8[] = [];
        bytes.length = input.length;
        if (input.length > 0) {
            memcpy(<Opaque>Ref(bytes[0]), <Opaque>input, input.length);
        }

        return new Uint8Array(bytes);
    }

    // Writes as many whole characters of `source` as fit into `destination`: `read` counts them in
    // UTF-16 units, as JavaScript does (a 4-byte character is 2), `written` in bytes.
    encodeInto(source: string, destination: Uint8Array): TextEncoderEncodeIntoResult {
        const bytes = this.encode(source);
        let read = 0;
        let written = 0;
        while (written < bytes.length) {
            const lead = bytes[written];
            let size = 1;
            if (lead >= 0xF0) {
                size = 4;
            } else if (lead >= 0xE0) {
                size = 3;
            } else if (lead >= 0xC0) {
                size = 2;
            }

            if (written + size > destination.length) {
                break;
            }

            for (let i = 0; i < size; i++) {
                destination[written + i] = bytes[written + i];
            }

            written += size;
            if (size == 4) {
                read += 2;
            } else {
                read += 1;
            }
        }

        return { read: read, written: written };
    }
}

interface TextEncoderEncodeIntoResult {
    read: int;
    written: int;
}

interface TextDecoderOptions {
    fatal?: boolean;
    ignoreBOM?: boolean;
}

// UTF-8 bytes to a string, as JavaScript's TextDecoder: each ill-formed sequence becomes U+FFFD
// (the WHATWG decoder's maximal subparts), or, with `fatal`, a TypeError. A leading byte order mark
// is dropped unless `ignoreBOM`. UTF-8 only: another label is a RangeError. No `stream` option: a
// decode takes whole input. A string ends at its first 0, so a 0 byte ends the result there.
class TextDecoder<T = u8> {
    private isFatal = false;
    private keepsBOM = false;

    constructor(label = "utf-8", options?: TextDecoderOptions) {
        const name = label.trim().toLowerCase();
        if (name != "utf-8" && name != "utf8" && name != "unicode-1-1-utf-8") {
            throw new RangeError(`The encoding label provided ('${label}') is not supported`);
        }

        if (options != undefined) {
            if (options.fatal != undefined) {
                this.isFatal = options.fatal;
            }

            if (options.ignoreBOM != undefined) {
                this.keepsBOM = options.ignoreBOM;
            }
        }
    }

    get encoding() {
        return "utf-8";
    }

    get fatal() {
        return this.isFatal;
    }

    get ignoreBOM() {
        return this.keepsBOM;
    }

    decode(input?: Uint8Array): string {
        if (input == undefined) {
            return "";
        }

        const output: char[] = [];
        let start = 0;
        if (!this.keepsBOM && input.length >= 3 && input[0] == 0xEF && input[1] == 0xBB && input[2] == 0xBF) {
            start = 3;
        }

        // the WHATWG UTF-8 decoder: a sequence that is whole and well-formed is copied as it is
        let needed = 0;
        let seen = 0;
        let lower = 0x80;
        let upper = 0xBF;
        let sequenceStart = 0;
        let i = start;
        while (i < input.length) {
            const b = <int>input[i];
            if (needed == 0) {
                sequenceStart = i;
                if (b <= 0x7F) {
                    output.push(<char>b);
                } else if (b >= 0xC2 && b <= 0xDF) {
                    needed = 1;
                } else if (b >= 0xE0 && b <= 0xEF) {
                    if (b == 0xE0) lower = 0xA0;
                    if (b == 0xED) upper = 0x9F;
                    needed = 2;
                } else if (b >= 0xF0 && b <= 0xF4) {
                    if (b == 0xF0) lower = 0x90;
                    if (b == 0xF4) upper = 0x8F;
                    needed = 3;
                } else {
                    this.replacement(output);
                }

                i++;
                continue;
            }

            if (b < lower || b > upper) {
                // the sequence so far is one error, and this byte starts again
                needed = 0;
                seen = 0;
                lower = 0x80;
                upper = 0xBF;
                this.replacement(output);
                continue;
            }

            lower = 0x80;
            upper = 0xBF;
            seen++;
            i++;
            if (seen == needed) {
                for (let j = sequenceStart; j < i; j++) {
                    output.push(<char>input[j]);
                }

                needed = 0;
                seen = 0;
            }
        }

        if (needed != 0) {
            this.replacement(output);
        }

        output.push(<char>0);
        // a copy: output goes with this function
        return <string><Opaque>Ref(output[0]) + "";
    }

    private replacement(output: char[]) {
        if (this.isFatal) {
            throw new TypeError("The encoded data was not valid for encoding utf-8");
        }

        // U+FFFD
        output.push(<char>0xEF);
        output.push(<char>0xBF);
        output.push(<char>0xBD);
    }
}

// The compiler takes `Promise<T>` as T: an async function returns its value, and `await` gives the
// value back once the expression has run. So a promise here is the value itself, already settled,
// and these are the functions over such values. A rejected promise is a thrown exception. There is
// no `then`: a value has no methods. Each is generic, as `isLockFree` is above.
namespace Promise {
    function resolve<T>(value: T): T {
        return value;
    }

    // throws the reason: what awaiting a rejected promise does. The reason keeps its own type, so a
    // `catch (e: Error)` catches an Error.
    function reject<T = never, R = Error>(reason: R): T {
        throw reason;
    }

    // the values, in order: every one has already settled. A new array, as in JavaScript: under
    // -mm=own the result then owns its elements and can leave an `await`, which the argument cannot.
    function all<T>(values: T[]): T[] {
        const results: T[] = [];
        for (const value of values) {
            results.push(value);
        }

        return results;
    }

    // the first value: it settled first
    function race<T>(values: T[]): T {
        if (values.length == 0) {
            throw new Error("Promise.race of no values never settles");
        }

        return values[0];
    }

    // the first value: none of them was rejected
    function any<T>(values: T[]): T {
        if (values.length == 0) {
            throw new Error("All promises were rejected");
        }

        return values[0];
    }

    // every value as fulfilled: a rejection would have thrown before the array was built
    function allSettled<T>(values: T[]): PromiseFulfilledResult<T>[] {
        const results: PromiseFulfilledResult<T>[] = [];
        for (const value of values) {
            results.push({ status: "fulfilled", value: value });
        }

        return results;
    }
}

// JSON.stringify, over JsonValue (src/lib.ts, with JSON.parse). Generic: it is told what it was given by
// the type each call is made with. An object literal's or a tuple's fields are walked by `for...in`, which
// the compiler makes for each field of the type; a class has no such walk and goes by its `toJSON()`.
namespace JSON {
    // A value as a JsonValue. R: a signature is read before lib.ts declares JsonValue, a default type
    // only when the function is used. An else chain: code after an `if` the type settles is still
    // compiled for that type, and a null cannot be cast to a number.
    function toValue<T, R = JsonValue>(value: T): R {
        if (typeof value == "string") {
            // a copy: the JsonValue keeps its string, and an array's element is only lent here
            return JsonValue.ofString(<string>value + "");
        } else if (typeof value == "boolean") {
            return JsonValue.ofBoolean(<boolean>value);
        } else if (typeof value == "null") {
            return new JsonValue();
        } else if (typeof value == "undefined") {
            return new JsonValue();
        } else if (typeof value == "array") {
            const result = JsonValue.newArray();
            for (const element of value) {
                result.push(toValue(element));
            }

            return result;
        } else if (typeof value == "class") {
            if (value instanceof JsonValue) {
                // -mm=own: the value is only lent to JSON.stringify, and the result owns what it holds,
                // so it holds a copy (elsewhere the result shares it)
                if (__MEMORY_MODEL__ == "own") {
                    return (<JsonValue>value).clone();
                } else {
                    return <JsonValue>value;
                }
            }

            return toValue(value.toJSON());
        } else if (typeof value == "tuple") {
            return fieldsToValue(value);
        } else if (typeof value == "object") {
            // an object literal with methods
            return fieldsToValue(value);
        } else if (typeof value == "bigint") {
            throw new TypeError("JSON.stringify cannot serialize a BigInt");
        } else {
            return JsonValue.ofNumber(<number>value);
        }
    }

    // An object literal or a tuple. `for...in` is made for each of its fields, `key` a literal, so
    // `value[key]` is that field with its own type. A tuple of unnamed fields ("0", "1", ...) is an array,
    // as in JavaScript; a function or an undefined field is left out of an object, and is null in an array.
    function fieldsToValue<T, R = JsonValue>(value: T): R {
        if ("0" in value) {
            const result = JsonValue.newArray();
            for (const key in value) {
                if (typeof value[key] == "function") {
                    result.push(new JsonValue());
                } else {
                    result.push(toValue(value[key]));
                }
            }

            return result;
        } else {
            const result = JsonValue.newObject();
            for (const key in value) {
                if (typeof value[key] == "function") {
                    // left out
                } else if (typeof value[key] == "undefined") {
                    // left out
                } else {
                    result.set(key, toValue(value[key]));
                }
            }

            return result;
        }
    }

    // up to 10 of them, as in JavaScript
    function indent<S>(space: S): string {
        if (typeof space == "string") {
            return (<string>space).substring(0, 10);
        } else {
            let result = "";
            for (let i = 0; i < 10 && i < <number>space; i++) {
                result += " ";
            }

            return result;
        }
    }

    // `replacer` is there for `JSON.stringify(value, null, 2)`: only null is taken
    function stringify<T, S = string>(value: T, replacer?: null, space?: S): string {
        // one call of toValue: under -mm=own a value used on two paths counts as moved on the first
        let spacing = "";
        if (space != undefined) {
            spacing = indent(<S>space);
        }

        return toValue(value).stringify(spacing);
    }
}

interface PromiseFulfilledResult<T> {
    status: string;
    value: T;
}

// thrown where a chain of entries is found to go round, which only a change made by another thread
// while this one reads can do
const CHAIN_LOOPS = "Map or Set changed by another thread while in use";

// what an insert does with a key already there: leaves its value, or replaces it
enum InsertionBehavior {
    None,
    OverwriteExisting,
}

namespace HashHelpers {
    function hashCodeGeneral<K>(key: K): int {
        // the parameter's own bytes: a local copy of it would take it under -mm=own
        const size = sizeof<K>();
        const valueRef = Ref(key);

        switch (size) {
            case 4: return Deref(<Reference<i32>>valueRef);
            case 8:
                const valueRef32 = <Reference<i32>>valueRef;
                const hash32 = (Deref(valueRef32[1]) >> 1) ^ Deref(valueRef32[0]);
                return hash32;
        }

        return hashCodeBinary(valueRef, size);
    }

    function hashCode<K>(key: K): int {
        if (typeof (key) == "string") {
            return hashCodeString(<string>key);
        }

        if (__is_any(key)) {
            return hashCodeAny(key);
        }

        return hashCodeGeneral(key);
    }
}

namespace EqualityHelper {
    function equals<K>(l: K, r: K): boolean {
        if (typeof (l) == "string") {
            return <string>l == <string>r;
        }

        return l == r;
    }
}

type MapEntry<TKey, TValue> =
    {
        hashCode: uint,
        /// <summary>
        /// 0-based index of next entry in chain: -1 means end of chain
        /// also encodes whether this entry _itself_ is part of the free list by changing sign and subtracting 3,
        /// so -2 means end of free list, -3 means index 0 but on free list, -4 means index 1 but on free list, etc.
        /// </summary>
        next: int;
        key: TKey;     // Key of entry
        value: TValue; // Value of entry
    };

// -mm=own: keys and values are values, strings, `any` or Shared<T> handles; an object goes in as Shared<T>
@sharedElements
class Map<K = any, V = any> {

    const StartOfFreeList = -3;

    private buckets: int[];
    private _entries: MapEntry<K, V>[];
    private freeList: int;
    private count: int;
    private freeCount: int;
    private version: int;

    constructor(values?: [K, V][]) {
        if (values == undefined) {
            this.initialize(0);
        }
        else {
            this.initialize(values.length);
            // a key given twice keeps its last value, as in JavaScript
            for (const [k, v] of values) this.tryInsert(k, v, InsertionBehavior.OverwriteExisting);
        }
    }

    get size() {
        // the entries deleted are on the free list, still counted
        return this.count - this.freeCount;
    }

    // The buckets are emptied where they are and keep their length: every lookup takes a hash
    // modulo that length, and modulo none it is not a number (the index it then makes is whatever
    // the processor gives for one). The next insert finds no room in the entries and resizes both.
    clear() {
        const count = this.count;
        if (count > 0) {
            const buckets = this.buckets;
            for (let i = 0; i < buckets.length; i++) buckets[i] = 0;

            this.count = 0;
            this.freeList = -1;
            this.freeCount = 0;
            this._entries.length = 0;
        }
    }

    set(k: K, v: V) {
        this.tryInsert(k, v, InsertionBehavior.OverwriteExisting);
        return this;
    }

    get(k: K): V | undefined {
        return this.findValue(k);
    }

    has(k: K): boolean {
        return this.hasValue(k);
    }

    delete(k: K): boolean {
        return this.removeValue(k);
    }

    @borrows("this")
    entries() {
        return this.iter();
    }

    @borrows("this")
    keys() {
        return this.iterKey();
    }

    @borrows("this")
    values() {
        return this.iterValue();
    }

    forEach(f: (value: V, key: K, map: Map<K, V>) => void) {
        for (let i = 0; i < this.count; i++) {
            if (this._entries[i].next >= -1) {
                f(this._entries[i].value, this._entries[i].key, this);
            }
        }
    }

    @borrows("this")
    [Symbol.iterator]() {
        return this.entries();
    }

    private initialize(capacity: int) {
        const size = PrimeHelpers.getPrime(capacity);
        let buckets: int[] = [];
        buckets.length = size;
        let entries: MapEntry<K, V>[] = [];
        entries.length = size;

        this.freeList = -1;
        this.buckets = buckets;
        this._entries = entries;

        return size;
    }

    // unsigned: a negative hash code (a negative int key, or a number or a handle with its top
    // bit set) gave a negative index, in front of the buckets
    private getBucket(hashCode: int): int {
        const buckets = this.buckets;
        return buckets[<uint>hashCode % <uint>buckets.length];
    }

    private setBucket(hashCode: int, value: int) {
        const buckets = this.buckets;
        buckets[<uint>hashCode % <uint>buckets.length] = value;
    }

    private newHashCodes(entries: MapEntry<K, V>[]) {
        const count = entries.length;
        for (let i = 0; i < count; i++) {
            if (entries[i].next >= -1) {
                entries[i].hashCode = <uint>HashHelpers.hashCode(entries[i].key);
            }
        }
    }

    private resizeHelper(newSize: int, forceNewHashCodes: boolean) {
        const count = this.count;
        // the entries array grows where it is: its entries stay its own (under -mm=own nothing can
        // move them out of it into another array)
        this._entries.length = newSize;

        if (forceNewHashCodes) {
            this.newHashCodes(this._entries);
        }

        this.buckets = [];
        this.buckets.length = newSize;
        for (let i = 0; i < count; i++) {
            if (this._entries[i].next >= -1) {
                const hashCode = this._entries[i].hashCode;
                this._entries[i].next = this.getBucket(hashCode) - 1; // Value in _buckets is 1-based
                this.setBucket(hashCode, i + 1);
            }
        }
    }

    private resize() {
        this.resizeHelper(PrimeHelpers.expandPrime(this.count), false);
    }

    private tryInsert(key: K, value: V, behavior: InsertionBehavior): boolean {
        const hashCode = <uint>HashHelpers.hashCode(key);

        let collisionCount: uint = 0;
        let bucket = this.getBucket(hashCode);
        let i = bucket - 1; // Value in _buckets is 1-based

        let found = -1;
        while (<uint>i < <uint>this._entries.length) {
            if (this._entries[i].hashCode == hashCode && EqualityHelper.equals(this._entries[i].key, key)) {
                found = i;
                break;
            }

            i = this._entries[i].next;
            collisionCount++;
            if (collisionCount > <uint>this._entries.length) {
                // the chain goes round: another thread changed it under this one. The loop
                // would never end
                throw new Error(CHAIN_LOOPS);
            }
        }

        if (found >= 0 && behavior != InsertionBehavior.OverwriteExisting) {
            return false;
        }

        // The key and the value go into the entry in one place, outside the loop: under -mm=own the
        // path that does not take them releases them. An entry overwritten keeps its place in its
        // chain.
        let index = found;
        let next = 0;
        if (found >= 0) {
            next = this._entries[found].next;
        }
        else {
            if (this.freeCount > 0) {
                index = this.freeList;
                this.freeList = this.StartOfFreeList - this._entries[this.freeList].next;
                this.freeCount--;
            }
            else {
                let count = this.count;
                if (count == this._entries.length) {
                    this.resize();
                    bucket = this.getBucket(hashCode);
                }

                index = count;
                this.count = count + 1;
            }

            next = bucket - 1; // Value in _buckets is 1-based
        }

        // a tuple of the entry's fields, in their order: under -mm=own an object literal that holds
        // what it owns moves only into a local, a tuple anywhere
        this._entries[index] = <MapEntry<K, V>>[hashCode, next, key, value];

        if (found < 0) {
            this.setBucket(hashCode, index + 1); // Value in _buckets is 1-based
        }

        this.version++;

        // Value types never rehash
        if (collisionCount > PrimeHelpers.hashCollisionThreshold) {
            this.newHashCodes(this._entries);
        }

        return true;
    }

    private findValue(key: K): V | undefined {
        const hashCode = <uint>HashHelpers.hashCode(key);
        let i = this.getBucket(hashCode);
        let entries = this._entries;
        let collisionCount: uint = 0;

        i--; // Value in _buckets is 1-based; subtract 1 from i. We do it here so it fuses with the following conditional.
        do {
            if (<uint>i >= <uint>entries.length) {
                // not found
                return undefined;
            }

            const entry = Ref(entries[i]);
            if (entry.hashCode == hashCode && EqualityHelper.equals(entry.key, key)) {
                // found
                return entry.value;
            }

            i = entry.next;

            collisionCount++;
        } while (collisionCount <= <uint>entries.length);

        // The chain of entries forms a loop; which means a concurrent update has happened.
        // Break out of the loop and throw, rather than looping forever.
        throw new Error(CHAIN_LOOPS);
    }

    private hasValue(key: K): boolean {
        const hashCode = <uint>HashHelpers.hashCode(key);
        let i = this.getBucket(hashCode);
        let entries = this._entries;
        let collisionCount: uint = 0;

        i--; // Value in _buckets is 1-based; subtract 1 from i. We do it here so it fuses with the following conditional.
        do {
            if (<uint>i >= <uint>entries.length) {
                // not found
                return false;
            }

            const entry = Ref(entries[i]);
            if (entry.hashCode == hashCode && EqualityHelper.equals(entry.key, key)) {
                // found
                return true;
            }

            i = entry.next;

            collisionCount++;
        } while (collisionCount <= <uint>entries.length);

        // The chain of entries forms a loop; which means a concurrent update has happened.
        // Break out of the loop and throw, rather than looping forever.
        throw new Error(CHAIN_LOOPS);
    }

    private removeValue(key: K): boolean {
        const hashCode = <uint>HashHelpers.hashCode(key);
        let bucket = this.getBucket(hashCode);
        let entries = this._entries;
        let collisionCount: uint = 0;

        let last = -1;
        let i = bucket - 1; // Value in buckets is 1-based
        while (i >= 0) {
            const entry = Ref(entries[i]);
            if (entry.hashCode == hashCode && EqualityHelper.equals(entry.key, key)) {
                if (last < 0) {
                    bucket = entry.next + 1; // Value in buckets is 1-based
                    this.setBucket(hashCode, bucket);
                }
                else {
                    entries[last].next = entry.next;
                }

                entry.next = this.StartOfFreeList - this.freeList;

                this.freeList = i;
                this.freeCount++;
                return true;
            }

            last = i;
            i = entry.next;

            collisionCount++;
            if (collisionCount > <uint>entries.length) {
                // The chain of entries forms a loop; which means a concurrent update has happened.
                // Break out of the loop and throw, rather than looping forever.
                throw new Error(CHAIN_LOOPS);
            }
        }

        return false;
    }

    // The entries are read through `this` at each step, not kept in the state: under -mm=own the
    // state borrows the map itself, and may not keep a field read out of it.
    @borrows("this")
    private *iter() {
        for (let i = 0; i < this.count; i++) {
            if (this._entries[i].next >= -1) {
                const key = this._entries[i].key;
                const value = this._entries[i].value;
                yield <[key: K, value: V]>[key, value];
            }
        }
    }

    @borrows("this")
    private *iterKey() {
        for (let i = 0; i < this.count; i++) {
            if (this._entries[i].next >= -1) {
                const key = this._entries[i].key;
                yield key;
            }
        }
    }

    @borrows("this")
    private *iterValue() {
        for (let i = 0; i < this.count; i++) {
            if (this._entries[i].next >= -1) {
                const value = this._entries[i].value;
                yield value;
            }
        }
    }
}


static class Map {
    // The items in groups, by the key `keySelector` gives each: the groups in the order their keys
    // first come, the items in each in their own order. Each group is made whole before it goes into
    // the map, a pass over the items for each, rather than pushed to through map.get(key).
    // Not under -mm=own, where a Map's values are values, strings, `any` or Shared<T>, not arrays.
    public groupBy<K, T>(items: T[], keySelector: (item: T, index: number) => K): Map<K, T[]> {
        const keys: K[] = [];
        for (let i = 0; i < items.length; i++) {
            keys.push(keySelector(items[i], i));
        }

        const groups = new Map<K, T[]>();
        for (let i = 0; i < keys.length; i++) {
            if (groups.has(keys[i])) {
                continue;
            }

            const group: T[] = [];
            for (let j = i; j < keys.length; j++) {
                if (keys[j] == keys[i]) {
                    group.push(items[j]);
                }
            }

            groups.set(keys[i], group);
        }

        return groups;
    }
}

type SetEntry<TValue> =
    {
        hashCode: uint,
        /// <summary>
        /// 0-based index of next entry in chain: -1 means end of chain
        /// also encodes whether this entry _itself_ is part of the free list by changing sign and subtracting 3,
        /// so -2 means end of free list, -3 means index 0 but on free list, -4 means index 1 but on free list, etc.
        /// </summary>
        next: int;
        value: TValue; // Value of entry
    };

// -mm=own: elements are values, strings, `any` or Shared<T> handles; an object goes in as Shared<T>
@sharedElements
class Set<V = any> {

    const StartOfFreeList = -3;

    private buckets: int[];
    private _entries: SetEntry<V>[];
    private freeList: int;
    private count: int;
    private freeList: int;
    private freeCount: int;
    private version: int;

    constructor(values?: V[]) {
        if (values == undefined) {
            this.initialize(0);
        }
        else {
            this.initialize(values.length);
            for (const v of values) this.AddIfNotPresent(v, InsertionBehavior.None);
        }
    }

    get size() {
        // the entries deleted are on the free list, still counted
        return this.count - this.freeCount;
    }

    // The buckets are emptied where they are and keep their length: every lookup takes a hash
    // modulo that length, and modulo none it is not a number (the index it then makes is whatever
    // the processor gives for one). The next insert finds no room in the entries and resizes both.
    clear() {
        const count = this.count;
        if (count > 0) {
            const buckets = this.buckets;
            for (let i = 0; i < buckets.length; i++) buckets[i] = 0;

            this.count = 0;
            this.freeList = -1;
            this.freeCount = 0;
            this._entries.length = 0;
        }
    }

    add(v: V) {
        this.AddIfNotPresent(v, InsertionBehavior.None);
        return this;
    }

    has(v: V): boolean {
        return this.hasValue(v);
    }

    delete(v: V): boolean {
        return this.removeValue(v);
    }

    @borrows("this")
    entries() {
        return this.iter();
    }

    @borrows("this")
    keys() {
        return this.iter();
    }

    @borrows("this")
    values() {
        return this.iter();
    }

    forEach(f: (value: V, map: Set<V>) => void) {
        for (let i = 0; i < this.count; i++) {
            if (this._entries[i].next >= -1) {
                f(this._entries[i].value, this);
            }
        }
    }

    @borrows("this")
    [Symbol.iterator]() {
        return this.iter();
    }

    toString() {
        return `Set(${this.size}) { ${this.join()} }`;
    }

    difference(other: Set<V>): Set<V> {
        const result = new Set<V>();
        for (const value of this.iter()) {
            if (other.has(value)) continue;
            result.add(value);
        }

        return result;
    }

    intersection(other: Set<V>): Set<V> {
        const result = new Set<V>();
        for (const value of this.iter())
            if (other.has(value)) result.add(value);
        return result;
    }

    union(other: Set<V>): Set<V> {
        const result = new Set<V>();
        for (const value of this.iter())
            result.add(value);
        for (const value of other)
            result.add(value);
        return result;
    }

    symmetricDifference(other: Set<V>): Set<V> {
        const result = new Set<V>();
        for (const value of this.iter()) {
            if (other.has(value)) continue;
            result.add(value);
        }

        for (const value of other) {
            if (this.has(value)) continue;
            result.add(value);
        }

        return result;
    }

    isDisjointFrom(other: Set<V>): boolean {
        for (const value of this.iter()) {
            if (other.has(value)) return false;
        }

        return true;
    }

    isSubsetOf(other: Set<V>): boolean {
        for (const value of this.iter()) {
            if (!other.has(value)) return false;
        }

        return true;
    }    

    isSupersetOf(other: Set<V>): boolean {
        for (const value of other) {
            if (!this.has(value)) return false;
        }

        return true;
    }    

    private join(): string {
        let result = "";
        let first = true;
        for (const value of this.iter()) {
            if (!first) result += ", ";
            result += <string>value;
            first = false;
        }

        return result;
    }

    private initialize(capacity: int) {
        const size = PrimeHelpers.getPrime(capacity);
        let buckets: int[] = [];
        buckets.length = size;
        let entries: SetEntry<V>[] = [];
        entries.length = size;

        this.freeList = -1;
        this.buckets = buckets;
        this._entries = entries;

        return size;
    }

    // unsigned: a negative hash code (a negative int key, or a number or a handle with its top
    // bit set) gave a negative index, in front of the buckets
    private getBucket(hashCode: int): int {
        const buckets = this.buckets;
        return buckets[<uint>hashCode % <uint>buckets.length];
    }

    private setBucket(hashCode: int, value: int) {
        const buckets = this.buckets;
        buckets[<uint>hashCode % <uint>buckets.length] = value;
    }

    private newHashCodes(entries: SetEntry<V>[]) {
        const count = entries.length;
        for (let i = 0; i < count; i++) {
            if (entries[i].next >= -1) {
                entries[i].hashCode = <uint>HashHelpers.hashCode(entries[i].value);
            }
        }
    }

    private resizeHelper(newSize: int, forceNewHashCodes: boolean) {
        const count = this.count;
        // the entries array grows where it is: its entries stay its own (under -mm=own nothing can
        // move them out of it into another array)
        this._entries.length = newSize;

        if (forceNewHashCodes) {
            this.newHashCodes(this._entries);
        }

        this.buckets = [];
        this.buckets.length = newSize;
        for (let i = 0; i < count; i++) {
            if (this._entries[i].next >= -1) {
                const hashCode = this._entries[i].hashCode;
                this._entries[i].next = this.getBucket(hashCode) - 1; // Value in _buckets is 1-based
                this.setBucket(hashCode, i + 1);
            }
        }
    }

    private resize() {
        this.resizeHelper(PrimeHelpers.expandPrime(this.count), false);
    }

    private AddIfNotPresent(value: V, behavior: InsertionBehavior): boolean {
        const hashCode = <uint>HashHelpers.hashCode(value);

        let collisionCount: uint = 0;
        let bucket = this.getBucket(hashCode);
        let i = bucket - 1; // Value in _buckets is 1-based

        let found = false;
        while (<uint>i < <uint>this._entries.length) {
            if (this._entries[i].hashCode == hashCode && EqualityHelper.equals(this._entries[i].value, value)) {
                found = true;
                break;
            }

            i = this._entries[i].next;
            collisionCount++;
            if (collisionCount > <uint>this._entries.length) {
                // the chain goes round: another thread changed it under this one. The loop
                // would never end
                throw new Error(CHAIN_LOOPS);
            }
        }

        // outside the loop: under -mm=own the path that does not take the value releases it
        if (found) {
            // a value equal to one in the set is not put in again, whatever the behavior
            return false;
        }

        let index = 0;
        if (this.freeCount > 0) {
            index = this.freeList;
            this.freeList = this.StartOfFreeList - this._entries[this.freeList].next;
            this.freeCount--;
        }
        else {
            let count = this.count;
            if (count == this._entries.length) {
                this.resize();
                bucket = this.getBucket(hashCode);
            }

            index = count;
            this.count = count + 1;
        }

        // a tuple of the entry's fields, in their order: under -mm=own an object literal that holds
        // what it owns moves only into a local, a tuple anywhere
        this._entries[index] = <SetEntry<V>>[hashCode, bucket - 1 /* Value in _buckets is 1-based */, value];

        this.setBucket(hashCode, index + 1); // Value in _buckets is 1-based
        this.version++;

        // Value types never rehash
        if (collisionCount > PrimeHelpers.hashCollisionThreshold) {
            this.newHashCodes(this._entries);
        }

        return true;
    }

    private hasValue(value: V): boolean {
        const hashCode = <uint>HashHelpers.hashCode(value);
        let i = this.getBucket(hashCode);
        let entries = this._entries;
        let collisionCount: uint = 0;

        i--; // Value in _buckets is 1-based; subtract 1 from i. We do it here so it fuses with the following conditional.
        do {
            if (<uint>i >= <uint>entries.length) {
                // not found
                return false;
            }

            const entry = Ref(entries[i]);
            if (entry.hashCode == hashCode && EqualityHelper.equals(entry.value, value)) {
                // found
                return true;
            }

            i = entry.next;

            collisionCount++;
        } while (collisionCount <= <uint>entries.length);

        // The chain of entries forms a loop; which means a concurrent update has happened.
        // Break out of the loop and throw, rather than looping forever.
        throw new Error(CHAIN_LOOPS);
    }

    private removeValue(value: V): boolean {
        const hashCode = <uint>HashHelpers.hashCode(value);
        let bucket = this.getBucket(hashCode);
        let entries = this._entries;
        let collisionCount: uint = 0;

        let last = -1;
        let i = bucket - 1; // Value in buckets is 1-based
        while (i >= 0) {
            const entry = Ref(entries[i]);
            if (entry.hashCode == hashCode && EqualityHelper.equals(entry.value, value)) {
                if (last < 0) {
                    bucket = entry.next + 1; // Value in buckets is 1-based
                    this.setBucket(hashCode, bucket);
                }
                else {
                    entries[last].next = entry.next;
                }

                entry.next = this.StartOfFreeList - this.freeList;

                this.freeList = i;
                this.freeCount++;
                return true;
            }

            last = i;
            i = entry.next;

            collisionCount++;
            if (collisionCount > <uint>entries.length) {
                // The chain of entries forms a loop; which means a concurrent update has happened.
                // Break out of the loop and throw, rather than looping forever.
                throw new Error(CHAIN_LOOPS);
            }
        }

        return false;
    }

    // The entries are read through `this` at each step, not kept in the state: under -mm=own the
    // state borrows the set itself, and may not keep a field read out of it.
    @borrows("this")
    private *iter() {
        for (let i = 0; i < this.count; i++) {
            if (this._entries[i].next >= -1) {
                const value = this._entries[i].value;
                yield value;
            }
        }
    }
}

namespace __Iterator
{
    // example how to restrict to iterators only
    // function *take<TIter extends { next(): {value: any, done: boolean} >(iter: TIter, limit: index) {

    // The lazy helpers take their source over, as in JavaScript: under -mm=own `@keeps` makes the
    // generator's state own `iter` (and the callback), so `const seq = g().map(f)` may be kept. The
    // other models ignore it.
    // `limit` is a number, as in JavaScript: `take(Infinity)` takes everything, where an index made
    // of Infinity is no particular count.
    @keeps("iter")
    function *take<TIter extends { next(): {value: any, done: boolean} } >(iter: TIter, limit: number) {
        let count = 0;
        for (const v of iter) {
            if (count ++ >= limit) 
                break;
            yield v;
        }
    }

    @keeps("iter")
    function *drop<TIter extends { next(): {value: any, done: boolean} } >(iter: TIter, limit: number) {
        let count = 0;
        for (const v of iter) {
            if (count++ < limit)
                continue;
            yield v;
        }
    }

    type ElementType<T> = T extends { next(): {value: infer TElem, done: boolean} } ? TElem : never;  
    function every<TIter extends { next(): {value: any, done: boolean} }>(iter: TIter, callbackFn: (e: ElementType<TIter>) => boolean): boolean {
        for (const v of iter) {
            if (!callbackFn(v)) 
                return false;
        }

        return true;
    }    

    @keeps("iter", "callbackFn")
    function *filter<TIter extends { next(): {value: any, done: boolean} }>(iter: TIter, callbackFn: (e: ElementType<TIter>) => boolean) {
        for (const v of iter) {
            if (!callbackFn(v)) 
                continue;
            yield v;
        }
    }      

    function find<TIter extends { next(): {value: any, done: boolean} }>(iter: TIter, callbackFn: (e: ElementType<TIter>) => boolean): ElementType<TIter> | undefined {
        for (const v of iter) if (callbackFn(v)) return v;
        return undefined;
    }    

    function forEach<TIter extends { next(): {value: any, done: boolean} }>(iter: TIter, callbackFn: (e: ElementType<TIter>) => void) {
        for (const v of iter) callbackFn(v);
    }     

    @keeps("iter", "callbackFn")
    function *map<TIter extends { next(): {value: any, done: boolean} }, R>(iter: TIter, callbackFn: (e: ElementType<TIter>) => R) {
        for (const v of iter) yield callbackFn(v);
    }

    function reduce<TIter extends { next(): {value: any, done: boolean} }, V = ElementType<TIter>>(iter: TIter, callbackFn: (v: V, t: ElementType<TIter>) => V, initial?: V) {
        // a V, not the `any` that `?? iter.next().value` gives: boxed into an any, the initial
        // value is one -mm=own cannot follow
        let result: V = initial ?? iter.next().value;
        for (const v of iter) result = callbackFn(result, v);
        return result;
    }

    function some<TIter extends { next(): {value: any, done: boolean} }>(iter: TIter, callbackFn: (e: ElementType<TIter>) => boolean): boolean {
        for (const v of iter) {
            if (callbackFn(v)) 
                return true;
        }

        return false;
    }      

    function toArray<TIter extends { next(): {value: any, done: boolean} }>(iter: TIter) {
        let result: ElementType<TIter>[] = [];
        for (const v of iter) result.push(v);
        return result;
    }
}

// gc only: the collector clears the link. Under any other model the compiler rejects the
// GC_* call below.
class WeakRef<T extends object> {
    // The target's address complemented, as gc.h's GC_HIDE_POINTER does: a plain pointer here is
    // one the collector finds when it scans this object, and it then keeps the target alive, so
    // the link was never cleared. The collector sets this to 0 when the target goes.
    private _hidden: index;

    constructor(target: T) {
        this._hidden = ~(<index><Opaque>target);
        GC_general_register_disappearing_link(<Reference<Opaque>>Ref(this._hidden), <Opaque>target);
    }

    deref(): T | undefined {
        const hidden = this._hidden;
        if (hidden == 0) {
            return undefined;
        }
        return <T><Opaque>(~hidden);
    }
}

// what a WeakMap keeps for a key: a weak reference to the key, which says whether it is still alive,
// and the value
class WeakMapEntry<K extends object, V> {
    public values: V[];

    constructor(public ref: WeakRef<K>, value: V) {
        this.values = [value];
    }
}

// gc only, as WeakRef is. Keys are objects, compared by identity. The table is keyed by the key's
// address complemented (see WeakRef), so it does not hold the key: the collector clears the entry's
// WeakRef when the key goes, and the entry is then as if deleted. The collector does not move objects,
// so an address stays the key's for as long as it lives; one reused by a later object finds a dead
// entry and replaces it. The values are held strongly: a value that refers to its own key keeps that
// key alive, as the collector has no ephemerons.
class WeakMap<K extends object, V> {
    private table: Map<index, WeakMapEntry<K, V>>;
    // the size at which `set` next looks for dead entries; doubles with what stays, so a run of sets
    // does linear work overall
    private sweepAt: int;

    constructor(entries?: [K, V][]) {
        this.table = new Map<index, WeakMapEntry<K, V>>();
        this.sweepAt = 32;
        if (entries != undefined) {
            for (const [key, value] of entries) {
                this.set(key, value);
            }
        }
    }

    get(key: K): V | undefined {
        const entry = this.table.get(this.hide(key));
        if (entry == undefined || entry.ref.deref() == undefined) {
            return undefined;
        }

        return entry.values[0];
    }

    set(key: K, value: V) {
        if (this.table.size >= this.sweepAt) {
            this.sweep();
        }

        this.table.set(this.hide(key), new WeakMapEntry<K, V>(new WeakRef<K>(key), value));
        return this;
    }

    has(key: K): boolean {
        const entry = this.table.get(this.hide(key));
        return entry != undefined && entry.ref.deref() != undefined;
    }

    delete(key: K): boolean {
        const present = this.has(key);
        this.drop(this.hide(key));
        return present;
    }

    private hide(key: K): index {
        return ~(<index><Opaque>key);
    }

    // Takes the entry out. Map leaves a deleted entry in its slot until the slot is used again, so
    // the entry lets go of its value first: otherwise it would keep the value alive.
    private drop(hidden: index) {
        const entry = this.table.get(hidden);
        if (entry != undefined) {
            entry.values = [];
            this.table.delete(hidden);
        }
    }

    private sweep() {
        const dead: index[] = [];
        for (const [hidden, entry] of this.table) {
            if (entry.ref.deref() == undefined) {
                dead.push(hidden);
            }
        }

        for (const hidden of dead) {
            this.drop(hidden);
        }

        this.sweepAt = this.table.size * 2;
        if (this.sweepAt < 32) {
            this.sweepAt = 32;
        }
    }
}

// gc only: a WeakMap with nothing to say about each key
class WeakSet<K extends object> {
    private keys: WeakMap<K, boolean>;

    constructor(values?: K[]) {
        this.keys = new WeakMap<K, boolean>();
        if (values != undefined) {
            for (const value of values) {
                this.keys.set(value, true);
            }
        }
    }

    add(value: K) {
        this.keys.set(value, true);
        return this;
    }

    has(value: K): boolean {
        return this.keys.has(value);
    }

    delete(value: K): boolean {
        return this.keys.delete(value);
    }
}
