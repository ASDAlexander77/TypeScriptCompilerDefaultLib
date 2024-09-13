if "%1" == "debug" (
    call scripts\build_vs.bat debug
) else (
    call scripts\build_vs.bat release
)    
