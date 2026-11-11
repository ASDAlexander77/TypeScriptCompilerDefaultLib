/// <reference path="types/lib.types.d.ts" />

// The OS layer for wasm32-unknown-unknown and wasm64-unknown-unknown: the counterpart of
// lib.linux.ts and lib.win32.ts. These targets have no C library. tslang links a wasm program with
// --allow-undefined, so every C function the library calls is an import from the `env` module and
// the host that instantiates the module (a JavaScript runtime) implements it. Only functions are
// imported that way: undefined data is never resolved, so nothing here declares a C variable (on
// Linux gettimezone reads libc's `timezone`; here it asks the host).
//
// struct tm is the nine ints alone: the host writes and reads only those.

type time_t = long;

// returns int, as the snprintf tslang itself calls for number-to-string: wasm-ld checks that the
// two declarations agree
@varargs
@nodrops declare function snprintf(out: string, n: index, format: string): int;

export function convertNumber(bufferSize: int, format: string, value: number): string
{
    let buffer : char[] = [];
    buffer.length = bufferSize;
    const s = <string> <Opaque> Ref(buffer[0]);
    snprintf(s, bufferSize, format, value);
    return s;
}

// `value: long` as core.os.d.ts declares it (wasm-ld checks the signatures); its callers' formats
// are %d, so it is passed on as an int
export function convertInteger(bufferSize: int, format: string, value: long): string
{
    let buffer : char[] = [];
    buffer.length = bufferSize;
    const s = <string> <Opaque> Ref(buffer[0]);
    snprintf(s, bufferSize, format, <i32>value);
    return s;
}

// Date & Time
export function init_time() {
}

// milliseconds since the epoch (Date.now())
@nodrops declare function tslang_wasm_now(): number;
export function getMilliseconds(): i64 {
    return <i64>tslang_wasm_now();
}

type tm = [tm_sec: i32, tm_min: i32, tm_hour: i32, tm_mday: i32, tm_mon: i32, tm_year: i32, tm_wday: i32, tm_yday: i32, tm_isdst: i32];

// seconds since the epoch, or -1; tm_year counts from 1900 and tm_mon from 0, as in C
@nodrops declare function timegm(tv: Reference<tm>): long;
export function makegmtime(year: i32, month: i32, day: i32, hour: i32, minutes: i32, seconds: i32, milliseconds: i32): i64 {
    let tm1: tm = [seconds, minutes, hour, day, month, year, 0, 0, 0];
    const sec = timegm(Ref(tm1));
    if (sec == -1)
    {
        return sec;
    }

    return sec * 1000 + milliseconds;
}

@nodrops declare function mktime(tv: Reference<tm>): long;
export function maketime(year: i32, month: i32, day: i32, hour: i32, minutes: i32, seconds: i32, milliseconds: i32): i64 {
    let tm1: tm = [seconds, minutes, hour, day, month, year, 0, 0, -1];
    const sec = mktime(Ref(tm1));
    if (sec == -1)
    {
        return sec;
    }

    return sec * 1000 + milliseconds;
}

@nodrops declare function gmtime_r(time: Reference<time_t>, tm: Reference<tm>) : Reference<tm>;
@nodrops declare function localtime_r(time: Reference<time_t>, tm: Reference<tm>) : Reference<tm>;
function c_time(time: long, isUtc: boolean): tm {
    let tmDest: tm = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let timeInSec: time_t = time / 1000;
    if (isUtc) {
        gmtime_r(Ref(timeInSec), Ref(tmDest));
    } else {
        localtime_r(Ref(timeInSec), Ref(tmDest));
    }

    return tmDest;
}

export function gmtime_tm(time: long): tm {
    return c_time(time, true);
}

export function localtime_tm(time: long): tm {
    return c_time(time, false);
}

// seconds west of UTC, as libc's `timezone`
@nodrops declare function tslang_wasm_timezone(): i32;
export function gettimezone(): i32 {
    return tslang_wasm_timezone();
}

// returns `buffer`: a pointer, not copied
@nodrops declare function ctime_r(time: Reference<time_t>, buffer: string): Opaque;
export function timestamp_to_string(maxsize: index, time: long): string {
    let timeInSec: time_t = time / 1000;
    let buffer : char[] = [];
    buffer.length = maxsize;
    const s = <string> <Opaque> Ref(buffer[0]);
    const result = ctime_r(Ref(timeInSec), s);
    return s;
}

@nodrops declare function asctime_r(time: Reference<tm>, buffer: string): Opaque;
export function time_to_string(maxsize: index, time: long, isUtc: boolean): string {
    let tm = c_time(time, isUtc);

    let buffer : char[] = [];
    buffer.length = maxsize;
    const s = <string> <Opaque> Ref(buffer[0]);
    const result = asctime_r(Ref(tm), s);
    return s;
}

@nodrops declare function strftime(out: string, maxsize: index, format: string, tm: Reference<tm>): index;
export function time_format(maxsize: index, format: string, time: long, isUtc: boolean): string {
    let tm = c_time(time, isUtc);

    let buffer : char[] = [];
    buffer.length = maxsize;
    const s = <string> <Opaque> Ref(buffer[0]);
    const len = strftime(s, maxsize, format, Ref(tm));
    return s;
}

// the host has one locale: the format is the same whatever `locale` names
export function time_format_locale(maxsize: index, format: string, time: long, locale: string, isUtc: boolean): string {
    return time_format(maxsize, format, time, isUtc);
}
