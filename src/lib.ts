/// <reference path="types/lib.types.d.ts" />
/// <reference path="native/lib.native.d.ts" />
/// <reference path="core/core.os.d.ts" />
/// <reference path="core/core.ts" />
/// <reference path="generics/lib.generics.ts" />

export function parseInt(val: string, radix = 10) {
    return strtol(val, null, radix);
}

export function parseFloat(val: string): number {
    return strtod(val, null);
}

export function isNaN(val: number): boolean {
    return val != val;
}

export function isFinite(val: number): boolean {
    return !isNaN(val) && val != Number.POSITIVE_INFINITY && val != Number.NEGATIVE_INFINITY;
}

export class Boolean {
    public constructor(private value: boolean) {
    }

    public toString() {
        return <string>this.value;
    }

    public valueOf() {
        return this.value;
    }
}

export class Number {
    public static EPSILON = 2 ** (-52);

    public static MAX_SAFE_INTEGER = 2 ** 53 - 1;

    /** The largest number that can be represented in JavaScript. Equal to approximately 1.79E+308. */
    public static MAX_VALUE = 1.7976931348623157e+308;

    public static MIN_SAFE_INTEGER = -Number.MAX_SAFE_INTEGER;

    /** The closest number to zero that can be represented in JavaScript. Equal to approximately 5.00E-324. */
    public static MIN_VALUE = 2.22507385855e-308; //5e-324;

    /**
     * A value that is not a number.
     * In equality comparisons, NaN does not equal any value, including itself. To test whether a value is equivalent to NaN, use the isNaN function.
     */
    public static NaN = 0.0 / 0.0;

    /**
     * A value that is less than the largest negative number that can be represented in JavaScript.
     * JavaScript displays NEGATIVE_INFINITY values as -infinity.
     */
    public static NEGATIVE_INFINITY = -1.0 / 0.0;

    /**
     * A value greater than the largest number that can be represented in JavaScript.
     * JavaScript displays POSITIVE_INFINITY values as infinity.
     */
    public static POSITIVE_INFINITY = 1.0 / 0.0;

    public constructor(private value: number) {
    }

    public static isFinite(value: number): boolean {
        return isFinite(value);
    }

    public static isInteger(value: number): boolean {
        return (value - <i64>value) == 0;
    }

    public static isNaN(value: number): boolean {
        return isNaN(value);
    }

    public static parseInt(value: string, radix: number = 10): number {
        return parseInt(value, radix);
    }

    public static parseFloat(value: string) {
        return parseFloat(value);
    }

    public static isSafeInteger(value: number) {
        return Number.isInteger(value) && value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER;
    }

    public toExponential(fractionDigits = 0) {
        return convertNum(50, `%.${fractionDigits}e`, this.value);
    }

    public toFixed(digits = 0) {
        return convertNum(50, `%.${digits}f`, this.value);
    }

    public toPrecision(precision = 0) {
        return convertNum(50, `%.${precision}g`, this.value);
    }

    public toString(radix = 10) {
        switch (radix) {
            case 16:
                return convertNum(50, "%a", this.value);
            default:
                return <string>this.value;
        }
    }

    public valueOf() {
        return this.value;
    }
}

export class RegExp
{
    public constructor(private expr: string) {
    }
}

namespace __String {

    function dataAt(this: string, index: int) {
        if (index < 0) {
            if (-this.length <= index) {
                index = index + this.length;
            } else if (index < -this.length) {
                index = 0;
            }
        } else if (index >= this.length) {
            return <char>0;
        }

        return this[index];
    }    

    function clone(this: string, add = "", right = false): string {
        return right ? add + this : this + add; // to clone string
    }

    function resize(this: string, newSize: index): string {
        this.length = newSize;
        this[newSize] = null;
        return this;
    }

    export function at(this: string, index: int): string {
        return this.dataAt(index);
    }

    export function charAt(this: string, index: int): string {
        return this.dataAt(index);
    }    

    export function charCodeAt(this: string, index: int): int {
        return this.dataAt(index);
    }    

    export function codePointAt(this: string, index: int): int {
        return this.dataAt(index);
    }    

    export function concat(this: string, ...other: string[]): string {
        let count = this.length;
        for (const item of other)
            count += item.length;
        let newString = this.clone().resize(count);        
        let index = this.length;
        for (const item of other) {
            memcpy(ReferenceOf(newString[index]), ReferenceOf(item[0]), sizeof<TypeOf<""[0]>>() * item.length);
            index += item.length;
        }

        return newString;
    }       

    export function endsWith(this: string, searchString: string, endPosition = this.length): boolean {
        if (!searchString)
        {
            return false;
        }

        const lenstr = endPosition;
        const lensuffix = searchString.length;
        if (lensuffix > lenstr)
        {
            return false;
        }

        return strncmp(<string>ReferenceOf(this[lenstr - lensuffix]), searchString, lensuffix) == 0;
    }    

    export function includes(this: string, searchString: string, position = 0): boolean {    
        if (position >= this.length) 
        {
            return false;
        }

        return strstr(<string>ReferenceOf(this[position]), searchString) != null;
    }      

    export function indexOf(this: string, searchString: string, position = 0): int {    
        if (!searchString)
        {
            return -1;
        }

        if (position >= this.length) 
        {
            return this.length;
        }
        
        const found = strstr(<string>ReferenceOf(this[position]), searchString);
        if (found == null)
        {
            return -1;
        }

        return <index>ReferenceOf(found[0]) - <index>ReferenceOf(this[0]);
    }        

    export function isWellFormed(this: string): boolean {    
        // TODO: to be implemented
        return true;
    }    

    export function lastIndexOf(this: string, searchString: string, position = this.length): int {    
        if (!searchString)
        {
            return position;
        }

        const searchStringLen = searchString.length;
        if (searchStringLen == 0)
        {
            return position;
        }

        if (position < 0) 
        {
            position = 0;
        }
        
        for (let i = position; i >= 0; i--)
        {
            const found = strncmp(<string>ReferenceOf(this[i]), searchString, searchStringLen);
            if (found == 0)
            {
                return <index>ReferenceOf(this[i]) - <index>ReferenceOf(this[0]);
            }
        }

        return -1;
    }     

    export function localeCompare(this: string, compareString: string, locale = ""): int {
        setlocale (LC_COLLATE, locale);        
        return strcoll(this, compareString);
    }

    export function match(this: string, expr: RegExp): string[] {
        // TODO: finish match
        return null;
    }

    export function matchAll(this: string, expr: RegExp): string[] {
        // TODO: finish matchAll
        return null;
    }

    export function normalize(this: string, form?: string): string {
        // TODO: finish normalize
        return this;
    }

    function pad(addSize: index, padString: string): string {
        let newPadString = "".clone().resize(addSize);
        let padStringIndex = 0;
        for (let i = 0; i < addSize; i++) {
            newPadString[i] = padString[padStringIndex++];
            if (padStringIndex >= padString.length) {
                padStringIndex = 0;
            }
        }

        return newPadString;
    }

    export function padEnd(this: string, targetLength: index, padString = " "): string {
        if (targetLength <= this.length) {
            return this;
        }

        return this.clone(pad(targetLength - this.length, padString));
    }

    export function padStart(this: string, targetLength: index, padString = " "): string {
        if (targetLength <= this.length) {
            return this;
        }

        return this.clone(pad(targetLength - this.length, padString), true);
    }    

    export function toLowercase(this: string): string {
        const lower = this.clone();
        for (let i = 0; i < this.length; i++) lower[i] = tolower(this[i]);
        return lower;
    }

    export function toUppercase(this: string): string {
        const upper = this.clone();
        for (let i = 0; i < this.length; i++) upper[i] = toupper(this[i]);
        return upper;
    }
}

export class String {

    public constructor(private value: string) {
    }

    public at(index: int) {
        return this.value.at(index);
    }
}

export static class Math {
    /** The mathematical constant e. This is Euler's number, the base of natural logarithms. */
    public E = 2.718281828459045;
    /** The natural logarithm of 10. */
    public LN10 = 2.302585092994046;
    /** The natural logarithm of 2. */
    public LN2 = 0.6931471805599453;
    /** The base-2 logarithm of e. */
    public LOG2E = 1.4426950408889634;
    /** The base-10 logarithm of e. */
    public LOG10E = 0.4342944819032518;
    /** Pi. This is the ratio of the circumference of a circle to its diameter. */
    public PI = 3.141592653589793;
    /** The square root of 0.5, or, equivalently, one divided by the square root of 2. */
    public SQRT1_2 = 0.7071067811865476;
    /** The square root of 2. */
    public SQRT2 = 1.4142135623730951;

    constructor() {
        let ltime = 0;
        time(ltime);
        srand(ltime);
    }

    /**
     * Returns the absolute value of a number (the value without regard to whether it is positive or negative).
     * For example, the absolute value of -5 is the same as the absolute value of 5.
     * @param x A numeric expression for which the absolute value is needed.
     */
    public abs(x: number): number {
        return fabs(x);
    }

    /**
     * Returns the arc cosine (or inverse cosine) of a number.
     * @param x A numeric expression.
     */
    public acos(x: number): number {
        return acos(x);
    }

    /**
     * Returns the arcsine of a number.
     * @param x A numeric expression.
     */
    public asin(x: number): number {
        return asin(x);
    }

    /**
     * Returns the arctangent of a number.
     * @param x A numeric expression for which the arctangent is needed.
     */
    public atan(x: number): number {
        return atan(x);
    }

    /**
     * Returns the angle (in radians) from the X axis to a point.
     * @param y A numeric expression representing the cartesian y-coordinate.
     * @param x A numeric expression representing the cartesian x-coordinate.
     */
    public atan2(y: number, x: number): number {
        return atan2(y, x);
    }

    /**
     * Returns the smallest integer greater than or equal to its numeric argument.
     * @param x A numeric expression.
     */
    public ceil(x: number): number {
        return ceil(x);
    }

    /**
     * Returns the cosine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    public cos(x: number): number {
        return cos(x);
    }

    /**
     * Returns e (the base of natural logarithms) raised to a power.
     * @param x A numeric expression representing the power of e.
     */
    public exp(x: number): number {
        return exp(x);
    }

    /**
     * Returns the greatest integer less than or equal to its numeric argument.
     * @param x A numeric expression.
     */
    public floor(x: number): number {
        return floor(x);
    }

    /**
     * Returns the natural logarithm (base e) of a number.
     * @param x A numeric expression.
     */
    public log(x: number): number {
        return log(x);
    }

    /**
     * Returns the larger of a set of supplied numeric expressions.
     * @param values Numeric expressions to be evaluated.
     */
    public max(...values: number[]): number {
        let m = Number.MIN_VALUE;
        for (const v of values) if (v > m) m = v;
        return m;
    }

    /**
     * Returns the smaller of a set of supplied numeric expressions.
     * @param values Numeric expressions to be evaluated.
     */
    public min(...values: number[]): number {
        let m = Number.MAX_VALUE;
        for (const v of values) if (v < m) m = v;
        return m;
    }

    /**
     * Returns the value of a base expression taken to a specified power.
     * @param x The base value of the expression.
     * @param y The exponent value of the expression.
     */
    public pow(x: number, y: number): number {
        return pow(x, y);
    }

    /** Returns a pseudorandom number between 0 and 1. */
    public random(): number {
        return rand() / <number>2147483647;
    }

    /**
     * Returns a supplied numeric expression rounded to the nearest integer.
     * @param x The value to be rounded to the nearest integer.
     */
    public round(x: number): number {
        return round(x);
    }

    /**
     * Returns the sine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    public sin(x: number): number {
        return sin(x);
    }

    /**
     * Returns the square root of a number.
     * @param x A numeric expression.
     */
    public sqrt(x: number): number {
        return sqrt(x);
    }

    /**
     * Returns the tangent of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    public tan(x: number): number {
        return tan(x);
    }
}

enum States {
    HasMaxByteLength = 1,
    NonResizable = 2,
    Detached = 4,
    View = 8,
}

export class ArrayBuffer {

    private arrayOfView: char[];
    private states: States;
    public maxByteLength: int;

    public constructor(length: int, options?: { maxByteLength?: int }) {
        if (options != undefined && options.maxByteLength != undefined) {
            this.maxByteLength = options.maxByteLength;
            this.states |= States.HasMaxByteLength;
        }

        if (length > 0) {
            this.arrayOfView = new Array<char>(length);
        }
    }

    public get resizable() {
        return (this.states & States.NonResizable) != States.NonResizable;
    }

    public get detached() {
        return (this.states & States.Detached) == States.Detached;
    }

    public static isView(arrayBuffer: ArrayBuffer) {
        return (arrayBuffer.states & States.View) == States.View;
    }

    public resize(newLength: int) {
        this.arrayOfView.length = newLength;
    }

    public slice(start?: int, end?: int) {
        const newArrayBuffer = new ArrayBuffer(0);
        newArrayBuffer.states = this.states | States.NonResizable;
        newArrayBuffer.maxByteLength = this.maxByteLength;
        newArrayBuffer.arrayOfView = this.arrayOfView.view(start || 0, end || this.arrayOfView.length);
        return newArrayBuffer;
    }

    public transfer(newByteLength?: int) {
        const newArrayBuffer = new ArrayBuffer(0);
        newArrayBuffer.states = this.states;
        newArrayBuffer.maxByteLength = this.maxByteLength;
        newArrayBuffer.arrayOfView = this.detach();
        return newArrayBuffer;
    }

    public transferToFixedLength(newByteLength?: int) {
        const newArrayBuffer = this.transfer(newByteLength);
        newArrayBuffer.states |= States.NonResizable;
        return newArrayBuffer;
    }

    private detach() {
        this.states |= States.Detached;
        const inst = this.arrayOfView;
        this.arrayOfView = null;
        return inst;
    }

    [Symbol.dispose]() {
        if (this.arrayOfView != null && !this.detached) {
            delete this.arrayOfView;
            this.arrayOfView = null;
        }
    }
}

export static class console {
    public assert(condition?: boolean, ...data: string[]): void {
        assert(condition || false, data.length > 0 ? data[0] : "");
    }

    public log(...data: string[]): void {
        this.printData(1, data);
    }

    public warn(...data: string[]): void {
        this.printData(2, data);
    }

    public error(...data: string[]): void {
        this.printData(2, data);
    }

    private printData(fileNo: int, data: string[]): void {
        switch (data.length) {
            case 0:
                break;
            default:
                this.print(fileNo, data[0]);
                for (let i = 1; i < data.length; i++) {
                    this.print(fileNo, " ");
                    this.print(fileNo, data[i]);
                }
        }

        this.print(fileNo, "\n");
    }

    private print(fileNo: int, data: string): void {
        write(fileNo, data, data.length);
    }
}
