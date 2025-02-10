#include <regex>

extern "C" int regexp_test(const char *expr, const char *s)
{
    try
    {
        std::cmatch cm;
        return std::regex_search(s, cm, std::regex(expr)) ? 1 : 0;
    }
    catch(const std::exception&)
    {
        // nothing todo
    }
    
    return 0;
}

extern "C" std::cmatch* regexp_exec(const char *expr, const char *s, std::cmatch* cm)
{
    try
    {
        if (cm == nullptr)
        {
            cm = new std::cmatch();
        }

        if (std::regex_search(s, *cm, std::regex(expr)))
        {
            return cm;
        }
    }
    catch(const std::exception&)
    {
        // nothing todo
    }

    return nullptr;
}

extern "C" size_t regexp_match_results_size(std::cmatch* cm)
{
    // TODO: fix it, somehow it is different to MDN RegExp test
    return static_cast<size_t>(cm->size());
}

extern "C" size_t regexp_match_results_prefix_length(std::cmatch* cm)
{
    return static_cast<size_t>(cm->prefix().length() + cm->operator[](0).length());
}

extern "C" void regexp_match_results_sub_match_str_copy_to(std::cmatch* cm, size_t subIndex, char* buffer, size_t count)
{
    cm->operator[](subIndex).str().copy(buffer, count);
}

extern "C" size_t regexp_match_results_sub_match_str_length(std::cmatch* cm, size_t subIndex)
{
    return cm->operator[](subIndex).str().size();
}

extern "C" void regexp_free(std::cmatch* cm)
{
    if (cm != nullptr)
    {
        delete cm;
        cm = nullptr;
    }
}