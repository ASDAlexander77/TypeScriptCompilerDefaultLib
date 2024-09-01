declare class Error {
    public constructor(message?: string, filename?: string, line?: int);
}

declare class RangeError extends Error {
    public constructor(message?: string, filename?: string, line?: int);
}

declare function convertNum(bufferSize: int, format: string, value: number): string;