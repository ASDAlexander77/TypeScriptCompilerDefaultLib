#include <regex>

extern "C" bool regexp_test(const char *expr, const char *s)
{
    std::cmatch cm;
    return std::regex_search(s, cm, std::regex(expr));
}

extern "C" std::cmatch* regexp_exec(const char *expr, const char *s, std::cmatch* cm)
{
    if (cm == nullptr)
    {
        cm = new std::cmatch();
    }

    if (std::regex_search(s, *cm, std::regex(expr)))
    {
        return cm;
    }

    return nullptr;
}

extern "C" size_t regexp_exec_lastIndex(std::cmatch* cm)
{
    return 1;
    //return static_cast<size_t>(cm->prefix().length());
}

extern "C" void regexp_free(std::cmatch* cm)
{
    if (cm != nullptr)
        delete cm;
}