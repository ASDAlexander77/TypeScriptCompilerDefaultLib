// A time with a zone ("GMT", "Z", "+07:00", "PDT") is that zone's and an ISO date alone is UTC: fixed
// values. Any other time is local, so it is compared with the same local time new Date(y, m, ...)
// builds - in UTC the two agree with the values in the comments.
function local(y: number, m: number, d: number, h = 0, min = 0, s = 0, ms = 0) {
    return new Date(y, m, d, h, min, s, ms).getTime();
}

const data = [
    ['August 19, 1975', local(1975, 7, 19)], // 177638400000
    ['August 19, 1975 00:00:00', local(1975, 7, 19)], // 177638400000
    ['August 19, 1975 23:15:30', local(1975, 7, 19, 23, 15, 30)], // 177722130000
    //['July 20, 69 00:20:18', -14258382000],
    ['1995-12-25T23:15:30', local(1995, 11, 25, 23, 15, 30)], // 819933330000
    ['March 13, 08 04:20', local(2008, 2, 13, 4, 20)], // 1205382000000
    ['July 20, 1979 00:20:18', local(1979, 6, 20, 0, 20, 18)], // 301278018000
    ['July 20, 1979 20:17:40 GMT+00:00', 301349860000],
    ['August 19, 1975 23:15:30 GMT+07:00', 177696930000],
    ['August 19, 1975 23:15:30 GMT-02:00', 177729330000],
    ['August 19, 1975 23:15:30 GMT-3:00', 177732930000],
    ['1995-12-25', 819849600000],
    ['01 Jan 1970 00:00:00 GMT', 0],
    ['01 Jan 1970 00:00:00', local(1970, 0, 1)], // 0
    ['04 Dec 1995 00:12:00 GMT', 818035920000],
    ['July 1, 1999, 12:00:00', local(1999, 6, 1, 12)], // 930830400000
    ['December 31, 1975 23:15:30 GMT-3:00', 189310530000],
    ['2018-01-24T12:38:29', local(2018, 0, 24, 12, 38, 29)], // 1516797509000
    ['2018-01-24T12:38:29.069Z', 1516797509069],
    ['2018-01-24T12:38:29+02:00', 1516790309000],
    ['December 31, 1975, 23:15:30 GMT+11:00', 189260130000],
    ['05 October 2011 14:48 UTC', 1317826080000],
    ['20 December 2019 14:48', local(2019, 11, 20, 14, 48)], // 1576853280000
    ['14 Jun 2017 00:00:00 PDT', 1497423600000],
    ['14 Jun 2017 00:00:00 EST', 1497416400000],
    ['August 19, 1975 23:15:30.150', local(1975, 7, 19, 23, 15, 30, 150)], // 177722130150
];

console.log(Date.parse("10/11/2009 10:11:22"));

assert(Date.parse("10/11/2009 10:11:22") != -1)

const t = Date.parse('2024-02-20T14:35:45.123Z');
const d = new Date(t);
assert(d.toISOString() == '2024-02-20T14:35:45.123Z');

data.forEach(([date, expected]) => {
    console.log(date, " e:", expected, " r:", Date.parse(date), " ", new Date(Date.parse(date)).toISOString());
    assert(Date.parse(date) === expected, `${date} failed`);
});

console.log('done.');

console.log("ALL DONE");
