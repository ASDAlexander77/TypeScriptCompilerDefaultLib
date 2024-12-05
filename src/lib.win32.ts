/// <reference path="types/lib.types.d.ts" />

@varargs
declare function sprintf_s(out: string, n: index, format: string);

export function convertNum(bufferSize: int, format: string, value: number): string
{
    //return convertf(bufferSize, format, value);
    let buffer : char[] = [];
    buffer.length = bufferSize;
    const s = <string> <Opaque> ReferenceOf(buffer[0]);
    sprintf_s(s, bufferSize, format, value);
    return s;
}