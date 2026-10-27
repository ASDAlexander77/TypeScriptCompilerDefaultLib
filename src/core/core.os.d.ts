// @nodrops: lib.win32.ts and lib.linux.ts define these, and none gives back or overwrites anything a
// caller holds. Without it a declaration whose signature is not all scalars is taken to drop, and
// under -mm=own so is every Date method that calls one: a global Date lent to `d.getMonth()` was an
// error. The scalar ones too: a scalar declaration is taken as no-drops only in a module no function
// value can escape from, and the library, which declares non-scalar functions, is not one.
@nodrops declare function convertNumber(bufferSize: int, format: string, value: number): string;
@nodrops declare function convertInteger(bufferSize: int, format: string, value: long): string;

@nodrops declare function init_time();

@nodrops declare function getMilliseconds(): i64;

@nodrops declare function maketime(year: i32, month: i32, day: i32, hour: i32, minutes: i32, seconds: i32, milliseconds: i32): i64;
@nodrops declare function makegmtime(year: i32, month: i32, day: i32, hour: i32, minutes: i32, seconds: i32, milliseconds: i32): i64;

type tm = [tm_sec: i32, tm_min: i32, tm_hour: i32, tm_mday: i32, tm_mon: i32, tm_year: i32, tm_wday: i32, tm_yday: i32, tm_isdst: i32];
@nodrops declare function localtime(time: long): tm;
@nodrops declare function gmtime(time: long): tm;

@nodrops declare function gettimezone(): i32;

@nodrops declare function timestamp_to_string(maxsize: index, time: long): string;
@nodrops declare function time_to_string(maxsize: index, time: long, isUtc: boolean): string;
@nodrops declare function time_format(maxsize: index, format: string, time: long, isUtc: boolean): string;
@nodrops declare function time_format_locale(maxsize: index, format: string, time: long, locale: string, isUtc: boolean): string;