#include <iostream>
#include <regex>

void regexp_error(int code);
std::regex::flag_type get_flags(const char *flags);
std::regex_constants::match_flag_type get_match_flags(const char *flags);

extern "C" size_t regexp_match_results_size(std::cmatch *cm)
{
    return static_cast<size_t>(cm->size());
}

extern "C" size_t regexp_match_results_prefix_length(std::cmatch *cm)
{
    return static_cast<size_t>(cm->prefix().length() + cm->operator[](0).length());
}

extern "C" void regexp_match_results_sub_match_str_copy_to(std::cmatch *cm, size_t subIndex, char *buffer, size_t count)
{
    cm->operator[](subIndex).str().copy(buffer, count);
}

extern "C" size_t regexp_match_results_sub_match_str_length(std::cmatch *cm, size_t subIndex)
{
    return cm->operator[](subIndex).str().size();
}

extern "C" size_t regexp_match_results_sub_match_position(std::cmatch *cm, size_t subIndex)
{
    return static_cast<size_t>(cm->position(subIndex));
}

extern "C" size_t regexp_match_results_sub_match_length(std::cmatch *cm, size_t subIndex)
{
    return static_cast<size_t>(cm->length(subIndex));
}

extern "C" int regexp_test(const char *expr, const char *flags, const char *s)
{
    try
    {
        std::cmatch cm;
        if (std::regex_search(s, cm, std::regex(expr, get_flags(flags)), get_match_flags(flags)))
        {
            return static_cast<int>(regexp_match_results_prefix_length(&cm));
        }

        return -1;
    }
    catch (std::regex_error &e)
    {
        regexp_error(e.code());
    }

    return -1;
}

extern "C" std::cmatch *regexp_exec(const char *expr, const char *flags, const char *s, std::cmatch *cm)
{
    try
    {
        if (cm == nullptr)
        {
            cm = new std::cmatch();
        }

        if (std::regex_search(s, *cm, std::regex(expr, get_flags(flags)), get_match_flags(flags)))
        {
            return cm;
        }
    }
    catch (std::regex_error &e)
    {
        regexp_error(e.code());
    }

    return nullptr;
}

extern "C" void regexp_free(std::cmatch *cm)
{
    if (cm != nullptr)
    {
        delete cm;
        cm = nullptr;
    }
}

std::regex::flag_type get_flags(const char *flags) 
{
    auto result = std::regex::ECMAScript;
    auto str = std::string(flags);
    for (auto c : str) 
    {
        switch (c)
        {
            case 'i': 
                result |= std::regex::icase;
                break;
            case 'm': 
                result |= std::regex::extended;
                break;
        }
    }

    return result;
}

std::regex_constants::match_flag_type get_match_flags(const char *flags)
{
    auto result = std::regex_constants::match_default;
    auto str = std::string(flags);

    result |= std::regex_constants::match_not_bol;
    result |= std::regex_constants::match_not_eol;

    for (auto c : str) 
    {
        switch (c)
        {
            case 'm': 
                result &= ~std::regex_constants::match_not_bol;
                result &= ~std::regex_constants::match_not_eol;
                break;
        }
    }

    return result;
}

void regexp_error(int code)
{
    switch (code) {
        case std::regex_constants::error_collate: 
            std::cerr << "The expression contained an invalid collating element name.\n";
            break;
        case std::regex_constants::error_ctype: 
            std::cerr << "The expression contained an invalid character class name.\n";
            break;
        case std::regex_constants::error_escape: 
            std::cerr << "The expression contained an invalid escaped character, or a trailing escape.\n";
            break;
        case std::regex_constants::error_backref: 
            std::cerr << "The expression contained an invalid back reference.\n";
            break;
        case std::regex_constants::error_brack: 
            std::cerr << "The expression contained mismatched brackets ([ and ]).\n";
            break;
        case std::regex_constants::error_paren: 
            std::cerr << "The expression contained mismatched parentheses (( and )).\n";
            break;
        case std::regex_constants::error_brace: 
            std::cerr << "The expression contained mismatched braces ({ and }).\n";
            break;
        case std::regex_constants::error_badbrace: 
            std::cerr << "The expression contained an invalid range between braces ({ and }).\n";
            break;
        case std::regex_constants::error_range: 
            std::cerr << "The expression contained an invalid character range.\n";
            break;
        case std::regex_constants::error_space: 
            std::cerr << "There was insufficient memory to convert the expression into a finite state machine.\n";
            break;
        case std::regex_constants::error_badrepeat: 
            std::cerr << "The expression contained a repeat specifier (one of *?+{) that was not preceded by a valid regular expression.\n";
            break;
        case std::regex_constants::error_complexity: 
            std::cerr << "The complexity of an attempted match against a regular expression exceeded a pre-set level.\n";
            break;
        case std::regex_constants::error_stack: 
            std::cerr << "There was insufficient memory to determine whether the regular expression could match the specified character sequence.\n";
            break;
        case std::regex_constants::error_parse: 
            std::cerr << "There was parsing error.\n";
            break;
        case std::regex_constants::error_syntax: 
            std::cerr << "There was syntax error.\n";
            break;
        default:
            std::cerr << "Some other regex exception happened.\n";
            break;
    }
}
