/// <reference path="types/lib.types.d.ts" />
/// <reference path="native/lib.native.d.ts" />
/// <reference path="core/core.d.ts" />
/// <reference path="generics/lib.generics.ts" />

declare function parseInt(val: string, radix?: int): int;

declare function parseFloat(val: string): number;

declare function isNaN(val: number): boolean;

declare function isFinite(val: number): boolean;

declare namespace __Boolean {
    function toString(this: boolean): string;
}

declare class Boolean {
    private value: boolean;

    constructor(value: boolean);
    
    toString(): string;

    valueOf(): boolean;
}

declare namespace __Number {

    function toExponential(this: number, fractionDigits?: int): string;

    function toFixed(this: number, digits?: int): string;

    function toPrecision(this: number, precision?: int): string;

    function toString(this: number, radix?: int): string;
}

declare class Number {
    static EPSILON: number;

    static MAX_SAFE_INTEGER: number;

    /** The largest number that can be represented in JavaScript. Equal to approximately 1.79E+308. */
    static MAX_VALUE: number;

    static MIN_SAFE_INTEGER: number;

    /** The closest number to zero that can be represented in JavaScript. Equal to approximately 5.00E-324. */
    static MIN_VALUE: number;

    /**
     * A value that is not a number.
     * In equality comparisons, NaN does not equal any value, including itself. To test whether a value is equivalent to NaN, use the isNaN function.
     */
    static NaN: number;

    /**
     * A value that is less than the largest negative number that can be represented in JavaScript.
     * JavaScript displays NEGATIVE_INFINITY values as -infinity.
     */
    static NEGATIVE_INFINITY: number;

    /**
     * A value greater than the largest number that can be represented in JavaScript.
     * JavaScript displays POSITIVE_INFINITY values as infinity.
     */
    static POSITIVE_INFINITY: number;

    private value: number;

    constructor(value: number);

    static isFinite(value: number): boolean;

    static isInteger(value: number): boolean;

    static isNaN(value: number): boolean;

    static parseInt(value: string, radix?: number): number;
    
    static parseFloat(value: string): number;

    static isSafeInteger(value: number): boolean;

    toExponential(fractionDigits?: int): string;

    toFixed(digits?: int): string;

    toPrecision(precision?: int): string;

    toString(radix?: int): string;

    valueOf(): number;
}

declare namespace __BigInt {
    
    function toLocaleString(this: bigint, locale?: string);

    function toString(this: bigint);
}

declare class BigInt {
    private value: bigint;

    constructor(value: bigint);

    toLocaleString(locale?: string);

    toString();

    valueOf();
}

declare class Date {
    private timestamp: long;
    
    constructor (value?: long);
}

declare class RegExp {
    private expr: string;

    constructor(expr: string);
}

declare namespace __String {
    function at(this: string, index: int): string;

    function charAt(this: string, index: int): string;

    function charCodeAt(this: string, index: int): int;

    function codePointAt(this: string, index: int): int;

    function concat(this: string, ...other: string[]): string;

    function endsWith(this: string, end: string, endPosition?: int): boolean;

    function includes(this: string, searchString: string, position?: int): boolean;

    function indexOf(this: string, searchString: string, position?: int): int;

    function isWellFormed(this: string): boolean;

    function lastIndexOf(this: string, searchString: string, position?: int): int;

    function localeCompare(this: string, compareString: string, locale?: string): int;

    function match(this: string, expr: RegExp): string[];

    function matchAll(this: string, expr: RegExp): string[];

    function normalize(this: string, form?: string): string;
    
    function padEnd(this: string, targetLength: index, padString?: string): string;

    function padStart(this: string, targetLength: index, padString?: string): string;

    function repeat(this: string, count: int): string;

    function replace(this: string, pattern: string | RegExp, replacement: string): string;

    function replaceAll(this: string, pattern: string | RegExp, replacement: string): string;
    
    function search(this: string, regexp: RegExp): index;

    function slice(this: string, indexStart: int, indexEnd?: int): string;

    function split(this: string, separator?: string | RegExp, limit?: int): string[];

    function substring(this: string, indexStart: int, indexEnd?: int): string;

    function startsWith(this: string, searchString: string, position?: int);

    function toLocaleLowerCase(this: string, locale?: string): string;

    function toLocaleUpperCase(this: string, locale?: string): string;

    function toLowerCase(this: string): string;

    function toString(this: string): string;

    function toUpperCase(this: string): string;

    function toWellFormed(this: string): string;

    function trim(this: string): string;

    function trimStart(this: string): string;

    function trimEnd(this: string): string;

    function valueOf(this: string): string;
}

declare class String {
    private value: string;

    constructor(value: string);
    
    at(index: int): string;

    charAt(this: string, index: int): string;

    charCodeAt(this: string, index: int): int;

    codePointAt(this: string, index: int): int;

    concat(this: string, ...other: string[]): string;

    endsWith(this: string, end: string, endPosition?: int): boolean;

    includes(this: string, searchString: string, position?: int): boolean;

    indexOf(this: string, searchString: string, position?: int): int;

    isWellFormed(this: string): boolean;

    lastIndexOf(this: string, searchString: string, position?: int): int;

    localeCompare(this: string, compareString: string, locale?: string): int;

    match(this: string, expr: RegExp): string[];

    matchAll(this: string, expr: RegExp): string[];

    normalize(this: string, form?: string): string;
    
    padEnd(this: string, targetLength: index, padString?: string): string;

    padStart(this: string, targetLength: index, padString?: string): string;

    repeat(this: string, count: int): string;

    replace(this: string, pattern: string | RegExp, replacement: string): string;

    replaceAll(this: string, pattern: string | RegExp, replacement: string): string;
    
    search(this: string, regexp: RegExp): index;

    slice(this: string, indexStart: int, indexEnd?: int): string;

    split(this: string, separator?: string | RegExp, limit?: int): string[];

    substring(this: string, indexStart: int, indexEnd?: int): string;

    startsWith(this: string, searchString: string, position?: int);

    toLocaleLowerCase(this: string, locale?: string): string;

    toLocaleUpperCase(this: string, locale?: string): string;

    toLowerCase(this: string): string;

    toString(this: string): string;

    toUpperCase(this: string): string;

    toWellFormed(this: string): string;

    trim(this: string): string;

    trimStart(this: string): string;

    trimEnd(this: string): string;

    valueOf(this: string): string;

    [Symbol.iterator](): Iterator<string>;
    //[Symbol.iterator](): ClassIterator<string>;
}

declare static class Math {
    readonly E: number;
    /** The natural logarithm of 10. */
    readonly LN10: number;
    /** The natural logarithm of 2. */
    readonly LN2: number;
    /** The base-2 logarithm of e. */
    readonly LOG2E: number;
    /** The base-10 logarithm of e. */
    readonly LOG10E: number;
    /** Pi. This is the ratio of the circumference of a circle to its diameter. */
    readonly PI: number;
    /** The square root of 0.5, or, equivalently, one divided by the square root of 2. */
    readonly SQRT1_2: number;
    /** The square root of 2. */
    readonly SQRT2: number;

    /**
     * Returns the absolute value of a number (the value without regard to whether it is positive or negative).
     * For example, the absolute value of -5 is the same as the absolute value of 5.
     * @param x A numeric expression for which the absolute value is needed.
     */    
    abs(x: number): number;

    /**
     * Returns the arc cosine (or inverse cosine) of a number.
     * @param x A numeric expression.
     */
    acos(x: number): number;
    /**
     * Returns the arcsine of a number.
     * @param x A numeric expression.
     */
    asin(x: number): number;
    /**
     * Returns the arctangent of a number.
     * @param x A numeric expression for which the arctangent is needed.
     */
    atan(x: number): number;
    /**
     * Returns the angle (in radians) from the X axis to a point.
     * @param y A numeric expression representing the cartesian y-coordinate.
     * @param x A numeric expression representing the cartesian x-coordinate.
     */
    atan2(y: number, x: number): number;
    /**
     * Returns the smallest integer greater than or equal to its numeric argument.
     * @param x A numeric expression.
     */
    ceil(x: number): number;
    /**
     * Returns the cosine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    cos(x: number): number;
    /**
     * Returns e (the base of natural logarithms) raised to a power.
     * @param x A numeric expression representing the power of e.
     */
    exp(x: number): number;
    /**
     * Returns the greatest integer less than or equal to its numeric argument.
     * @param x A numeric expression.
     */
    floor(x: number): number;
    /**
     * Returns the natural logarithm (base e) of a number.
     * @param x A numeric expression.
     */
    log(x: number): number;
    /**
     * Returns the larger of a set of supplied numeric expressions.
     * @param values Numeric expressions to be evaluated.
     */
    max(...values: number[]): number;
    /**
     * Returns the smaller of a set of supplied numeric expressions.
     * @param values Numeric expressions to be evaluated.
     */
    min(...values: number[]): number;
    /**
     * Returns the value of a base expression taken to a specified power.
     * @param x The base value of the expression.
     * @param y The exponent value of the expression.
     */
    pow(x: number, y: number): number;
    /** Returns a pseudorandom number between 0 and 1. */
    random(): number;
    /**
     * Returns a supplied numeric expression rounded to the nearest integer.
     * @param x The value to be rounded to the nearest integer.
     */
    round(x: number): number;
    /**
     * Returns the sine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    sin(x: number): number;
    /**
     * Returns the square root of a number.
     * @param x A numeric expression.
     */
    sqrt(x: number): number;
    /**
     * Returns the tangent of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    tan(x: number): number;    
}

declare class ArrayDecl<T> {

    private data: T[];

    constructor(data?: T[]);
    
    [index: int]: T;

    get(index: int): T;

    set(index: int, value: T): void;

    get length(): int;

    set length(val: int): void;

    at(index: int): T;

    copyWithin(target: int, start: int, end?: int): T[];

    concat(...other: T[][]): T[];

    entries(): Iterator<T>;

    toString(): string;

    every(func: (v: T) => boolean): boolean;

    fill(value: T, start?: int, end?: int);

    filter(func: (v: T) => boolean): T[];

    filter2(func: (v: T) => boolean): Iterator<T>;

    find(func: (v: T) => boolean): T | undefined;

    findIndex(func: (v: T) => boolean): int;
    
    findLast(func: (v: T) => boolean): T | undefined;

    findLastIndex(func: (v: T) => boolean): int;

    forEach(func: (v: T) => void): void;

    includes(searchElement: T, fromIndex?: int): boolean;

    indexOf(searchElement: T, fromIndex?: int): int;

    join(separator?: string): string;
    
    keys(): Iterator<int>;

    lastIndexOf(searchElement: T, fromIndex?: int): int;

    map<V>(func: (v: T) => V): V[];
    
    reduce<V = T>(func: (v: V, t: T) => V, initial?: V): V;

    reduceRight<V = T>(func: (v: V, t: T) => V, initial?: V): V;

    reverse(): T[];

    slice(start?: int, end?: int): T[];

    some(func: (v: T) => boolean): boolean;

    sort(callbackfn?: (value1: T, value2: T) => int): T[];

    [Symbol.iterator](): Iterator<T>;

    toReversed(): T[];

    toSorted(callbackfn?: (value1: T, value2: T) => int): T[];

    values(): Iterator<T>;

    _with(index: int, value: T): T[];
}

declare class TypedArrayDecl<T> extends ArrayDecl<T> {    
    constructor(data?: T[]);
}

declare class Int8Array extends TypedArrayDecl<s8> {   
    constructor(data?: s8[]);
}

declare class Uint8Array extends TypedArrayDecl<u8> {    
    constructor(data?: u8[]);
}

declare class Int16Array extends TypedArrayDecl<s16> {    
    constructor(data?: s16[]);
}

declare class Uint16Array extends TypedArrayDecl<u16> {    
    constructor(data?: u16[]);
}

declare class Int32Array extends TypedArrayDecl<s32> {    
    constructor(data?: s32[]);
}

declare class Uint32Array extends TypedArrayDecl<u32> {    
    constructor(data?: u32[]);
}

declare class BigInt64Array extends TypedArrayDecl<s64> {    
    constructor(data?: s64[]);
}

declare class BigUint64Array extends TypedArrayDecl<u64> {    
    constructor(data?: u64[]);
}

declare class Float32Array extends TypedArrayDecl<f32> {    
    constructor(data?: f32[]);
}

declare class Float64Array extends TypedArrayDecl<f64> {    
    constructor(data?: f64[]);
}

declare static class console {
    assert(condition?: boolean, ...data: string[]): void;

    log(...data: string[]): void;

    warn(...data: string[]): void;

    error(...data: string[]): void;
}
