// Temporal's Duration and Instant, and Now, as in JavaScript
function main() {
    const d = Temporal.Duration.from("P1Y2M3W4DT5H6M7.008009010S");
    assert(d.years == 1 && d.months == 2 && d.weeks == 3 && d.days == 4, "the date fields");
    assert(d.hours == 5 && d.minutes == 6 && d.seconds == 7, "the time fields");
    assert(d.milliseconds == 8 && d.microseconds == 9 && d.nanoseconds == 10, "the parts of a second");
    assert(d.toString() == "P1Y2M3W4DT5H6M7.00800901S", "back to text");
    assert(d.sign == 1 && !d.blank, "positive");

    const neg = d.negated();
    assert(neg.sign == -1 && neg.years == -1 && neg.toString() == "-P1Y2M3W4DT5H6M7.00800901S", "negated");
    assert(neg.abs().toString() == d.toString(), "abs");
    assert(new Temporal.Duration().toString() == "PT0S" && new Temporal.Duration().blank, "blank");
    assert(new Temporal.Duration(0, 0, 0, 0, 0, 0, 0, 1500).toString() == "PT1.5S", "milliseconds into seconds");

    let mixed = false;
    try {
        new Temporal.Duration(1, -1);
    } catch (e) {
        mixed = e instanceof RangeError;
    }

    assert(mixed, "mixed signs are a RangeError");

    // the sum in the larger of the two largest units
    const a = Temporal.Duration.from("PT1H30M");
    const b = Temporal.Duration.from("PT45M");
    assert(a.add(b).toString() == "PT2H15M", "hours and minutes");
    assert(Temporal.Duration.from("PT36H").add(b).toString() == "PT36H45M", "hours stay hours");
    assert(Temporal.Duration.from("P1D").add(Temporal.Duration.from("PT25H")).toString() == "P2DT1H", "days take hours");
    assert(a.subtract(Temporal.Duration.from("PT2H")).toString() == "-PT30M", "below 0");
    assert(Temporal.Duration.from("PT1H").total("minutes") == 60, "total");
    assert(Temporal.Duration.from("P1DT12H").total("day") == 1.5, "total in days");
    assert(Temporal.Duration.compare(a, b) == 1, "compare");

    let noLength = false;
    try {
        Temporal.Duration.from("P1M").add(a);
    } catch (e) {
        noLength = e instanceof RangeError;
    }

    assert(noLength, "a month has no length without a date");

    const epoch = Temporal.Instant.fromEpochMilliseconds(0);
    assert(epoch.toString() == "1970-01-01T00:00:00Z", "the epoch");
    const i = Temporal.Instant.from("2024-03-15T14:30:00.5+02:00");
    assert(i.toString() == "2024-03-15T12:30:00.5Z", "an offset, in UTC");
    assert(i.epochMilliseconds == 1710505800500, "epochMilliseconds");
    assert(i.epochNanoseconds == 1710505800500000000, "epochNanoseconds");
    assert(Temporal.Instant.fromEpochNanoseconds(i.epochNanoseconds).equals(i), "fromEpochNanoseconds");
    const later = i.add(Temporal.Duration.from("PT1H0.25S"));
    assert(later.toString() == "2024-03-15T13:30:00.75Z", "add");
    assert(i.until(later).toString() == "PT3600.25S", "until, in seconds");
    assert(later.since(i).seconds == 3600, "since");
    assert(Temporal.Instant.compare(i, later) == -1, "compare");
    const before = Temporal.Instant.fromEpochMilliseconds(-1);
    assert(before.toString() == "1969-12-31T23:59:59.999Z", "before the epoch");
    assert(before.epochNanoseconds == -1000000, "a negative epochNanoseconds");

    let noDays = false;
    try {
        i.add(Temporal.Duration.from("P1D"));
    } catch (e) {
        noDays = e instanceof RangeError;
    }

    assert(noDays, "an Instant takes no days");

    const now = Temporal.Now.instant();
    assert(now.epochMilliseconds > 1700000000000, "now is after 2023");
    const today = Temporal.Now.plainDateISO();
    assert(today.year >= 2024, "today");
    assert(Temporal.Now.plainTimeISO().hour < 24, "a time of day");

    console.log("ALL DONE");
}
