/// <reference path="types/lib.types.d.ts" />
/// <reference path="native/lib.native.d.ts" />
/// <reference path="core/core.os.d.ts" />
/// <reference path="core/core.ts" />
/// <reference path="generics/lib.generics.ts" />

export function parseInt(val: string, radix = 10) {
    return strtol(val, null, radix);
}

export function parseFloat(val: string): number {
    return strtod(val, null);
}

export function isNaN(val: number): boolean {
    return val != val;
}

export function isFinite(val: number): boolean {
    return !isNaN(val) && val != Number.POSITIVE_INFINITY && val != Number.NEGATIVE_INFINITY;
}

namespace __Boolean {
    export function toString(this: boolean) {
        return <string>this;
    }    
}

@final
export class Boolean {
    public constructor(private value: boolean) {
    }

    public toString() {
        return this.value.toString();
    }

    public valueOf() {
        return this.value;
    }
}

namespace __Number {

    export function toExponential(this: number, fractionDigits = 0) {
        return convertNumber(50, `%.${fractionDigits}e`, this);
    }

    export function toFixed(this: number, digits = 0) {
        return convertNumber(50, `%.${digits}f`, this);
    }

    export function toPrecision(this: number, precision = 0) {
        return convertNumber(50, `%.${precision}g`, this);
    }

    // In `radix` (2 to 36), as JavaScript writes it: `(255).toString(16)` is "ff" (it was C's "%a",
    // 0x1.fe00000000000p+7) and `(10.5).toString(2)` is "1010.1" (any radix but 16 was ignored).
    export function toString(this: number, radix = 10) {
        if (radix == 10) {
            return <string>this;
        }

        assert(radix >= 2 && radix <= 36, "toString() radix must be between 2 and 36");

        const value = this;
        if (!isFinite(value)) {
            return <string>value;
        }

        const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
        const negative = value < 0;
        const magnitude = negative ? -value : value;

        let whole = Math.floor(magnitude);
        let fraction = magnitude - whole;

        let integerPart = "";
        do {
            const digit = <int>(whole % radix);
            integerPart = digits.substring(digit, digit + 1) + integerPart;
            whole = Math.floor(whole / radix);
        } while (whole > 0);

        // a double's fraction ends in a power-of-two radix, each step exact (1074 binary digits at
        // most); in another radix it may not end, and is cut at 52 digits
        const limit = (radix & (radix - 1)) == 0 ? 1100 : 52;
        let fractionPart = "";
        for (let i = 0; i < limit && fraction > 0; i++) {
            fraction *= radix;
            const digit = <int>Math.floor(fraction);
            fractionPart += digits.substring(digit, digit + 1);
            fraction -= digit;
        }

        const sign = negative ? "-" : "";
        return fractionPart.length > 0 ? sign + integerPart + "." + fractionPart : sign + integerPart;
    }
}

@final
export class Number {
    public static EPSILON = 2 ** (-52);

    public static MAX_SAFE_INTEGER = 2 ** 53 - 1;

    /** The largest number that can be represented in JavaScript. Equal to approximately 1.79E+308. */
    public static MAX_VALUE = 1.7976931348623157e+308;

    public static MIN_SAFE_INTEGER = -Number.MAX_SAFE_INTEGER;

    /** The closest number to zero that can be represented in JavaScript. Equal to approximately 5.00E-324. */
    public static MIN_VALUE = 2.22507385855e-308; //5e-324;

    /**
     * A value that is not a number.
     * In equality comparisons, NaN does not equal any value, including itself. To test whether a value is equivalent to NaN, use the isNaN function.
     */
    public static NaN = 0.0 / 0.0;

    /**
     * A value that is less than the largest negative number that can be represented in JavaScript.
     * JavaScript displays NEGATIVE_INFINITY values as -infinity.
     */
    public static NEGATIVE_INFINITY = -1.0 / 0.0;

    /**
     * A value greater than the largest number that can be represented in JavaScript.
     * JavaScript displays POSITIVE_INFINITY values as infinity.
     */
    public static POSITIVE_INFINITY = 1.0 / 0.0;

    public constructor(private value: number) {
    }

    public static isFinite(value: number): boolean {
        return isFinite(value);
    }

    public static isInteger(value: number): boolean {
        return (value - <i64>value) == 0;
    }

    public static isNaN(value: number): boolean {
        return isNaN(value);
    }

    public static parseInt(value: string, radix: number = 10): number {
        return parseInt(value, radix);
    }

    public static parseFloat(value: string) {
        return parseFloat(value);
    }

    public static isSafeInteger(value: number) {
        return Number.isInteger(value) && value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER;
    }

    public toExponential(fractionDigits = 0) {
        return this.value.toExponential(fractionDigits);
    }

    public toFixed(digits = 0) {
        return this.value.toFixed(digits);
    }

    public toPrecision(precision = 0) {
        return this.value.toPrecision(precision);
    }

    public toString(radix = 10) {
        return this.value.toString(radix);
    }

    public valueOf() {
        return this.value;
    }
}

namespace __BigInt {
    
    export function toLocaleString(this: bigint, locale = "") {
        setlocale (LC_COLLATE, locale);        
        const result = convertNumber(50, "%a", this);
        setlocale (LC_COLLATE, "");        
        return result;
    }  

    export function toString(this: bigint) {
        return <string>this;
    }    
}

@final
export class BigInt {
    public constructor(private value: bigint) {
    }

    public toLocaleString(locale = "") {
        return this.value.toLocaleString(locale);
    }

    public toString() {
        return this.value.toString();
    }

    public valueOf() {
        return this.value;
    }    
}

@final
export class Date {
    private timestamp: time_t;
    constructor (valueOrYear?: time_t | i32, monthIndex?: i32, day = 1, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) {
        if (valueOrYear != undefined)
        {
            if (monthIndex != undefined) {
                this.timestamp = maketime(valueOrYear - 1900, monthIndex, day, hours, minutes, seconds, milliseconds); 
            } else {
                this.timestamp = valueOrYear;
            }
        }
        else
        {
            this.timestamp = getMilliseconds();
        }
    }

    static {
        init_time();
    }

    static now(): time_t {
        return getMilliseconds();
    }

    static parse(dateString: string): time_t {

        const result = parse_date(dateString);
        if (result == -1)
            return NaN;

        return result;        
    }    

    static UTC(year: i32, monthIndex = 0, day = 1, hours = 0, minutes = 0, seconds = 0, milliseconds = 0): time_t {
        return makegmtime(year >= 1900 ? year - 1900 : year, monthIndex, day, hours, minutes, seconds, milliseconds);
    }

    getDate(): i32 {
        return localtime_tm(this.timestamp).tm_mday;
    }

    getDay(): i32 {
        return localtime_tm(this.timestamp).tm_wday;
    }    

    getFullYear(): i32 {
        return localtime_tm(this.timestamp).tm_year + 1900;
    }

    getHours(): i32 {
        return localtime_tm(this.timestamp).tm_hour;
    }    

    getMilliseconds(): i32 {
        return this.timestamp % 1000;
    }

    getMinutes(): i32 {
        return localtime_tm(this.timestamp).tm_min;
    }     

    getMonth(): i32 {
        return localtime_tm(this.timestamp).tm_mon;
    }     

    getSeconds(): i32 {
        return localtime_tm(this.timestamp).tm_sec;
    }      

    getTime(): long {
        return this.timestamp;
    } 

    getTimezoneOffset(): i32 {
        return gettimezone();
    }
    
    getUTCDate(): i32 {
        return gmtime_tm(this.timestamp).tm_mday;
    }

    getUTCDay(): i32 {
        return gmtime_tm(this.timestamp).tm_wday;
    }    

    getUTCFullYear(): i32 {
        return gmtime_tm(this.timestamp).tm_year + 1900;
    }

    getUTCHours(): i32 {
        return gmtime_tm(this.timestamp).tm_hour;
    }    

    getUTCMilliseconds(): i32 {
        return this.timestamp % 1000;
    }

    getUTCMinutes(): i32 {
        return gmtime_tm(this.timestamp).tm_min;
    }     

    getUTCMonth(): i32 {
        return gmtime_tm(this.timestamp).tm_mon;
    }     

    getUTCSeconds(): i32 {
        return gmtime_tm(this.timestamp).tm_sec;
    }      
    
    getYear(): i32 {
        return localtime_tm(this.timestamp).tm_year;
    }  

    setDate(mday: i32) {
        let lt = localtime_tm(this.timestamp);
        this.timestamp = maketime(lt.tm_year, lt.tm_mon, mday, lt.tm_hour, lt.tm_min, lt.tm_sec, this.timestamp % 1000); 
    }    

    setFullYear(year: i32) {
        let lt = localtime_tm(this.timestamp);
        this.timestamp = maketime(year - 1900, lt.tm_mon, lt.tm_mday, lt.tm_hour, lt.tm_min, lt.tm_sec, this.timestamp % 1000); 
    }    

    setHours(hours: i32, minutes?: i32, seconds?: i32, ms?: i32) {
        let lt = localtime_tm(this.timestamp);
        this.timestamp = maketime(lt.tm_year, lt.tm_mon, lt.tm_mday, hours, 
            minutes == undefined ? lt.tm_min : minutes, seconds == undefined ? lt.tm_sec : seconds, ms == undefined ? this.timestamp % 1000 : ms); 
    }        

    setMilliseconds(ms: i32) {
        this.timestamp += ms - this.timestamp % 1000;
    }

    setMinutes(minutes: i32, seconds?: i32, ms?: i32) {
        let lt = localtime_tm(this.timestamp);
        this.timestamp = maketime(lt.tm_year, lt.tm_mon, lt.tm_mday, lt.tm_hour, minutes, 
            seconds == undefined ? lt.tm_sec : seconds, ms == undefined ? this.timestamp % 1000 : ms); 
    }        

    setMonth(month: i32) {
        let lt = localtime_tm(this.timestamp);
        this.timestamp = maketime(lt.tm_year, month, lt.tm_mday, lt.tm_hour, lt.tm_min, lt.tm_sec, this.timestamp % 1000); 
    }        

    setSeconds(seconds: i32, ms?: i32) {
        let lt = localtime_tm(this.timestamp);
        this.timestamp = maketime(lt.tm_year, lt.tm_mon, lt.tm_mday, lt.tm_hour, lt.tm_min, seconds, 
            ms == undefined ? this.timestamp % 1000 : ms); 
    }        

    setTime(time: long) {
        this.timestamp = time; 
    }        

    setUTCDate(mday: i32) {
        let lt = gmtime_tm(this.timestamp);
        this.timestamp = makegmtime(lt.tm_year, lt.tm_mon, mday, lt.tm_hour, lt.tm_min, lt.tm_sec, this.timestamp % 1000); 
    }    

    setUTCFullYear(year: i32) {
        let lt = gmtime_tm(this.timestamp);
        this.timestamp = makegmtime(year - 1900, lt.tm_mon, lt.tm_mday, lt.tm_hour, lt.tm_min, lt.tm_sec, this.timestamp % 1000); 
    }    

    setUTCHours(hours: i32, minutes?: i32, seconds?: i32, ms?: i32) {
        let lt = gmtime_tm(this.timestamp);
        this.timestamp = makegmtime(lt.tm_year, lt.tm_mon, lt.tm_mday, hours, 
            minutes == undefined ? lt.tm_min : minutes, seconds == undefined ? lt.tm_sec : seconds, ms == undefined ? this.timestamp % 1000 : ms); 
    }        

    setUTCMilliseconds(ms: i32) {
        this.timestamp += ms - this.timestamp % 1000;
    }

    setUTCMinutes(minutes: i32, seconds?: i32, ms?: i32) {
        let lt = gmtime_tm(this.timestamp);
        this.timestamp = makegmtime(lt.tm_year, lt.tm_mon, lt.tm_mday, lt.tm_hour, minutes, 
            seconds == undefined ? lt.tm_sec : seconds, ms == undefined ? this.timestamp % 1000 : ms); 
    }        

    setUTCMonth(month: i32) {
        let lt = gmtime_tm(this.timestamp);
        this.timestamp = makegmtime(lt.tm_year, month, lt.tm_mday, lt.tm_hour, lt.tm_min, lt.tm_sec, this.timestamp % 1000); 
    }        

    setUTCSeconds(seconds: i32, ms?: i32) {
        let lt = gmtime_tm(this.timestamp);
        this.timestamp = makegmtime(lt.tm_year, lt.tm_mon, lt.tm_mday, lt.tm_hour, lt.tm_min, seconds, 
            ms == undefined ? this.timestamp % 1000 : ms); 
    }        

    setYear(year: i32) {
        let lt = localtime_tm(this.timestamp);
        this.timestamp = maketime(year, lt.tm_mon, lt.tm_mday, lt.tm_hour, lt.tm_min, lt.tm_sec, this.timestamp % 1000); 
    }      

    toDateString() {
        return time_format(100, "%#x", this.timestamp, false);
    }

    toISOString() {
        const ms = convertInteger(50, ".%03dZ", this.timestamp % 1000);
        return time_format(100, "%FT%T", this.timestamp, true) + ms;
    }

    toJSON() {
        const ms = convertInteger(50, ".%03dZ", this.timestamp % 1000);
        return time_format(100, "%FT%T", this.timestamp, true) + ms;
    }

    toLocaleDateString(locale = "") {
        return time_format_locale(100, "%#x", this.timestamp, locale, false);
    }

    toLocaleString(locale = "", options?: { timeZone?: string }) {
        if (options != undefined && options.timeZone == 'UTC') {
            return time_format_locale(100, "%#c", this.timestamp, locale, true);
        }
        
        return time_format_locale(100, "%#c", this.timestamp, locale, false);
    }    

    toLocaleTimeString(locale = "", options?: { timeZone?: string }) {
        if (options != undefined && options.timeZone == 'UTC') {
            return time_format_locale(100, "%X", this.timestamp, locale, true);
        }
        
        return time_format_locale(100, "%X", this.timestamp, locale, false);
    }    

    toString() {
        return timestamp_to_string(26, this.timestamp);// + time_format(100, "%z", this.timestamp, false);
    }

    toTimeString() {
        // TODO: in linux %Z is not returning right value and crashes  "%T %Z"
        return time_format(100, "%T", this.timestamp, false);
    }   

    toUTCString() {
        return time_to_string(26, this.timestamp, true);// + time_format(100, "%z", this.timestamp, true);
    }

    valueOf() {
        return this.timestamp;
    }

    [Symbol.toPrimitive](hint: string) : string | number {
        if (hint === "number") {
            return <number>this.timestamp;
        }
        
        if (hint === "string") {
            return this.toString();
        }

        return this.toString();
    }
}

@final
export class MatchIndicesResults
{
    constructor(private match: Opaque, private lastIndex: index = 0) {
    }

    [index: number]: [index, index];

    get(index: number) {        
        const pos = regexp_match_results_sub_match_position(this.match, index);
        const len = regexp_match_results_sub_match_length(this.match, index);
        const res: [index, index] = [pos + this.lastIndex, pos + len + this.lastIndex];
        return res;
    }

    get length() {
        return regexp_match_results_size(this.match);
    }    
}

@final
export class MatchResults
{
    constructor(private match: Opaque, private hasIndices = false, private lastIndex: index = 0) {
    }

    [index: number]: string;

    get(index: number) {
        const len = regexp_match_results_sub_match_str_length(this.match, index);
        let buffer = "".clone().resize(len);
        regexp_match_results_sub_match_str_copy_to(this.match, index, Ref(buffer[0]), len);
        return buffer;
    }

    get length() {
        return regexp_match_results_size(this.match);
    }

    get indices() {
        // TODO: finish it
        //if (!this.hasIndices)
        //    return undefined;
        // a new one each time: it holds no state of its own, and a cached one in a field could
        // only be lent out, never returned, under -mm=own
        return new MatchIndicesResults(this.match, this.lastIndex);
    }
}

@final
export class RegExp
{
    dotAll = false;
    global = false;
    hasIndices = false;
    ignoreCase = false;
    multiline = false;
    sticky = false;
    unicode = false;
    unicodeSets = false;

    lastIndex: index = 0;

    private match: Opaque | null = null;

    constructor(private source: string, private flags = "") {
        // TODO: finish flags - g, if it is provided it should change lastIndex
        // for now all regex changes lastIndex;
        for (const c of flags)
        {
            switch (c) {
                case "s": this.dotAll = true;
                    break;
                case "g": this.global = true;
                    break;
                case "d": this.hasIndices = true;
                    break;
                case "i": this.ignoreCase = true;
                    break;
                case "m": this.multiline = true;
                    break;
                case "y": this.sticky = true;
                    break;
                case "u": this.unicode = true;
                    break;
                case "v": this.unicodeSets = true;
                    break;
            }
        }
    }

    exec(s: string): MatchResults | null {
        // past the end there is nothing to search, and nothing to read: as in JavaScript the
        // match fails and lastIndex goes back to 0 (at 0 there is nothing to ask the length for)
        if (this.lastIndex > 0 && this.lastIndex > s.length)
        {
            this.lastIndex = 0;
            return null;
        }

        const cmatch = regexp_exec(this.source, this.flags, Ref(s[this.lastIndex]), this.match);
        if (!cmatch)
        {
            if (this.global) 
                this.lastIndex = 0;

            return null;
        }

        const lastIndex = this.lastIndex;
        if (this.global) 
            this.lastIndex += regexp_match_results_suffix_position(cmatch);

        this.match = cmatch;

        return new MatchResults(cmatch, this.hasIndices, lastIndex);
    }

    test(s: string) {
        if (this.global) {
            // as in exec: past the end the match fails
            if (this.lastIndex > 0 && this.lastIndex > s.length)
            {
                this.lastIndex = 0;
                return false;
            }

            const result = regexp_test(this.source, this.flags, Ref(s[this.lastIndex]));
            if (result >= 0)
            {
                this.lastIndex += <index> result;
                return true;
            }

            this.lastIndex = 0;
            return false;
        }

        return regexp_test(this.source, this.flags, s) >= 0;
    }

    // Where the first match starts, or -1. It gave where the match ends, less one: right only for
    // a match of one character.
    search(s: string): int {
        const cmatch = regexp_exec(this.source, this.flags, s, null);
        if (!cmatch)
            return -1;

        const start = regexp_match_results_prefix_length(cmatch);
        regexp_free(cmatch);
        return <int>start;
    }    

    replace(s: string, replacement: string): string {
        // "g" replaces every match, which is what replaceAll does
        if (this.global)
            return this.replaceAll(s, replacement);

        const cmatch = regexp_exec(this.source, this.flags, s, null);
        if (cmatch)
        {
            const r = regexp_match_results_format(cmatch, replacement);

            const index = regexp_match_results_prefix_length(cmatch);
            const lastIndex = regexp_match_results_suffix_position(cmatch);

            // get formatted replacement: C's string, copied, then given back
            const len = (<string>r).length;
            let result = "".clone().resize(len);
            boundedCopy(Ref(result[0]), len, r, len);
            
            regexp_free_string(r);
            regexp_free(cmatch);

            // do replacement
            return s.substring(0, index) + result + s.substring(lastIndex);
        }

        // no match: the string is given back unchanged
        return s;
    }

    replaceAll(s: string, replacement: string): string {
        const r = regexp_replace(this.source, this.flags, s, replacement);
        // no text comes back for a pattern that is not a regular expression
        if (r == null)
            throw new SyntaxError(`Invalid regular expression: /${this.source}/`);

        const len = (<string>r).length;
        let result = "".clone().resize(len);
        boundedCopy(Ref(result[0]), len, r, len);
        regexp_free_string(r);
        return result;
    }

    // String.split with this as the separator: a piece between every two matches, then the
    // capture groups of the match (an unmatched group gives "", as string[] holds no undefined).
    // A negative limit is no limit (ToUint32 makes it huge). lastIndex is not used or changed, and
    // the match results are its own, so a MatchResults the caller holds from exec stays valid.
    split(s: string, limit = -1): string[] {
        let result: string[] = [];
        if (limit == 0)
            return result;

        const len = s.length;
        if (len == 0)
        {
            // an empty string the separator matches has no pieces
            const cmatch = regexp_exec(this.source, this.flags, s, null);
            if (cmatch)
            {
                regexp_free(cmatch);
                return result;
            }

            result.push(s);
            return result;
        }

        let cmatch: Opaque | null = null;
        // p: where the current piece starts, q: where the search goes on from
        let p: index = 0;
        let q: index = 0;
        while (q < len)
        {
            const found = regexp_exec(this.source, this.flags, Ref(s[q]), cmatch);
            if (!found)
                break;

            cmatch = found;
            const start = q + regexp_match_results_prefix_length(cmatch);
            const end = q + regexp_match_results_suffix_position(cmatch);
            if (start >= len)
                break;

            // an empty match where the piece starts splits nothing: look one further on
            if (end == p)
            {
                q = start + 1;
                continue;
            }

            result.push(s.substring(p, start));
            if (result.length == limit)
            {
                regexp_free(cmatch);
                return result;
            }

            const groups = new MatchResults(cmatch);
            for (let i = 1; i < groups.length; i++)
            {
                result.push(groups.get(i));
                if (result.length == limit)
                {
                    regexp_free(cmatch);
                    return result;
                }
            }

            p = end;
            q = end;
        }

        regexp_free(cmatch);

        result.push(s.substring(p));
        return result;
    }

    // other methods
    [Symbol.dispose]() {
        // Close object.
        const ptr = this.match;
        this.match = null;
        regexp_free(ptr);
    }    
}

namespace __String {

    function dataAt(this: string, index: int) {
        // the length once: it is a walk to the string's end each time it is asked for
        const len: int = this.length;
        if (index < 0) {
            if (-len <= index) {
                index = index + len;
            } else {
                index = 0;
            }
        } else if (index >= len) {
            return <char>0;
        }

        return this[index];
    }    

    function clone(this: string, add = "", right = false): string {
        return right ? add + this : this + add; // to clone string
    }

    function resize(this: string, newSize: index): string {
        this.length = newSize + 1;
        this[newSize] = <char>0;
        return this;
    }

    export function at(this: string, index: int): string {
        return this.dataAt(index);
    }

    export function charAt(this: string, index: int): string {
        return this.dataAt(index);
    }    

    export function charCodeAt(this: string, index: int): int {
        return this.dataAt(index);
    }    

    export function codePointAt(this: string, index: int): int {
        return this.dataAt(index);
    }    

    export function concat(this: string, ...other: string[]): string {
        let count = this.length;
        for (const item of other)
            count += item.length;
        const newString = this.clone().resize(count);        
        let index = this.length;
        for (const item of other) {
            boundedCopy(Ref(newString[index]), sizeof<char>() * (count - index), Ref(item[0]), sizeof<char>() * item.length);
            index += item.length;
        }

        return newString;
    }       

    // internal
    function join(parts: string[]): string {
        let count = 0;
        for (const item of parts)
            count += item.length;
        const newString = "".clone().resize(count);        
        let index = 0;
        for (const item of parts) {
            boundedCopy(Ref(newString[index]), sizeof<char>() * (count - index), Ref(item[0]), sizeof<char>() * item.length);
            index += item.length;
        }

        return newString;
    }      

    export function endsWith(this: string, searchString: string, endPosition: int = this.length): boolean {
        // a null check: "" is falsy, and an empty search string is found
        if (searchString == null)
        {
            return false;
        }

        // the end is clamped to [0, length]: past the end the suffix was read after the terminator
        let lenstr = endPosition;
        if (lenstr < 0)
        {
            lenstr = 0;
        }
        else if (lenstr > this.length)
        {
            lenstr = this.length;
        }

        const lensuffix = searchString.length;
        if (lensuffix > lenstr)
        {
            return false;
        }

        return strncmp(<string>Ref(this[lenstr - lensuffix]), searchString, lensuffix) == 0;
    }    

    export function includes(this: string, searchString: string, position = 0): boolean {
        // a null check: "" is falsy, and an empty search string is found
        if (searchString == null)
        {
            return false;
        }

        // the position is clamped to [0, length]: a negative one read before the string, and at
        // the end only "" is found, at the terminator
        if (position < 0)
        {
            position = 0;
        }
        else if (position > this.length)
        {
            position = this.length;
        }

        return strstr(<string>Ref(this[position]), searchString) != null;
    }      

    export function indexOf(this: string, searchString: string, position = 0): int {    
        // a null check: "" is falsy, and an empty search string is found
        if (searchString == null)
        {
            return -1;
        }

        // the position is clamped to [0, length], as in includes; at the end only "" is found
        if (position < 0)
        {
            position = 0;
        }
        else if (position > this.length)
        {
            position = this.length;
        }

        const found = strstr(<string>Ref(this[position]), searchString);
        if (found == null)
        {
            return -1;
        }

        return <index>found - <index>Ref(this[0]);
    }        

    export function isWellFormed(this: string): boolean {    
        // TODO: to be implemented
        return true;
    }    

    export function lastIndexOf(this: string, searchString: string, position: int = this.length): int {
        // the position is clamped to [0, length] first: past the end the search read after the
        // terminator, and "" is found at the clamped position
        if (position < 0)
        {
            position = 0;
        }
        else if (position > this.length)
        {
            position = this.length;
        }

        // a null check: "" is falsy
        if (searchString == null)
        {
            return -1;
        }

        const searchStringLen = searchString.length;
        if (searchStringLen == 0)
        {
            return position;
        }

        for (let i = position; i >= 0; i--)
        {
            const found = strncmp(<string>Ref(this[i]), searchString, searchStringLen);
            if (found == 0)
            {
                return <index>Ref(this[i]) - <index>Ref(this[0]);
            }
        }

        return -1;
    }     

    export function localeCompare(this: string, compareString: string, locale = ""): int {
        setlocale (LC_COLLATE, locale);        
        const result = strcoll(this, compareString);
        setlocale (LC_COLLATE, "");   
        return result;
    }

    export function match(this: string, expr: RegExp): string[] | null {
        if (!expr.global)
        {
            const result = expr.exec(this);
            if (result != null)
            {
                // -mm=own: into a local first, which the return then moves (as matchAll's yield does)
                const groups: string[] = [...result];
                return groups;
            }

            return null;
        }

        // the whole string is searched, whatever lastIndex an earlier test/exec left
        expr.lastIndex = 0;

        let results: string[] = [];
        while (true)
        {
            const result = expr.exec(this);
            if (result == null)
                break;

            const matched = result[0];
            results.push(matched);
            if (!skipEmptyMatch(this, expr, matched))
                break;
        }

        // an empty array when nothing matched, not JavaScript's null: a global match can always be
        // walked or counted without a check
        return results;
    }

    @borrows("this", "expr")
    export function *matchAll(this: string, expr: RegExp): Iterator<string[]> {
        // as in JavaScript; a non-global exec never moves lastIndex, so this looped forever
        if (!expr.global)
            throw new TypeError("matchAll must be called with a global RegExp");

        // unlike JavaScript, which starts a copy of expr at its lastIndex, the whole string is
        // searched and expr.lastIndex is 0 again once all matches are read
        expr.lastIndex = 0;

        while (true)
        {
            const result = expr.exec(this);
            if (result == null)
                break;

            // -mm=own: groups is read only to be yielded, so the yield moves it to the caller
            const groups = [...result];
            // typed: skipEmptyMatch is declared below, after the generator's state is laid out
            const more: boolean = skipEmptyMatch(this, expr, result.get(0));
            yield groups;
            if (!more)
                break;
        }
    }

    // A global exec that matched the empty string leaves lastIndex where it was, and the next
    // exec finds the same match again: move one on, as JavaScript does. Past the end there is
    // nothing more to search (exec would read beyond the string): lastIndex goes back to 0 and
    // false says to stop.
    function skipEmptyMatch(s: string, expr: RegExp, matched: string): boolean {
        if (matched.length == 0)
            expr.lastIndex++;

        if (expr.lastIndex > s.length)
        {
            expr.lastIndex = 0;
            return false;
        }

        return true;
    }

    export function normalize(this: string, form?: string): string {
        // TODO: finish normalize
        return this;
    }

    function pad(addSize: index, padString: string): string {
        let newPadString = "".clone().resize(addSize);
        let padStringIndex = 0;
        const padStringLength = padString.length;
        for (let i = 0; i < addSize; i++) {
            newPadString[i] = padString[padStringIndex++];
            if (padStringIndex >= padStringLength) {
                padStringIndex = 0;
            }
        }

        return newPadString;
    }

    export function padEnd(this: string, targetLength: index, padString = " "): string {
        if (targetLength <= this.length) {
            return this;
        }

        return this.clone(pad(targetLength - this.length, padString));
    }

    export function padStart(this: string, targetLength: index, padString = " "): string {
        if (targetLength <= this.length) {
            return this;
        }

        return this.clone(pad(targetLength - this.length, padString), true);
    }    
    
    export function repeat(this: string, count: int): string {
        if (count < 0) throw new RangeError();
        if (count == 0) return "";

        let newSize = this.length * count;
        const newString = this.clone().resize(newSize);        
        let index = this.length;
        const byteSize = sizeof<char>() * this.length;
        // the clone holds the first copy already: count - 1 more fill the string, and one more
        // wrote past its end
        for (let i = 1; i < count; i++) {
            boundedCopy(Ref(newString[index]), sizeof<char>() * (newSize - index), this, byteSize);
            index += this.length;
        }

        return newString;        
    }

    export function replace(this: string, pattern: string | RegExp, replacement: string): string {
        if (typeof pattern == "string") {
            const index = this.indexOf(pattern);
            if (index == -1)
                return this;
            return this.substring(0, index) + replacement + this.substring(index + pattern.length);
        }
        else
        {
            return pattern.replace(this, replacement);
        }
    }
    
    export function replaceAll(this: string, pattern: string | RegExp, replacement: string): string {
        if (typeof pattern == "string") {
            if (pattern == "") {
                // An empty pattern matches at every position, including before the
                // first character and after the last one, and never consumes any
                // input: every original character is preserved.
                let parts: string[] = [];
                parts.push(replacement);
                for (const ch of this) {
                    parts.push(ch);
                    parts.push(replacement);
                }

                return join(parts);
            }

            let index = 0;
            let parts: string[] = [];
            let len = this.length;
            while (true)
            {
                const found = this.indexOf(pattern, index);
                // indexOf(pattern, position) returns `this.length` (not -1) once
                // position is past the end of the string, even for a non-empty
                // pattern that can never match there; `found >= len` catches that
                // so the loop terminates instead of looping forever re-finding
                // the same out-of-range "match".
                if (found == -1 || found >= len)
                {
                    parts.push( this.substring(index) );
                    break;
                }

                parts.push( this.substring(index, found) + replacement );
                index = found + pattern.length;
            }

            return join(parts);
        }
        else
        {
            // as in JavaScript: a RegExp without "g" is a mistake, not a single replacement
            if (!pattern.global)
                throw new TypeError("replaceAll must be called with a global RegExp");

            return pattern.replaceAll(this, replacement);
        }
    }

    export function search(this: string, regexp: RegExp): int {
        return regexp.search(this);
    }

    export function slice(this: string, indexStart: int = 0, indexEnd: int = this.length): string {

        const len: int = this.length;
        if (indexStart < 0) {
            if (-len <= indexStart) {
                indexStart = indexStart + len;
            } else {
                indexStart = 0;
            }
        } else if (indexStart >= len) {
            return "";
        }

        if (indexEnd < 0) {
            if (-len <= indexEnd) {
                indexEnd = indexEnd + len;
            } else {
                indexEnd = 0;
            }
        } else if (indexEnd >= len) {
            indexEnd = len;
        }

        // an end at or before the start is empty - slice does not swap, as substring does; the
        // count was negative and the copy ran past the result (#27)
        if (indexEnd <= indexStart) {
            return "";
        }

        const count = indexEnd - indexStart;
        const newString = "".clone().resize(count);
        boundedCopy(Ref(newString[0]), sizeof<char>() * count, Ref(this[indexStart]), sizeof<char>() * count);
        return newString;
    }

    export function split(this: string, separator?: string | RegExp, limit?: int): string[] {

        if (limit != undefined && limit == 0)
            return [];

        if (separator == undefined)
        {
            return [this];        
        }
        else if (typeof separator == "string")
        {
            if (separator == "")
            {
                // split every char;
                let result: string[] = [];
                for (const v of this) result.push(v);
                return result;
            }

            let pos = 0;
            let result: string[] = [];
            const len = this.length;
            while (pos < len) {
                const matchPos = this.indexOf(separator, pos);
                if (matchPos === -1) {
                    result.push(this.substring(pos));
                    break;
                }
                
                result.push(this.substring(pos, matchPos));
                if (limit != undefined && limit >= result.length) {
                    break;
                }
                
                pos = matchPos + separator.length;
            }

            return result;    
        }   
        else
        {
            return separator.split(this, limit != undefined ? limit : -1);
        } 
    }
    
    export function startsWith(this: string, searchString: string, position = 0): boolean {
        // a null check: "" is falsy, and an empty search string is found
        if (searchString == null)
        {
            return false;
        }

        const lensuffix = searchString.length;
        if (position > this.length)
        {
            return false;
        }

        // a negative position is 0: it read before the string
        if (position < 0)
        {
            position = 0;
        }

        return strncmp(<string>Ref(this[position]), searchString, lensuffix) == 0;
    }    

    // `length` characters from `start`; a negative start counts from the end
    export function substr(this: string, start: int, length: int = this.length): string {
        if (start < 0) {
            start = start + this.length;
            if (start < 0) {
                start = 0;
            }
        } else if (start >= this.length) {
            return "";
        }

        if (length <= 0) {
            return "";
        }

        if (length > this.length - start) {
            length = this.length - start;
        }

        return this.substring(start, start + length);
    }

    export function substring(this: string, indexStart: int, indexEnd: int = this.length): string {
        const len: int = this.length;
        if (indexStart < 0) {
            indexStart = 0;
        } else if (indexStart >= len) {
            indexStart = len;
        }

        if (indexEnd < 0) {
            indexEnd = 0;
        } else if (indexEnd >= len) {
            indexEnd = len;
        }

        if (indexStart == indexEnd) {
            return "";
        }

        if (indexStart > indexEnd) {
            [indexStart, indexEnd] = [indexEnd, indexStart];
        }

        const count = indexEnd - indexStart;
        const newString = "".clone().resize(count);
        boundedCopy(Ref(newString[0]), sizeof<char>() * count, Ref(this[indexStart]), sizeof<char>() * count);
        return newString;        
    }

    export function toLocaleLowerCase(this: string, locale = ""): string {
        setlocale (LC_COLLATE, locale); 
        const lower = this.clone();
        const len = this.length;
        for (let i = 0; i < len; i++) lower[i] = tolower(this[i]);
        setlocale (LC_COLLATE, "");   
        return lower;
    }

    export function toLocaleUpperCase(this: string, locale = ""): string {
        setlocale (LC_COLLATE, locale); 
        const upper = this.clone();
        const len = this.length;
        for (let i = 0; i < len; i++) upper[i] = toupper(this[i]);
        setlocale (LC_COLLATE, "");   
        return upper;
    }

    export function toLowerCase(this: string): string {
        const lower = this.clone();
        const len = this.length;
        for (let i = 0; i < len; i++) lower[i] = tolower(this[i]);
        return lower;
    }

    export function toString(this: string): string {
        return this;
    }

    export function toUpperCase(this: string): string {
        const upper = this.clone();
        const len = this.length;
        for (let i = 0; i < len; i++) upper[i] = toupper(this[i]);
        return upper;
    }

    export function toWellFormed(this: string): string {
        // TODO: finish it
        return this;
    }    

    // the first character that is not a space, or the length when every one is
    function trimmedStart(this: string): int {
        const len: int = this.length;
        for (let i: int = 0; i < len; i++) {
            if (!isspace(this[i])) return i;
        }

        return len;
    }

    // one past the last character that is not a space, or 0 when every one is: substring's end is
    // exclusive, and the end used to be the last kept character, so it was dropped
    function trimmedEnd(this: string): int {
        for (let i: int = this.length - 1; i >= 0; i--) {
            if (!isspace(this[i])) return i + 1;
        }

        return 0;
    }

    export function trim(this: string): string {
        const start = this.trimmedStart();
        return start == this.length ? "" : this.substring(start, this.trimmedEnd());
    }

    export function trimStart(this: string): string {
        return this.substring(this.trimmedStart());
    }    

    export function trimEnd(this: string): string {
        return this.substring(0, this.trimmedEnd());
    }    

    export function valueOf(this: string): string {
        return this;
    }    
}

/*
class StringIterator implements ClassIterator<string> {

    private #index = 0;

    public constructor(private value: string) {
    }

    public next(): IterateResult<string> {
        if (this.#index >= this.value.length) return { value: undefined, done: true };
        return { value: this.value[this.#index++], done: false };
    }
}
*/

// `code`, a code point, as its UTF-8 bytes
function utf8Push(buffer: char[], code: int): void {
    if (code < 0x80) {
        buffer.push(<char>code);
    } else if (code < 0x800) {
        buffer.push(<char>(0xC0 | (code >> 6)));
        buffer.push(<char>(0x80 | (code & 0x3F)));
    } else if (code < 0x10000) {
        buffer.push(<char>(0xE0 | (code >> 12)));
        buffer.push(<char>(0x80 | ((code >> 6) & 0x3F)));
        buffer.push(<char>(0x80 | (code & 0x3F)));
    } else {
        buffer.push(<char>(0xF0 | (code >> 18)));
        buffer.push(<char>(0x80 | ((code >> 12) & 0x3F)));
        buffer.push(<char>(0x80 | ((code >> 6) & 0x3F)));
        buffer.push(<char>(0x80 | (code & 0x3F)));
    }
}

@final
export class String {

    public constructor(private value: string) {
    }

    // Strings are UTF-8, so each code is written as its UTF-8 bytes; a UTF-16 surrogate pair
    // (two codes) is one character of four bytes, as `String.fromCharCode(0xD83D, 0xDE00)` is one
    // character in JavaScript. A code is a UTF-16 unit: only its low 16 bits count. A string ends at
    // its first 0, so a 0 code ends the result there.
    public static fromCharCode(...codes: int[]): string {
        let buffer: char[] = [];
        for (let i = 0; i < codes.length; i++) {
            let code = codes[i] & 0xFFFF;
            if (code >= 0xD800 && code <= 0xDBFF && i + 1 < codes.length) {
                const low = codes[i + 1] & 0xFFFF;
                if (low >= 0xDC00 && low <= 0xDFFF) {
                    code = 0x10000 + ((code - 0xD800) << 10) + (low - 0xDC00);
                    i++;
                }
            }

            utf8Push(buffer, code);
        }

        buffer.push(<char>0);
        // a copy: buffer goes with this function
        return <string><Opaque>Ref(buffer[0]) + "";
    }

    // Each code point as its UTF-8 bytes (strings are UTF-8): `String.fromCodePoint(0x1F600)` is "😀",
    // one character of four bytes. A code point outside 0 to 0x10FFFF is a RangeError; a lone
    // surrogate (0xD800 to 0xDFFF) is written as is, as JavaScript keeps it. A string ends at its
    // first 0, so a 0 code point ends the result there.
    public static fromCodePoint(...codePoints: int[]): string {
        let buffer: char[] = [];
        for (let i = 0; i < codePoints.length; i++) {
            const code = codePoints[i];
            if (code < 0 || code > 0x10FFFF) {
                throw new RangeError(`Invalid code point ${code}`);
            }

            utf8Push(buffer, code);
        }

        buffer.push(<char>0);
        // a copy: buffer goes with this function
        return <string><Opaque>Ref(buffer[0]) + "";
    }

    public at(index: int) {
        return this.value.at(index);
    }

    public charAt(index: int): string {
        return this.value.charAt(index);
    }

    public charCodeAt(index: int): int {
        return this.value.charCodeAt(index);
    }

    public codePointAt(index: int): int {
        return this.value.codePointAt(index);
    }

    public concat(...other: string[]): string {
        return this.value.concat(...other);
    }

    public endsWith(end: string, endPosition?: int): boolean {
        return this.value.endsWith(end, endPosition);
    }

    public includes(searchString: string, position?: int): boolean {
        return this.value.includes(searchString, position);
    }

    public indexOf(searchString: string, position?: int): int {
        return this.value.indexOf(searchString, position);
    }

    public isWellFormed(): boolean {
        return this.value.isWellFormed();
    }

    public lastIndexOf(searchString: string, position?: int): int {
        return this.value.lastIndexOf(searchString, position);
    }

    public localeCompare(compareString: string, locale?: string): int {
        return this.value.localeCompare(compareString, locale);
    }

    public match(expr: RegExp): string[] | null {
        return this.value.match(expr);
    }

    @borrows("this", "expr")
    public matchAll(expr: RegExp): Iterator<string[]> {
        return this.value.matchAll(expr);
    }

    public normalize(form?: string): string {
        return this.value.normalize(form);
    }
    
    public padEnd(targetLength: index, padString?: string): string {
        return this.value.padEnd(targetLength, padString);
    }

    public padStart(targetLength: index, padString?: string): string {
        return this.value.padStart(targetLength, padString);
    }

    public repeat(count: int): string {
        return this.value.repeat(count);
    }

    public replace(pattern: string | RegExp, replacement: string): string {
        return this.value.replace(pattern, replacement);
    }

    public replaceAll(pattern: string | RegExp, replacement: string): string {
        return this.value.replaceAll(pattern, replacement);
    }
    
    public search(regexp: RegExp): int {
        return this.value.search(regexp);
    }

    public slice(indexStart?: int, indexEnd?: int): string {
        return this.value.slice(indexStart, indexEnd);
    }

    public split(separator?: string | RegExp, limit?: int): string[] {
        return this.value.split(separator, limit);
    }

    public substr(start: int, length?: int): string {
        return this.value.substr(start, length);
    }

    public substring(indexStart: int, indexEnd?: int): string {
        return this.value.substring(indexStart, indexEnd);
    }

    public startsWith(searchString: string, position?: int) {
        return this.value.startsWith(searchString, position);
    }

    public toLocaleLowerCase(locale?: string): string {
        return this.value.toLocaleLowerCase(locale);
    }

    public toLocaleUpperCase(locale?: string): string {
        return this.value.toLocaleUpperCase(locale);
    }

    public toLowerCase(): string {
        return this.value.toLowerCase();
    }

    public toString(): string {
        return this.value.toString();
    }

    public toUpperCase(): string {
        return this.value.toUpperCase();
    }

    public toWellFormed(): string {
        return this.value.toWellFormed();
    }

    public trim(): string {
        return this.value.trim();
    }

    public trimStart(): string {
        return this.value.trimStart();
    }

    public trimEnd(): string {
        return this.value.trimEnd();
    }

    public valueOf(): string {
        return this.value.valueOf();
    }

    @borrows("this")
    public *[Symbol.iterator]() : Iterator<string> {
        for (const c of this.value) yield <string>c;
    }
    // public [Symbol.iterator]() : ClassIterator<string> {
    //     return new StringIterator(this.value);
    // }
}

export static class Math {
    /** The mathematical constant e. This is Euler's number, the base of natural logarithms. */
    public E = 2.718281828459045;
    /** The natural logarithm of 10. */
    public LN10 = 2.302585092994046;
    /** The natural logarithm of 2. */
    public LN2 = 0.6931471805599453;
    /** The base-2 logarithm of e. */
    public LOG2E = 1.4426950408889634;
    /** The base-10 logarithm of e. */
    public LOG10E = 0.4342944819032518;
    /** Pi. This is the ratio of the circumference of a circle to its diameter. */
    public PI = 3.141592653589793;
    /** The square root of 0.5, or, equivalently, one divided by the square root of 2. */
    public SQRT1_2 = 0.7071067811865476;
    /** The square root of 2. */
    public SQRT2 = 1.4142135623730951;

    constructor() {
        let ltime: long = 0;
        time(ltime);
        srand(ltime);
    }

    /**
     * Returns the absolute value of a number (the value without regard to whether it is positive or negative).
     * For example, the absolute value of -5 is the same as the absolute value of 5.
     * @param x A numeric expression for which the absolute value is needed.
     */
    public abs(x: number): number {
        return fabs(x);
    }

    /**
     * Returns the arc cosine (or inverse cosine) of a number.
     * @param x A numeric expression.
     */
    public acos(x: number): number {
        return acos(x);
    }

    /**
     * Returns the inverse hyperbolic cosine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    acosh(x: number): number {
        return acosh(x);
    }

    /**
     * Returns the arcsine of a number.
     * @param x A numeric expression.
     */
    public asin(x: number): number {
        return asin(x);
    }

    /**
     * Returns the inverse hyperbolic sine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    asinh(x: number): number {
        return asinh(x);
    }    

    /**
     * Returns the arctangent of a number.
     * @param x A numeric expression for which the arctangent is needed.
     */
    public atan(x: number): number {
        return atan(x);
    }

    /**
     * Returns the angle (in radians) from the X axis to a point.
     * @param y A numeric expression representing the cartesian y-coordinate.
     * @param x A numeric expression representing the cartesian x-coordinate.
     */
    public atan2(y: number, x: number): number {
        return atan2(y, x);
    }

    /**
     * Returns the inverse hyperbolic tangent of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    atanh(x: number): number {
        return atanh(x);
    }

    /**
     * Returns an implementation-dependent approximation to the cube root of number.
     * @param x A numeric expression.
     */
    cbrt(x: number): number {
        return cbrt(x);
    }    

    /**
     * Returns the smallest integer greater than or equal to its numeric argument.
     * @param x A numeric expression.
     */
    public ceil(x: number): number {
        return ceil(x);
    }

    /**
     * Returns the number of leading zero bits in the 32-bit binary representation of a number.
     * @param x A numeric expression.
     */
    clz32(x: number): number {
        if (x == 0) return 32;
    
        let count = 0;
        for (let i = 31; i >= 0; i--) {
            if ((x >> i) & 1) break;
            count++;
        }
        
        return count;
    }
     
    /**
     * Returns the cosine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    public cos(x: number): number {
        return cos(x);
    }

    /**
     * Returns the hyperbolic cosine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    cosh(x: number): number {
        return cosh(x);
    }

    /**
     * Returns e (the base of natural logarithms) raised to a power.
     * @param x A numeric expression representing the power of e.
     */
    public exp(x: number): number {
        return exp(x);
    }

    /**
     * Returns the result of (e^x - 1), which is an implementation-dependent approximation to
     * subtracting 1 from the exponential function of x (e raised to the power of x, where e
     * is the base of the natural logarithms).
     * @param x A numeric expression.
     */
    expm1(x: number): number {
        return expm1(x);
    }    

    /**
     * Returns the greatest integer less than or equal to its numeric argument.
     * @param x A numeric expression.
     */
    public floor(x: number): number {
        return floor(x);
    }
    
    /**
     * Returns the nearest single precision float representation of a number.
     * @param x A numeric expression.
     */
    fround(x: number): number {
        return <f32>x;
    }

    /**
     * Returns the nearest half precision float representation of a number.
     * @param x A numeric expression.
     */
    f16round(x: number): number {
        return __Float16.decode(__Float16.encode(x));
    }

    /**
     * Returns the square root of the sum of squares of its arguments.
     * @param values Values to compute the square root for.
     *     If no arguments are passed, the result is +0.
     *     If there is only one argument, the result is the absolute value.
     *     If any argument is +Infinity or -Infinity, the result is +Infinity.
     *     If any argument is NaN, the result is NaN.
     *     If all arguments are either +0 or −0, the result is +0.
     */
    hypot(...values: number[]): number {
        let sum = 0.0;
        for (const v of values) sum += v * v;
        return sqrt(sum);
    }    

    /**
     * Returns the result of 32-bit multiplication of two numbers.
     * @param x First number
     * @param y Second number
     */
    imul(x: number, y: number): number {
        return <i32>x * <i32>y;
    }    

    /**
     * Returns the natural logarithm (base e) of a number.
     * @param x A numeric expression.
     */
    public log(x: number): number {
        return log(x);
    }

    /**
     * Returns the base 10 logarithm of a number.
     * @param x A numeric expression.
     */
    log10(x: number): number {
        return log10(x);
    }    

    /**
     * Returns the natural logarithm of 1 + x.
     * @param x A numeric expression.
     */
    log1p(x: number): number {
        return log1p(x);
    }

    /**
     * Returns the base 2 logarithm of a number.
     * @param x A numeric expression.
     */
    log2(x: number): number {
        return log2(x);
    }

    /**
     * Returns the larger of a set of supplied numeric expressions.
     * @param values Numeric expressions to be evaluated.
     */
    public max(...values: number[]): number {
        // -Infinity, not Number.MIN_VALUE: that is the smallest positive number, so the maximum of
        // negative numbers came out as it. With no arguments the result is -Infinity, and any NaN
        // makes it NaN.
        // +0 is larger than -0 here, which `>` does not tell apart: Math.max(-0, 0) is 0 in either
        // order (1 / -0 is -Infinity)
        let m = Number.NEGATIVE_INFINITY;
        for (const v of values) {
            if (isNaN(v)) return Number.NaN;
            if (v > m || (v == 0 && m == 0 && 1 / m < 0)) m = v;
        }

        return m;
    }

    /**
     * Returns the smaller of a set of supplied numeric expressions.
     * @param values Numeric expressions to be evaluated.
     */
    public min(...values: number[]): number {
        // +Infinity, not Number.MAX_VALUE, so that Math.min() and Math.min(Infinity) are Infinity
        // -0 is smaller than +0 here, which `<` does not tell apart: Math.min(0, -0) is -0 in either
        // order
        let m = Number.POSITIVE_INFINITY;
        for (const v of values) {
            if (isNaN(v)) return Number.NaN;
            if (v < m || (v == 0 && m == 0 && 1 / v < 0)) m = v;
        }

        return m;
    }

    /**
     * Returns the value of a base expression taken to a specified power.
     * @param x The base value of the expression.
     * @param y The exponent value of the expression.
     */
    public pow(x: number, y: number): number {
        return pow(x, y);
    }

    /** Returns a pseudorandom number between 0 and 1. */
    public random(): number {
        // 45 bits from three calls, 15 from each: rand() gives 15 on Windows (RAND_MAX is 32767) and
        // 31 on Linux, and its range was taken to be the larger, so on Windows nothing above
        // 0.000016 came back. Never 1, as in JavaScript.
        const high = rand() & 0x7FFF;
        const middle = rand() & 0x7FFF;
        const low = rand() & 0x7FFF;
        return (<number>high * 1073741824.0 + <number>middle * 32768.0 + <number>low) / 35184372088832.0;
    }

    /**
     * Returns a supplied numeric expression rounded to the nearest integer.
     * @param x The value to be rounded to the nearest integer.
     */
    public round(x: number): number {
        return round(x);
    }

    /**
     * Returns the sign of the x, indicating whether x is positive, negative or zero.
     * @param x The numeric expression to test
     */
    sign(x: number): number {
        return (x > 0) ? 1 : ((x < 0) ? -1 : 0);
    }

    /**
     * Returns the sine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    public sin(x: number): number {
        return sin(x);
    }

    /**
     * Returns the hyperbolic sine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    sinh(x: number): number {
        return sinh(x);
    }    

    /**
     * Returns the square root of a number.
     * @param x A numeric expression.
     */
    public sqrt(x: number): number {
        return sqrt(x);
    }

    /**
     * Returns the tangent of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    public tan(x: number): number {
        return tan(x);
    }

    /**
     * Returns the hyperbolic tangent of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    tanh(x: number): number {
        return tanh(x);
    }    

    /**
     * Returns the integral part of the a numeric expression, x, removing any fractional digits.
     * If x is already an integer, the result is x.
     * @param x A numeric expression.
     */
    trunc(x: number): number {
        return trunc(x);
    }    
}

enum States {
    HasMaxByteLength = 1,
    NonResizable = 2,
    Detached = 4,
    View = 8,
}

@final
export class ArrayBuffer {
    private arrayOfView: char[];
    private states: States;
    public maxByteLength: int;

    public constructor(length: int, options?: { maxByteLength?: int }) {
        if (length < 0) {
            throw new RangeError("Invalid array buffer length");
        }

        // resizable only when given a maxByteLength, as in JavaScript
        if (options != undefined && options.maxByteLength != undefined) {
            if (options.maxByteLength < length) {
                throw new RangeError("Invalid array buffer max length");
            }

            this.maxByteLength = options.maxByteLength;
            this.states |= States.HasMaxByteLength;
        } else {
            this.maxByteLength = length;
            this.states |= States.NonResizable;
        }

        // always an array, empty for no bytes and once detached: never null
        let buffer : char[] = [];
        if (length > 0) {
            buffer.length = length;
        }

        this.arrayOfView = buffer;
    }

    public get resizable() {
        return (this.states & States.NonResizable) != States.NonResizable;
    }

    public get detached() {
        return (this.states & States.Detached) == States.Detached;
    }

    // 0 once detached
    public get byteLength(): int {
        return this.arrayOfView.length;
    }

    public static isView(arrayBuffer: ArrayBuffer) {
        return (arrayBuffer.states & States.View) == States.View;
    }

    public resize(newLength: int) {
        this.expectAttached();
        if (!this.resizable) {
            throw new TypeError("ArrayBuffer is not resizable");
        }

        if (newLength < 0 || newLength > this.maxByteLength) {
            throw new RangeError("Invalid array buffer length");
        }

        // the bytes past the old length are 0, as in JavaScript: setting the length alone keeps
        // what a shrink left there
        const oldLength = this.arrayOfView.length;
        this.arrayOfView.length = newLength;
        for (let i = oldLength; i < newLength; i++) {
            this.arrayOfView[i] = <char>0;
        }
    }

    public slice(start = 0, end: int = this.arrayOfView.length) {
        this.expectAttached();
        if (start < 0 && -this.arrayOfView.length <= start) start += this.arrayOfView.length;
        if (start < -this.arrayOfView.length) start = 0;
        if (start >= this.arrayOfView.length) {
            start = 0;
            end = 0;
        }

        if (-this.arrayOfView.length <= end && end < 0) end += this.arrayOfView.length;
        if (end < -this.arrayOfView.length) end = 0;
        if (end >= this.arrayOfView.length) end = this.arrayOfView.length;
        if (start >= end) end = start; 

        const newArrayBuffer = new ArrayBuffer(0);
        newArrayBuffer.states = (this.states & ~States.HasMaxByteLength) | States.NonResizable;
        newArrayBuffer.arrayOfView = this.copyOf(start, end);
        newArrayBuffer.maxByteLength = end - start;
        return newArrayBuffer;
    }

    // the bytes in a buffer of newByteLength, its own length by default: cut short, or 0 past it
    public transfer(newByteLength?: int) {
        this.expectAttached();
        const length = newByteLength == undefined ? this.arrayOfView.length : newByteLength;
        if (length < 0 || (this.resizable && length > this.maxByteLength)) {
            throw new RangeError("Invalid array buffer length");
        }

        const newArrayBuffer = new ArrayBuffer(0);
        newArrayBuffer.states = this.states;
        newArrayBuffer.maxByteLength = this.resizable ? this.maxByteLength : length;
        const kept = length < this.arrayOfView.length ? length : this.arrayOfView.length;
        const bytes = this.copyOf(0, kept);
        bytes.length = length;
        for (let i = kept; i < length; i++) {
            bytes[i] = <char>0;
        }

        newArrayBuffer.arrayOfView = bytes;

        this.detach();
        return newArrayBuffer;
    }

    public transferToFixedLength(newByteLength?: int) {
        const newArrayBuffer = this.transfer(newByteLength);
        newArrayBuffer.states |= States.NonResizable;
        newArrayBuffer.maxByteLength = newArrayBuffer.arrayOfView.length;
        return newArrayBuffer;
    }

    // for DataView: the bytes themselves
    @lends("this")
    public __bytes(): char[] {
        return this.arrayOfView;
    }

    // the assignment releases the bytes under rc and own, and leaves them to the collector under gc
    [Symbol.dispose]() {
        if (!this.detached) {
            this.arrayOfView = [];
        }
    }

    // The bytes [start, end) in an array of their own. A slice is a copy, as in JavaScript, and a
    // transfer copies too: the bytes cannot move out of the field into another object under
    // -mm=own, where a read of a field only borrows it.
    private copyOf(start: int, end: int): char[] {
        let copy: char[] = [];
        copy.length = end - start;
        for (let i = start; i < end; i++) {
            copy[i - start] = this.arrayOfView[i];
        }

        return copy;
    }

    // as in JavaScript: a detached buffer has no bytes to read, resize or hand on
    private expectAttached() {
        if (this.detached) {
            throw new TypeError("ArrayBuffer is detached");
        }
    }

    private detach() {
        this.states |= States.Detached;
        this.arrayOfView = [];
    }
}

// A block of bytes that threads share, as in JavaScript. A growable one takes all maxByteLength bytes
// up front, so grow() never moves them while another thread reads: it only says more of them are in
// use. Nothing here is atomic: threads that write the same bytes order their writes themselves (a
// TypedArray cannot view these bytes, so Atomics cannot reach them).
@final
export class SharedArrayBuffer {
    private bytes: char[];
    private length: int;
    private capacity: int;
    private canGrow: boolean;

    public constructor(length: int, options?: { maxByteLength?: int }) {
        if (length < 0) {
            throw new RangeError("Invalid array buffer length");
        }

        let capacity = length;
        let canGrow = false;
        if (options != undefined && options.maxByteLength != undefined) {
            capacity = options.maxByteLength;
            canGrow = true;
            if (capacity < length) {
                throw new RangeError("Invalid array buffer max length");
            }
        }

        let bytes: char[] = [];
        if (capacity > 0) {
            bytes.length = capacity;
        }

        this.bytes = bytes;
        this.length = length;
        this.capacity = capacity;
        this.canGrow = canGrow;
    }

    public get byteLength(): int {
        return this.length;
    }

    public get growable(): boolean {
        return this.canGrow;
    }

    public get maxByteLength(): int {
        return this.capacity;
    }

    // the bytes past the old length are 0: they were never written
    public grow(newLength: int): void {
        if (!this.canGrow) {
            throw new TypeError("SharedArrayBuffer is not growable");
        }

        if (newLength < this.length || newLength > this.capacity) {
            throw new RangeError("Invalid array buffer length");
        }

        this.length = newLength;
    }

    // a copy of the bytes [start, end), in a SharedArrayBuffer of its own that does not grow
    public slice(start = 0, end = this.length): SharedArrayBuffer {
        const from = SharedArrayBuffer.clamp(start, this.length);
        const until = SharedArrayBuffer.clamp(end, this.length);
        const count = until > from ? until - from : 0;
        const copy = new SharedArrayBuffer(count);
        for (let i = 0; i < count; i++) {
            copy.bytes[i] = this.bytes[from + i];
        }

        return copy;
    }

    // for DataView: the bytes themselves, of which the first byteLength are in use
    @lends("this")
    public __bytes(): char[] {
        return this.bytes;
    }

    // a relative index, as JavaScript takes one: a negative one counts from the end
    private static clamp(index: int, length: int): int {
        if (index < 0) {
            index = index + length;
            return index < 0 ? 0 : index;
        }

        return index > length ? length : index;
    }
}

// A view that reads and writes numbers of any width at any byte offset of an ArrayBuffer or a
// SharedArrayBuffer, big-endian unless littleEndian is true, as in JavaScript. An offset past the
// view's end is a RangeError, and a detached ArrayBuffer a TypeError. Made without a byteLength over
// a buffer that can resize or grow, the view follows the buffer's length.
@final
export class DataView {
    private source: ArrayBuffer | SharedArrayBuffer;
    private offset: int;
    private fixedLength: int;
    private tracksLength: boolean;

    // One constructor of a union, not two: lib.d.ts cannot declare an overloaded one. The view keeps
    // the buffer: under -mm=own its caller gives the buffer up, and reaches it through `buffer`.
    @keeps("buffer")
    public constructor(buffer: ArrayBuffer | SharedArrayBuffer, byteOffset = 0, byteLength?: int) {
        if (buffer instanceof ArrayBuffer) {
            if (buffer.detached) {
                throw new TypeError("ArrayBuffer is detached");
            }

            this.init(buffer.byteLength, buffer.resizable, byteOffset, byteLength);
        } else {
            this.init(buffer.byteLength, buffer.growable, byteOffset, byteLength);
        }

        // stored once, after it is measured: under -mm=own the store moves it
        this.source = buffer;
    }

    @lends("this")
    public get buffer(): ArrayBuffer | SharedArrayBuffer {
        return this.source;
    }

    public get byteOffset(): int {
        this.bufferLength();
        return this.offset;
    }

    public get byteLength(): int {
        const bufferLength = this.bufferLength();
        if (this.tracksLength) {
            return bufferLength - this.offset;
        }

        if (this.offset + this.fixedLength > bufferLength) {
            throw new TypeError("DataView is out of bounds");
        }

        return this.fixedLength;
    }

    public getInt8(byteOffset: int): number {
        return <s8><u8>this.read(byteOffset, 1, false);
    }

    public getUint8(byteOffset: int): number {
        return <u8>this.read(byteOffset, 1, false);
    }

    public getInt16(byteOffset: int, littleEndian = false): number {
        return <s16><u16>this.read(byteOffset, 2, littleEndian);
    }

    public getUint16(byteOffset: int, littleEndian = false): number {
        return <u16>this.read(byteOffset, 2, littleEndian);
    }

    public getInt32(byteOffset: int, littleEndian = false): number {
        return <s32><u32>this.read(byteOffset, 4, littleEndian);
    }

    public getUint32(byteOffset: int, littleEndian = false): number {
        return <u32>this.read(byteOffset, 4, littleEndian);
    }

    public getFloat16(byteOffset: int, littleEndian = false): number {
        return __Float16.decode(<u16>this.read(byteOffset, 2, littleEndian));
    }

    public getFloat32(byteOffset: int, littleEndian = false): number {
        return DataView.f32Of(this.read(byteOffset, 4, littleEndian));
    }

    public getFloat64(byteOffset: int, littleEndian = false): number {
        return DataView.f64Of(this.read(byteOffset, 8, littleEndian));
    }

    public getBigInt64(byteOffset: int, littleEndian = false): bigint {
        return <s64>this.read(byteOffset, 8, littleEndian);
    }

    // a bigint here is 64 bits and signed: a value of 2^63 or more comes out negative
    public getBigUint64(byteOffset: int, littleEndian = false): bigint {
        return <s64>this.read(byteOffset, 8, littleEndian);
    }

    public setInt8(byteOffset: int, value: number): void {
        this.write(byteOffset, 1, DataView.wrap(value), false);
    }

    public setUint8(byteOffset: int, value: number): void {
        this.write(byteOffset, 1, DataView.wrap(value), false);
    }

    public setInt16(byteOffset: int, value: number, littleEndian = false): void {
        this.write(byteOffset, 2, DataView.wrap(value), littleEndian);
    }

    public setUint16(byteOffset: int, value: number, littleEndian = false): void {
        this.write(byteOffset, 2, DataView.wrap(value), littleEndian);
    }

    public setInt32(byteOffset: int, value: number, littleEndian = false): void {
        this.write(byteOffset, 4, DataView.wrap(value), littleEndian);
    }

    public setUint32(byteOffset: int, value: number, littleEndian = false): void {
        this.write(byteOffset, 4, DataView.wrap(value), littleEndian);
    }

    public setFloat16(byteOffset: int, value: number, littleEndian = false): void {
        this.write(byteOffset, 2, __Float16.encode(value), littleEndian);
    }

    public setFloat32(byteOffset: int, value: number, littleEndian = false): void {
        this.write(byteOffset, 4, DataView.f32Bits(value), littleEndian);
    }

    public setFloat64(byteOffset: int, value: number, littleEndian = false): void {
        this.write(byteOffset, 8, DataView.f64Bits(value), littleEndian);
    }

    public setBigInt64(byteOffset: int, value: bigint, littleEndian = false): void {
        this.write(byteOffset, 8, <u64><s64>value, littleEndian);
    }

    public setBigUint64(byteOffset: int, value: bigint, littleEndian = false): void {
        this.write(byteOffset, 8, <u64><s64>value, littleEndian);
    }

    private init(bufferLength: int, followsBuffer: boolean, byteOffset: int, byteLength?: int) {
        if (byteOffset < 0 || byteOffset > bufferLength) {
            throw new RangeError("Start offset is outside the bounds of the buffer");
        }

        this.offset = byteOffset;
        if (byteLength == undefined) {
            this.fixedLength = bufferLength - byteOffset;
            this.tracksLength = followsBuffer;
        } else {
            if (byteLength < 0 || byteOffset + byteLength > bufferLength) {
                throw new RangeError("Invalid DataView length");
            }

            this.fixedLength = byteLength;
            this.tracksLength = false;
        }
    }

    // the buffer's length now: a resizable ArrayBuffer may have shrunk under the view
    private bufferLength(): int {
        const source = this.source;
        if (source instanceof ArrayBuffer) {
            if (source.detached) {
                throw new TypeError("ArrayBuffer is detached");
            }

            return source.byteLength;
        }

        return source.byteLength;
    }

    @lends("this")
    private bytes(): char[] {
        const source = this.source;
        if (source instanceof ArrayBuffer) {
            return source.__bytes();
        }

        return source.__bytes();
    }

    private check(byteOffset: int, size: int): void {
        const length = this.byteLength;
        if (byteOffset < 0 || byteOffset + size > length) {
            throw new RangeError("Offset is outside the bounds of the DataView");
        }
    }

    // `size` bytes at `byteOffset`, as one unsigned integer
    private read(byteOffset: int, size: int, littleEndian: boolean): u64 {
        this.check(byteOffset, size);
        const bytes = this.bytes();
        const at = this.offset + byteOffset;
        let value: u64 = 0;
        for (let i = 0; i < size; i++) {
            const b = <u64><u8>bytes[littleEndian ? at + size - 1 - i : at + i];
            value = (value << 8) | b;
        }

        return value;
    }

    private write(byteOffset: int, size: int, value: u64, littleEndian: boolean): void {
        this.check(byteOffset, size);
        const bytes = this.bytes();
        const at = this.offset + byteOffset;
        for (let i = 0; i < size; i++) {
            const b = <char><u8>(value & 0xFF);
            bytes[littleEndian ? at + i : at + size - 1 - i] = b;
            value = value >> 8;
        }
    }

    // a number as an integer of the element's width, as JavaScript's ToInt32 and its kin wrap it:
    // NaN and the infinities are 0
    private static wrap(value: number): u64 {
        if (!isFinite(value)) {
            return 0;
        }

        const whole = Math.trunc(value);
        if (whole < 0) {
            return <u64><s64>whole;
        }

        return <u64>whole;
    }

    private static f32Of(bits: u64): number {
        let b: u32 = <u32>bits;
        let value: f32 = 0;
        memcpy(<Opaque>Ref(value), <Opaque>Ref(b), 4);
        return value;
    }

    private static f32Bits(x: number): u64 {
        let value: f32 = x;
        let b: u32 = 0;
        memcpy(<Opaque>Ref(b), <Opaque>Ref(value), 4);
        return b;
    }

    private static f64Of(bits: u64): number {
        let b: u64 = bits;
        let value: f64 = 0;
        memcpy(<Opaque>Ref(value), <Opaque>Ref(b), 8);
        return value;
    }

    private static f64Bits(x: number): u64 {
        let value: f64 = x;
        let b: u64 = 0;
        memcpy(<Opaque>Ref(b), <Opaque>Ref(value), 8);
        return b;
    }
}

@final
export class Headers {
    private names: string[];
    private values: string[];

    constructor(init?: [string, string][]) {
        this.names = [];
        this.values = [];

        if (init != undefined) {
            // copies: set may overwrite an element of this.values, and under -mm=own a call that
            // may destroy anything cannot be lent the caller's strings
            for (const [k, v] of init) this.set(k + "", v + "");
        }
    }

    static parse(rawHeaders: string): Headers {
        const headers = new Headers();
        const lines = rawHeaders.split("\r\n");
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line == "") continue;
            const sep = line.indexOf(":");
            if (sep == -1) continue;
            let name = line.substring(0, sep);
            let value = line.substring(sep + 1);
            headers.set(name, value.trim());
        }

        return headers;
    }

    append(name: string, value: string) {
        const key = this.key(name);
        const i = this.indexOf(key);
        if (i != -1) {
            this.values[i] = this.values[i] + ", " + value;
        } else {
            this.names.push(key);
            this.values.push(value);
        }
    }

    set(name: string, value: string) {
        const key = this.key(name);
        const i = this.indexOf(key);
        if (i != -1) {
            this.values[i] = value;
        } else {
            this.names.push(key);
            this.values.push(value);
        }
    }

    // the value, or null when there is no such header, as in JavaScript
    get(name: string): string | null {
        const i = this.indexOf(this.key(name));
        if (i == -1) {
            return null;
        }

        return this.values[i];
    }

    has(name: string): boolean {
        return this.indexOf(this.key(name)) != -1;
    }

    delete(name: string) {
        const i = this.indexOf(this.key(name));
        if (i == -1) return;

        let newNames: string[] = [];
        let newValues: string[] = [];
        for (let j = 0; j < this.names.length; j++) {
            if (j == i) continue;
            newNames.push(this.names[j]);
            newValues.push(this.values[j]);
        }

        this.names = newNames;
        this.values = newValues;
    }

    toRawString(): string {
        let result = "";
        for (let i = 0; i < this.names.length; i++) {
            result += this.names[i] + ": " + this.values[i] + "\r\n";
        }

        return result;
    }

    // The private methods come last: lib.d.ts declares only the public ones, and a program finds a
    // method by its place among them. With these two before `append`, every call from a program
    // ran a method two places before the one it named.
    private key(name: string): string {
        return name.toLowerCase();
    }

    private indexOf(key: string): int {
        for (let i = 0; i < this.names.length; i++) {
            if (this.names[i] == key) return i;
        }

        return -1;
    }
}

@final
export class Response {
    @keeps("headers", "body")
    public constructor(
        public status: int,
        public headers: Headers,
        private body: string) {
    }

    public get ok(): boolean {
        return this.status >= 200 && this.status < 300;
    }

    text(): string {
        return this.body;
    }

    json(): JsonValue {
        return JsonValue.parse(this.body);
    }
}

// NOTE: not `async` - the compiler's async lowering currently fails
// ("failed to legalize operation 'async.runtime.load'") when an async
// function returns a class-typed value. Revisit once that's fixed upstream.
export function fetch(url: string, init?: { method?: string, headers?: [string, string][], body?: string }): Response {
    const method = init != undefined && init.method != undefined ? init.method : "GET";
    const body = init != undefined && init.body != undefined ? init.body : "";

    let rawHeaders = "";
    if (init != undefined && init.headers != undefined) {
        for (const [k, v] of init.headers) rawHeaders += k + ": " + v + "\r\n";
    }

    const r = http_request(method, url, rawHeaders, body, body.length);

    if (!http_response_success(r)) {
        const errorCode = http_response_error_code(r);
        http_response_free(r);
        // the platform's own code: a WinHTTP error on Windows, a CURLcode on Linux, -1 where there
        // is no HTTP client (Android) - see docs/fetch.md
        throw new Error(`fetch failed with error ${errorCode}`);
    }

    const status = http_response_status(r);

    const headersLen = http_response_headers_length(r);
    let headersBuffer: char[] = [];
    headersBuffer.length = headersLen + 1;
    headersBuffer[headersLen] = <char>0;
    if (headersLen > 0) http_response_headers_copy_to(r, <string><Opaque>Ref(headersBuffer[0]), headersLen);
    const headers = Headers.parse(<string><Opaque>Ref(headersBuffer[0]));

    const bodyLen = http_response_body_length(r);
    let bodyBuffer: char[] = [];
    bodyBuffer.length = bodyLen + 1;
    bodyBuffer[bodyLen] = <char>0;
    if (bodyLen > 0) http_response_body_copy_to(r, <string><Opaque>Ref(bodyBuffer[0]), bodyLen);
    // a copy: the Response keeps its body (@keeps), and bodyBuffer goes with this function
    const responseBody = <string><Opaque>Ref(bodyBuffer[0]) + "";

    http_response_free(r);

    return new Response(status, headers, responseBody);
}

const JSON_NULL = 0;
const JSON_BOOLEAN = 1;
const JSON_NUMBER = 2;
const JSON_STRING = 3;
const JSON_ARRAY = 4;
const JSON_OBJECT = 5;
// A parser and a writer that recurse: past this a deep input would run off the native stack.
const JSON_MAX_DEPTH = 512;
// An object with this many members or more finds a member by its name through a table.
const JSON_INDEX_FROM = 16;

function jsonAppend(output: char[], text: string): void {
    // the length once: it is a walk to the text's end each time it is asked for
    const length = text.length;
    for (let i = 0; i < length; i++) {
        output.push(text[i]);
    }
}

function jsonNewLine(output: char[], space: string, level: int): void {
    if (space.length == 0) {
        return;
    }

    output.push(<char>0x0A);
    for (let i = 0; i < level; i++) {
        jsonAppend(output, space);
    }
}

function jsonHexDigit(digit: int): char {
    if (digit < 10) {
        return <char>(0x30 + digit);
    }

    return <char>(0x61 + digit - 10);
}

function jsonAppendQuoted(output: char[], text: string): void {
    output.push(<char>0x22);
    const length = text.length;
    for (let i = 0; i < length; i++) {
        const c = <int>text[i];
        let escape = 0;
        switch (c) {
            case 0x22: escape = 0x22; break;
            case 0x5C: escape = 0x5C; break;
            case 0x08: escape = 0x62; break;
            case 0x0C: escape = 0x66; break;
            case 0x0A: escape = 0x6E; break;
            case 0x0D: escape = 0x72; break;
            case 0x09: escape = 0x74; break;
        }

        if (escape != 0) {
            output.push(<char>0x5C);
            output.push(<char>escape);
        } else if (c < 0x20) {
            jsonAppend(output, "\\u00");
            output.push(jsonHexDigit(c >> 4));
            output.push(jsonHexDigit(c & 15));
        } else {
            // the bytes of a character past ASCII go as they are: the text is UTF-8
            output.push(text[i]);
        }
    }

    output.push(<char>0x22);
}

// A JSON value. The compiler has no objects whose fields are found at run time, so `JSON.parse` gives
// one of these and its accessors take the place of `value.field`. What is asked of the wrong kind of
// value is a TypeError; a key or an index that is not there gives a JSON null (`has` tells them apart).
@final
export class JsonValue {
    private tag: int;
    private flag: boolean;
    private num: number;
    private str: string;
    private items: JsonValue[];
    private names: string[];
    // holds the JSON null `at` and `get` give for what is not there: under -mm=own what they return
    // is lent by this value, so a new one could not go back the same way
    private absent: JsonValue[];
    // For an object of JSON_INDEX_FROM members or more: an open-addressed table of the names, each
    // slot a name's position plus one, 0 an empty one. Empty for anything smaller. Not a Map: one
    // built into the library would be built again into a program that uses the same Map.
    private slots: int[];

    // JSON's null
    public constructor() {
        this.tag = JSON_NULL;
        this.flag = false;
        this.num = 0;
        this.str = "";
        this.items = [];
        this.names = [];
        this.absent = [];
        this.slots = [];
    }

    public static ofBoolean(value: boolean): JsonValue {
        const result = new JsonValue();
        result.tag = JSON_BOOLEAN;
        result.flag = value;
        return result;
    }

    public static ofNumber(value: number): JsonValue {
        const result = new JsonValue();
        result.tag = JSON_NUMBER;
        result.num = value;
        return result;
    }

    public static ofString(value: string): JsonValue {
        const result = new JsonValue();
        result.tag = JSON_STRING;
        result.str = value;
        return result;
    }

    public static newArray(): JsonValue {
        const result = new JsonValue();
        result.tag = JSON_ARRAY;
        return result;
    }

    public static newObject(): JsonValue {
        const result = new JsonValue();
        result.tag = JSON_OBJECT;
        return result;
    }

    // what JSON.parse does: a SyntaxError for what is not JSON
    public static parse(text: string): JsonValue {
        // a copy: under -mm=own the parser keeps what it is given, and this function only borrows it
        const parser = new JsonParser(text + "");
        return parser.parseDocument();
    }

    public get kind(): string {
        switch (this.tag) {
            case JSON_BOOLEAN: return "boolean";
            case JSON_NUMBER: return "number";
            case JSON_STRING: return "string";
            case JSON_ARRAY: return "array";
            case JSON_OBJECT: return "object";
        }

        return "null";
    }

    public isNull(): boolean {
        return this.tag == JSON_NULL;
    }

    public asBoolean(): boolean {
        this.expect(JSON_BOOLEAN, "boolean");
        return this.flag;
    }

    public asNumber(): number {
        this.expect(JSON_NUMBER, "number");
        return this.num;
    }

    public asString(): string {
        this.expect(JSON_STRING, "string");
        return this.str;
    }

    // how many elements an array has, or members an object has
    public get length(): int {
        this.expectContainer();
        return this.items.length;
    }

    // an array's element, or a JSON null past its end
    @lends("this")
    public at(position: int): JsonValue {
        this.expect(JSON_ARRAY, "array");
        if (position < 0 || position >= this.items.length) {
            return this.nothing();
        }

        return this.items[position];
    }

    // `this`: the object itself, so a chain from a new value is the caller's (own spec 78)
    @keeps("value")
    public push(value: JsonValue): this {
        this.expect(JSON_ARRAY, "array");
        this.items.push(value);
        return this;
    }

    // value["name"] and value[0] read through get(), value["name"] = member and value[0] = element
    // write through set()
    [key: number | string]: JsonValue;

    public has(key: string): boolean {
        this.expect(JSON_OBJECT, "object");
        return this.indexOf(key) >= 0;
    }

    // An object's member (a string key) or an array's element (a number), or a JSON null when there
    // is none.
    @lends("this")
    public get(key: number | string): JsonValue {
        let position = -1;
        if (typeof key == "number") {
            this.expect(JSON_ARRAY, "array");
            if (key >= 0 && key < this.items.length) {
                position = <int>key;
            }
        } else {
            this.expect(JSON_OBJECT, "object");
            position = this.indexOf(key);
        }

        if (position < 0) {
            return this.nothing();
        }

        return this.items[position];
    }

    // An object's member (a string key) or an array's element (a number). A key already there keeps
    // its place and takes the new value, and an element past an array's end leaves JSON nulls before
    // it, as in JavaScript.
    // `this`: the object itself, so a chain from a new value is the caller's (own spec 78)
    @keeps("value")
    public set(key: number | string, value: JsonValue): this {
        let position = -1;
        if (typeof key == "number") {
            this.expect(JSON_ARRAY, "array");
            if (key < 0) {
                throw new RangeError("JSON array index is negative");
            }

            position = <int>key;
            while (this.items.length < position) {
                this.items.push(new JsonValue());
            }

            if (position == this.items.length) {
                this.items.length = position + 1;
            }
        } else {
            this.expect(JSON_OBJECT, "object");
            position = this.indexOf(key);
            if (position < 0) {
                position = this.items.length;
                // a copy: only this path takes the key, and under -mm=own a parameter is taken on every path or none
                this.names.push(key + "");
                this.indexAdded(position);
                this.items.length = position + 1;
            }
        }

        // in one place, for the same reason
        this.items[position] = value;
        return this;
    }

    // A copy of the whole value, sharing nothing with it. JSON.stringify uses it under -mm=own, where a
    // JsonValue it is given is only lent to it.
    public clone(): JsonValue {
        const result = new JsonValue();
        result.tag = this.tag;
        result.flag = this.flag;
        result.num = this.num;
        result.str = this.str + "";
        for (const item of this.items) {
            result.items.push(item.clone());
        }

        for (const name of this.names) {
            result.names.push(name + "");
        }

        // the copy finds its names as this one does
        result.indexAdded(result.names.length - 1);
        return result;
    }

    // an object's keys, in their order
    public keys(): string[] {
        this.expect(JSON_OBJECT, "object");
        const result: string[] = [];
        for (const name of this.names) {
            result.push(name);
        }

        return result;
    }

    // the JSON text; `space` indents it, one per level
    public stringify(space = ""): string {
        const output: char[] = [];
        this.write(output, space, 0);
        output.push(<char>0);
        // a copy: output goes with this function
        return <string><Opaque>Ref(output[0]) + "";
    }

    public toString(): string {
        return this.stringify();
    }

    // Its text, as Date's toJSON is. JSON.stringify takes a JsonValue as it is and never calls this; a
    // result of JsonValue here would have it instantiate itself for the same type, which the compiler
    // cannot do.
    public toJSON(): string {
        return this.stringify();
    }

    @lends("this")
    private nothing(): JsonValue {
        if (this.absent.length == 0) {
            this.absent.push(new JsonValue());
        }

        return this.absent[0];
    }

    // Where the key is among the names, or -1. A few names are looked through; from JSON_INDEX_FROM
    // on they are found through `slots`, as looking through them for every member made reading an
    // object of n members cost n * n.
    private indexOf(key: string): int {
        const size: int = this.slots.length;
        if (size == 0) {
            const count: int = this.names.length;
            for (let i = 0; i < count; i++) {
                if (this.names[i] == key) return i;
            }

            return -1;
        }

        let slot: int = <int>(<uint>HashHelpers.hashCodeString(key) % <uint>size);
        while (true) {
            const at = this.slots[slot];
            if (at == 0) {
                return -1;
            }

            if (this.names[at - 1] == key) {
                return at - 1;
            }

            slot++;
            if (slot == size) {
                slot = 0;
            }
        }
    }

    // puts the name at `position` into the table, which has a free slot for it
    private addSlot(position: int): void {
        const size: int = this.slots.length;
        let slot: int = <int>(<uint>HashHelpers.hashCodeString(this.names[position]) % <uint>size);
        while (this.slots[slot] != 0) {
            slot++;
            if (slot == size) {
                slot = 0;
            }
        }

        this.slots[slot] = position + 1;
    }

    // Called once a name has been added at `position`. The table is made when there are
    // JSON_INDEX_FROM names, and again, twice the size, whenever it is half full: it then holds
    // every name, so indexOf only reads it.
    private indexAdded(position: int): void {
        const count: int = this.names.length;
        if (count < JSON_INDEX_FROM) {
            return;
        }

        if (this.slots.length >= count * 2) {
            this.addSlot(position);
            return;
        }

        const size: int = count * 4;
        let slots: int[] = [];
        slots.length = size;
        for (let i = 0; i < size; i++) {
            slots[i] = 0;
        }

        this.slots = slots;
        for (let i = 0; i < count; i++) {
            this.addSlot(i);
        }
    }

    private expect(tag: int, name: string): void {
        if (this.tag != tag) {
            throw new TypeError(`JSON value is not a ${name}`);
        }
    }

    private expectContainer(): void {
        if (this.tag != JSON_ARRAY && this.tag != JSON_OBJECT) {
            throw new TypeError("JSON value is not an array or an object");
        }
    }

    private write(output: char[], space: string, level: int): void {
        if (level > JSON_MAX_DEPTH) {
            throw new RangeError("JSON value is nested too deeply, or contains itself");
        }

        switch (this.tag) {
            case JSON_BOOLEAN:
                jsonAppend(output, this.flag ? "true" : "false");
                return;
            case JSON_NUMBER:
                // JavaScript's text for a number; JSON has no NaN or Infinity, and no -0
                if (!isFinite(this.num)) {
                    jsonAppend(output, "null");
                } else if (this.num == 0) {
                    jsonAppend(output, "0");
                } else {
                    jsonAppend(output, this.num.toString());
                }

                return;
            case JSON_STRING:
                jsonAppendQuoted(output, this.str);
                return;
            case JSON_ARRAY:
            case JSON_OBJECT:
                this.writeContainer(output, space, level);
                return;
        }

        jsonAppend(output, "null");
    }

    private writeContainer(output: char[], space: string, level: int): void {
        const isObject = this.tag == JSON_OBJECT;
        output.push(<char>(isObject ? 0x7B : 0x5B));
        const count = this.items.length;
        for (let i = 0; i < count; i++) {
            if (i > 0) {
                output.push(<char>0x2C);
            }

            jsonNewLine(output, space, level + 1);
            if (isObject) {
                jsonAppendQuoted(output, this.names[i]);
                output.push(<char>0x3A);
                if (space.length > 0) {
                    output.push(<char>0x20);
                }
            }

            this.items[i].write(output, space, level + 1);
        }

        if (count > 0) {
            jsonNewLine(output, space, level);
        }

        output.push(<char>(isObject ? 0x7D : 0x5D));
    }
}

// RFC 8259, as JSON.parse reads it: no comments, no trailing commas, whitespace only between tokens.
class JsonParser {
    private pos: int;
    private depth: int;
    private size: int;

    @keeps("text")
    public constructor(private text: string) {
        this.pos = 0;
        this.depth = 0;
        this.size = text.length;
    }

    public parseDocument(): JsonValue {
        this.skipSpace();
        const value = this.parseValue();
        this.skipSpace();
        if (this.pos != this.size) {
            this.fail();
        }

        return value;
    }

    private fail(): void {
        if (this.pos >= this.size) {
            throw new SyntaxError("Unexpected end of JSON input");
        }

        throw new SyntaxError(`Unexpected token in JSON at position ${this.pos}`);
    }

    // the byte at the position, or -1 at the end of the text
    private peek(): int {
        if (this.pos < this.size) {
            return <int>this.text[this.pos];
        }

        return -1;
    }

    private skipSpace(): void {
        let c = this.peek();
        while (c == 0x20 || c == 0x0A || c == 0x0D || c == 0x09) {
            this.pos++;
            c = this.peek();
        }
    }

    private parseValue(): JsonValue {
        const c = this.peek();
        if (c == 0x7B) return this.parseObject();
        if (c == 0x5B) return this.parseArray();
        if (c == 0x22) return JsonValue.ofString(this.parseString());
        if (c == 0x2D || this.isDigit(c)) return JsonValue.ofNumber(this.parseNumber());
        if (c == 0x74) {
            this.expectWord("true");
            return JsonValue.ofBoolean(true);
        }

        if (c == 0x66) {
            this.expectWord("false");
            return JsonValue.ofBoolean(false);
        }

        if (c == 0x6E) {
            this.expectWord("null");
            return new JsonValue();
        }

        this.fail();
        return new JsonValue();
    }

    private enter(): void {
        this.depth++;
        if (this.depth > JSON_MAX_DEPTH) {
            throw new RangeError("JSON text is nested too deeply");
        }
    }

    private parseArray(): JsonValue {
        this.enter();
        this.pos++;
        const result = JsonValue.newArray();
        this.skipSpace();
        if (this.peek() == 0x5D) {
            this.pos++;
            this.depth--;
            return result;
        }

        while (true) {
            this.skipSpace();
            result.push(this.parseValue());
            this.skipSpace();
            const c = this.peek();
            if (c == 0x2C) {
                this.pos++;
                continue;
            }

            if (c == 0x5D) {
                this.pos++;
                this.depth--;
                return result;
            }

            this.fail();
        }
    }

    private parseObject(): JsonValue {
        this.enter();
        this.pos++;
        const result = JsonValue.newObject();
        this.skipSpace();
        if (this.peek() == 0x7D) {
            this.pos++;
            this.depth--;
            return result;
        }

        while (true) {
            this.skipSpace();
            if (this.peek() != 0x22) {
                this.fail();
            }

            const key = this.parseString();
            this.skipSpace();
            if (this.peek() != 0x3A) {
                this.fail();
            }

            this.pos++;
            this.skipSpace();
            result.set(key, this.parseValue());
            this.skipSpace();
            const c = this.peek();
            if (c == 0x2C) {
                this.pos++;
                continue;
            }

            if (c == 0x7D) {
                this.pos++;
                this.depth--;
                return result;
            }

            this.fail();
        }
    }

    private expectWord(word: string): void {
        for (let i = 0; i < word.length; i++) {
            if (this.peek() != <int>word[i]) {
                this.fail();
            }

            this.pos++;
        }
    }

    private isDigit(c: int): boolean {
        return c >= 0x30 && c <= 0x39;
    }

    private digits(output: char[]): void {
        if (!this.isDigit(this.peek())) {
            this.fail();
        }

        while (this.isDigit(this.peek())) {
            output.push(<char>this.peek());
            this.pos++;
        }
    }

    private parseNumber(): number {
        const output: char[] = [];
        if (this.peek() == 0x2D) {
            output.push(<char>0x2D);
            this.pos++;
        }

        // a leading zero stands alone
        if (this.peek() == 0x30) {
            output.push(<char>0x30);
            this.pos++;
        } else {
            this.digits(output);
        }

        if (this.peek() == 0x2E) {
            output.push(<char>0x2E);
            this.pos++;
            this.digits(output);
        }

        if (this.peek() == 0x65 || this.peek() == 0x45) {
            output.push(<char>0x65);
            this.pos++;
            if (this.peek() == 0x2B || this.peek() == 0x2D) {
                output.push(<char>this.peek());
                this.pos++;
            }

            this.digits(output);
        }

        output.push(<char>0);
        return parseFloat(<string><Opaque>Ref(output[0]));
    }

    private parseHex4(): int {
        let code = 0;
        for (let i = 0; i < 4; i++) {
            const c = this.peek();
            let digit = -1;
            if (c >= 0x30 && c <= 0x39) {
                digit = c - 0x30;
            } else if (c >= 0x61 && c <= 0x66) {
                digit = c - 0x61 + 10;
            } else if (c >= 0x41 && c <= 0x46) {
                digit = c - 0x41 + 10;
            }

            if (digit < 0) {
                this.fail();
            }

            code = code * 16 + digit;
            this.pos++;
        }

        return code;
    }

    private appendCodePoint(output: char[], code: int): void {
        if (code < 0x80) {
            output.push(<char>code);
        } else if (code < 0x800) {
            output.push(<char>(0xC0 | (code >> 6)));
            output.push(<char>(0x80 | (code & 63)));
        } else if (code < 0x10000) {
            output.push(<char>(0xE0 | (code >> 12)));
            output.push(<char>(0x80 | ((code >> 6) & 63)));
            output.push(<char>(0x80 | (code & 63)));
        } else {
            output.push(<char>(0xF0 | (code >> 18)));
            output.push(<char>(0x80 | ((code >> 12) & 63)));
            output.push(<char>(0x80 | ((code >> 6) & 63)));
            output.push(<char>(0x80 | (code & 63)));
        }
    }

    // After the backslash-u of a code unit. A surrogate pair is one character; a surrogate alone has
    // no UTF-8 form and becomes U+FFFD. A string here ends at its first 0, so an escaped 0 would cut
    // it short without a word: that is an error instead.
    private parseUnicodeEscape(output: char[]): void {
        let code = this.parseHex4();
        if (code == 0) {
            throw new SyntaxError("\\u0000 in a JSON string is not supported: a string ends at its first 0");
        }

        if (code >= 0xD800 && code <= 0xDBFF) {
            const start = this.pos;
            let low = 0;
            if (this.peek() == 0x5C) {
                this.pos++;
                if (this.peek() == 0x75) {
                    this.pos++;
                    low = this.parseHex4();
                }
            }

            if (low >= 0xDC00 && low <= 0xDFFF) {
                code = 0x10000 + ((code - 0xD800) << 10) + (low - 0xDC00);
            } else {
                // what followed was not this one's other half: it is read again on its own
                this.pos = start;
                code = 0xFFFD;
            }
        } else if (code >= 0xDC00 && code <= 0xDFFF) {
            code = 0xFFFD;
        }

        this.appendCodePoint(output, code);
    }

    private parseEscape(output: char[]): void {
        const c = this.peek();
        let plain = -1;
        switch (c) {
            case 0x22: plain = 0x22; break;
            case 0x5C: plain = 0x5C; break;
            case 0x2F: plain = 0x2F; break;
            case 0x62: plain = 0x08; break;
            case 0x66: plain = 0x0C; break;
            case 0x6E: plain = 0x0A; break;
            case 0x72: plain = 0x0D; break;
            case 0x74: plain = 0x09; break;
        }

        if (plain >= 0) {
            output.push(<char>plain);
            this.pos++;
            return;
        }

        if (c == 0x75) {
            this.pos++;
            this.parseUnicodeEscape(output);
            return;
        }

        this.fail();
    }

    private parseString(): string {
        this.pos++;
        const output: char[] = [];
        while (true) {
            const c = this.peek();
            if (c < 0x20) {
                // the end of the text, or a control character, which JSON has only escaped
                this.fail();
            }

            this.pos++;
            if (c == 0x22) {
                break;
            }

            if (c == 0x5C) {
                this.parseEscape(output);
            } else {
                output.push(<char>c);
            }
        }

        output.push(<char>0);
        // a copy: output goes with this function
        return <string><Opaque>Ref(output[0]) + "";
    }
}

export namespace JSON {
    export function parse(text: string): JsonValue {
        return JsonValue.parse(text);
    }
}

export static class console {
    // The next line of stdin without its line break ("\n" or "\r\n"), or null at the end of input.
    // A last line with no line break is still a line. A member of console, not a global function:
    // a global readLine would clash with any program's own. See src/wrappers/io.cpp.
    public readLine(): string | null {
        const length = stdio_read_line();
        if (length < 0) return null;

        let buffer: char[] = [];
        buffer.length = length + 1;
        buffer[length] = <char>0;
        if (length > 0) stdio_line_copy_to(<string><Opaque>Ref(buffer[0]), length);
        // a copy: buffer goes with this function
        return <string><Opaque>Ref(buffer[0]) + "";
    }

    public assert(condition?: boolean, ...data: string[]): void {
        assert(condition || false, data.length > 0 ? data[0] : "");
    }

    public log(...data: string[]): void {
        this.printData(1, data);
    }

    public warn(...data: string[]): void {
        this.printData(2, data);
    }

    public error(...data: string[]): void {
        this.printData(2, data);
    }

    private printData(fileNo: int, data: string[]): void {
        switch (data.length) {
            case 0:
                break;
            default:
                this.print(fileNo, data[0]);
                for (let i = 1; i < data.length; i++) {
                    this.print(fileNo, " ");
                    this.print(fileNo, data[i]);
                }
        }

        this.print(fileNo, "\n");
    }

    private print(fileNo: int, data: string): void {
        // stdio_write, not write: going through stdio keeps this in the same buffer
        // as print()/assert(), which lower to puts(). See src/wrappers/io.cpp.
        stdio_write(fileNo, data, data.length);
    }
}

// Temporal, the ISO 8601 calendar's part of it: Duration, Instant, PlainDate, PlainTime,
// PlainDateTime and Now. Not here: ZonedDateTime, PlainYearMonth, PlainMonthDay, time zones other
// than UTC and the system's present offset, other calendars, and the options bags (largestUnit,
// smallestUnit, rounding, overflow). Where JavaScript takes options the default is used, and an
// overflowing day is constrained to the month's last. Instant.epochNanoseconds is a 64-bit bigint, so
// an Instant is between the years 1677 and 2262 when it is read that way.
// In each class the members lib.d.ts declares come first, in its order: a program calls them by
// their place in the class's table.
export namespace Temporal {
    const NS_PER_SECOND = 1000000000;
    const SECONDS_PER_DAY = 86400;

    // the units, largest first, as Duration's fields are
    const YEARS = 0;
    const MONTHS = 1;
    const WEEKS = 2;
    const DAYS = 3;
    const HOURS = 4;
    const MINUTES = 5;
    const SECONDS = 6;

    function isLeapYear(year: int): boolean {
        return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
    }

    function daysInMonthOf(year: int, month: int): int {
        if (month == 2) return isLeapYear(year) ? 29 : 28;
        if (month == 4 || month == 6 || month == 9 || month == 11) return 30;
        return 31;
    }

    // the days from 1970-01-01 to the date (H. Hinnant's days_from_civil)
    function epochDays(year: int, month: int, day: int): int {
        const y = month <= 2 ? year - 1 : year;
        const era = Math.floor(y / 400);
        const yoe = y - era * 400;
        const mp = (month + 9) % 12;
        const doy = Math.floor((153 * mp + 2) / 5) + day - 1;
        const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
        return <int>(era * 146097 + doe - 719468);
    }

    // the date that many days from 1970-01-01 (civil_from_days)
    function dateOfEpochDays(days: int): PlainDate {
        const z = days + 719468;
        const era = Math.floor(z / 146097);
        const doe = z - era * 146097;
        const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
        const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
        const mp = Math.floor((5 * doy + 2) / 153);
        const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
        const month = mp < 10 ? mp + 3 : mp - 9;
        const year = yoe + era * 400 + (month <= 2 ? 1 : 0);
        return new PlainDate(<int>year, <int>month, <int>day);
    }

    function pad(value: number, width: int): string {
        let text = "" + value;
        while (text.length < width) text = "0" + text;
        return text;
    }

    function yearText(year: int): string {
        if (year >= 0 && year <= 9999) return pad(year, 4);
        return (year < 0 ? "-" : "+") + pad(Math.abs(year), 6);
    }

    // the nine digits of a fraction of a second, its trailing zeros gone; "" for none
    function fractionText(nanoseconds: number): string {
        if (nanoseconds == 0) return "";
        let text = pad(nanoseconds, 9);
        while (text.endsWith("0")) text = text.substring(0, text.length - 1);
        return "." + text;
    }

    function timeText(hour: int, minute: int, second: int, nanoseconds: number): string {
        return pad(hour, 2) + ":" + pad(minute, 2) + ":" + pad(second, 2) + fractionText(nanoseconds);
    }

    function invalid(what: string): RangeError {
        return new RangeError("Invalid " + what);
    }

    // An ISO 8601 text, read one part at a time: each read throws a RangeError for what it cannot
    // read. `at` is where the next part starts.
    class IsoReader {
        public at = 0;

        constructor(public text: string) {
        }

        public get done(): boolean {
            return this.at >= this.text.length;
        }

        public peek(): int {
            return this.at < this.text.length ? this.text.charCodeAt(this.at) : -1;
        }

        public take(code: int): boolean {
            if (this.peek() == code) {
                this.at++;
                return true;
            }

            return false;
        }

        public digits(count: int): int {
            let value = 0;
            for (let i = 0; i < count; i++) {
                const c = this.peek();
                if (c < 48 || c > 57) throw invalid("ISO 8601 string: " + this.text);
                value = value * 10 + (c - 48);
                this.at++;
            }

            return value;
        }

        // YYYY-MM-DD, or ±YYYYYY-MM-DD
        public date(): int[] {
            let year: int;
            if (this.peek() == 43 || this.peek() == 45) {
                const negative = this.peek() == 45;
                this.at++;
                year = this.digits(6);
                if (negative) year = -year;
            } else {
                year = this.digits(4);
            }

            if (!this.take(45)) throw invalid("ISO 8601 date: " + this.text);
            const month = this.digits(2);
            if (!this.take(45)) throw invalid("ISO 8601 date: " + this.text);
            const day = this.digits(2);
            return [year, month, day];
        }

        // HH:MM[:SS[.fffffffff]]: hour, minute, second and the fraction in nanoseconds
        public time(): int[] {
            const hour = this.digits(2);
            if (!this.take(58)) throw invalid("ISO 8601 time: " + this.text);
            const minute = this.digits(2);
            let second = 0;
            let fraction = 0;
            if (this.take(58)) {
                second = this.digits(2);
                if (this.take(46) || this.take(44)) {
                    let count = 0;
                    while (count < 9 && this.peek() >= 48 && this.peek() <= 57) {
                        fraction = fraction * 10 + (this.peek() - 48);
                        this.at++;
                        count++;
                    }

                    if (count == 0) throw invalid("ISO 8601 time: " + this.text);
                    for (; count < 9; count++) fraction = fraction * 10;
                }
            }

            return [hour, minute, second, fraction];
        }

        // the date, then "T" or a space and the time when there is one
        public dateTime(): int[] {
            const date = this.date();
            let time = [0, 0, 0, 0];
            if (this.take(84) || this.take(116) || this.take(32)) {
                time = this.time();
            }

            return [date[0], date[1], date[2], time[0], time[1], time[2], time[3]];
        }

        // Z, or ±HH:MM: the offset from UTC in seconds
        public offset(): int {
            if (this.take(90) || this.take(122)) return 0;
            const c = this.peek();
            if (c != 43 && c != 45) throw invalid("ISO 8601 offset: " + this.text);
            this.at++;
            const hours = this.digits(2);
            this.take(58);
            const minutes = this.digits(2);
            const seconds = hours * 3600 + minutes * 60;
            return c == 45 ? -seconds : seconds;
        }

        public end(): void {
            // an annotation, as [u-ca=iso8601], is allowed and ignored
            if (this.peek() == 91) {
                const close = this.text.indexOf("]", this.at);
                if (close >= 0) this.at = close + 1;
            }

            if (!this.done) throw invalid("ISO 8601 string: " + this.text);
        }
    }

    function checkDate(year: int, month: int, day: int): void {
        if (month < 1 || month > 12 || day < 1 || day > daysInMonthOf(year, month)) {
            throw invalid("date: " + year + "-" + month + "-" + day);
        }
    }

    function checkTime(hour: int, minute: int, second: int, millisecond: int, microsecond: int, nanosecond: int): void {
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59
            || millisecond < 0 || millisecond > 999 || microsecond < 0 || microsecond > 999
            || nanosecond < 0 || nanosecond > 999) {
            throw invalid("time");
        }
    }

    // A span of seconds and the nanoseconds past them, the nanoseconds in [0, 1e9): exact over any
    // span a Duration can hold, where nanoseconds alone in a number lose digits past 104 days.
    class Span {
        constructor(public seconds: number, public nanoseconds: number) {
            const carry = Math.floor(this.nanoseconds / NS_PER_SECOND);
            this.seconds = this.seconds + carry;
            this.nanoseconds = this.nanoseconds - carry * NS_PER_SECOND;
        }

        public plus(other: Span): Span {
            return new Span(this.seconds + other.seconds, this.nanoseconds + other.nanoseconds);
        }

        public minus(other: Span): Span {
            return new Span(this.seconds - other.seconds, this.nanoseconds - other.nanoseconds);
        }

        public get sign(): int {
            if (this.seconds < 0) return -1;
            if (this.seconds > 0 || this.nanoseconds > 0) return 1;
            return 0;
        }

        public compare(other: Span): int {
            return this.minus(other).sign;
        }

        // as a Duration whose largest unit is `largest` (DAYS to SECONDS), each field with its sign
        public toDuration(largest: int): Duration {
            const sign = this.sign;
            let seconds = this.seconds;
            let nanoseconds = this.nanoseconds;
            if (sign < 0) {
                // the magnitude: -(seconds + nanoseconds / 1e9)
                seconds = -seconds;
                if (nanoseconds > 0) {
                    seconds = seconds - 1;
                    nanoseconds = NS_PER_SECOND - nanoseconds;
                }
            }

            let days = 0;
            let hours = 0;
            let minutes = 0;
            if (largest <= DAYS) {
                days = Math.floor(seconds / SECONDS_PER_DAY);
                seconds = seconds - days * SECONDS_PER_DAY;
            }

            if (largest <= HOURS) {
                hours = Math.floor(seconds / 3600);
                seconds = seconds - hours * 3600;
            }

            if (largest <= MINUTES) {
                minutes = Math.floor(seconds / 60);
                seconds = seconds - minutes * 60;
            }

            const milliseconds = Math.floor(nanoseconds / 1000000);
            const microseconds = Math.floor(nanoseconds / 1000) % 1000;
            const rest = nanoseconds % 1000;
            return new Duration(0, 0, 0, days * sign, hours * sign, minutes * sign, seconds * sign,
                milliseconds * sign, microseconds * sign, rest * sign);
        }
    }

    function unitOf(name: string): int {
        if (name == "year" || name == "years") return YEARS;
        if (name == "month" || name == "months") return MONTHS;
        if (name == "week" || name == "weeks") return WEEKS;
        if (name == "day" || name == "days") return DAYS;
        if (name == "hour" || name == "hours") return HOURS;
        if (name == "minute" || name == "minutes") return MINUTES;
        if (name == "second" || name == "seconds") return SECONDS;
        if (name == "millisecond" || name == "milliseconds") return 7;
        if (name == "microsecond" || name == "microseconds") return 8;
        if (name == "nanosecond" || name == "nanoseconds") return 9;
        throw invalid("unit: " + name);
    }

    // A length of time in years, months, weeks, days, hours, minutes, seconds, milliseconds,
    // microseconds and nanoseconds. Every field is a whole number, and none has a sign the others
    // do not. Without a date to count from (JavaScript's relativeTo, not here) a year, a month and a
    // week have no length, so add, subtract, compare and total refuse a Duration that has them, and a
    // day is 24 hours.
    @final
    export class Duration {
        private fields: number[];

        public constructor(years: number = 0, months: number = 0, weeks: number = 0, days: number = 0,
            hours: number = 0, minutes: number = 0, seconds: number = 0, milliseconds: number = 0,
            microseconds: number = 0, nanoseconds: number = 0) {
            const fields = [years, months, weeks, days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds];
            let sign = 0;
            for (let i = 0; i < 10; i++) {
                const v = fields[i];
                if (!isFinite(v) || Math.trunc(v) != v) {
                    throw invalid("duration: a field is not a whole number");
                }

                // -0 is 0
                if (v == 0) {
                    fields[i] = 0;
                    continue;
                }

                const s = v < 0 ? -1 : 1;
                if (sign != 0 && s != sign) {
                    throw invalid("duration: mixed signs");
                }

                sign = s;
            }

            this.fields = fields;
        }

        // P[nY][nM][nW][nD][T[nH][nM][n[.fffffffff]S]], with a sign before the P for a negative one
        public static from(text: string): Duration {
            const reader = new IsoReader(text);
            let sign = 1;
            if (reader.take(45)) {
                sign = -1;
            } else {
                reader.take(43);
            }

            if (!reader.take(80) && !reader.take(112)) throw invalid("ISO 8601 duration: " + text);
            const fields = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let inTime = false;
            let any = false;
            let last = -1;
            while (!reader.done) {
                if (reader.take(84) || reader.take(116)) {
                    if (inTime) throw invalid("ISO 8601 duration: " + text);
                    inTime = true;
                    continue;
                }

                let whole = 0;
                let digits = 0;
                while (reader.peek() >= 48 && reader.peek() <= 57) {
                    whole = whole * 10 + (reader.peek() - 48);
                    reader.at++;
                    digits++;
                }

                let fraction = 0;
                let fractionDigits = 0;
                if (reader.take(46) || reader.take(44)) {
                    while (reader.peek() >= 48 && reader.peek() <= 57) {
                        if (fractionDigits < 9) {
                            fraction = fraction * 10 + (reader.peek() - 48);
                            fractionDigits++;
                        }

                        reader.at++;
                    }
                }

                if (digits == 0) throw invalid("ISO 8601 duration: " + text);
                const designator = reader.peek() | 32;
                reader.at++;
                let unit = -1;
                if (!inTime && designator == 121) unit = YEARS;
                else if (!inTime && designator == 109) unit = MONTHS;
                else if (!inTime && designator == 119) unit = WEEKS;
                else if (!inTime && designator == 100) unit = DAYS;
                else if (inTime && designator == 104) unit = HOURS;
                else if (inTime && designator == 109) unit = MINUTES;
                else if (inTime && designator == 115) unit = SECONDS;
                if (unit < 0 || unit <= last) throw invalid("ISO 8601 duration: " + text);
                // only seconds take a fraction here
                if (fractionDigits > 0 && unit != SECONDS) throw invalid("ISO 8601 duration: " + text);
                fields[unit] = whole;
                if (unit == SECONDS) {
                    for (let i = fractionDigits; i < 9; i++) fraction = fraction * 10;
                    fields[7] = Math.floor(fraction / 1000000);
                    fields[8] = Math.floor(fraction / 1000) % 1000;
                    fields[9] = fraction % 1000;
                }

                last = unit;
                any = true;
            }

            if (!any) throw invalid("ISO 8601 duration: " + text);
            return new Duration(fields[0] * sign, fields[1] * sign, fields[2] * sign, fields[3] * sign,
                fields[4] * sign, fields[5] * sign, fields[6] * sign, fields[7] * sign, fields[8] * sign,
                fields[9] * sign);
        }

        // by length: a Duration with years, months or weeks has none, and is a RangeError
        public static compare(one: Duration, two: Duration): int {
            return one.span().compare(two.span());
        }

        public get years(): number { return this.fields[0]; }
        public get months(): number { return this.fields[1]; }
        public get weeks(): number { return this.fields[2]; }
        public get days(): number { return this.fields[3]; }
        public get hours(): number { return this.fields[4]; }
        public get minutes(): number { return this.fields[5]; }
        public get seconds(): number { return this.fields[6]; }
        public get milliseconds(): number { return this.fields[7]; }
        public get microseconds(): number { return this.fields[8]; }
        public get nanoseconds(): number { return this.fields[9]; }

        public get sign(): int {
            for (let i = 0; i < 10; i++) {
                if (this.fields[i] < 0) return -1;
                if (this.fields[i] > 0) return 1;
            }

            return 0;
        }

        public get blank(): boolean {
            return this.sign == 0;
        }

        public negated(): Duration {
            const f = this.fields;
            return new Duration(-f[0], -f[1], -f[2], -f[3], -f[4], -f[5], -f[6], -f[7], -f[8], -f[9]);
        }

        // a new Duration either way: under -mm=own one call cannot give back `this` or a new one
        public abs(): Duration {
            if (this.sign < 0) return this.negated();
            const f = this.fields;
            return new Duration(f[0], f[1], f[2], f[3], f[4], f[5], f[6], f[7], f[8], f[9]);
        }

        // the sum, in the larger of the two largest units
        public add(other: Duration): Duration {
            const largest = this.largestUnit() < other.largestUnit() ? this.largestUnit() : other.largestUnit();
            return this.span().plus(other.span()).toDuration(largest < DAYS ? DAYS : largest);
        }

        public subtract(other: Duration): Duration {
            return this.add(other.negated());
        }

        // the length in `unit`, from "day" to "nanosecond", fraction and all
        public total(unit: string): number {
            const u = unitOf(unit);
            if (u < DAYS) throw new RangeError("A year, month or week has no length without a date to count from");
            const span = this.span();
            const perUnit = [SECONDS_PER_DAY, 3600, 60, 1, 0.001, 0.000001, 0.000000001];
            return (span.seconds + span.nanoseconds / NS_PER_SECOND) / perUnit[u - DAYS];
        }

        public toString(): string {
            const sign = this.sign;
            if (sign == 0) return "PT0S";
            const f = this.abs().fields;
            let text: string = sign < 0 ? "-P" : "P";
            if (f[0] != 0) text += f[0] + "Y";
            if (f[1] != 0) text += f[1] + "M";
            if (f[2] != 0) text += f[2] + "W";
            if (f[3] != 0) text += f[3] + "D";
            // the parts of a second go into the seconds, as JavaScript writes them
            const subsecond = new Span(f[6], f[7] * 1000000 + f[8] * 1000 + f[9]);
            const hasSeconds = subsecond.seconds != 0 || subsecond.nanoseconds != 0;
            if (f[4] != 0 || f[5] != 0 || hasSeconds) {
                text += "T";
                if (f[4] != 0) text += f[4] + "H";
                if (f[5] != 0) text += f[5] + "M";
                if (hasSeconds) text += subsecond.seconds + fractionText(subsecond.nanoseconds) + "S";
            }

            return text;
        }

        public toJSON(): string {
            return this.toString();
        }

        // for the classes here: the fields as they are
        public __field(index: int): number {
            return this.fields[index];
        }

        // years, months and weeks refused; a day is 24 hours
        private span(): Span {
            const f = this.fields;
            if (f[0] != 0 || f[1] != 0 || f[2] != 0) {
                throw new RangeError("A year, month or week has no length without a date to count from");
            }

            return new Span(f[3] * SECONDS_PER_DAY + f[4] * 3600 + f[5] * 60 + f[6], f[7] * 1000000 + f[8] * 1000 + f[9]);
        }

        // the index of the first field that is not 0; SECONDS when only parts of a second are
        private largestUnit(): int {
            for (let i = 0; i < 10; i++) {
                if (this.fields[i] != 0) return i < SECONDS ? i : SECONDS;
            }

            return SECONDS;
        }

    }

    // A point in time, to the nanosecond, with no calendar and no time zone: kept as the seconds
    // from 1970-01-01T00:00:00Z and the nanoseconds past them.
    @final
    export class Instant {
        private epochSeconds: number;
        private nanos: number;

        // nanoseconds from 1970-01-01T00:00:00Z
        public constructor(epochNanoseconds: bigint) {
            // in 64 bits throughout: a bigint times an int is an int here
            const billion: bigint = NS_PER_SECOND;
            const rest: bigint = epochNanoseconds % billion;
            const whole: bigint = (epochNanoseconds - rest) / billion;
            const span = new Span(0, rest);
            this.epochSeconds = whole + span.seconds;
            this.nanos = span.nanoseconds;
        }

        public static fromEpochMilliseconds(epochMilliseconds: number): Instant {
            if (!isFinite(epochMilliseconds) || Math.trunc(epochMilliseconds) != epochMilliseconds) {
                throw invalid("epoch milliseconds");
            }

            return Instant.ofSpan(new Span(0, (epochMilliseconds % 1000) * 1000000).plus(new Span(Math.trunc(epochMilliseconds / 1000), 0)));
        }

        public static fromEpochNanoseconds(epochNanoseconds: bigint): Instant {
            return new Instant(epochNanoseconds);
        }

        // a date and time with Z or an offset, as 2024-03-15T12:30:00Z or 2024-03-15T14:30+02:00
        public static from(text: string): Instant {
            const reader = new IsoReader(text);
            const p = reader.dateTime();
            const offset = reader.offset();
            reader.end();
            checkDate(p[0], p[1], p[2]);
            checkTime(p[3], p[4], p[5], 0, 0, 0);
            const seconds = epochDays(p[0], p[1], p[2]) * SECONDS_PER_DAY + p[3] * 3600 + p[4] * 60 + p[5] - offset;
            return Instant.ofSpan(new Span(seconds, p[6]));
        }

        public static compare(one: Instant, two: Instant): int {
            return one.span().compare(two.span());
        }

        public get epochMilliseconds(): number {
            return this.epochSeconds * 1000 + Math.floor(this.nanos / 1000000);
        }

        public get epochNanoseconds(): bigint {
            const billion: bigint = NS_PER_SECOND;
            const seconds: bigint = this.epochSeconds;
            const nanos: bigint = this.nanos;
            return seconds * billion + nanos;
        }

        // hours and smaller only: a day is not always 24 hours, so days and larger are a RangeError
        public add(duration: Duration): Instant {
            if (duration.__field(YEARS) != 0 || duration.__field(MONTHS) != 0 || duration.__field(WEEKS) != 0
                || duration.__field(DAYS) != 0) {
                throw new RangeError("An Instant takes hours and smaller units only");
            }

            return Instant.ofSpan(this.span().plus(Instant.spanOf(duration)));
        }

        public subtract(duration: Duration): Instant {
            return this.add(duration.negated());
        }

        // from this one to `other`, in seconds and smaller
        public until(other: Instant): Duration {
            return other.span().minus(this.span()).toDuration(SECONDS);
        }

        public since(other: Instant): Duration {
            return this.span().minus(other.span()).toDuration(SECONDS);
        }

        public equals(other: Instant): boolean {
            return this.epochSeconds == other.epochSeconds && this.nanos == other.nanos;
        }

        // in UTC, as 2024-03-15T12:30:00.5Z
        public toString(): string {
            const days = Math.floor(this.epochSeconds / SECONDS_PER_DAY);
            const rest = this.epochSeconds - days * SECONDS_PER_DAY;
            const date = dateOfEpochDays(<int>days);
            return date.toString() + "T" + timeText(<int>Math.floor(rest / 3600), <int>(Math.floor(rest / 60) % 60), <int>(rest % 60), this.nanos) + "Z";
        }

        public toJSON(): string {
            return this.toString();
        }

        private span(): Span {
            return new Span(this.epochSeconds, this.nanos);
        }

        private static ofSpan(span: Span): Instant {
            const instant = new Instant(0);
            instant.epochSeconds = span.seconds;
            instant.nanos = span.nanoseconds;
            return instant;
        }

        private static spanOf(duration: Duration): Span {
            return new Span(duration.__field(HOURS) * 3600 + duration.__field(MINUTES) * 60 + duration.__field(SECONDS),
                duration.__field(7) * 1000000 + duration.__field(8) * 1000 + duration.__field(9));
        }
    }

    // A date in the ISO 8601 calendar, with no time and no time zone.
    @final
    export class PlainDate {
        private isoYear: int;
        private isoMonth: int;
        private isoDay: int;

        public constructor(year: int, month: int, day: int) {
            checkDate(year, month, day);
            this.isoYear = year;
            this.isoMonth = month;
            this.isoDay = day;
        }

        // YYYY-MM-DD; the time of a date and time is ignored
        public static from(text: string): PlainDate {
            const reader = new IsoReader(text);
            const p = reader.dateTime();
            if (reader.peek() == 90 || reader.peek() == 122) throw invalid("PlainDate string: " + text);
            reader.end();
            return new PlainDate(p[0], p[1], p[2]);
        }

        public static compare(one: PlainDate, two: PlainDate): int {
            const d = one.__epochDays() - two.__epochDays();
            return d < 0 ? -1 : d > 0 ? 1 : 0;
        }

        public get year(): int { return this.isoYear; }
        public get month(): int { return this.isoMonth; }
        public get day(): int { return this.isoDay; }

        public get monthCode(): string {
            return "M" + pad(this.isoMonth, 2);
        }

        public get calendarId(): string {
            return "iso8601";
        }

        // 1 for Monday to 7 for Sunday
        public get dayOfWeek(): int {
            const d = (this.__epochDays() + 3) % 7;
            return <int>(d < 0 ? d + 8 : d + 1);
        }

        public get dayOfYear(): int {
            return this.__epochDays() - epochDays(this.isoYear, 1, 1) + 1;
        }

        public get daysInMonth(): int {
            return daysInMonthOf(this.isoYear, this.isoMonth);
        }

        public get daysInYear(): int {
            return isLeapYear(this.isoYear) ? 366 : 365;
        }

        public get daysInWeek(): int {
            return 7;
        }

        public get monthsInYear(): int {
            return 12;
        }

        public get inLeapYear(): boolean {
            return isLeapYear(this.isoYear);
        }

        // Years and months first, a day past the month's end moved back to its last, then weeks and
        // days; whole days of the time units count too, and the rest of them is dropped.
        public add(duration: Duration): PlainDate {
            let year = this.isoYear + duration.__field(YEARS);
            let month = this.isoMonth + duration.__field(MONTHS);
            year = year + Math.floor((month - 1) / 12);
            month = ((month - 1) % 12 + 12) % 12 + 1;
            let day = this.isoDay;
            const last = daysInMonthOf(<int>year, <int>month);
            if (day > last) day = last;
            const timeSeconds = duration.__field(HOURS) * 3600 + duration.__field(MINUTES) * 60 + duration.__field(SECONDS)
                + Math.trunc((duration.__field(7) * 1000000 + duration.__field(8) * 1000 + duration.__field(9)) / NS_PER_SECOND);
            const days = duration.__field(WEEKS) * 7 + duration.__field(DAYS) + Math.trunc(timeSeconds / SECONDS_PER_DAY);
            return dateOfEpochDays(<int>(epochDays(<int>year, <int>month, day) + days));
        }

        public subtract(duration: Duration): PlainDate {
            return this.add(duration.negated());
        }

        // from this date to `other`, in days
        public until(other: PlainDate): Duration {
            return new Duration(0, 0, 0, other.__epochDays() - this.__epochDays());
        }

        public since(other: PlainDate): Duration {
            return new Duration(0, 0, 0, this.__epochDays() - other.__epochDays());
        }

        // a copy with the fields given replaced
        public with(fields: { year?: int, month?: int, day?: int }): PlainDate {
            const year = fields.year != undefined ? fields.year : this.isoYear;
            const month = fields.month != undefined ? fields.month : this.isoMonth;
            let day = fields.day != undefined ? fields.day : this.isoDay;
            if (month >= 1 && month <= 12 && day > daysInMonthOf(year, month)) day = daysInMonthOf(year, month);
            return new PlainDate(year, month, day);
        }

        public equals(other: PlainDate): boolean {
            return this.isoYear == other.isoYear && this.isoMonth == other.isoMonth && this.isoDay == other.isoDay;
        }

        public toPlainDateTime(time?: PlainTime): PlainDateTime {
            if (time == undefined) {
                return new PlainDateTime(this.isoYear, this.isoMonth, this.isoDay);
            }

            return new PlainDateTime(this.isoYear, this.isoMonth, this.isoDay, time.hour, time.minute, time.second,
                time.millisecond, time.microsecond, time.nanosecond);
        }

        public toString(): string {
            return yearText(this.isoYear) + "-" + pad(this.isoMonth, 2) + "-" + pad(this.isoDay, 2);
        }

        public toJSON(): string {
            return this.toString();
        }

        // for the classes here: the days from 1970-01-01
        public __epochDays(): int {
            return epochDays(this.isoYear, this.isoMonth, this.isoDay);
        }
    }

    // A time of day, to the nanosecond, with no date and no time zone.
    @final
    export class PlainTime {
        private parts: int[];

        public constructor(hour = 0, minute = 0, second = 0, millisecond = 0, microsecond = 0, nanosecond = 0) {
            checkTime(hour, minute, second, millisecond, microsecond, nanosecond);
            this.parts = [hour, minute, second, millisecond, microsecond, nanosecond];
        }

        // HH:MM[:SS[.fffffffff]], alone or after a date and "T"
        public static from(text: string): PlainTime {
            const reader = new IsoReader(text);
            let p: int[];
            if (text.length > 2 && text.charCodeAt(2) == 58) {
                p = reader.time();
            } else {
                const all = reader.dateTime();
                p = [all[3], all[4], all[5], all[6]];
            }

            reader.end();
            return new PlainTime(p[0], p[1], p[2], <int>Math.floor(p[3] / 1000000), <int>(Math.floor(p[3] / 1000) % 1000), p[3] % 1000);
        }

        public static compare(one: PlainTime, two: PlainTime): int {
            return spanOfTime(one).compare(spanOfTime(two));
        }

        public get hour(): int { return this.parts[0]; }
        public get minute(): int { return this.parts[1]; }
        public get second(): int { return this.parts[2]; }
        public get millisecond(): int { return this.parts[3]; }
        public get microsecond(): int { return this.parts[4]; }
        public get nanosecond(): int { return this.parts[5]; }

        // around the clock: what passes midnight starts the day again
        public add(duration: Duration): PlainTime {
            const span = spanOfTime(this).plus(new Span(duration.__field(DAYS) * SECONDS_PER_DAY + duration.__field(HOURS) * 3600
                + duration.__field(MINUTES) * 60 + duration.__field(SECONDS),
                duration.__field(7) * 1000000 + duration.__field(8) * 1000 + duration.__field(9)));
            const seconds = span.seconds - Math.floor(span.seconds / SECONDS_PER_DAY) * SECONDS_PER_DAY;
            return PlainTime.ofSpan(new Span(seconds, span.nanoseconds));
        }

        public subtract(duration: Duration): PlainTime {
            return this.add(duration.negated());
        }

        // from this time to `other`, in hours and smaller
        public until(other: PlainTime): Duration {
            return spanOfTime(other).minus(spanOfTime(this)).toDuration(HOURS);
        }

        public since(other: PlainTime): Duration {
            return spanOfTime(this).minus(spanOfTime(other)).toDuration(HOURS);
        }

        // a copy with the fields given replaced
        public with(fields: { hour?: int, minute?: int, second?: int, millisecond?: int, microsecond?: int, nanosecond?: int }): PlainTime {
            return new PlainTime(
                fields.hour != undefined ? fields.hour : this.parts[0],
                fields.minute != undefined ? fields.minute : this.parts[1],
                fields.second != undefined ? fields.second : this.parts[2],
                fields.millisecond != undefined ? fields.millisecond : this.parts[3],
                fields.microsecond != undefined ? fields.microsecond : this.parts[4],
                fields.nanosecond != undefined ? fields.nanosecond : this.parts[5]);
        }

        public equals(other: PlainTime): boolean {
            return PlainTime.compare(this, other) == 0;
        }

        public toString(): string {
            const p = this.parts;
            return timeText(p[0], p[1], p[2], p[3] * 1000000 + p[4] * 1000 + p[5]);
        }

        public toJSON(): string {
            return this.toString();
        }

        private static ofSpan(span: Span): PlainTime {
            const s = span.seconds;
            const n = span.nanoseconds;
            return new PlainTime(<int>Math.floor(s / 3600), <int>(Math.floor(s / 60) % 60), <int>(s % 60),
                <int>Math.floor(n / 1000000), <int>(Math.floor(n / 1000) % 1000), <int>(n % 1000));
        }
    }

    // the seconds since midnight and the nanoseconds past them
    function spanOfTime(time: PlainTime): Span {
        return new Span(time.hour * 3600 + time.minute * 60 + time.second,
            time.millisecond * 1000000 + time.microsecond * 1000 + time.nanosecond);
    }

    // A date and a time of day in the ISO 8601 calendar, with no time zone.
    @final
    export class PlainDateTime {
        private date: PlainDate;
        private time: PlainTime;

        public constructor(year: int, month: int, day: int, hour = 0, minute = 0, second = 0, millisecond = 0,
            microsecond = 0, nanosecond = 0) {
            this.date = new PlainDate(year, month, day);
            this.time = new PlainTime(hour, minute, second, millisecond, microsecond, nanosecond);
        }

        // YYYY-MM-DD[THH:MM[:SS[.fffffffff]]]
        public static from(text: string): PlainDateTime {
            const reader = new IsoReader(text);
            const p = reader.dateTime();
            if (reader.peek() == 90 || reader.peek() == 122) throw invalid("PlainDateTime string: " + text);
            reader.end();
            return new PlainDateTime(p[0], p[1], p[2], p[3], p[4], p[5], <int>Math.floor(p[6] / 1000000),
                <int>(Math.floor(p[6] / 1000) % 1000), p[6] % 1000);
        }

        public static compare(one: PlainDateTime, two: PlainDateTime): int {
            return one.span().compare(two.span());
        }

        public get year(): int { return this.date.year; }
        public get month(): int { return this.date.month; }
        public get day(): int { return this.date.day; }
        public get hour(): int { return this.time.hour; }
        public get minute(): int { return this.time.minute; }
        public get second(): int { return this.time.second; }
        public get millisecond(): int { return this.time.millisecond; }
        public get microsecond(): int { return this.time.microsecond; }
        public get nanosecond(): int { return this.time.nanosecond; }
        public get monthCode(): string { return this.date.monthCode; }
        public get calendarId(): string { return "iso8601"; }
        public get dayOfWeek(): int { return this.date.dayOfWeek; }
        public get dayOfYear(): int { return this.date.dayOfYear; }
        public get daysInMonth(): int { return this.date.daysInMonth; }
        public get daysInYear(): int { return this.date.daysInYear; }
        public get inLeapYear(): boolean { return this.date.inLeapYear; }

        // the time units first, whole days of them carried into the date, then the date's
        public add(duration: Duration): PlainDateTime {
            const time = spanOfTime(this.time).plus(new Span(duration.__field(HOURS) * 3600 + duration.__field(MINUTES) * 60
                + duration.__field(SECONDS), duration.__field(7) * 1000000 + duration.__field(8) * 1000 + duration.__field(9)));
            const carry = Math.floor(time.seconds / SECONDS_PER_DAY);
            const date = this.date.add(new Duration(duration.__field(YEARS), duration.__field(MONTHS), duration.__field(WEEKS),
                duration.__field(DAYS) + carry));
            return PlainDateTime.of(date, new Span(time.seconds - carry * SECONDS_PER_DAY, time.nanoseconds));
        }

        public subtract(duration: Duration): PlainDateTime {
            return this.add(duration.negated());
        }

        // from this one to `other`, in days and smaller
        public until(other: PlainDateTime): Duration {
            return other.span().minus(this.span()).toDuration(DAYS);
        }

        public since(other: PlainDateTime): Duration {
            return this.span().minus(other.span()).toDuration(DAYS);
        }

        // a copy with the fields given replaced
        public with(fields: { year?: int, month?: int, day?: int, hour?: int, minute?: int, second?: int,
            millisecond?: int, microsecond?: int, nanosecond?: int }): PlainDateTime {
            const year = fields.year != undefined ? fields.year : this.date.year;
            const month = fields.month != undefined ? fields.month : this.date.month;
            let day = fields.day != undefined ? fields.day : this.date.day;
            if (month >= 1 && month <= 12 && day > daysInMonthOf(year, month)) day = daysInMonthOf(year, month);
            return new PlainDateTime(year, month, day,
                fields.hour != undefined ? fields.hour : this.time.hour,
                fields.minute != undefined ? fields.minute : this.time.minute,
                fields.second != undefined ? fields.second : this.time.second,
                fields.millisecond != undefined ? fields.millisecond : this.time.millisecond,
                fields.microsecond != undefined ? fields.microsecond : this.time.microsecond,
                fields.nanosecond != undefined ? fields.nanosecond : this.time.nanosecond);
        }

        public equals(other: PlainDateTime): boolean {
            return this.date.equals(other.date) && this.time.equals(other.time);
        }

        public toPlainDate(): PlainDate {
            return new PlainDate(this.date.year, this.date.month, this.date.day);
        }

        public toPlainTime(): PlainTime {
            return new PlainTime(this.time.hour, this.time.minute, this.time.second, this.time.millisecond,
                this.time.microsecond, this.time.nanosecond);
        }

        public toString(): string {
            return this.date.toString() + "T" + this.time.toString();
        }

        public toJSON(): string {
            return this.toString();
        }

        // the seconds from 1970-01-01T00:00 and the nanoseconds past them
        private span(): Span {
            const time = spanOfTime(this.time);
            return new Span(this.date.__epochDays() * SECONDS_PER_DAY + time.seconds, time.nanoseconds);
        }

        private static of(date: PlainDate, time: Span): PlainDateTime {
            const s = time.seconds;
            const n = time.nanoseconds;
            return new PlainDateTime(date.year, date.month, date.day, <int>Math.floor(s / 3600), <int>(Math.floor(s / 60) % 60),
                <int>(s % 60), <int>Math.floor(n / 1000000), <int>(Math.floor(n / 1000) % 1000), <int>(n % 1000));
        }
    }

    // the present, to the millisecond, as the system's clock gives it; the plain ones at the system's
    // present offset from UTC
    export namespace Now {
        export function instant(): Temporal.Instant {
            return Temporal.Instant.fromEpochMilliseconds(Date.now());
        }

        export function plainDateTimeISO(): Temporal.PlainDateTime {
            const now = Date.now();
            const local = now - new Date(now).getTimezoneOffset() * 60000;
            const days = Math.floor(local / 86400000);
            const ms = local - days * 86400000;
            const date = new Temporal.PlainDate(1970, 1, 1).add(new Temporal.Duration(0, 0, 0, days));
            return date.toPlainDateTime(new Temporal.PlainTime(<int>Math.floor(ms / 3600000),
                <int>(Math.floor(ms / 60000) % 60), <int>(Math.floor(ms / 1000) % 60), <int>(ms % 1000)));
        }

        export function plainDateISO(): Temporal.PlainDate {
            return plainDateTimeISO().toPlainDate();
        }

        export function plainTimeISO(): Temporal.PlainTime {
            return plainDateTimeISO().toPlainTime();
        }
    }
}
