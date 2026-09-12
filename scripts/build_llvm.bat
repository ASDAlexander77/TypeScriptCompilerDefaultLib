@rem LLVM entry point for the default library. Same body, same flags, same output tree
@rem as the MSVC build - only the wrapper compiler and the archiver differ.
@rem
@rem   scripts\build_llvm.bat debug gc
@rem
@rem clang-cl still compiles against the MSVC headers and the Windows SDK, which
@rem build_core.bat sets up via vcvars64. vcvars64 does not add the LLVM tools to PATH,
@rem so clang-cl and llvm-lib must already be there - a default LLVM install puts them
@rem in %ProgramFiles%\LLVM\bin. build_core.bat checks for both before compiling.
@rem
@rem The build body lives in build_core.bat and is shared with build_vs.bat, so a
@rem change to flags or layout reaches both toolchains.

setlocal
set TSLANG_TOOLCHAIN=llvm
set TSLANG_CC=clang-cl
set TSLANG_AR=llvm-lib.exe
call "%~dp0build_core.bat" %1 %2
exit /b %errorlevel%
