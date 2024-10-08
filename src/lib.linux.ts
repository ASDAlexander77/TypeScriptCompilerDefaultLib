/// <reference path="types/lib.types.d.ts" />

@varargs
declare function snprintf(out: string, n: index, format: string);

export function convertNum(bufferSize: int, format: string, value: number): string
{
    //return convertf(bufferSize, format, value);
    const buffer = new Array<char>(bufferSize);
    const s = <string> <Opaque> ReferenceOf(buffer[0]);
    snprintf(s, bufferSize, format, value);
    return s;
}