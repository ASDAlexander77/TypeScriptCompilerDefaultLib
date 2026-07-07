#include <windows.h>
#include <winhttp.h>
#include <string>
#include <vector>

#pragma comment(lib, "winhttp.lib")

// Opaque handle wrapping a completed HTTP exchange: request/response headers,
// status, and body, all read into memory up-front so the TypeScript side can
// query them through simple length/copy accessors (same shape as regex.cpp).
struct HttpResponse
{
    bool success = false;
    DWORD errorCode = 0;
    int statusCode = 0;
    std::string statusText;
    std::string headers;   // raw header block, CRLF separated
    std::string body;
};

static std::wstring widen(const char *s)
{
    if (s == nullptr || s[0] == '\0')
        return std::wstring();

    int len = MultiByteToWideChar(CP_UTF8, 0, s, -1, nullptr, 0);
    std::wstring result(len > 0 ? len - 1 : 0, L'\0');
    if (len > 0)
        MultiByteToWideChar(CP_UTF8, 0, s, -1, &result[0], len);
    return result;
}

static std::string narrow(const wchar_t *s, DWORD lenChars)
{
    if (s == nullptr || lenChars == 0)
        return std::string();

    int len = WideCharToMultiByte(CP_UTF8, 0, s, (int)lenChars, nullptr, 0, nullptr, nullptr);
    std::string result(len, '\0');
    if (len > 0)
        WideCharToMultiByte(CP_UTF8, 0, s, (int)lenChars, &result[0], len, nullptr, nullptr);
    return result;
}

extern "C" HttpResponse *http_request(const char *method, const char *url, const char *headers, const char *body, size_t bodyLength)
{
    auto *response = new HttpResponse();

    URL_COMPONENTS urlComp{};
    urlComp.dwStructSize = sizeof(urlComp);
    wchar_t hostName[256]{};
    wchar_t urlPath[2048]{};
    wchar_t extraInfo[2048]{};
    urlComp.lpszHostName = hostName;
    urlComp.dwHostNameLength = _countof(hostName);
    urlComp.lpszUrlPath = urlPath;
    urlComp.dwUrlPathLength = _countof(urlPath);
    urlComp.lpszExtraInfo = extraInfo;
    urlComp.dwExtraInfoLength = _countof(extraInfo);

    std::wstring wUrl = widen(url);
    if (!WinHttpCrackUrl(wUrl.c_str(), (DWORD)wUrl.size(), 0, &urlComp))
    {
        response->errorCode = GetLastError();
        return response;
    }

    bool isHttps = urlComp.nScheme == INTERNET_SCHEME_HTTPS;

    HINTERNET hSession = WinHttpOpen(L"tslang-fetch/1.0",
                                      WINHTTP_ACCESS_TYPE_DEFAULT_PROXY,
                                      WINHTTP_NO_PROXY_NAME,
                                      WINHTTP_NO_PROXY_BYPASS, 0);
    if (hSession == nullptr)
    {
        response->errorCode = GetLastError();
        return response;
    }

    HINTERNET hConnect = WinHttpConnect(hSession, urlComp.lpszHostName, urlComp.nPort, 0);
    if (hConnect == nullptr)
    {
        response->errorCode = GetLastError();
        WinHttpCloseHandle(hSession);
        return response;
    }

    std::wstring path = std::wstring(urlComp.lpszUrlPath, urlComp.dwUrlPathLength) +
                         std::wstring(urlComp.lpszExtraInfo, urlComp.dwExtraInfoLength);
    if (path.empty())
        path = L"/";

    HINTERNET hRequest = WinHttpOpenRequest(hConnect, widen(method).c_str(), path.c_str(),
                                             nullptr, WINHTTP_NO_REFERER,
                                             WINHTTP_DEFAULT_ACCEPT_TYPES,
                                             isHttps ? WINHTTP_FLAG_SECURE : 0);
    if (hRequest == nullptr)
    {
        response->errorCode = GetLastError();
        WinHttpCloseHandle(hConnect);
        WinHttpCloseHandle(hSession);
        return response;
    }

    std::wstring wHeaders = widen(headers);
    BOOL sent = WinHttpSendRequest(hRequest,
                                    wHeaders.empty() ? WINHTTP_NO_ADDITIONAL_HEADERS : wHeaders.c_str(),
                                    wHeaders.empty() ? 0 : (DWORD)-1L,
                                    (LPVOID)(body != nullptr && bodyLength > 0 ? body : WINHTTP_NO_REQUEST_DATA),
                                    (DWORD)bodyLength,
                                    (DWORD)bodyLength, 0);

    if (sent)
        sent = WinHttpReceiveResponse(hRequest, nullptr);

    if (!sent)
    {
        response->errorCode = GetLastError();
        WinHttpCloseHandle(hRequest);
        WinHttpCloseHandle(hConnect);
        WinHttpCloseHandle(hSession);
        return response;
    }

    DWORD statusCode = 0;
    DWORD statusCodeSize = sizeof(statusCode);
    WinHttpQueryHeaders(hRequest, WINHTTP_QUERY_FLAG_NUMBER | WINHTTP_QUERY_STATUS_CODE,
                        WINHTTP_HEADER_NAME_BY_INDEX, &statusCode, &statusCodeSize, WINHTTP_NO_HEADER_INDEX);
    response->statusCode = (int)statusCode;

    DWORD headerBufferSize = 0;
    WinHttpQueryHeaders(hRequest, WINHTTP_QUERY_RAW_HEADERS_CRLF, WINHTTP_HEADER_NAME_BY_INDEX,
                        WINHTTP_NO_OUTPUT_BUFFER, &headerBufferSize, WINHTTP_NO_HEADER_INDEX);
    if (headerBufferSize > 0)
    {
        std::wstring headerBuffer(headerBufferSize / sizeof(wchar_t), L'\0');
        if (WinHttpQueryHeaders(hRequest, WINHTTP_QUERY_RAW_HEADERS_CRLF, WINHTTP_HEADER_NAME_BY_INDEX,
                                &headerBuffer[0], &headerBufferSize, WINHTTP_NO_HEADER_INDEX))
        {
            response->headers = narrow(headerBuffer.c_str(), headerBufferSize / sizeof(wchar_t));
        }
    }

    DWORD bytesAvailable = 0;
    do
    {
        bytesAvailable = 0;
        if (!WinHttpQueryDataAvailable(hRequest, &bytesAvailable) || bytesAvailable == 0)
            break;

        std::vector<char> chunk(bytesAvailable);
        DWORD bytesRead = 0;
        if (!WinHttpReadData(hRequest, chunk.data(), bytesAvailable, &bytesRead))
            break;

        response->body.append(chunk.data(), bytesRead);
    } while (bytesAvailable > 0);

    response->success = true;

    WinHttpCloseHandle(hRequest);
    WinHttpCloseHandle(hConnect);
    WinHttpCloseHandle(hSession);

    return response;
}

extern "C" bool http_response_success(HttpResponse *r)
{
    return r->success;
}

extern "C" int http_response_error_code(HttpResponse *r)
{
    return (int)r->errorCode;
}

extern "C" int http_response_status(HttpResponse *r)
{
    return r->statusCode;
}

extern "C" size_t http_response_headers_length(HttpResponse *r)
{
    return r->headers.size();
}

extern "C" void http_response_headers_copy_to(HttpResponse *r, char *buffer, size_t count)
{
    r->headers.copy(buffer, count);
}

extern "C" size_t http_response_body_length(HttpResponse *r)
{
    return r->body.size();
}

extern "C" void http_response_body_copy_to(HttpResponse *r, char *buffer, size_t count)
{
    r->body.copy(buffer, count);
}

extern "C" void http_response_free(HttpResponse *r)
{
    delete r;
}
