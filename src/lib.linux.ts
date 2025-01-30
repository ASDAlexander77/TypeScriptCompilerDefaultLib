/// <reference path="types/lib.types.d.ts" />

const LC_TIME_MASK = 1 << 2; // linux ubuntu value
type errno_t = i32;
type time_t = long; 

// locale
declare function setlocale (category: int, locale: string);
declare function newlocale (category: int, locale: string, base: Opaque | null): Opaque;
declare function uselocale (locale: Opaque): Opaque;
declare function freelocale (locale: Opaque);
// LC_TIME

@varargs
declare function snprintf(out: string, n: index, format: string);

export function convertNumber(bufferSize: int, format: string, value: number): string
{
    //return convertf(bufferSize, format, value);
    let buffer : char[] = [];
    buffer.length = bufferSize;
    const s = <string> <Opaque> ReferenceOf(buffer[0]);
    snprintf(s, bufferSize, format, value);
    return s;
}

export function convertInteger(bufferSize: int, format: string, value: i32): string
{
    //return convertf(bufferSize, format, value);
    let buffer : char[] = [];
    buffer.length = bufferSize;
    const s = <string> <Opaque> ReferenceOf(buffer[0]);
    snprintf(s, bufferSize, format, value);
    return s;
}


// Date & Time
declare function tzset();
export function init_time() {
    tzset();
}

type timeval = [tv_sec: i64, tv_usec: i32];
declare function timespec_get(tv: Reference<timeval>, base: int): int;

const TIME_UTC = 1;
export function getMilliseconds(): i64 {
    let timestamp: timeval = [0, 0];
    const retBase = timespec_get(ReferenceOf(timestamp), TIME_UTC);
    return timestamp.tv_sec * 1000 + timestamp.tv_usec / 1000000;
}

type tm = [tm_sec: i32, tm_min: i32, tm_hour: i32, tm_mday: i32, tm_mon: i32, tm_year: i32, tm_wday: i32, tm_yday: i32, tm_isdst: i32];
declare function timegm(tv: Reference<tm>): long;
export function makegmtime(year: i32, month: i32, day: i32, hour: i32, minutes: i32, seconds: i32, milliseconds: i32): i64 {
    let tm1: tm = [seconds, minutes, hour, day, month, year, 0, 0, 0];
    const sec = timegm(ReferenceOf(tm1));
    if (sec == -1)
    {
        // error
        return sec;
    }

    return sec * 1000 + milliseconds; // return ms
}

declare function mktime(tv: Reference<tm>): long;
export function maketime(year: i32, month: i32, day: i32, hour: i32, minutes: i32, seconds: i32, milliseconds: i32): i64 {
    let tm1: tm = [seconds, minutes, hour, day, month, year, 0, 0, 0];
    const sec = mktime(ReferenceOf(tm1));
    if (sec == -1)
    {
        // error
        return sec;
    }

    return sec * 1000 + milliseconds; // return ms
}

declare function gmtime_r(time: Reference<time_t>, tm: Reference<tm>) : Reference<tm>;
export function gmtime(time: long): tm {
    let tmDest: tm = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let timeInSec: long = time / 1000;
    const result = gmtime_r(ReferenceOf(timeInSec), ReferenceOf(tmDest));
    return tmDest; // return ms
}

declare function localtime_r(time: Reference<time_t>, tm: Reference<tm>) : Reference<tm>;
export function localtime(time: long): tm {
    let tmDest: tm = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let timeInSec: long = time / 1000;
    const result = localtime_r(ReferenceOf(timeInSec), ReferenceOf(tmDest));
    return tmDest; // return ms
}

declare const timezone: int;
export function gettimezone(): i32 {
    return timezone;
}

declare function ctime_r(time: Reference<time_t>, buffer: string): string;
export function timestamp_to_string(maxsize: index, time: long): string {
    let timeInSec: time_t = time / 1000;
    let buffer : char[] = [];
    buffer.length = maxsize;
    const s = <string> <Opaque> ReferenceOf(buffer[0]);
    const result = ctime_r(ReferenceOf(timeInSec), s);
    return s;
}

declare function asctime_r(time: Reference<tm>, buffer: string): string;
export function time_to_string(maxsize: index, time: long, isUtc: boolean): string {
    let tm = isUtc ? gmtime(time) : localtime(time);

    let buffer : char[] = [];
    buffer.length = maxsize;
    const s = <string> <Opaque> ReferenceOf(buffer[0]);    
    const result = asctime_r(ReferenceOf(tm), s);
    return s;
}

declare function strftime(out: string, maxsize: index, format: string, tm: Reference<tm>): index;
export function time_format(maxsize: index, format: string, time: long, isUtc: boolean): string {
    let tm = isUtc ? gmtime(time) : localtime(time);

    let buffer : char[] = [];
    buffer.length = maxsize;
    const s = <string> <Opaque> ReferenceOf(buffer[0]);
    const len = strftime(s, maxsize, format, ReferenceOf(tm));
    return s;
}

declare function strftime_l(out: string, maxsize: index, format: string, tm: Reference<tm>, locale: Opaque): index;
export function time_format_locale(maxsize: index, format: string, time: long, locale: string, isUtc: boolean): string {
    let tm = isUtc ? gmtime(time) : localtime(time);

    setlocale(LC_TIME_MASK, locale);
    //const locale_t = newlocale(LC_TIME_MASK, locale, null);

    let buffer : char[] = [];
    buffer.length = maxsize;
    const s = <string> <Opaque> ReferenceOf(buffer[0]);
    //const len = strftime_l(s, maxsize, format, ReferenceOf(tm), locale_t);
    const len = strftime(s, maxsize, format, ReferenceOf(tm));

    setlocale(LC_TIME_MASK, "");
    //freelocale(locale_t);

    return s;
}