@rem MSVC entry point for the default library. Builds one (build type, memory model)
@rem pair; build.bat drives the loop over the three models.
@rem
@rem   scripts\build_vs.bat debug gc
@rem
@rem The build body lives in build_core.bat and is shared with build_llvm.bat, so a
@rem change to flags or layout reaches both toolchains.

setlocal
set TSLANG_TOOLCHAIN=msvc
set TSLANG_CC=cl
set TSLANG_AR=lib.exe
call "%~dp0build_core.bat" %1 %2
exit /b %errorlevel%
