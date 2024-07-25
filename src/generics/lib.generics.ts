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
}

static class Array {
    public of<T>(...arg: T[]) {
        return arg;
    }
}