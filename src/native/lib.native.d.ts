// `@nodrops`: a C function that destroys nothing the TypeScript program owns, so -mm=own may lend
// it a borrow (a field, an element) and keep using that borrow after the call. Only for functions
// that never call back into TypeScript; the GC_* ones below can run finalizers and have none.

// IO
@nodrops declare function write(fileNo: int, s: string, count: int);
// Buffered counterpart of write(), sharing stdio's buffer with print()/puts() so the
// two cannot reorder relative to each other. See src/wrappers/io.cpp.
@nodrops declare function stdio_write(fileNo: int, s: string, count: int);

// Time (in seconds)
@nodrops declare function time(destTime: Reference<long>);

// String
@nodrops declare function strtol(str: string, end: Reference<string>, base: int): int;
@nodrops declare function strtod(str: string, end: Reference<string>): double;
@nodrops declare function strncmp(str: string, other: string, count: index): int;
// a pointer into `str`, not a string of its own: a `string` result from C is copied
@nodrops declare function strstr(str: string, other: string): Opaque;
@nodrops declare function strcoll(str: string, other: string): int;
@nodrops declare function setlocale (category: int, locale: string): Opaque;
@nodrops declare function toupper(c: int): int;
@nodrops declare function tolower(c: int): int;
@nodrops declare function isspace(argument: int): int;

// Random
@nodrops declare function srand(seed: int);

@nodrops declare function rand(): int;

// Math
@nodrops declare function fabs(x: number): number;

@nodrops declare function acos(x: number): number;

@nodrops declare function acosh(x: number): number;

@nodrops declare function asin(x: number): number;

@nodrops declare function asinh(x: number): number;

@nodrops declare function atan(x: number): number;

@nodrops declare function atan2(y: number, x: number): number;

@nodrops declare function atanh(x: number): number;

@nodrops declare function cbrt(x: number): number;

@nodrops declare function ceil(x: number): number;

@nodrops declare function cos(x: number): number;

@nodrops declare function cosh(x: number): number;

@nodrops declare function exp(x: number): number;

@nodrops declare function expm1(x: number): number;

@nodrops declare function floor(x: number): number;

@nodrops declare function log(x: number): number;

@nodrops declare function log10(x: number): number;

@nodrops declare function log1p(x: number): number;

@nodrops declare function log2(x: number): number;

@nodrops declare function min(x: number, y: number): number;

@nodrops declare function max(x: number, y: number): number;

@nodrops declare function pow(x: number, y: number): number;

@nodrops declare function round(x: number): number;

@nodrops declare function sin(x: number): number;

@nodrops declare function sinh(x: number): number;

@nodrops declare function sqrt(x: number): number;

@nodrops declare function tan(x: number): number;

@nodrops declare function tanh(x: number): number;

@nodrops declare function trunc(x: number): number;

// memory
@nodrops declare function memcpy(dest: Opaque, src: Opaque, bytes: index): Opaque;
@nodrops declare function memmove(dest: Opaque, src: Opaque, bytes: index): Opaque;
// wrappers/memory.cpp: memcpy_s on Windows, __memcpy_chk elsewhere - ends the process rather
// than copy more than `destSize` bytes
@nodrops declare function boundedCopy(dest: Opaque, destSize: index, src: Opaque, count: index): void;
@nodrops declare function memcmp(dest: Opaque, src: Opaque, bytes: index): int;

// gc weak references
declare function GC_general_register_disappearing_link(link: Reference<Opaque>, obj: Opaque): int;
declare function GC_unregister_disappearing_link(link: Reference<Opaque>): int;
declare function GC_gcollect(): void;

// datetime
@nodrops declare function parse_date(dateStr: string): time_t;

// regex
@nodrops declare function regexp_test(expr: string, flags: string, s: string): int;
@nodrops declare function regexp_exec(expr: string, flags: string, s: string, cm: Opaque): Opaque;
@nodrops declare function regexp_match_results_size(cm: Opaque): index;
@nodrops declare function regexp_match_results_prefix_length(cm: Opaque): index;
@nodrops declare function regexp_match_results_suffix_position(cm: Opaque): index;
@nodrops declare function regexp_match_results_sub_match_str_length(cm: Opaque, subIndex: index): index;
@nodrops declare function regexp_match_results_sub_match_str_copy_to(cm: Opaque, subIndex: index, buffer: string, count: index);
@nodrops declare function regexp_match_results_sub_match_position(cm: Opaque, subIndex: index): index;
@nodrops declare function regexp_match_results_sub_match_length(cm: Opaque, subIndex: index): index;
// malloc'ed C strings, given back with regexp_free_string: kept as pointers, not copied
@nodrops declare function regexp_match_results_format(cm: Opaque, replacement: string): Opaque;
@nodrops declare function regexp_replace(expr: string, flags: string, s: string, replacement: string): Opaque;
@nodrops declare function regexp_free_string(s: Opaque): void;
@nodrops declare function regexp_free(cm: Opaque): void;

// thread
@nodrops declare function std_this_thread_sleep_for(milliseconds: u32): void;

// http
@nodrops declare function http_request(method: string, url: string, headers: string, body: string, bodyLength: index): Opaque;
@nodrops declare function http_response_success(r: Opaque): boolean;
@nodrops declare function http_response_error_code(r: Opaque): int;
@nodrops declare function http_response_status(r: Opaque): int;
@nodrops declare function http_response_headers_length(r: Opaque): index;
@nodrops declare function http_response_headers_copy_to(r: Opaque, buffer: string, count: index): void;
@nodrops declare function http_response_body_length(r: Opaque): index;
@nodrops declare function http_response_body_copy_to(r: Opaque, buffer: string, count: index): void;
@nodrops declare function http_response_free(r: Opaque): void;
