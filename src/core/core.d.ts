declare class Error {
    private message?: string;
    private filename?: string;
    private line?: int;
    constructor(message?: string, filename?: string, line?: int);
}

declare class RangeError extends Error {
    constructor(message?: string, filename?: string, line?: int);
}

declare function convertNum(bufferSize: int, format: string, value: number): string;