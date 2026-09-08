@rem Builds the default library for every memory model, since a program links the build that
@rem matches its own -mm= and there is deliberately no fallback to another model's copy.
@rem
@rem   build.bat                -> release and debug, all three models
@rem   build.bat release        -> release only, all three models
@rem   build.bat release rc     -> just that one
@rem
@rem See tslang/include/TypeScript/Defines.h for the resulting layout.

if not "%2" == "" (
    call scripts\build_vs.bat %1 %2
    exit /b %errorlevel%
)

if "%1" == "debug" (
    call :build_all_models debug
) else if "%1" == "release" (
    call :build_all_models release
) else (
    call :build_all_models release
    if errorlevel 1 exit /b 1
    call :build_all_models debug
)
exit /b %errorlevel%

:build_all_models
call scripts\build_vs.bat %1 gc
if errorlevel 1 exit /b 1
call scripts\build_vs.bat %1 rc
if errorlevel 1 exit /b 1
call scripts\build_vs.bat %1 none
if errorlevel 1 exit /b 1
exit /b 0
