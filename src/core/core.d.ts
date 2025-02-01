declare class Error {
    private message?: string;
    private filename?: string;
    private line?: int;
    constructor(message?: string, filename?: string, line?: int);
}

declare class RangeError extends Error {
    constructor(message?: string, filename?: string, line?: int);
}

declare namespace PrimeHelpers
{
    declare const hashPrime: int;

    declare const hashCollisionThreshold: int;

    declare function getPrime(min?: int): int;

    declare function expandPrime(oldSize: int): int;
}