/// <reference path="native/lib.native.d.ts" />

namespace __Array {
    function at<T>(this: T[], index: int): T {
        return this[index];
    }

    function concat<T>(this: T[], ...other: T[][]): T[] {
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

    function copyWithin<T>(this: T[], target: int, start: int, end?: int = this.length - 1 ): T[] {

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
            return this;
        }    

        memmove(<Opaque>ReferenceOf(this[target]), <Opaque>ReferenceOf(this[start]), sizeof(T) * (end - start + 1));
        return this;
    }     

    function toString<T>(this: T[]): string {
        let str = "";
        for (const item of this) {
            if (str.length > 0)
                str += ",";
            str += item;        
        }

        return str;
    }    
}

static class Array {
    public of<T>(...arg: T[]) {
        return arg;
    }
}