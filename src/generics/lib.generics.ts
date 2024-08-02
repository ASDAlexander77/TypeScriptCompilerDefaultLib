/// <reference path="native/lib.native.d.ts" />

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
        let result = true;
        for (const v of this) if (!(result &&= func(v))) break;
        return result;
    } 

    public fill(this: T[], value: T, start = 0, end = this.length) {
        let newArray = this.clone();

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

    /*
    public *filter(this: T[], func: (v: T) => boolean) {
        for (const v of this) if (func(v)) yield v;
    }
    */     

    public filter(this: T[], func: (v: T) => boolean) {
        let result = new Array<T>();
        for (const v of this) if (func(v)) result.push(v);
        return result;
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
        for (const v of this) result.push(func(v));
        return result;
    }

    private clone(this: T[]) {
        let newArray = new Array<T>(this.length);
        memcpy(<Opaque>ReferenceOf(newArray[0]), <Opaque>ReferenceOf(this[0]), sizeof(T) * this.length);
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