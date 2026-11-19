// Temporal's PlainDate, PlainTime and PlainDateTime, in the ISO 8601 calendar, as in JavaScript
function main() {
    const date = new Temporal.PlainDate(2024, 2, 29);
    assert(date.year == 2024 && date.month == 2 && date.day == 29, "fields");
    assert(date.inLeapYear && date.daysInMonth == 29 && date.daysInYear == 366, "a leap year");
    assert(date.dayOfWeek == 4 && date.dayOfYear == 60, "Thursday, the 60th day");
    assert(date.monthCode == "M02" && date.calendarId == "iso8601", "monthCode and calendarId");
    assert(date.toString() == "2024-02-29", "toString");

    let refused = false;
    try {
        new Temporal.PlainDate(2023, 2, 29);
    } catch (e) {
        refused = e instanceof RangeError;
    }

    assert(refused, "no February 29 in 2023");

    // a day past the end of the month goes back to its last
    assert(date.add(Temporal.Duration.from("P1Y")).toString() == "2025-02-28", "a year on, constrained");
    assert(date.add(new Temporal.Duration(0, 1)).toString() == "2024-03-29", "a month on");
    assert(Temporal.PlainDate.from("2024-01-31").add(Temporal.Duration.from("P1M")).toString() == "2024-02-29",
        "January 31 and a month");
    assert(date.add(Temporal.Duration.from("P1W2D")).toString() == "2024-03-09", "weeks and days");
    assert(date.subtract(Temporal.Duration.from("P60D")).toString() == "2023-12-31", "back past the start of a year");
    assert(date.add(Temporal.Duration.from("PT47H")).toString() == "2024-03-01", "whole days of hours");

    const from = Temporal.PlainDate.from("1970-01-01");
    assert(from.until(date).days == 19782, "until, in days");
    assert(date.since(from).toString() == "P19782D", "since");
    assert(Temporal.PlainDate.compare(from, date) == -1 && date.equals(Temporal.PlainDate.from("2024-02-29")),
        "compare and equals");
    assert(date._with({ month: 4, day: 31 }).toString() == "2024-04-30", "with, constrained");
    assert(new Temporal.PlainDate(-44, 3, 15).toString() == "-000044-03-15", "an expanded year");
    assert(Temporal.PlainDate.from("1969-12-31").dayOfWeek == 3, "a Wednesday before 1970");

    const time = Temporal.PlainTime.from("13:45:30.25");
    assert(time.hour == 13 && time.minute == 45 && time.second == 30 && time.millisecond == 250, "time fields");
    assert(time.toString() == "13:45:30.25", "fraction, its trailing zeros gone");
    assert(new Temporal.PlainTime(9, 5).toString() == "09:05:00", "padded");
    assert(time.add(Temporal.Duration.from("PT11H")).toString() == "00:45:30.25", "around midnight");
    assert(time.subtract(Temporal.Duration.from("PT14H")).toString() == "23:45:30.25", "back around midnight");
    assert(new Temporal.PlainTime(8).until(time).toString() == "PT5H45M30.25S", "until, in hours and smaller");
    assert(time._with({ second: 0, millisecond: 0 }).toString() == "13:45:00", "with");

    const dt = Temporal.PlainDateTime.from("2024-12-31T23:30");
    assert(dt.year == 2024 && dt.hour == 23 && dt.minute == 30, "date and time fields");
    assert(dt.toString() == "2024-12-31T23:30:00", "toString");
    const next = dt.add(Temporal.Duration.from("PT45M"));
    assert(next.toString() == "2025-01-01T00:15:00", "the time carries into the date");
    assert(dt.until(next).toString() == "PT45M", "until");
    assert(Temporal.PlainDateTime.from("2024-01-01T00:00").until(dt).toString() == "P365DT23H30M", "days and smaller");
    assert(dt.subtract(Temporal.Duration.from("P1M")).toString() == "2024-11-30T23:30:00", "a month back, constrained");
    assert(dt.toPlainDate().equals(Temporal.PlainDate.from("2024-12-31")), "toPlainDate");
    assert(dt.toPlainTime().toString() == "23:30:00", "toPlainTime");
    assert(date.toPlainDateTime(time).toString() == "2024-02-29T13:45:30.25", "a date with a time");
    assert(Temporal.PlainDateTime.compare(dt, next) == -1, "compare");

    let bad = false;
    try {
        Temporal.PlainDate.from("2024-13-01");
    } catch (e) {
        bad = e instanceof RangeError;
    }

    assert(bad, "month 13 is a RangeError");

    console.log("ALL DONE");
}
