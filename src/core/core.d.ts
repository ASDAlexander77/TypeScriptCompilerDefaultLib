@owned
declare class Error {
    public message?: string;
    public filename?: string;
    public line?: int;
    constructor(message?: string, filename?: string, line?: int);
}

@owned
declare class RangeError extends Error {
    constructor(message?: string, filename?: string, line?: int);
}

@owned
declare class TypeError extends Error {
    constructor(message?: string, filename?: string, line?: int);
}

@owned
declare class SyntaxError extends Error {
    constructor(message?: string, filename?: string, line?: int);
}

@owned
declare class ReferenceError extends Error {
    constructor(message?: string, filename?: string, line?: int);
}

@owned
declare class SuppressedError extends Error {
    public error: any;
    public suppressed: any;
    constructor(error: any, suppressed: any, message?: string);
}

@owned
declare class ErrorEvent {
    public message: string;
    constructor(message: string);
}

declare namespace PrimeHelpers
{
    declare const hashPrime: int;

    declare const hashCollisionThreshold: int;

    declare function getPrime(min?: int): int;

    declare function expandPrime(oldSize: int): int;
}

declare namespace HashHelpers
{
    declare function hashCodeBinary(key: Opaque, size: index): int;
    
    declare function hashCodeString(key: string): int;

    declare function hashCodeAny(key: any): int;
}