#include <iostream>
#include <sstream>
#include <iomanip>
#include <ctime>
#include <cctype>
#include <cstring>
#include <vector>

#include "tslang_export.h"

static std::vector<const char*> formats {
    "%c",
    "%x %X",

    "%Y-%m-%dT%T",

    "%Y-%m-%d %T",
    "%Y/%m/%d %T",
    "%Y.%m.%d %T",
    "%D %T",
    "%d-%m-%Y %T",
    "%d/%m/%Y %T",
    "%d %m %Y %T",

    "%Y-%m-%d %R",
    "%Y/%m/%d %R",
    "%Y.%m.%d %R",
    "%D %R",
    "%d-%m-%Y %R",
    "%d/%m/%Y %R",
    "%d %m %Y %R",

    "%Y-%m-%d %r",
    "%Y/%m/%d %r",
    "%Y.%m.%d %r",
    "%D %r",
    "%d-%m-%Y %r",
    "%d/%m/%Y %r",
    "%d %m %Y %r",

    "%B %d, %Y %T", // August 19, 1975 00:00:00
    "%B %d, %Y %R", // August 19, 1975 00:00
    "%B %d, %Y %r", // August 19, 1975 00:00:00 pm

    "%B %d, %y %T", // August 19, 75 00:00:00
    "%B %d, %y %R", // August 19, 75 00:00
    "%B %d, %y %r", // August 19, 75 00:00:00 pm

    "%d %b %Y %T", // 01 Jan 1970 00:00:00
    "%d %b %Y %R", // 01 Jan 1970 00:00
    "%d %b %Y %r", // 01 Jan 1970 00:00:00 pm

    "%B %d, %Y, %T", // August 19, 1975, 00:00:00
    "%B %d, %Y, %R", // August 19, 1975, 00:00
    "%B %d, %Y, %r", // August 19, 1975, 00:00:00 pm

    "%F",
    "%Y/%m/%d",
    "%Y.%m.%d",
    "%m/%d/%Y",
    "%d-%m-%Y",
    "%d/%m/%Y",
    "%d %m %Y",
};

static time_t utc_time(std::tm *tm)
{
#ifdef _WIN32
    return _mkgmtime(tm);
#else
    return timegm(tm);
#endif
}

// "+hh:mm", "+hhmm", "+h", "-3:00": the minutes east of UTC, or false when `s` is not an offset
static bool parse_offset(const char *&s, int &minutes)
{
    if (*s != '+' && *s != '-')
    {
        return false;
    }

    auto sign = *s == '-' ? -1 : 1;
    auto p = s + 1;
    auto digits = 0;
    auto value = 0;
    while (isdigit((unsigned char)*p) && digits < 4)
    {
        value = value * 10 + (*p++ - '0');
        digits++;
    }

    if (digits == 0)
    {
        return false;
    }

    auto hours = value;
    auto mins = 0;
    if (*p == ':')
    {
        if (digits > 2 || !isdigit((unsigned char)p[1]) || !isdigit((unsigned char)p[2]))
        {
            return false;
        }

        mins = (p[1] - '0') * 10 + (p[2] - '0');
        p += 3;
    }
    else if (digits > 2)
    {
        // +hhmm
        hours = value / 100;
        mins = value % 100;
    }

    minutes = sign * (hours * 60 + mins);
    s = p;
    return true;
}

// The zone after the time: "Z", "GMT", "UTC", "GMT+07:00", "+0200", or one of the US zone names
// JavaScript engines know. Sets the minutes east of UTC; false when there is no zone.
static bool parse_zone(const char *s, int &minutes)
{
    while (isspace((unsigned char)*s))
    {
        s++;
    }

    minutes = 0;
    if (*s == 'Z' && !isalpha((unsigned char)s[1]))
    {
        return true;
    }

    if (strncmp(s, "GMT", 3) == 0 || strncmp(s, "UTC", 3) == 0)
    {
        s += 3;
        parse_offset(s, minutes);
        return true;
    }

    if (parse_offset(s, minutes))
    {
        return true;
    }

    static const struct { const char *name; int minutes; } names[] {
        {"EST", -5 * 60}, {"EDT", -4 * 60},
        {"CST", -6 * 60}, {"CDT", -5 * 60},
        {"MST", -7 * 60}, {"MDT", -6 * 60},
        {"PST", -8 * 60}, {"PDT", -7 * 60},
    };

    for (auto &name : names)
    {
        if (strncmp(s, name.name, 3) == 0 && !isalpha((unsigned char)s[3]))
        {
            minutes = name.minutes;
            return true;
        }
    }

    return false;
}

// "1995-12-25" and nothing else: an ISO date alone is UTC, unlike any date with a time
static bool is_iso_date_only(const char *s)
{
    while (isspace((unsigned char)*s))
    {
        s++;
    }

    for (auto i = 0; i < 10; i++)
    {
        auto dash = i == 4 || i == 7;
        if (dash ? s[i] != '-' : !isdigit((unsigned char)s[i]))
        {
            return false;
        }
    }

    for (s += 10; isspace((unsigned char)*s); s++)
    {
    }

    return *s == '\0';
}

extern "C" TSLANG_EXPORT long long parse_date(const char* dateStr)
{
    for (auto format : formats)
    {
        // a format that failed may have filled some fields
        struct std::tm tm{};

        std::istringstream ss(dateStr);
        ss >> std::get_time(&tm, format);
        // GCC 13's and older libstdc++'s %c "succeeds" reading nothing, which left the zeroed tm
        // (31 Dec 1899) as every date: a format that read no day of the month did not match
        if (ss.fail() || tm.tm_mday == 0)
        {
            continue;
        }

        std::string rest;
        std::getline(ss, rest, '\0');
        auto p = rest.c_str();

        int milliseconds = 0;
        if (*p == '.' && isdigit((unsigned char)p[1]))
        {
            // a fraction of a second: its first three digits are milliseconds
            auto scale = 100;
            for (p++; isdigit((unsigned char)*p); p++)
            {
                milliseconds += (*p - '0') * scale;
                scale /= 10;
            }
        }

        // "March 13, 08 04:20": libstdc++'s %Y takes the two digits as the year 8 (MSVC's fails
        // and the %y format after it reads 2008). Outside ISO forms a year under 100 is two
        // digits, read as JavaScript engines do: 0-49 is 20xx, 50-99 is 19xx.
        auto year = tm.tm_year + 1900;
        auto iso = format[0] == '%' && (format[1] == 'F' || (format[1] == 'Y' && format[2] == '-'));
        if (!iso && year >= 0 && year < 100)
        {
            tm.tm_year = (year < 50 ? year + 2000 : year + 1900) - 1900;
        }

        // A time with a zone is that zone's, and an ISO date alone ("1995-12-25") is UTC; any
        // other time is local, in daylight saving time or not as the date says.
        int offsetMinutes = 0;
        auto hasZone = parse_zone(p, offsetMinutes);
        auto isoDateOnly = is_iso_date_only(dateStr);

        time_t time;
        if (hasZone || isoDateOnly)
        {
            time = utc_time(&tm);
            if (time == -1)
            {
                continue;
            }

            time -= offsetMinutes * 60;
        }
        else
        {
            tm.tm_isdst = -1;
            time = std::mktime(&tm);
            if (time == -1)
            {
                continue;
            }
        }

        // Convert to milliseconds
        return static_cast<long long>(time) * 1000 + milliseconds;
    }

    return -1;
}
