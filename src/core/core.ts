export class Exception {
    public constructor(public message?: string, public filename?: string, public line?: int) {
    }
}

export class RangeException extends Exception {
    public constructor(message?: string, filename?: string, line?: int) {
        super(message, filename, line);
    }
}
