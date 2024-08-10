/// <reference path="native/lib.native.d.ts" />

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

static class Array<T> {
    public at(this: T[], index: int) {
        return this[index];
    }

    public copyWithin(this: T[], target: int, start: int, end = this.length) {

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

        memmove(<Opaque>ReferenceOf(this[target]), <Opaque>ReferenceOf(this[start]), sizeof(T) * (end - start));
        return this;
    }

    public *entries(this: T[]) {
        for (let i = 0; i in this; i++) {
            yield [i, this[i]];
        }
    }

    public toString(this: T[]) {
        return this.join();
    }

    public every(this: T[], func: (v: T) => boolean) {
        for (const v of this) if (!func(v)) return false;
        return true;
    } 

    public fill(this: T[], value: T, start = 0, end = this.length) {
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

    public filter(this: T[], func: (v: T) => boolean) {
        let result = new Array<T>();
        for (const v of this) if (func(v)) result.push(v);
        return result;
    }

    public *filter2(this: T[], func: (v: T) => boolean) {
        for (const v of this) if (func(v)) yield v;
    }

    public find(this: T[], func: (v: T) => boolean) {
        for (const v of this) if (func(v)) return v;
    }

    public findIndex(this: T[], func: (v: T) => boolean) {
        let i = -1;
        for (const v of this) if (i++, func(v)) return i;
        return -1;
    }    
    
    public findLast(this: T[], func: (v: T) => boolean) {
        for (let i = this.length - 1; i >= 0; i--) {
            const v = this[i];
            if (func(v)) return v;
        }
    }

    public findLastIndex(this: T[], func: (v: T) => boolean) {
        for (let i = this.length - 1; i >= 0; i--) {
            const v = this[i];
            if (func(v)) return i;
        }

        return -1;
    }    

    public forEach(this: T[], func: (v: T) => void) {
        for (const v of this) func(v);
    }    

    public includes(this: T[], searchElement: T, fromIndex = 0) {
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

    public indexOf(this: T[], searchElement: T, fromIndex = 0) {
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

    public join(this: T[], separator = ",") {
        let result = "";
        for (const v of this) {
            if (result.length > 0)
                result += separator;
            result += v;
        }

        return result;
    } 
    
    public *keys(this: T[]) {
        for (let i = 0; i in this; i++) {
            yield i;
        }
    }

    public lastIndexOf(this: T[], searchElement: T, fromIndex = this.length - 1) {
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

    public map<V>(this: T[], func: (v: T) => V) {
        let result = new Array<V>();
        result.length = this.length;
        for (let i = 0; i in this; i++) result[i] = func(this[i]);
        return result;
    }
    
    public reduce<V = T>(this: T[], func: (v: V, t: T) => V, initial?: V) {
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

    public reduceRight<V = T>(this: T[], func: (v: V, t: T) => V, initial?: V) {
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

    public reverse(this: T[]) {
        const shift = this.length - 1;
        const size = this.length >> 1;
        for (let i = 0; i < size; i++) { 
            const v = this[i];
            this[i] = this[shift - i]
            this[shift - i] = v; 
        }
        
        return this;
    }    

    public slice(this: T[], start = 0, end = this.length) {

        if (start < 0) {
            if (-this.length <= start) {
                start = start + this.length;
            } else if (start < -this.length) {
                start = 0;
            }
        } else if (start >= this.length) {
            return new Array<T>(0);
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

        let newArray = new Array<T>(end - start);
        memcpy(<Opaque>ReferenceOf(newArray[0]), <Opaque>ReferenceOf(this[start]), sizeof(T) * (end - start));
        return newArray;
    }    

    public some(this: T[], func: (v: T) => boolean) {
        for (const v of this) if (func(v)) return true;
        return false;
    }    

    public sort(this: T[], callbackfn?: (value1: T, value2: T) => int): T[] {
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

    public *values(this: T[]) {
        for (const v of this) {
            yield v;
        }
    }

    public with(this: T[], index: int, value: T) {
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

namespace __Array {
    // to prevent cycling initialization of T[][] as Array<Array<....>> which causes inf. cycle
    function concat<T>(this: T[], ...other: T[][]) {
        let count = this.length;
        for (const item of other)
            count += item.length;
        let newArray = new Array<T>(count);
        let index = 0;
        memcpy(<Opaque>ReferenceOf(newArray[index]), <Opaque>ReferenceOf(this[0]), sizeof(T) * this.length);
        index += this.length;
        for (const item of other) {
            memcpy(<Opaque>ReferenceOf(newArray[index]), <Opaque>ReferenceOf(item[0]), sizeof(T) * item.length);
            index += item.length;
        }

        return newArray;
    }
}

static class Array {
    public of<T>(...arg: T[]) {
        return arg;
    }
}