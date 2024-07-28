/// <reference path="native/lib.native.d.ts" />

static class Array<T> {
    public at(this: T[], index: int) {
        return this[index];
    }

    public copyWithin(this: T[], target: int, start: int, end?: int = this.length) {

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
        let str = "";
        for (const item of this) {
            if (str.length > 0)
                str += ",";
            str += item;
        }

        return str;
    }

    public every(this: T[], func: (v: T) => boolean) {
        let result = true;
        for (const v of this) if (!(result &&= func(v))) break;
        return result;
    } 

    public fill(this: T[], value: T, start?: int = 0, end?: int = this.length) {
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

    private clone(this: T[]) {
        var newArray = new Array<T>(this.length);
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