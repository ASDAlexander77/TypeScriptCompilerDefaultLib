declare function convertNum(bufferSize: int, format: string, value: number): string;

declare function getMilliseconds(): i64;

declare function maketime(year: i32, month: i32, day: i32, hour: i32, minutes: i32, seconds: i32, milliseconds: i32): i64;

type tm = [tm_sec: i32, tm_min: i32, tm_hour: i32, tm_mday: i32, tm_mon: i32, tm_year: i32, tm_wday: i32, tm_yday: i32, tm_isdst: i32];
declare function gmtime(time: long): tm;

declare function localtime(time: long): tm;