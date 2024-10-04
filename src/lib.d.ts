/// <reference path="types/lib.types.d.ts" />
/// <reference path="native/lib.native.d.ts" />
/// <reference path="core/core.d.ts" />
/// <reference path="generics/lib.generics.ts" />

declare function parseInt(val: string, radix?: int): int;

declare function parseFloat(val: string): number;

declare function isNaN(val: number): boolean;

declare function isFinite(val: number): boolean;

declare class Boolean {
    private value: boolean;

    constructor(value: boolean);
    
    toString(): string;

    valueOf(): boolean;
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

declare class RegExp
{
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
}

declare class String {
    private value: string;

    constructor(value: string);
    
    at(index: int): string;
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

declare static class console {
    assert(condition?: boolean, ...data: string[]): void;

    log(...data: string[]): void;

    warn(...data: string[]): void;

    error(...data: string[]): void;
}
