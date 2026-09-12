@rem Builds the default library for every memory model, since a program links the build that
@rem matches its own -mm= and there is deliberately no fallback to another model's copy.
@rem
@rem   build.bat                -> release and debug, all three models
@rem   build.bat release        -> release only, all three models
@rem   build.bat release rc     -> just that one
@rem
@rem Set TSLANG_TOOLCHAIN=llvm to build the C++ wrappers with clang-cl/llvm-lib instead
@rem of cl/lib.exe; everything else (flags, layout, output tree) is identical, so the two
@rem builds are interchangeable and overwrite each other in lib\ and dll\.
@rem
@rem See tslang/include/TypeScript/Defines.h for the resulting layout.

if /I "%TSLANG_TOOLCHAIN%" == "llvm" (
    set "BUILD_SCRIPT=scripts\build_llvm.bat"
) else (
    set "BUILD_SCRIPT=scripts\build_vs.bat"
)

if not "%2" == "" (
    cmd /c %BUILD_SCRIPT% %1 %2
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
rem Each model runs in its own cmd.exe child (via "cmd /c", not "call") so
rem vcvars64.bat's PATH/INCLUDE/LIB growth doesn't accumulate across models -
rem calling it 3x in one process eventually trips cmd's line-length limit
rem ("The input line is too long"), which silently aborts that model's build
rem partway through and leaves its subfolder uncopied.
cmd /c %BUILD_SCRIPT% %1 gc
if errorlevel 1 exit /b 1
cmd /c %BUILD_SCRIPT% %1 rc
if errorlevel 1 exit /b 1
cmd /c %BUILD_SCRIPT% %1 none
if errorlevel 1 exit /b 1
exit /b 0
