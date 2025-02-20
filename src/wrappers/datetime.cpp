#include <iostream>
#include <sstream>
#include <iomanip>
#include <ctime>
#include <vector>

static std::vector<const char*> formats {
    "%Y-%m-%dT%H:%M:%S",
    "%m/%d/%Y %H:%M:%S"
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
            // Convert to time_t (seconds since Unix epoch)
            auto time = std::mktime(&tm);
            if (time == -1)
            { 
                return -1;
            }

            // Convert to milliseconds
            return static_cast<long long>(time) * 1000;
        }
    }

    return -1;
}
