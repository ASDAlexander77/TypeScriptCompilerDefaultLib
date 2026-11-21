/// <reference path="types/lib.types.d.ts" />
/// <reference path="native/lib.native.d.ts" />
/// <reference path="core/core.d.ts" />
/// <reference path="generics/lib.generics.ts" />

// @owned: lib.ts defines what this file declares, compiled under the program's own memory model, so
// under -mm=rc each function here returns a reference its caller owns, as an imported function does.
// Without it the compiler can say nothing of these results: every call kept its +1 for good, and one
// declaration with a heap result was enough to stop any call through a function value from giving
// its result back. Never on a C function, nor on one that returns a pointer into a buffer
// (core/core.os.d.ts's convertNumber, timestamp_to_string, ...).

@owned
declare function parseInt(val: string, radix?: int): int;

@owned
declare function parseFloat(val: string): number;

@owned
declare function isNaN(val: number): boolean;

@owned
declare function isFinite(val: number): boolean;

@owned
declare namespace __Boolean {
    function toString(this: boolean): string;
}

@final
@owned
declare class Boolean {
    private value: boolean;

    constructor(value: boolean);
    
    toString(): string;

    valueOf(): boolean;
}

@owned
declare namespace __Number {

    function toExponential(this: number, fractionDigits?: int): string;

    function toFixed(this: number, digits?: int): string;

    function toPrecision(this: number, precision?: int): string;

    function toString(this: number, radix?: int): string;
}

@final
@owned
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

@owned
declare namespace __BigInt {
    
    function toLocaleString(this: bigint, locale?: string): string;

    function toString(this: bigint): string;
}

@final
@owned
declare class BigInt {
    private value: bigint;

    constructor(value: bigint);

    toLocaleString(locale?: string): string;

    toString(): string;

    valueOf(): bigint;
}

@final
@owned
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

@final
@owned
declare class MatchIndicesResults
{
    private match: Opaque;

    private lastIndex: index;

    constructor(match: Opaque, lastIndex?: index);

    [index: number]: [index, index];

    get(index: number): [index, index];

    get length(): index;
}

@final
@owned
declare class MatchResults
{
    private match: Opaque;

    private hasIndices: boolean;

    private lastIndex: index;

    constructor(match: Opaque, hasIndices?: boolean, lastIndex?: index);

    [index: number]: string;

    get(index: number): string;

    get length(): index;

    get indices(): MatchIndicesResults/* | undefined*/;    
}

@final
@owned
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

    private flags: string;

    constructor(source: string, flags?: string);

    exec(s: string): MatchResults | null;

    test(s: string): boolean;

    search(s: string): int;

    replace(s: string, replacement: string): string;

    replaceAll(s: string, replacement: string): string;

    split(s: string, limit?: int): string[];

    [Symbol.dispose](): void;
}

@owned
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

    function match(this: string, expr: RegExp): string[] | null;

    @borrows("this", "expr")
    function matchAll(this: string, expr: RegExp): Iterator<string[]>;

    function normalize(this: string, form?: string): string;
    
    function padEnd(this: string, targetLength: index, padString?: string): string;

    function padStart(this: string, targetLength: index, padString?: string): string;

    function repeat(this: string, count: int): string;

    function replace(this: string, pattern: string | RegExp, replacement: string): string;

    function replaceAll(this: string, pattern: string | RegExp, replacement: string): string;
    
    function search(this: string, regexp: RegExp): int;

    function slice(this: string, indexStart?: int, indexEnd?: int): string;

    function split(this: string, separator?: string | RegExp, limit?: int): string[];

    function substr(this: string, start: int, length?: int): string;

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

@final
@owned
declare class String {
    private value: string;

    constructor(value: string);

    static fromCharCode(...codes: int[]): string;

    static fromCodePoint(...codePoints: int[]): string;

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

    match(this: string, expr: RegExp): string[] | null;

    @borrows("this", "expr")
    matchAll(this: string, expr: RegExp): Iterator<string[]>;

    normalize(this: string, form?: string): string;
    
    padEnd(this: string, targetLength: index, padString?: string): string;

    padStart(this: string, targetLength: index, padString?: string): string;

    repeat(this: string, count: int): string;

    replace(this: string, pattern: string | RegExp, replacement: string): string;

    replaceAll(this: string, pattern: string | RegExp, replacement: string): string;
    
    search(this: string, regexp: RegExp): int;

    slice(this: string, indexStart?: int, indexEnd?: int): string;

    split(this: string, separator?: string | RegExp, limit?: int): string[];

    substr(this: string, start: int, length?: int): string;

    substring(this: string, indexStart: int, indexEnd?: int): string;

    startsWith(this: string, searchString: string, position?: int): boolean;

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

    @borrows("this")
    [Symbol.iterator](): Iterator<string>;
    //[Symbol.iterator](): ClassIterator<string>;
}

@owned
declare namespace Math {
    /** The mathematical constant e. This is Euler's number, the base of natural logarithms. */
    const E = 2.718281828459045;
    /** The natural logarithm of 10. */
    const LN10 = 2.302585092994046;
    /** The natural logarithm of 2. */
    const LN2 = 0.6931471805599453;
    /** The base-2 logarithm of e. */
    const LOG2E = 1.4426950408889634;
    /** The base-10 logarithm of e. */
    const LOG10E = 0.4342944819032518;
    /** Pi. This is the ratio of the circumference of a circle to its diameter. */
    const PI = 3.141592653589793;
    /** The square root of 0.5, or, equivalently, one divided by the square root of 2. */
    const SQRT1_2 = 0.7071067811865476;
    /** The square root of 2. */
    const SQRT2 = 1.4142135623730951;

    /**
     * Returns the absolute value of a number (the value without regard to whether it is positive or negative).
     * For example, the absolute value of -5 is the same as the absolute value of 5.
     * @param x A numeric expression for which the absolute value is needed.
     */    
    function abs(x: number): number;

    /**
     * Returns the arc cosine (or inverse cosine) of a number.
     * @param x A numeric expression.
     */
    function acos(x: number): number;
    /**
     * Returns the inverse hyperbolic cosine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    function acosh(x: number): number;
    /**
     * Returns the arcsine of a number.
     * @param x A numeric expression.
     */
    function asin(x: number): number;
    /**
     * Returns the inverse hyperbolic sine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    function asinh(x: number): number    
    /**
     * Returns the arctangent of a number.
     * @param x A numeric expression for which the arctangent is needed.
     */
    function atan(x: number): number;
    /**
     * Returns the angle (in radians) from the X axis to a point.
     * @param y A numeric expression representing the cartesian y-coordinate.
     * @param x A numeric expression representing the cartesian x-coordinate.
     */
    function atan2(y: number, x: number): number;
    /**
     * Returns the inverse hyperbolic tangent of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    function atanh(x: number): number;    
    /**
     * Returns an implementation-dependent approximation to the cube root of number.
     * @param x A numeric expression.
     */
    function cbrt(x: number): number;
    /**
     * Returns the smallest integer greater than or equal to its numeric argument.
     * @param x A numeric expression.
     */
    function ceil(x: number): number;
    /**
     * Returns the number of leading zero bits in the 32-bit binary representation of a number.
     * @param x A numeric expression.
     */
    function clz32(x: number): number;   
    /**
     * Returns the hyperbolic cosine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    function cosh(x: number): number;     
    /**
     * Returns the cosine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    function cos(x: number): number;
    /**
     * Returns e (the base of natural logarithms) raised to a power.
     * @param x A numeric expression representing the power of e.
     */
    function exp(x: number): number;
    /**
     * Returns the result of (e^x - 1), which is an implementation-dependent approximation to
     * subtracting 1 from the exponential function of x (e raised to the power of x, where e
     * is the base of the natural logarithms).
     * @param x A numeric expression.
     */
    function expm1(x: number): number;    
    /**
     * Returns the greatest integer less than or equal to its numeric argument.
     * @param x A numeric expression.
     */
    function floor(x: number): number;
    /**
     * Returns the nearest single precision float representation of a number.
     * @param x A numeric expression.
     */
    function fround(x: number): number;    
    /**
     * Returns the nearest half precision float representation of a number.
     * @param x A numeric expression.
     */
    function f16round(x: number): number;
    /**
     * Returns the square root of the sum of squares of its arguments.
     * @param values Values to compute the square root for.
     *     If no arguments are passed, the result is +0.
     *     If there is only one argument, the result is the absolute value.
     *     If any argument is +Infinity or -Infinity, the result is +Infinity.
     *     If any argument is NaN, the result is NaN.
     *     If all arguments are either +0 or −0, the result is +0.
     */
    function hypot(...values: number[]): number;
    /**
     * Returns the result of 32-bit multiplication of two numbers.
     * @param x First number
     * @param y Second number
     */
    function imul(x: number, y: number): number;
    /**
     * Returns the natural logarithm (base e) of a number.
     * @param x A numeric expression.
     */
    function log(x: number): number;
    /**
     * Returns the base 10 logarithm of a number.
     * @param x A numeric expression.
     */
    function log10(x: number): number;
    /**
     * Returns the natural logarithm of 1 + x.
     * @param x A numeric expression.
     */
    function log1p(x: number): number;
    /**
     * Returns the base 2 logarithm of a number.
     * @param x A numeric expression.
     */
    function log2(x: number): number;
    /**
     * Returns the larger of a set of supplied numeric expressions.
     * @param values Numeric expressions to be evaluated.
     */
    function max(...values: number[]): number;
    /**
     * Returns the smaller of a set of supplied numeric expressions.
     * @param values Numeric expressions to be evaluated.
     */
    function min(...values: number[]): number;
    /**
     * Returns the value of a base expression taken to a specified power.
     * @param x The base value of the expression.
     * @param y The exponent value of the expression.
     */
    function pow(x: number, y: number): number;
    /** Returns a pseudorandom number between 0 and 1. */
    function random(): number;
    /**
     * Returns a supplied numeric expression rounded to the nearest integer.
     * @param x The value to be rounded to the nearest integer.
     */
    function round(x: number): number;
    /**
     * Returns the sign of the x, indicating whether x is positive, negative or zero.
     * @param x The numeric expression to test
     */
    function sign(x: number): number;
    /**
     * Returns the sine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    function sin(x: number): number;
    /**
     * Returns the hyperbolic sine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    function sinh(x: number): number;    
    /**
     * Returns the square root of a number.
     * @param x A numeric expression.
     */
    function sqrt(x: number): number;
    /**
     * Returns the tangent of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    function tan(x: number): number; 
    /**
     * Returns the hyperbolic tangent of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    function tanh(x: number): number;
    /**
     * Returns the integral part of the a numeric expression, x, removing any fractional digits.
     * If x is already an integer, the result is x.
     * @param x A numeric expression.
     */
    function trunc(x: number): number;
}

declare enum States {
    HasMaxByteLength = 1,
    NonResizable = 2,
    Detached = 4,
    View = 8,
}

@final
@owned
declare class ArrayBuffer {
    private arrayOfView: char[];
    private states: States;
    maxByteLength: int;

    constructor(length: int, options?: { maxByteLength?: int });

    get resizable(): boolean;
    get detached(): boolean;
    get byteLength(): int;
    static isView(arrayBuffer: ArrayBuffer): boolean;
    resize(newLength: int): void;
    slice(start?: int, end?: int): ArrayBuffer;
    transfer(newByteLength?: int): ArrayBuffer;
    transferToFixedLength(newByteLength?: int): ArrayBuffer;
    @lends("this")
    __bytes(): char[];
    [Symbol.dispose](): void;
}

@final
@owned
declare class SharedArrayBuffer {
    private bytes: char[];
    private length: int;
    private capacity: int;
    private canGrow: boolean;

    constructor(length: int, options?: { maxByteLength?: int });

    get byteLength(): int;
    get growable(): boolean;
    get maxByteLength(): int;
    grow(newLength: int): void;
    slice(start?: int, end?: int): SharedArrayBuffer;
    @lends("this")
    __bytes(): char[];
}

@final
@owned
declare class DataView {
    private source: ArrayBuffer | SharedArrayBuffer;
    private offset: int;
    private fixedLength: int;
    private tracksLength: boolean;

    @keeps("buffer")
    constructor(buffer: ArrayBuffer | SharedArrayBuffer, byteOffset?: int, byteLength?: int);

    @lends("this")
    get buffer(): ArrayBuffer | SharedArrayBuffer;
    get byteOffset(): int;
    get byteLength(): int;

    getInt8(byteOffset: int): number;
    getUint8(byteOffset: int): number;
    getInt16(byteOffset: int, littleEndian?: boolean): number;
    getUint16(byteOffset: int, littleEndian?: boolean): number;
    getInt32(byteOffset: int, littleEndian?: boolean): number;
    getUint32(byteOffset: int, littleEndian?: boolean): number;
    getFloat16(byteOffset: int, littleEndian?: boolean): number;
    getFloat32(byteOffset: int, littleEndian?: boolean): number;
    getFloat64(byteOffset: int, littleEndian?: boolean): number;
    getBigInt64(byteOffset: int, littleEndian?: boolean): bigint;
    getBigUint64(byteOffset: int, littleEndian?: boolean): bigint;
    setInt8(byteOffset: int, value: number): void;
    setUint8(byteOffset: int, value: number): void;
    setInt16(byteOffset: int, value: number, littleEndian?: boolean): void;
    setUint16(byteOffset: int, value: number, littleEndian?: boolean): void;
    setInt32(byteOffset: int, value: number, littleEndian?: boolean): void;
    setUint32(byteOffset: int, value: number, littleEndian?: boolean): void;
    setFloat16(byteOffset: int, value: number, littleEndian?: boolean): void;
    setFloat32(byteOffset: int, value: number, littleEndian?: boolean): void;
    setFloat64(byteOffset: int, value: number, littleEndian?: boolean): void;
    setBigInt64(byteOffset: int, value: bigint, littleEndian?: boolean): void;
    setBigUint64(byteOffset: int, value: bigint, littleEndian?: boolean): void;
}

@final
@owned
declare class Headers {
    private names: string[];
    private values: string[];

    constructor(init?: [string, string][]);

    static parse(rawHeaders: string): Headers;

    append(name: string, value: string): void;

    set(name: string, value: string): void;

    get(name: string): string | null;

    has(name: string): boolean;

    delete(name: string): void;

    toRawString(): string;
}

@final
@owned
declare class Response {
    status: int;
    headers: Headers;
    private body: string;

    @keeps("headers", "body")
    constructor(status: int, headers: Headers, body: string);

    get ok(): boolean;

    text(): string;

    json(): JsonValue;
}

@final
@owned
declare class JsonValue {
    private tag: int;
    private flag: boolean;
    private num: number;
    private str: string;
    private items: JsonValue[];
    private names: string[];
    private absent: JsonValue[];
    private slots: int[];

    constructor();

    static ofBoolean(value: boolean): JsonValue;
    static ofNumber(value: number): JsonValue;
    static ofString(value: string): JsonValue;
    static newArray(): JsonValue;
    static newObject(): JsonValue;
    static parse(text: string): JsonValue;

    get kind(): string;
    isNull(): boolean;
    asBoolean(): boolean;
    asNumber(): number;
    asString(): string;
    get length(): int;
    @lends("this")
    at(position: int): JsonValue;
    @keeps("value")
    push(value: JsonValue): this;
    [key: number | string]: JsonValue;
    has(key: string): boolean;
    @lends("this")
    get(key: number | string): JsonValue;
    @keeps("value")
    set(key: number | string, value: JsonValue): this;
    clone(): JsonValue;
    keys(): string[];
    stringify(space?: string): string;
    toString(): string;
    toJSON(): string;
}

@owned
declare namespace JSON {
    function parse(text: string): JsonValue;
}

@owned
declare function fetch(url: string, init?: { method?: string, headers?: [string, string][], body?: string }): Response;

@owned
declare namespace console {
    function readLine(): string | null;

    function assert(condition?: boolean, ...data: string[]): void;

    function log(...data: string[]): void;

    function warn(...data: string[]): void;

    function error(...data: string[]): void;
}

// Temporal's ISO 8601 part: see lib.ts. Each class lists its members in lib.ts's order: a program
// calls them by their place in the class's table. `declare` on each class too, not only on the
// namespace: without it a program defines the class's ..new and ..instanceOf itself, and a debug link
// finds them twice.
declare namespace Temporal {
    @final
    @owned
    declare class Duration {
        private fields: number[];

        constructor(years?: number, months?: number, weeks?: number, days?: number, hours?: number, minutes?: number,
            seconds?: number, milliseconds?: number, microseconds?: number, nanoseconds?: number);

        static from(text: string): Duration;
        static compare(one: Duration, two: Duration): int;
        get years(): number;
        get months(): number;
        get weeks(): number;
        get days(): number;
        get hours(): number;
        get minutes(): number;
        get seconds(): number;
        get milliseconds(): number;
        get microseconds(): number;
        get nanoseconds(): number;
        get sign(): int;
        get blank(): boolean;
        negated(): Duration;
        abs(): Duration;
        add(other: Duration): Duration;
        subtract(other: Duration): Duration;
        total(unit: string): number;
        toString(): string;
        toJSON(): string;
        __field(index: int): number;
    }

    @final
    @owned
    declare class Instant {
        private epochSeconds: number;
        private nanos: number;

        constructor(epochNanoseconds: bigint);

        static fromEpochMilliseconds(epochMilliseconds: number): Instant;
        static fromEpochNanoseconds(epochNanoseconds: bigint): Instant;
        static from(text: string): Instant;
        static compare(one: Instant, two: Instant): int;
        get epochMilliseconds(): number;
        get epochNanoseconds(): bigint;
        add(duration: Duration): Instant;
        subtract(duration: Duration): Instant;
        until(other: Instant): Duration;
        since(other: Instant): Duration;
        equals(other: Instant): boolean;
        toString(): string;
        toJSON(): string;
    }

    @final
    @owned
    declare class PlainDate {
        private isoYear: int;
        private isoMonth: int;
        private isoDay: int;

        constructor(year: int, month: int, day: int);

        static from(text: string): PlainDate;
        static compare(one: PlainDate, two: PlainDate): int;
        get year(): int;
        get month(): int;
        get day(): int;
        get monthCode(): string;
        get calendarId(): string;
        get dayOfWeek(): int;
        get dayOfYear(): int;
        get daysInMonth(): int;
        get daysInYear(): int;
        get daysInWeek(): int;
        get monthsInYear(): int;
        get inLeapYear(): boolean;
        add(duration: Duration): PlainDate;
        subtract(duration: Duration): PlainDate;
        until(other: PlainDate): Duration;
        since(other: PlainDate): Duration;
        with(fields: { year?: int, month?: int, day?: int }): PlainDate;
        equals(other: PlainDate): boolean;
        toPlainDateTime(time?: PlainTime): PlainDateTime;
        toString(): string;
        toJSON(): string;
        __epochDays(): int;
    }

    @final
    @owned
    declare class PlainTime {
        private parts: int[];

        constructor(hour?: int, minute?: int, second?: int, millisecond?: int, microsecond?: int, nanosecond?: int);

        static from(text: string): PlainTime;
        static compare(one: PlainTime, two: PlainTime): int;
        get hour(): int;
        get minute(): int;
        get second(): int;
        get millisecond(): int;
        get microsecond(): int;
        get nanosecond(): int;
        add(duration: Duration): PlainTime;
        subtract(duration: Duration): PlainTime;
        until(other: PlainTime): Duration;
        since(other: PlainTime): Duration;
        with(fields: { hour?: int, minute?: int, second?: int, millisecond?: int, microsecond?: int, nanosecond?: int }): PlainTime;
        equals(other: PlainTime): boolean;
        toString(): string;
        toJSON(): string;
    }

    @final
    @owned
    declare class PlainDateTime {
        private date: PlainDate;
        private time: PlainTime;

        constructor(year: int, month: int, day: int, hour?: int, minute?: int, second?: int, millisecond?: int,
            microsecond?: int, nanosecond?: int);

        static from(text: string): PlainDateTime;
        static compare(one: PlainDateTime, two: PlainDateTime): int;
        get year(): int;
        get month(): int;
        get day(): int;
        get hour(): int;
        get minute(): int;
        get second(): int;
        get millisecond(): int;
        get microsecond(): int;
        get nanosecond(): int;
        get monthCode(): string;
        get calendarId(): string;
        get dayOfWeek(): int;
        get dayOfYear(): int;
        get daysInMonth(): int;
        get daysInYear(): int;
        get inLeapYear(): boolean;
        add(duration: Duration): PlainDateTime;
        subtract(duration: Duration): PlainDateTime;
        until(other: PlainDateTime): Duration;
        since(other: PlainDateTime): Duration;
        with(fields: { year?: int, month?: int, day?: int, hour?: int, minute?: int, second?: int,
            millisecond?: int, microsecond?: int, nanosecond?: int }): PlainDateTime;
        equals(other: PlainDateTime): boolean;
        toPlainDate(): PlainDate;
        toPlainTime(): PlainTime;
        toString(): string;
        toJSON(): string;
    }

    declare namespace Now {
        declare function instant(): Temporal.Instant;
        declare function plainDateTimeISO(): Temporal.PlainDateTime;
        declare function plainDateISO(): Temporal.PlainDate;
        declare function plainTimeISO(): Temporal.PlainTime;
    }
}
