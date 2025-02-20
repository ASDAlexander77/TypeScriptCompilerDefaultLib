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
    
    function toLocaleString(this: bigint, locale?: string): string;

    function toString(this: bigint): string;
}

declare class BigInt {
    private value: bigint;

    constructor(value: bigint);

    toLocaleString(locale?: string): string;

    toString(): string;

    valueOf(): bigint;
}

declare class Date {
    private timestamp: time_t;
    
    constructor (valueOrYear?: time_t | i32, monthIndex?: i32, day?: i32, hours?: i32, minutes?: i32, seconds?: i32, milliseconds?: i32);

    static now(): time_t;
    
    static parse(dateString: string): time_t;

    static UTC(year: i32, monthIndex?: i32, day?: i32, hours?: i32, minutes?: i32, seconds?: i32, milliseconds?: i32): time_t;

    getDate(): i32;

    getDay(): i32;

    getFullYear(): i32;

    getHours(): i32;

    getMilliseconds(): i32;

    getMinutes(): i32;

    getMonth(): i32;

    getSeconds(): i32;

    getTime(): long;

    getTimezoneOffset(): i32;

    getUTCDate(): i32;

    getUTCDay(): i32;

    getUTCFullYear(): i32;

    getUTCHours(): i32;

    getUTCMilliseconds(): i32;

    getUTCMinutes(): i32;

    getUTCMonth(): i32;

    getUTCSeconds(): i32;

    getYear(): i32;

    setDate(mday: i32);

    setFullYear(year: i32);

    setHours(hours: i32, minutes?: i32, seconds?: i32, ms?: i32);

    setMilliseconds(ms: i32);

    setMinutes(minutes: i32, seconds?: i32, ms?: i32);

    setMonth(month: i32);

    setSeconds(seconds: i32, ms?: i32);

    setTime(time: long);

    setUTCDate(mday: i32);

    setUTCFullYear(year: i32);

    setUTCHours(hours: i32, minutes?: i32, seconds?: i32, ms?: i32);

    setUTCMilliseconds(ms: i32);

    setUTCMinutes(minutes: i32, seconds?: i32, ms?: i32);

    setUTCMonth(month: i32);

    setUTCSeconds(seconds: i32, ms?: i32);

    setYear(year: i32);

    toDateString(): string;

    toISOString(): string;

    toJSON(): string;

    toLocaleDateString(locale?: string): string; 

    toLocaleString(locale?: string, options?: { timeZone?: string }): string;

    toLocaleTimeString(locale?: string, options?: { timeZone?: string }): string;

    toString(): string;

    toTimeString(): string;

    toUTCString(): string;

    valueOf(): time_t;

    [Symbol.toPrimitive](hint: string) : string | number;
}

declare class MatchIndicesResults
{
    private match?: Opaque | null;

    private lastIndex?: index;

    constructor(match?: Opaque | null, lastIndex?: index);

    [index: number]: [index, index];

    get(index: number): [index, index];

    get length(): index;
}

declare class MatchResults
{
    private indices_: MatchIndicesResults;

    private match?: Opaque | null;

    private hasIndices?: boolean;

    private lastIndex?: index;

    constructor(match?: Opaque | null, lastIndex?: index);

    [index: number]: string;

    get(index: number): string;

    get length(): index;

    get indices(): MatchIndicesResults/* | undefined*/;    
}

declare class RegExp {

    dotAll: boolean;
    global: boolean;
    hasIndices: boolean;
    ignoreCase: boolean;
    multiline: boolean;
    sticky: boolean;
    unicode: boolean;
    unicodeSets: boolean;

    lastIndex: index;

    private match: Opaque | null;

    private expr: string;

    private flags?: string;

    constructor(source: string, flags?: string);

    exec(s: string): MatchResults | null;

    test(s: string): boolean;

    search(s: string): int;

    replace(s: string, replacement: string): string;

    replaceAll(s: string, replacement: string): string;

    [Symbol.dispose](): void;
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

    function matchAll(this: string, expr: RegExp): Iterator<string[]>;

    function normalize(this: string, form?: string): string;
    
    function padEnd(this: string, targetLength: index, padString?: string): string;

    function padStart(this: string, targetLength: index, padString?: string): string;

    function repeat(this: string, count: int): string;

    function replace(this: string, pattern: string | RegExp, replacement: string): string;

    function replaceAll(this: string, pattern: string | RegExp, replacement: string): string;
    
    function search(this: string, regexp: RegExp): int;

    function slice(this: string, indexStart: int, indexEnd?: int): string;

    function split(this: string, separator?: string | RegExp, limit?: int): string[];

    function substring(this: string, indexStart: int, indexEnd?: int): string;

    function startsWith(this: string, searchString: string, position?: int): boolean;

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

    matchAll(this: string, expr: RegExp): Iterator<string[]>;

    normalize(this: string, form?: string): string;
    
    padEnd(this: string, targetLength: index, padString?: string): string;

    padStart(this: string, targetLength: index, padString?: string): string;

    repeat(this: string, count: int): string;

    replace(this: string, pattern: string | RegExp, replacement: string): string;

    replaceAll(this: string, pattern: string | RegExp, replacement: string): string;
    
    search(this: string, regexp: RegExp): int;

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
     * Returns the inverse hyperbolic cosine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    acosh(x: number): number;
    /**
     * Returns the arcsine of a number.
     * @param x A numeric expression.
     */
    asin(x: number): number;
    /**
     * Returns the inverse hyperbolic sine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    asinh(x: number): number    
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
     * Returns the inverse hyperbolic tangent of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    atanh(x: number): number;    
    /**
     * Returns an implementation-dependent approximation to the cube root of number.
     * @param x A numeric expression.
     */
    cbrt(x: number): number;
    /**
     * Returns the smallest integer greater than or equal to its numeric argument.
     * @param x A numeric expression.
     */
    ceil(x: number): number;
    /**
     * Returns the number of leading zero bits in the 32-bit binary representation of a number.
     * @param x A numeric expression.
     */
    clz32(x: number): number;   
    /**
     * Returns the hyperbolic cosine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    cosh(x: number): number;     
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
     * Returns the result of (e^x - 1), which is an implementation-dependent approximation to
     * subtracting 1 from the exponential function of x (e raised to the power of x, where e
     * is the base of the natural logarithms).
     * @param x A numeric expression.
     */
    expm1(x: number): number;    
    /**
     * Returns the greatest integer less than or equal to its numeric argument.
     * @param x A numeric expression.
     */
    floor(x: number): number;
    /**
     * Returns the nearest single precision float representation of a number.
     * @param x A numeric expression.
     */
    fround(x: number): number;    
    /**
     * Returns the square root of the sum of squares of its arguments.
     * @param values Values to compute the square root for.
     *     If no arguments are passed, the result is +0.
     *     If there is only one argument, the result is the absolute value.
     *     If any argument is +Infinity or -Infinity, the result is +Infinity.
     *     If any argument is NaN, the result is NaN.
     *     If all arguments are either +0 or −0, the result is +0.
     */
    hypot(...values: number[]): number;
    /**
     * Returns the result of 32-bit multiplication of two numbers.
     * @param x First number
     * @param y Second number
     */
    imul(x: number, y: number): number;
    /**
     * Returns the natural logarithm (base e) of a number.
     * @param x A numeric expression.
     */
    log(x: number): number;
    /**
     * Returns the base 10 logarithm of a number.
     * @param x A numeric expression.
     */
    log10(x: number): number;
    /**
     * Returns the natural logarithm of 1 + x.
     * @param x A numeric expression.
     */
    log1p(x: number): number;
    /**
     * Returns the base 2 logarithm of a number.
     * @param x A numeric expression.
     */
    log2(x: number): number    
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
     * Returns the sign of the x, indicating whether x is positive, negative or zero.
     * @param x The numeric expression to test
     */
    sign(x: number): number;
    /**
     * Returns the sine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    sin(x: number): number;
    /**
     * Returns the hyperbolic sine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    sinh(x: number): number;    
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
    /**
     * Returns the hyperbolic tangent of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    tanh(x: number): number;
    /**
     * Returns the integral part of the a numeric expression, x, removing any fractional digits.
     * If x is already an integer, the result is x.
     * @param x A numeric expression.
     */
    trunc(x: number): number;
}

declare static class console {
    assert(condition?: boolean, ...data: string[]): void;

    log(...data: string[]): void;

    warn(...data: string[]): void;

    error(...data: string[]): void;
}
