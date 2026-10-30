// A date without a zone is local time, so the expected values are the same local times built by
// new Date(y, m, d, ...): 0 and 818035920000 hold only in UTC (Europe/London kept UTC+1 all 1970).
const unixTimeZero = Date.parse("01 Jan 1970 00:00:00");
const javaScriptRelease = Date.parse("04 Dec 1995 00:12:00");

console.log(unixTimeZero);
// Expected output: 0 (in UTC)

assert(unixTimeZero == new Date(1970, 0, 1, 0, 0, 0).getTime());

console.log(javaScriptRelease);
// Expected output: 818035920000 (in UTC)

assert(javaScriptRelease == new Date(1995, 11, 4, 0, 12, 0).getTime());

console.log("ALL DONE");
