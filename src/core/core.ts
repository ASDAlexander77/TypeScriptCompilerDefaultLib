const LC_COLLATE = 1;

export class Error {
    public constructor(public message?: string, public filename?: string, public line?: int) {
    }
}

export class RangeError extends Error {
    public constructor(message?: string, filename?: string, line?: int) {
        super(message, filename, line);
    }
}
