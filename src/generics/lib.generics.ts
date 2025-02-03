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

function __is<V extends T, T>(t: T): t is V
{
    return true;
}

namespace __Array {
    function at<T>(this: T[], index: int) {
        return this[index];
    }

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

        memmove(ReferenceOf(this[target]), ReferenceOf(this[start]), sizeof<T>() * (end - start));
        return this;
    }

    // to prevent cycling initialization of T[][] as Array<Array<....>> which causes inf. cycle
    function concat<T>(this: T[], ...other: T[][]) {
        let count = this.length;
        for (const item of other)
            count += item.length;
        let newArray : T[] = [];
        newArray.length = count;
        let index = 0;
        memcpy(ReferenceOf(newArray[index]), ReferenceOf(this[0]), sizeof<T>() * this.length);
        index += this.length;
        for (const item of other) {
            memcpy(ReferenceOf(newArray[index]), ReferenceOf(item[0]), sizeof<T>() * item.length);
            index += item.length;
        }

        return newArray;
    }

    function *entries<T>(this: T[]) {
        for (let i = 0; i in this; i++) {
            yield [i, this[i]];
        }
    }

    function toString<T>(this: T[]) {
        return this.join();
    }

    function every<T>(this: T[], func: (v: T) => boolean) {
        for (const v of this) if (!func(v)) return false;
        return true;
    } 

    function fill<T>(this: T[], value: T, start = 0, end = this.length) {
        let newArray = this.slice();

        if (start < 0) {
            if (-this.length <= start) {
                start = start + this.length;
            } else if (start < -this.length) {
                start = 0;
            }
        } else if (start >= this.length) {
            return newArray;
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

        for (let i = start; i <= end; i++)
            newArray[i] = value;

        return newArray;
    }

    function filter<T>(this: T[], func: (v: T) => boolean) {
        let result: T[] = [];
        for (const v of this) if (func(v)) result.push(v);
        return result;
    }

    function *filter2<T>(this: T[], func: (v: T) => boolean) {
        for (const v of this) if (func(v)) yield v;
    }

    function find<T>(this: T[], func: (v: T) => boolean) {
        for (const v of this) if (func(v)) return v;
    }

    function findIndex<T>(this: T[], func: (v: T) => boolean) {
        let i = -1;
        for (const v of this) if (i++, func(v)) return i;
        return -1;
    }    
    
    function findLast<T>(this: T[], func: (v: T) => boolean) {
        for (let i = this.length - 1; i >= 0; i--) {
            const v = this[i];
            if (func(v)) return v;
        }

        return -1;
    }

    function findLastIndex<T>(this: T[], func: (v: T) => boolean) {
        for (let i = this.length - 1; i >= 0; i--) {
            const v = this[i];
            if (func(v)) return i;
        }

        return -1;
    }    

    function forEach<T>(this: T[], func: (v: T) => void) {
        for (const v of this) func(v);
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

    function join<T>(this: T[], separator = ",") {
        let result = "";
        for (const v of this) {
            if (result.length > 0)
                result += separator;
            result += v;
        }

        return result;
    } 
    
    function *keys<T>(this: T[]) {
        for (let i = 0; i in this; i++) {
            yield i;
        }
    }

    function lastIndexOf<T>(this: T[], searchElement: T, fromIndex = this.length - 1) {
        if (fromIndex < 0) {
            if (-this.length <= fromIndex) {
                fromIndex = fromIndex + this.length;
            } else if (fromIndex < -this.length) {
                fromIndex = 0;
            }
        } else if (fromIndex >= this.length) {
            return -1;
        }

        if (fromIndex > this.length)
            fromIndex = this.length - 1;
 
        for (let i = fromIndex; i in this; i--) {
            if (searchElement === this[i]) return i;
        }

        return -1;
    }      

    function map<T, V>(this: T[], func: (v: T) => V) {
        let result: V[] = [];
        result.length = this.length;
        for (let i = 0; i in this; i++) result[i] = func(this[i]);
        return result;
    }
    
    function reduce<T, V = T>(this: T[], func: (v: V, t: T) => V, initial?: V) {
        if (initial == undefined)
        {
            if (this.length <= 0) {
                return undefined;
            }

            if (__is<V, T>(this[0])) {
                let result = <V>this[0];
                for (let i = 1; i in this; i++) result = func(result, this[i]);
                return result;
            }
        }
        else 
        {
            let result = initial;
            for (const v of this) result = func(result, v);
            return result;
        }
    }

    function reduceRight<T, V = T>(this: T[], func: (v: V, t: T) => V, initial?: V) {
        if (initial == undefined)
        {
            if (this.length <= 0) {
                return undefined;
            }

            if (__is<V, T>(this[0])) {
                let result = <V>this[this.length - 1];
                for (let i = this.length - 2; i in this; i--) result = func(result, this[i]);
                return result;
            }
        }
        else
        {
            let result = initial;
            for (let i = this.length - 1; i in this; i--) result = func(result, this[i]);
            return result;
        }
    }    

    function reverse<T>(this: T[]) {
        const shift = this.length - 1;
        const size = this.length >> 1;
        for (let i = 0; i < size; i++) { 
            const v = this[i];
            this[i] = this[shift - i]
            this[shift - i] = v; 
        }
        
        return this;
    }    

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
        memcpy(ReferenceOf(newArray[0]), ReferenceOf(this[start]), sizeof<T>() * (end - start));
        return newArray;
    }    

    function some<T>(this: T[], func: (v: T) => boolean) {
        for (const v of this) if (func(v)) return true;
        return false;
    }    

    function sort<T>(this: T[], callbackfn?: (value1: T, value2: T) => int): T[] {
        if (this.length <= 0) {
            return this;
        }

        if (!callbackfn) {
            callbackfn = (a, b) => { 
                const sa = <string>a;
                const sb = <string>b;
                if (sa == sb) return 0;
                return sa > sb ? 1 : -1;
            };
        }

        const len = this.length;
        // simple selection sort.
        for (let i = 0; i < len - 1; ++i) {
            for (let j = i + 1; j < len; ++j) {
                if (callbackfn(this[i], this[j]) > 0) {
                    let temp: T = this[i];
                    this[i] = this[j];
                    this[j] = temp;                    
                }
            }
        }

        return this;
    }    

    function iterator<T>(this: T[]) {
         return this.values();
    }

    function toReversed<T>(this: T[]) {
        let newArray = this.slice();
        newArray.reverse();
        return newArray;
    }        

    function toSorted<T>(this: T[], callbackfn?: (value1: T, value2: T) => int): T[] {
        let newArray = this.slice();
        newArray.sort(callbackfn);
        return newArray;
    }        

    function *values<T>(this: T[]) {
        for (const v of this) {
            yield v;
        }
    }

    function _with<T>(this: T[], index: int, value: T) {
        if (index < 0) {
            if (-this.length <= index) {
                index = index + this.length;
            } 
        }

        if (index < 0 || index >= this.length)
        {
            throw new RangeError();
        }

        let newArray = this.slice();
        newArray[index] = value;
        return newArray;
    }
}

class Array<T> {

    constructor(private data: T[] = []) {
    }

    public [index: int]: T;

    public get(index: int): T {
        return this.data[index];
    }

    public set(index: int, value: T) {
        this.data[index] = value;
    }

    public push(...args: T[]): int {
        for (const v of args)
            this.data.push(v);
        return this.data.length;
    }

    public pop(): T {
        return this.data.pop();
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

    public copyWithin(target: int, start: int, end = this.length) {
        return this.data.copyWithin(target, start, end);
    }

    public concat(...other: T[][]) {
        return this.data.concat(...other);
    }

    public entries() {
        return this.data.entries();
    }

    public toString() {
        return this.join();
    }

    public every(func: (v: T) => boolean) {
        return this.data.every(func);
    } 

    public fill(value: T, start = 0, end = this.length) {
        return this.data.fill(value, start, end);
    }

    public filter(func: (v: T) => boolean) {
        return this.data.filter(func);
    }

    public *filter2(func: (v: T) => boolean) {
        return this.data.filter2(func);
    }

    public find(func: (v: T) => boolean) {
        return this.data.find(func);
    }

    public findIndex(func: (v: T) => boolean) {
        return this.data.findIndex(func);
    }    
    
    public findLast(func: (v: T) => boolean) {
        return this.data.findLast(func);
    }

    public findLastIndex(func: (v: T) => boolean) {
        return this.data.findLastIndex(func);
    }    

    public forEach(func: (v: T) => void) {
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
    
    public keys() {
        return this.data.keys();
    }

    public lastIndexOf(searchElement: T, fromIndex = this.length - 1) {
        return this.data.lastIndexOf(searchElement, fromIndex);
    }      

    public map<V>(func: (v: T) => V) {
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

    public slice(start = 0, end = this.length) {
        return this.data.slice(start, end);
    }    

    public some(func: (v: T) => boolean) {
        return this.data.some(func);
    }    

    public sort(callbackfn?: (value1: T, value2: T) => int): T[] {
        return this.data.sort(callbackfn);
    }    

    public [Symbol.iterator]() {
        return this.data.values();
    }

    public toReversed() {
        return this.data.toReversed();
    }        

    public toSorted(callbackfn?: (value1: T, value2: T) => int): T[] {
        return this.data.toSorted(callbackfn);
    }        

    public values() {
        return this.data.values();
    }

    public _with(index: int, value: T) {
        return this.data._with(index, value);
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

enum InsertionBehavior
{
  None,
  OverwriteExisting,
  ThrowOnExisting,
}

namespace HashHelpers
{
    function hashCodeGeneral<K>(key: K): int {
        let hashValue = 0;
        let power = 1;
        const mod = 10 ** 9 + 7;

        let keyLocal = key;
        const size = sizeof<K>();
        const valueRef = ReferenceOf(keyLocal);

        switch (size) {
            case 4: return LoadReference(<Reference<i32>>valueRef);
            case 8: 
                const valueRef32 = <Reference<i32>>valueRef;
                const hash32 = (LoadReference(valueRef32[1]) >> 1) ^ LoadReference(valueRef32[0]);
                return hash32;
        }

        return hashCodeBinary(valueRef, size);
    }

    function hashCode<K>(key: K): int {
        if (__is<K, string>(key))
        { 
            return hashCodeString(key);
        }
        else
        {
            return hashCodeGeneral(key);
        }
    }
}

type Entry<TKey, TValue> =
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

class Map<K = any, V = any> {

    const StartOfFreeList = -3;

    private buckets: int[];
    private _entries: Entry<K, V>[];    
    private freeList: int;
    private count: int;
    private freeList: int;
    private freeCount: int;
    private version: int;
    
    constructor() {
        this.initialize(0);
    }

    clear() {
        const count = this.count;
        if (count > 0)
        {
            this.buckets.length = 0;

            this.count = 0;
            this.freeList = -1;
            this.freeCount = 0;
            this._entries.length = 0;
        }        
    }

    set (k: K, v: V) {        
        this.tryInsert(k, v, InsertionBehavior.ThrowOnExisting);
        return this;
    }

    get (k: K): V | null {        
        return this.findValue(k);
    }
    
    has (k: K): boolean {        
        return this.hasValue(k);
    }    

    delete (k: K): boolean {
        return this.removeValue(k);
    }

    *entries() {
        for (const entry of this.iter()) yield [entry.key, entry.value];
    }
    
    *keys() {
        for (const entry of this.iter()) yield entry.key;
    }

    *values() {
        for (const entry of this.iter()) yield entry.value;
    }

    forEach(f: (value: V, key: K, map: Map<K, V>) => void) {
        for (const entry of this.iter()) f(entry.value, entry.key, this);
    }

    [Symbol.iterator]() {
        return this.entries();
    }

    private initialize(capacity: int) {
        const size = PrimeHelpers.getPrime(capacity);
        let buckets: int[] = [];
        buckets.length = size;
        let entries: Entry<K, V>[] = [];
        entries.length = size;

        this.freeList = -1;
        this.buckets = buckets;
        this._entries = entries;

        return size;
    }

    private getBucket(hashCode: int): int
    {
        const buckets = this.buckets;
        return buckets[hashCode % buckets.length];
    }    

    private setBucket(hashCode: int, value: int)
    {
        const buckets = this.buckets;
        buckets[hashCode % buckets.length] = value;
    } 

    private newHashCodes(entries: Entry<K, V>[]) {
        const count = entries.length;
        for (let i = 0; i < count; i++) {
            if (entries[i].next >= -1)
            {
                entries[i].hashCode = <uint>HashHelpers.hashCode(entries[i].key);
            }
        }
    }

    private resizeHelper(newSize: int, forceNewHashCodes: boolean)
    {
        let entries: Entry<K, V>[] = [];
        entries.length = newSize;

        const count = this.count;
        memcpy(ReferenceOf(entries[0]), ReferenceOf(this._entries[0]), sizeof<typeof entries[0]>() * count);

        if (forceNewHashCodes)
        {
            this.newHashCodes(entries);
        }

        // Assign member variables after both arrays allocated to guard against corruption from OOM if second fails
        this.buckets = [];
        this.buckets.length = newSize;
        for (let i = 0; i < count; i++)
        {
            if (entries[i].next >= -1)
            {
                const hashCode = entries[i].hashCode;
                entries[i].next = this.getBucket(hashCode) - 1; // Value in _buckets is 1-based
                this.setBucket(hashCode, i + 1);
            }
        }

        this._entries = entries;
    }

    private resize() {
        this.resizeHelper(PrimeHelpers.expandPrime(this.count), false);
    }

    private tryInsert(key: K, value: V, behavior: InsertionBehavior): boolean {
        const hashCode = <uint>HashHelpers.hashCode(key);

        let entries = this._entries;

        let collisionCount: uint = 0;
        let bucket = this.getBucket(hashCode);
        let i = bucket - 1; // Value in _buckets is 1-based

        while (<uint>i < <uint>entries.length)
        {
            if (entries[i].hashCode == hashCode && entries[i].key == key)
            {
                if (behavior == InsertionBehavior.OverwriteExisting)
                {
                    entries[i].value = value;
                    return true;
                }

                if (behavior == InsertionBehavior.ThrowOnExisting)
                {
                    // throw error
                }

                return false;
            }            

            i = entries[i].next;
            collisionCount++;
            if (collisionCount > <uint>entries.length)
            {
                // throw exception
            }        
        }        

        let index = 0;
        if (this.freeCount > 0)
        {
            index = this.freeList;
            this.freeList = this.StartOfFreeList - entries[this.freeList].next;
            this.freeCount--;
        }
        else
        {
            let count = this.count;
            if (count == entries.length)
            {
                this.resize();
                bucket = this.getBucket(hashCode);
            }

            index = count;
            this.count = count + 1;
            entries = this._entries;
        }

        entries[index] = {
            hashCode: hashCode,
            next: bucket - 1, // Value in _buckets is 1-based
            key: key,
            value: value,
        };

        this.setBucket(hashCode, index + 1); // Value in _buckets is 1-based
        this.version++;

        // Value types never rehash
        if (collisionCount > PrimeHelpers.hashCollisionThreshold)
        {
            this.newHashCodes(entries);
        }

        return true;
    }

    private findValue(key: K): V | null
    {
        const hashCode = <uint>HashHelpers.hashCode(key);
        let i = this.getBucket(hashCode);
        let entries = this._entries;
        let collisionCount: uint = 0;

        i--; // Value in _buckets is 1-based; subtract 1 from i. We do it here so it fuses with the following conditional.
        do
        {
            if (<uint>i >= <uint>entries.length)
            {
                // not found
                return null;
            }

            const entry = ReferenceOf(entries[i]);
            if (entry.hashCode == hashCode && entry.key == key)
            {
                // found
                return entry.value;
            }

            i = entry.next;

            collisionCount++;
        } while (collisionCount <= <uint>entries.length);

        // The chain of entries forms a loop; which means a concurrent update has happened.
        // Break out of the loop and throw, rather than looping forever.
        // TODO: throw exception
        return null;
    }    

    private hasValue(key: K): boolean
    {
        const hashCode = <uint>HashHelpers.hashCode(key);
        let i = this.getBucket(hashCode);
        let entries = this._entries;
        let collisionCount: uint = 0;

        i--; // Value in _buckets is 1-based; subtract 1 from i. We do it here so it fuses with the following conditional.
        do
        {
            if (<uint>i >= <uint>entries.length)
            {
                // not found
                return false;
            }

            const entry = ReferenceOf(entries[i]);
            if (entry.hashCode == hashCode && entry.key == key)
            {
                // found
                return true;
            }

            i = entry.next;

            collisionCount++;
        } while (collisionCount <= <uint>entries.length);

        // The chain of entries forms a loop; which means a concurrent update has happened.
        // Break out of the loop and throw, rather than looping forever.
        // TODO: throw exception
        return false;
    } 
    
    private removeValue(key: K): boolean
    {
        const hashCode = <uint>HashHelpers.hashCode(key);
        let bucket = this.getBucket(hashCode);
        let entries = this._entries;
        let collisionCount: uint = 0;

        let last = -1;
        let i = bucket - 1; // Value in buckets is 1-based
        while (i >= 0)
        {
            const entry = ReferenceOf(entries[i]);
            if (entry.hashCode == hashCode && entry.key == key)
            {
                if (last < 0)
                {
                    bucket = entry.next + 1; // Value in buckets is 1-based
                }
                else
                {
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
            if (collisionCount > <uint>entries.length)
            {
                // The chain of entries forms a loop; which means a concurrent update has happened.
                // Break out of the loop and throw, rather than looping forever.
                // throw exception
                return false;
            }
        }

        return false;
    }    

    private *iter() {
        let i = 1;
        let entries = this._entries;
        let collisionCount: uint = 0;

        i--; // Value in _buckets is 1-based; subtract 1 from i. We do it here so it fuses with the following conditional.
        do
        {
            if (<uint>i >= <uint>entries.length)
            {
                // not found
                break;
            }

            const entry = ReferenceOf(entries[i]);
            yield <[key: K, value: V]>[entry.key, entry.value];

            i = entry.next;

            collisionCount++;
        } while (collisionCount <= <uint>entries.length);
    }
}
