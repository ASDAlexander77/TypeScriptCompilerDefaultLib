// IO
declare function write(fileNo: int, s: string, count: int);

// Time (in seconds)
declare function time(destTime: Reference<long>);

// String
declare function strtol(str: string, end: Reference<string>, base: int): int;
declare function strtod(str: string, end: Reference<string>): double;
declare function strncmp(str: string, other: string, count: index): int;
declare function strstr(str: string, other: string): string;
declare function strcoll(str: string, other: string): int;
declare function setlocale (category: int, locale: string): string;
declare function toupper(c: int): int;
declare function tolower(c: int): int;
declare function isspace(argument: int): int;

// Random
declare function srand(seed: int);

declare function rand(): int;

// Math
declare function fabs(x: number): number;

declare function acos(x: number): number;

declare function acosh(x: number): number;

declare function asin(x: number): number;

declare function asinh(x: number): number;

declare function atan(x: number): number;

declare function atan2(y: number, x: number): number;

declare function atanh(x: number): number;

declare function cbrt(x: number): number;

declare function ceil(x: number): number;

declare function cos(x: number): number;

declare function cosh(x: number): number;

declare function exp(x: number): number;

declare function expm1(x: number): number;

declare function floor(x: number): number;

declare function log(x: number): number;

declare function log10(x: number): number;

declare function log1p(x: number): number;

declare function log2(x: number): number;

declare function min(x: number, y: number): number;

declare function max(x: number, y: number): number;

declare function pow(x: number, y: number): number;

declare function round(x: number): number;

declare function sin(x: number): number;

declare function sinh(x: number): number;

declare function sqrt(x: number): number;

declare function tan(x: number): number;

declare function tanh(x: number): number;

declare function trunc(x: number): number;

// memory
declare function memcpy(dest: Opaque, src: Opaque, bytes: index): Opaque;
declare function memmove(dest: Opaque, src: Opaque, bytes: index): Opaque;
declare function memcmp(dest: Opaque, src: Opaque, bytes: index): int;

// datetime
declare function parse_date(dateStr: string): time_t;

// regex
declare function regexp_test(expr: string, flags: string, s: string): int;
declare function regexp_exec(expr: string, flags: string, s: string, cm: Opaque): Opaque;
declare function regexp_match_results_size(cm: Opaque): index;
declare function regexp_match_results_prefix_length(cm: Opaque): index;
declare function regexp_match_results_suffix_position(cm: Opaque): index;
declare function regexp_match_results_sub_match_str_length(cm: Opaque, subIndex: index): index;
declare function regexp_match_results_sub_match_str_copy_to(cm: Opaque, subIndex: index, buffer: string, count: index);
declare function regexp_match_results_sub_match_position(cm: Opaque, subIndex: index): index;
declare function regexp_match_results_sub_match_length(cm: Opaque, subIndex: index): index;
declare function regexp_match_results_format(cm: Opaque, replacement: string): string;
declare function regexp_replace(expr: string, flags: string, s: string, replacement: string): string;
declare function regexp_free_string(s: string): void;
declare function regexp_free(cm: Opaque): void;