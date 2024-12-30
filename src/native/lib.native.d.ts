// IO
declare function write(fileNo: int, s: string, count: int);

// Time
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

declare function asin(x: number): number;

declare function atan(x: number): number;

declare function atan2(y: number, x: number): number;

declare function ceil(x: number): number;

declare function cos(x: number): number;

declare function exp(x: number): number;

declare function floor(x: number): number;

declare function log(x: number): number;

declare function min(x: number, y: number): number;

declare function max(x: number, y: number): number;

declare function pow(x: number, y: number): number;

declare function round(x: number): number;

declare function sin(x: number): number;

declare function sqrt(x: number): number;

declare function tan(x: number): number;

// memory
declare function memcpy(dest: Opaque, src: Opaque, bytes: int): Opaque;
declare function memmove(dest: Opaque, src: Opaque, bytes: int): Opaque;