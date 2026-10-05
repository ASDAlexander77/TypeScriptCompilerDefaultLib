// new Date(y, m, d, h, ...) and the set* methods take a local time: mktime must work out whether
// daylight saving time is in effect on that date itself. Told "not in effect", it read a summer
// date as standard time, an hour off - which only shows in a time zone that has DST.
const summer = new Date(2001, 6, 15, 12, 30, 0);
console.log(summer.getHours(), summer.getMinutes());
assert(summer.getHours() == 12 && summer.getMinutes() == 30, "summer date keeps its hour");

const winter = new Date(2001, 0, 15, 12, 30, 0);
console.log(winter.getHours(), winter.getMinutes());
assert(winter.getHours() == 12 && winter.getMinutes() == 30, "winter date keeps its hour");

// set* rebuilds the date from its local fields
summer.setMinutes(45);
assert(summer.getHours() == 12 && summer.getMinutes() == 45, "setMinutes keeps the hour");
summer.setHours(20);
assert(summer.getHours() == 20 && summer.getMinutes() == 45, "setHours sets the hour");

console.log("ALL DONE");
