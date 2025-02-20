#include <iostream>
#include <sstream>
#include <iomanip>
#include <ctime>
#include <vector>

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

    "%d %b %Y %T %Z", // 01 Jan 1970 00:00:00 UTC
    "%d %b %Y %R %Z", // 01 Jan 1970 00:00 UTC
    "%d %b %Y %r %Z", // 01 Jan 1970 00:00:00 pm UTC

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

extern "C" long long parse_date(const char* dateStr) 
{
    struct std::tm tm{};

    for (auto format : formats) 
    {
        std::istringstream ss(dateStr);
        ss >> std::get_time(&tm, format);
        if (!ss.fail()) 
        {
            char separator = 0;
            char zSeparator = 0;
            int milliseconds = 0;
            ss >> separator >> milliseconds >> zSeparator;
            if (separator != '.' || zSeparator != 'Z')
            {
                milliseconds = 0;
            }

            // Convert to time_t (seconds since Unix epoch)
            auto time = std::mktime(&tm);
            if (time == -1)
            { 
                continue;
            }

            // Convert to milliseconds
            return static_cast<long long>(time) * 1000 + milliseconds;
        }
    }

    return -1;
}
