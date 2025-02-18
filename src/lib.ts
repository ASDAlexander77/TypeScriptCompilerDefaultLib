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
    function toString(this: boolean) {
        return <string>this;
    }    
}

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

    function toExponential(this: number, fractionDigits = 0) {
        return convertNumber(50, `%.${fractionDigits}e`, this);
    }

    function toFixed(this: number, digits = 0) {
        return convertNumber(50, `%.${digits}f`, this);
    }

    function toPrecision(this: number, precision = 0) {
        return convertNumber(50, `%.${precision}g`, this);
    }

    function toString(this: number, radix = 10) {
        switch (radix) {
            case 16:
                return convertNumber(50, "%a", this);
            default:
                return <string>this;
        }
    }
}

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
        this.value.toString(radix);
    }

    public valueOf() {
        return this.value;
    }
}

namespace __BigInt {
    
    function toLocaleString(this: bigint, locale = "") {
        setlocale (LC_COLLATE, locale);        
        const result = convertNumber(50, "%a", this);
        setlocale (LC_COLLATE, "");        
        return result;
    }  

    function toString(this: bigint) {
        return <string>this;
    }    
}

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

export class Date {
    private timestamp: long;
    constructor (valueOrYear?: long | i32, monthIndex?: i32, day = 1, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) {
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

    static now(): long {
        return getMilliseconds();
    }

    static parse(dateString: string): long {
        function createDate(year: int, month: int, day: int, hour = 0, minute = 0, second = 0) {
            return Date.UTC(year, month, day, hour, minute, second);
        }

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Define regex patterns for different date formats
        const patterns = [
            { regex: /^(\d{4})-(\d{2})-(\d{2})$/, order: [1, 2, 3] },  // YYYY-MM-DD
            { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, order: [3, 1, 2] }, // MM/DD/YYYY -> YYYY-MM-DD
            { regex: /^(\d{2})-(\d{2})-(\d{4})$/, order: [3, 2, 1] },  // DD-MM-YYYY -> YYYY-MM-DD
            { regex: /^(\d{4})\/(\d{2})\/(\d{2})$/, order: [1, 2, 3] }, // YYYY/MM/DD
            { regex: /^(\d{4})\.(\d{2})\.(\d{2})$/, order: [1, 2, 3] }  // YYYY.MM.DD
        ];

        // Check for supported formats (YYYY-MM-DD, MM/DD/YYYY, etc.)
        for (let { regex, order } of patterns) {
            const match = dateString.match(regex);
            if (match) {
                const year = parseInt(match[order[0]]);
                const month = parseInt(match[order[1]]) - 1; // Month is zero-based
                const day = parseInt(match[order[2]]);
                return createDate(year, month, day);
            }
        }

        // Custom logic for RFC 2822 format (e.g., "Wed, 12 Feb 2025 07:21:02 GMT")
        const rfc2822Pattern = /^([A-Za-z]{3}), (\d{2}) ([A-Za-z]{3}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) (GMT|UTC)$/;
        const rfc2822Match = dateString.match(rfc2822Pattern);
        if (rfc2822Match) {
            const [_, weekday, day, monthName, year, hour, minute, second] = rfc2822Match;
            const month = monthNames.indexOf(monthName); // Get the month index
            return createDate(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
        }

        const rfc2822PatternNoWeek = /^(\d{2}) ([A-Za-z]{3}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) (GMT|UTC)$/;
        const rfc2822MatchNoWeek = dateString.match(rfc2822PatternNoWeek);
        if (rfc2822MatchNoWeek) {
            const [_, day, monthName, year, hour, minute, second] = rfc2822MatchNoWeek;
            const month = monthNames.indexOf(monthName); // Get the month index
            return createDate(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
        }        

        // Custom logic for long date format (e.g., "February 12, 2025 07:21:02")
        const longDatePattern = /^([A-Za-z]+) (\d{1,2}), (\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
        const longDateMatch = dateString.match(longDatePattern);
        if (longDateMatch) {
            const [_, monthName, day, year, hour, minute, second] = longDateMatch;
            const month = fullMonthNames.indexOf(monthName); // Get the month index
            return createDate(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
        }

        // If no matching pattern is found, return NaN
        return NaN;        
    }    

    static UTC(year: i32, monthIndex = 0, day = 1, hours = 0, minutes = 0, seconds = 0, milliseconds = 0): long {
        return makegmtime(year >= 1900 ? year - 1900 : year, monthIndex, day, hours, minutes, seconds, milliseconds);
    }

    getDate(): i32 {
        return localtime(this.timestamp).tm_mday;
    }

    getDay(): i32 {
        return localtime(this.timestamp).tm_wday;
    }    

    getFullYear(): i32 {
        return localtime(this.timestamp).tm_year + 1900;
    }

    getHours(): i32 {
        return localtime(this.timestamp).tm_hour;
    }    

    getMilliseconds(): i32 {
        return this.timestamp % 1000;
    }

    getMinutes(): i32 {
        return localtime(this.timestamp).tm_min;
    }     

    getMonth(): i32 {
        return localtime(this.timestamp).tm_mon;
    }     

    getSeconds(): i32 {
        return localtime(this.timestamp).tm_sec;
    }      

    getTime(): long {
        return this.timestamp;
    } 

    getTimezoneOffset(): i32 {
        return gettimezone();
    }
    
    getUTCDate(): i32 {
        return gmtime(this.timestamp).tm_mday;
    }

    getUTCDay(): i32 {
        return gmtime(this.timestamp).tm_wday;
    }    

    getUTCFullYear(): i32 {
        return gmtime(this.timestamp).tm_year + 1900;
    }

    getUTCHours(): i32 {
        return gmtime(this.timestamp).tm_hour;
    }    

    getUTCMilliseconds(): i32 {
        return this.timestamp % 1000;
    }

    getUTCMinutes(): i32 {
        return gmtime(this.timestamp).tm_min;
    }     

    getUTCMonth(): i32 {
        return gmtime(this.timestamp).tm_mon;
    }     

    getUTCSeconds(): i32 {
        return gmtime(this.timestamp).tm_sec;
    }      
    
    getYear(): i32 {
        return localtime(this.timestamp).tm_year;
    }  

    setDate(mday: i32) {
        let lt = localtime(this.timestamp);
        this.timestamp = maketime(lt.tm_year, lt.tm_mon, mday, lt.tm_hour, lt.tm_min, lt.tm_sec, this.timestamp % 1000); 
    }    

    setFullYear(year: i32) {
        let lt = localtime(this.timestamp);
        this.timestamp = maketime(year - 1900, lt.tm_mon, lt.tm_mday, lt.tm_hour, lt.tm_min, lt.tm_sec, this.timestamp % 1000); 
    }    

    setHours(hours: i32, minutes?: i32, seconds?: i32, ms?: i32) {
        let lt = localtime(this.timestamp);
        this.timestamp = maketime(lt.tm_year, lt.tm_mon, lt.tm_mday, hours, 
            minutes == undefined ? lt.tm_min : minutes, seconds == undefined ? lt.tm_sec : seconds, ms == undefined ? this.timestamp % 1000 : ms); 
    }        

    setMilliseconds(ms: i32) {
        this.timestamp += ms - this.timestamp % 1000;
    }

    setMinutes(minutes: i32, seconds?: i32, ms?: i32) {
        let lt = localtime(this.timestamp);
        this.timestamp = maketime(lt.tm_year, lt.tm_mon, lt.tm_mday, lt.tm_hour, minutes, 
            seconds == undefined ? lt.tm_sec : seconds, ms == undefined ? this.timestamp % 1000 : ms); 
    }        

    setMonth(month: i32) {
        let lt = localtime(this.timestamp);
        this.timestamp = maketime(lt.tm_year, month, lt.tm_mday, lt.tm_hour, lt.tm_min, lt.tm_sec, this.timestamp % 1000); 
    }        

    setSeconds(seconds: i32, ms?: i32) {
        let lt = localtime(this.timestamp);
        this.timestamp = maketime(lt.tm_year, lt.tm_mon, lt.tm_mday, lt.tm_hour, lt.tm_min, seconds, 
            ms == undefined ? this.timestamp % 1000 : ms); 
    }        

    setTime(time: long) {
        this.timestamp = time; 
    }        

    setUTCDate(mday: i32) {
        let lt = gmtime(this.timestamp);
        this.timestamp = makegmtime(lt.tm_year, lt.tm_mon, mday, lt.tm_hour, lt.tm_min, lt.tm_sec, this.timestamp % 1000); 
    }    

    setUTCFullYear(year: i32) {
        let lt = gmtime(this.timestamp);
        this.timestamp = makegmtime(year - 1900, lt.tm_mon, lt.tm_mday, lt.tm_hour, lt.tm_min, lt.tm_sec, this.timestamp % 1000); 
    }    

    setUTCHours(hours: i32, minutes?: i32, seconds?: i32, ms?: i32) {
        let lt = gmtime(this.timestamp);
        this.timestamp = makegmtime(lt.tm_year, lt.tm_mon, lt.tm_mday, hours, 
            minutes == undefined ? lt.tm_min : minutes, seconds == undefined ? lt.tm_sec : seconds, ms == undefined ? this.timestamp % 1000 : ms); 
    }        

    setUTCMilliseconds(ms: i32) {
        this.timestamp += ms - this.timestamp % 1000;
    }

    setUTCMinutes(minutes: i32, seconds?: i32, ms?: i32) {
        let lt = gmtime(this.timestamp);
        this.timestamp = makegmtime(lt.tm_year, lt.tm_mon, lt.tm_mday, lt.tm_hour, minutes, 
            seconds == undefined ? lt.tm_sec : seconds, ms == undefined ? this.timestamp % 1000 : ms); 
    }        

    setUTCMonth(month: i32) {
        let lt = gmtime(this.timestamp);
        this.timestamp = makegmtime(lt.tm_year, month, lt.tm_mday, lt.tm_hour, lt.tm_min, lt.tm_sec, this.timestamp % 1000); 
    }        

    setUTCSeconds(seconds: i32, ms?: i32) {
        let lt = gmtime(this.timestamp);
        this.timestamp = makegmtime(lt.tm_year, lt.tm_mon, lt.tm_mday, lt.tm_hour, lt.tm_min, seconds, 
            ms == undefined ? this.timestamp % 1000 : ms); 
    }        

    setYear(year: i32) {
        let lt = localtime(this.timestamp);
        this.timestamp = maketime(year, lt.tm_mon, lt.tm_mday, lt.tm_hour, lt.tm_min, lt.tm_sec, this.timestamp % 1000); 
    }      

    toDateString() {
        return time_format(100, "%#x", this.timestamp, false);
    }

    toISOString() {
        const ms = convertInteger(50, ".%03.dZ", this.timestamp % 1000);
        return time_format(100, "%FT%T", this.timestamp, true) + ms;
    }

    toJSON() {
        const ms = convertInteger(50, ".%03.dZ", this.timestamp % 1000);
        return time_format(100, "%FT%T", this.timestamp, false) + ms;
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

export class MatchResults
{
    private indices_: MatchIndicesResults = null;

    constructor(private match: Opaque | null = null, private hasIndices = false, private lastIndex: index = 0) {
    }    

    [index: number]: string;

    get(index: number) {
        const len = regexp_match_results_sub_match_str_length(this.match, index);
        let buffer = "".clone().resize(len);
        regexp_match_results_sub_match_str_copy_to(this.match, index, ReferenceOf(buffer[0]), len);
        return buffer;
    }

    get length() {
        return regexp_match_results_size(this.match);
    }

    get indices() {
        // TODO: finish it
        //if (!this.hasIndices)
        //    return undefined;
        return this.indices_ ??= new MatchIndicesResults(this.match, this.lastIndex);
    }
}

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
        const cmatch = regexp_exec(this.source, this.flags, ReferenceOf(s[this.lastIndex]), this.match);
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
            const result = regexp_test(this.source, this.flags, ReferenceOf(s[this.lastIndex]));
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
        const cmatch = regexp_exec(this.source, this.flags, s, null);
        if (cmatch)
        {
            const r = regexp_match_results_format(cmatch, replacement);

            const index = regexp_match_results_prefix_length(cmatch);
            const lastIndex = regexp_match_results_suffix_position(cmatch);

            // get formatted replacement
            const len = r.length;
            let result = "".clone().resize(len);
            memcpy(ReferenceOf(result[0]), r, len);
            
            regexp_free_string(r);
            regexp_free(cmatch);

            // do replacement
            return s.substring(0, index) + result + s.substring(lastIndex);
        }

        return null;
    }

    replaceAll(s: string, replacement: string): string {
        const r = regexp_replace(this.source, this.flags, s);
        const len = r.length;
        let result = "".clone().resize(len);
        memcpy(ReferenceOf(result[0]), r, len);
        regexp_free_string(r);
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
            memcpy(ReferenceOf(newString[index]), ReferenceOf(item[0]), sizeof<char>() * item.length);
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
            memcpy(ReferenceOf(newString[index]), ReferenceOf(item[0]), sizeof<char>() * item.length);
            index += item.length;
        }

        return newString;
    }      

    export function endsWith(this: string, searchString: string, endPosition = this.length): boolean {
        if (!searchString)
        {
            return false;
        }

        const lenstr = endPosition;
        const lensuffix = searchString.length;
        if (lensuffix > lenstr)
        {
            return false;
        }

        return strncmp(<string>ReferenceOf(this[lenstr - lensuffix]), searchString, lensuffix) == 0;
    }    

    export function includes(this: string, searchString: string, position = 0): boolean {    
        if (position >= this.length) 
        {
            return false;
        }

        return strstr(<string>ReferenceOf(this[position]), searchString) != null;
    }      

    export function indexOf(this: string, searchString: string, position = 0): int {    
        if (!searchString)
        {
            return -1;
        }

        if (position >= this.length) 
        {
            return this.length;
        }
        
        const found = strstr(<string>ReferenceOf(this[position]), searchString);
        if (found == null)
        {
            return -1;
        }

        return <index>ReferenceOf(found[0]) - <index>ReferenceOf(this[0]);
    }        

    export function isWellFormed(this: string): boolean {    
        // TODO: to be implemented
        return true;
    }    

    export function lastIndexOf(this: string, searchString: string, position = this.length): int {    
        if (!searchString)
        {
            return position;
        }

        const searchStringLen = searchString.length;
        if (searchStringLen == 0)
        {
            return position;
        }

        if (position < 0) 
        {
            position = 0;
        }
        
        for (let i = position; i >= 0; i--)
        {
            const found = strncmp(<string>ReferenceOf(this[i]), searchString, searchStringLen);
            if (found == 0)
            {
                return <index>ReferenceOf(this[i]) - <index>ReferenceOf(this[0]);
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

        let results: string[] = [];
        while (true)
        {
            const result = expr.exec(this);
            if (result == null)
                break;

            results.push(result[0]);
        }

        return results;        
    }

    export function *matchAll(this: string, expr: RegExp): Iterator<string[]> {

        while (true)
        {
            const result = expr.exec(this);
            if (result == null)
                break;

            yield [...result];
        }
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
        for (let i = 0; i < count; i++) {
            memcpy(ReferenceOf(newString[index]), this, byteSize);
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
            let index = 0;
            let parts: string[] = [];
            let len = this.length;
            while (true)
            {
                const found = this.indexOf(pattern, index);
                if (found == -1 || found >= len)
                {
                    parts.push( this.substring(index) );
                    break;
                }

                parts.push( this.substring(index, found) + replacement );
                index = found + pattern.length + (index == found ? 1 : 0);
            }

            return join(parts);
        }
        else
        {            
            return pattern.replaceAll(this, replacement);
        }
    }    

    export function search(this: string, regexp: RegExp): int {
        return regexp.search(this);
    }

    export function slice(this: string, indexStart: int, indexEnd = this.length): string {

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

        const count = indexEnd - indexStart;
        const newString = "".clone().resize(count);
        memcpy(ReferenceOf(newString[0]), ReferenceOf(this[indexStart]), sizeof<char>() * count);
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
            // TODO: finish implementation with regexp
            return [];
        } 
    }
    
    export function startsWith(this: string, searchString: string, position = 0): boolean {
        if (!searchString)
        {
            return false;
        }

        const lensuffix = searchString.length;
        if (position > this.length)
        {
            return false;
        }

        return strncmp(<string>ReferenceOf(this[position]), searchString, lensuffix) == 0;
    }    

    export function substring(this: string, indexStart: int, indexEnd = this.length): string {
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
        memcpy(ReferenceOf(newString[0]), ReferenceOf(this[indexStart]), sizeof<char>() * count);
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

    export function trim(this: string): string {
        let start = 0;
        for (let i = 0; i < this.length; i++) {
            if (!isspace(this[i])) { start = i; break; }
        }

        let end = this.length - 1;
        for (let i = this.length - 1; i >= 0; i--) {
            if (!isspace(this[i])) { end = i; break; }
        }

        return this.substring(start, end);
    }

    export function trimStart(this: string): string {
        let start = 0;
        for (let i = 0; i < this.length; i++) {
            if (!isspace(this[i])) { start = i; break; }
        }

        return this.substring(start);
    }    

    export function trimEnd(this: string): string {
        let end = this.length - 1;
        for (let i = this.length - 1; i >= 0; i--) {
            if (!isspace(this[i])) { end = i; break; }
        }

        return this.substring(0, end);
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

export class String {

    public constructor(private value: string) {
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
        let m = Number.MIN_VALUE;
        for (const v of values) if (v > m) m = v;
        return m;
    }

    /**
     * Returns the smaller of a set of supplied numeric expressions.
     * @param values Numeric expressions to be evaluated.
     */
    public min(...values: number[]): number {
        let m = Number.MAX_VALUE;
        for (const v of values) if (v < m) m = v;
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
        newArrayBuffer.arrayOfView = this.arrayOfView.view(start, end);
        return newArrayBuffer;
    }

    // TODO: newByteLength is not used
    public transfer(newByteLength?: int) {
        const newArrayBuffer = new ArrayBuffer(0);
        newArrayBuffer.states = this.states;
        newArrayBuffer.maxByteLength = this.maxByteLength;
        newArrayBuffer.arrayOfView = this.detach();
        return newArrayBuffer;
    }

    public transferToFixedLength(newByteLength?: int) {
        const newArrayBuffer = this.transfer(newByteLength);
        newArrayBuffer.states |= States.NonResizable;
        return newArrayBuffer;
    }

    private detach() {
        this.states |= States.Detached;
        const inst = this.arrayOfView;
        this.arrayOfView = null;
        return inst;
    }

    [Symbol.dispose]() {
        if (this.arrayOfView != null && !this.detached) {
            delete this.arrayOfView;
            this.arrayOfView = null;
        }
    }
}

export static class console {
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
        write(fileNo, data, data.length);
    }
}
