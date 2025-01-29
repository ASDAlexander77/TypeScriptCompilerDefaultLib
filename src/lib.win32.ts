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

// Date & Time
declare function _tzset();
export function init_time() {
    _tzset();
}

type timeval64 = [tv_sec: i64, tv_usec: i32];
declare function _timespec64_get(tv: Reference<timeval64>, base: int): int;

const TIME_UTC = 1;
export function getMilliseconds(): i64 {
    let timestamp: timeval64 = [0, 0];
    const retBase = _timespec64_get(ReferenceOf(timestamp), TIME_UTC);
    return timestamp.tv_sec * 1000 + timestamp.tv_usec / 1000000;
}

type tm = [tm_sec: i32, tm_min: i32, tm_hour: i32, tm_mday: i32, tm_mon: i32, tm_year: i32, tm_wday: i32, tm_yday: i32, tm_isdst: i32];
declare function _mkgmtime64(tv: Reference<tm>): long;
export function makegmtime(year: i32, month: i32, day: i32, hour: i32, minutes: i32, seconds: i32, milliseconds: i32): i64 {
    let tm1: tm = [seconds, minutes, hour, day, month, year, 0, 0, 0];
    const sec = _mkgmtime64(ReferenceOf(tm1));
    if (sec == -1)
    {
        // error
        return sec;
    }

    return sec * 1000 + milliseconds; // return ms
}

declare function _mktime64(tv: Reference<tm>): long;
export function maketime(year: i32, month: i32, day: i32, hour: i32, minutes: i32, seconds: i32, milliseconds: i32): i64 {
    let tm1: tm = [seconds, minutes, hour, day, month, year, 0, 0, 0];
    const sec = _mktime64(ReferenceOf(tm1));
    if (sec == -1)
    {
        // error
        return sec;
    }

    return sec * 1000 + milliseconds; // return ms
}

declare function _gmtime64(time: Reference<long>) : Reference<tm>;
export function gmtime(time: long): tm {
    let timeInSec: long = time / 1000;
    const tmRef = _gmtime64(ReferenceOf(timeInSec));
    if (tmRef == null)
        return [0, 0, 0, 0, 0, 0, 0, 0, 0];
    return LoadReference(tmRef); // return ms
}

declare function _localtime64(time: Reference<long>) : Reference<tm>;
export function localtime(time: long): tm {
    let timeInSec: long = time / 1000;
    const tmRef = _localtime64(ReferenceOf(timeInSec));
    if (tmRef == null)
        return [0, 0, 0, 0, 0, 0, 0, 0, 0];
    return LoadReference(tmRef); // return ms
}

declare function _get_timezone(time: Reference<i32>): int;
export function timezone(): i32 {
    let time = 0;
    const error = _get_timezone(ReferenceOf(time));
    return time;
}

declare function _ctime64(time: Reference<tm>): string;
export function timestamp_to_string(time: long): string | null {
    let timeInSec: long = time / 1000;
    return _ctime64(ReferenceOf(timeInSec));
}

declare function asctime(time: Reference<tm>): string;
export function time_to_string(time: long): string | null {
    let timeInSec: long = time / 1000;
    const tmRef = _localtime64(ReferenceOf(timeInSec));
    if (tmRef == null)
        return null;
    return asctime(tmRef);
}

export function time_to_utcstring(time: long): string | null {
    let timeInSec: long = time / 1000;
    const tmRef = _gmtime64(ReferenceOf(timeInSec));
    if (tmRef == null)
        return null;
    return asctime(tmRef);
}

