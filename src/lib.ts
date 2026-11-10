/// <reference path="types/lib.types.d.ts" />
/// <reference path="native/lib.native.d.ts" />
/// <reference path="core/core.os.d.ts" />
/// <reference path="core/core.ts" />
/// <reference path="generics/lib.generics.ts" />

// @strict-null false

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
    constructor(private match: Opaque | null = null, private lastIndex: index = 0) {
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
    private indices_: MatchIndicesResults = null;

    constructor(private match: Opaque | null = null, private hasIndices = false, private lastIndex: index = 0) {
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

    search(s: string): int {
        const r = regexp_test(this.source, this.flags, s);
        return r > 0 ? r - 1 : r;
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
        if (index < 0) {
            if (-this.length <= index) {
                index = index + this.length;
            } else if (index < -this.length) {
                index = 0;
            }
        } else if (index >= this.length) {
            return <char>0;
        }

        return this[index];
    }    

    function clone(this: string, add = "", right = false): string {
        return right ? add + this : this + add; // to clone string
    }

    function resize(this: string, newSize: index): string {
        this.length = newSize + 1;
        this[newSize] = null;
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

    export function match(this: string, expr: RegExp): string[] {
        if (!expr.global)
        {
            const result = expr.exec(this);
            if (result != null)
            {
                return [...result];
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
        for (let i = 0; i < addSize; i++) {
            newPadString[i] = padString[padStringIndex++];
            if (padStringIndex >= padString.length) {
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

    export function slice(this: string, indexStart: int, indexEnd: int = this.length): string {

        if (indexStart < 0) {
            if (-this.length <= indexStart) {
                indexStart = indexStart + this.length;
            } else if (indexStart < -this.length) {
                indexStart = 0;
            }
        } else if (indexStart >= this.length) {
            return "";
        }

        if (indexEnd < 0) {
            if (-this.length <= indexEnd) {
                indexEnd = indexEnd + this.length;
            } else if (indexEnd < -this.length) {
                indexEnd = 0;
            }
        } else if (indexEnd >= this.length) {
            indexEnd = this.length;
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
        if (indexStart < 0) {
            indexStart = 0;
        } else if (indexStart >= this.length) {
            indexStart = this.length;
        }

        if (indexEnd < 0) {
            indexEnd = 0;
        } else if (indexEnd >= this.length) {
            indexEnd = this.length;
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
        for (let i = 0; i < this.length; i++) lower[i] = tolower(this[i]);
        setlocale (LC_COLLATE, "");   
        return lower;
    }

    export function toLocaleUpperCase(this: string, locale = ""): string {
        setlocale (LC_COLLATE, locale); 
        const upper = this.clone();
        for (let i = 0; i < this.length; i++) upper[i] = toupper(this[i]);
        setlocale (LC_COLLATE, "");   
        return upper;
    }

    export function toLowerCase(this: string): string {
        const lower = this.clone();
        for (let i = 0; i < this.length; i++) lower[i] = tolower(this[i]);
        return lower;
    }

    export function toString(this: string): string {
        return this;
    }

    export function toUpperCase(this: string): string {
        const upper = this.clone();
        for (let i = 0; i < this.length; i++) upper[i] = toupper(this[i]);
        return upper;
    }

    export function toWellFormed(this: string): string {
        // TODO: finish it
        return this;
    }    

    // the first character that is not a space, or the length when every one is
    function trimmedStart(this: string): int {
        for (let i: int = 0; i < this.length; i++) {
            if (!isspace(this[i])) return i;
        }

        return this.length;
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

    public match(expr: RegExp): string[] {
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

    public slice(indexStart: int, indexEnd?: int): string {
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
        let m = Number.NEGATIVE_INFINITY;
        for (const v of values) {
            if (isNaN(v)) return Number.NaN;
            if (v > m) m = v;
        }

        return m;
    }

    /**
     * Returns the smaller of a set of supplied numeric expressions.
     * @param values Numeric expressions to be evaluated.
     */
    public min(...values: number[]): number {
        // +Infinity, not Number.MAX_VALUE, so that Math.min() and Math.min(Infinity) are Infinity
        let m = Number.POSITIVE_INFINITY;
        for (const v of values) {
            if (isNaN(v)) return Number.NaN;
            if (v < m) m = v;
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
        return rand() / <number>2147483647;
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
        if (options != undefined && options.maxByteLength != undefined) {
            this.maxByteLength = options.maxByteLength;
            this.states |= States.HasMaxByteLength;
        }

        if (length > 0) {
            let buffer : char[] = [];
            buffer.length = length;            
            this.arrayOfView = buffer;
        }
    }

    public get resizable() {
        return (this.states & States.NonResizable) != States.NonResizable;
    }

    public get detached() {
        return (this.states & States.Detached) == States.Detached;
    }

    public static isView(arrayBuffer: ArrayBuffer) {
        return (arrayBuffer.states & States.View) == States.View;
    }

    public resize(newLength: int) {
        this.arrayOfView.length = newLength;
    }

    public slice(start = 0, end = this.arrayOfView.length) {
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
        newArrayBuffer.states = this.states | States.NonResizable;
        newArrayBuffer.maxByteLength = this.maxByteLength;
        newArrayBuffer.arrayOfView = this.copyOf(start, end);
        return newArrayBuffer;
    }

    // TODO: newByteLength is not used
    public transfer(newByteLength?: int) {
        const newArrayBuffer = new ArrayBuffer(0);
        newArrayBuffer.states = this.states;
        newArrayBuffer.maxByteLength = this.maxByteLength;
        if (this.arrayOfView != null) {
            newArrayBuffer.arrayOfView = this.copyOf(0, this.arrayOfView.length);
        }

        this.detach();
        return newArrayBuffer;
    }

    public transferToFixedLength(newByteLength?: int) {
        const newArrayBuffer = this.transfer(newByteLength);
        newArrayBuffer.states |= States.NonResizable;
        return newArrayBuffer;
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

    private detach() {
        this.states |= States.Detached;
        this.arrayOfView = null;
    }

    // the assignment releases the bytes under rc and own, and leaves them to the collector under gc
    [Symbol.dispose]() {
        if (this.arrayOfView != null && !this.detached) {
            this.arrayOfView = null;
        }
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

    private key(name: string): string {
        return name.toLowerCase();
    }

    private indexOf(key: string): int {
        for (let i = 0; i < this.names.length; i++) {
            if (this.names[i] == key) return i;
        }

        return -1;
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

    get(name: string): string {
        const i = this.indexOf(this.key(name));
        return i != -1 ? this.values[i] : null;
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
    headersBuffer[headersLen] = null;
    if (headersLen > 0) http_response_headers_copy_to(r, <string><Opaque>Ref(headersBuffer[0]), headersLen);
    const headers = Headers.parse(<string><Opaque>Ref(headersBuffer[0]));

    const bodyLen = http_response_body_length(r);
    let bodyBuffer: char[] = [];
    bodyBuffer.length = bodyLen + 1;
    bodyBuffer[bodyLen] = null;
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

function jsonAppend(output: char[], text: string): void {
    for (let i = 0; i < text.length; i++) {
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
    for (let i = 0; i < text.length; i++) {
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

    // JSON's null
    public constructor() {
        this.tag = JSON_NULL;
        this.flag = false;
        this.num = 0;
        this.str = "";
        this.items = [];
        this.names = [];
        this.absent = [];
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

    private indexOf(key: string): int {
        for (let i = 0; i < this.names.length; i++) {
            if (this.names[i] == key) return i;
        }

        return -1;
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
        buffer[length] = null;
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
