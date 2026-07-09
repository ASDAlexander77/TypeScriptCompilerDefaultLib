if "%1" == "debug" (
    call scripts\build_vs.bat debug
) else if "%1" == "release" (
    call scripts\build_vs.bat release
) else (
    call scripts\build_vs.bat release
    if errorlevel 1 exit /b 1
    call scripts\build_vs.bat debug
)
