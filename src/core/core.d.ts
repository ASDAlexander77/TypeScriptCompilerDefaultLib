declare class Exception {
    public constructor(message?: string, filename?: string, line?: int);
}

declare class RangeException extends Exception {
    public constructor(message?: string, filename?: string, line?: int);
}
