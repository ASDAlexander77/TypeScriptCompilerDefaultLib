function __as<T>(a: any) : T
{
    if (typeof a == 'number') return a;
    if (typeof a == 'string') return a;
    if (typeof a == 'class') if (a instanceof T) return a;
    if (typeof a == 'boolean') return a;
    if (typeof a == 'i32') return a;
    if (typeof a == 'i64') return a;
    return null;
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

            let result = <V>this[0];
            for (let i = 1; i in this; i++) result = func(result, this[i]);
            return result;
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

            let result = <V>this[this.length - 1];
            for (let i = this.length - 2; i in this; i--) result = func(result, this[i]);
            return result;
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

    // public [Symbol.iterator](this: T[]) {
    //     return this.values();
    // }

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
        this.data.filter2(func);
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

namespace __Array {
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
}

static class Array {
    public of(...arg) {
        return arg;
    }

    public from(arrayLike) {
        return [...arrayLike];
    }       
}