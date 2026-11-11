@rem Builds the default library for WebAssembly (wasm32-unknown-unknown, wasm64-unknown-unknown) on a
@rem Windows host, the wasm counterpart of scripts\build_android.bat. scripts/build_wasm.sh is the same
@rem for a Linux host.
@rem
@rem   scripts\build_wasm.bat [arch] [release|debug] [rc|none|own]
@rem
@rem   arch   wasm32 | wasm64      (default: both)
@rem   mode   release | debug      (default: both)
@rem   model  rc | none | own      (default: all three; gc needs the Boehm collector, which has no wasm build)
@rem
@rem Needs:
@rem   TOOL_PATH   the directory holding tslang.exe; defaults to the compiler's release build tree next
@rem               to this repository
@rem   llvm-ar     on PATH (LLVM's bin folder), or LLVM_AR set to it
@rem
@rem Output, into the one default-library tree every target shares:
@rem   __build\defaultlib\lib\<arch>\unknown\unknown\unknown\<mode>\<model>\libTypeScriptDefaultLib.a
@rem   __build\defaultlib\*.d.ts ...  (shared by every target)
@rem
@rem Differences from the other targets:
@rem - No C++ wrappers: these targets have no C library to build them against. The archive is lib.ts
@rem   and the OS layer lib.wasm.ts only. tslang links a wasm program with --allow-undefined, so what
@rem   the wrappers and the C library would provide (snprintf, malloc, regexp_*, stdio_write, ...)
@rem   become imports from the `env` module, which the host that runs the program implements - see
@rem   TypeScriptCompiler\docs\how\wasm\test\host.mjs.
@rem - Only the static library: a wasm program is one module.
@echo off
setlocal

set ARCH=%~1
set MODE=%~2
set MM=%~3

if "%ARCH%"=="" (
    call "%~f0" wasm32 "%MODE%" "%MM%" || exit /b 1
    call "%~f0" wasm64 "%MODE%" "%MM%" || exit /b 1
    exit /b 0
)
if "%MODE%"=="" (
    call "%~f0" %ARCH% release "%MM%" || exit /b 1
    call "%~f0" %ARCH% debug "%MM%" || exit /b 1
    exit /b 0
)
if "%MM%"=="" (
    call "%~f0" %ARCH% %MODE% rc || exit /b 1
    call "%~f0" %ARCH% %MODE% none || exit /b 1
    call "%~f0" %ARCH% %MODE% own || exit /b 1
    exit /b 0
)

if not "%ARCH%"=="wasm32" if not "%ARCH%"=="wasm64" (
    echo unknown arch "%ARCH%": wasm32 or wasm64
    exit /b 1
)
set TRIPLE=%ARCH%-unknown-unknown

if "%MODE%"=="release" (
    set DBG=--opt --opt_level=3
) else if "%MODE%"=="debug" (
    set DBG=--di --opt_level=0
) else (
    echo unknown mode "%MODE%": release or debug
    exit /b 1
)

if "%MM%"=="gc" (
    echo -mm=gc has no wasm build: the Boehm collector is not built for wasm. Use rc, none or own.
    exit /b 1
)
if not "%MM%"=="rc" if not "%MM%"=="none" if not "%MM%"=="own" (
    echo unknown memory model "%MM%": rc, none or own
    exit /b 1
)

set ROOT=%~dp0..
if "%TOOL_PATH%"=="" set TOOL_PATH=%ROOT%\..\TypeScriptCompiler\__build\tslang\windows-msbuild-2026-release\bin
set TSLANG="%TOOL_PATH%\tslang.exe"
if not exist %TSLANG% (
    echo tslang.exe not found in "%TOOL_PATH%": set TOOL_PATH
    exit /b 1
)

if "%LLVM_AR%"=="" set LLVM_AR=llvm-ar
where "%LLVM_AR%" >nul 2>&1
if errorlevel 1 if not exist "%LLVM_AR%" (
    echo llvm-ar not found: put LLVM's bin folder on PATH or set LLVM_AR
    exit /b 1
)

set TSC=%TSLANG% -mtriple=%TRIPLE% %DBG% -mm=%MM% --emit=obj --export=none --nowarn --no-default-lib

rem The archive's folder, from tslang itself with the flags it compiles with below, composed the
rem way tslang later looks it up (see tslang/include/TypeScript/Defines.h).
set LIB_DIR=
for /f "usebackq delims=" %%d in (`"%TOOL_PATH%\tslang.exe" --print-default-lib-dir=lib -mtriple=%TRIPLE% %DBG% -mm=%MM%`) do set "LIB_DIR=%%d"
if "%LIB_DIR%"=="" (
    echo %TSLANG% cannot name the output folder ^(--print-default-lib-dir^): it predates the per-target layout
    exit /b 1
)
set "LIB_DIR=%LIB_DIR:/=\%"

set OUT=%ROOT%\__build\defaultlib
set OBJ=%ROOT%\__build\obj-%ARCH%-%MODE%-%MM%
set LIB_OUT=%ROOT%\__build\%LIB_DIR%

echo === %ARCH% %MODE% %MM%
if exist "%OBJ%" rd /s /q "%OBJ%"
if exist "%LIB_OUT%" rd /s /q "%LIB_OUT%"
md "%OBJ%" "%LIB_OUT%"

%TSC% "%ROOT%\src\lib.wasm.ts" -o "%OBJ%\lib.wasm.o" || exit /b 1
%TSC% "%ROOT%\src\lib.ts" -o "%OBJ%\lib.o" || exit /b 1

"%LLVM_AR%" rcs "%LIB_OUT%\libTypeScriptDefaultLib.a" "%OBJ%\lib.o" "%OBJ%\lib.wasm.o" || exit /b 1

rd /s /q "%OBJ%"

rem the declarations a program compiled against this tree reads (the same for every target), and
rem which compiler built this target's archives, beside the other targets' records
xcopy /E /I /Y /Q "%ROOT%\src" "%OUT%" > nul || exit /b 1
%TSLANG% --version > "%OUT%\COMPILER_VERSION.%ARCH%.txt" 2>&1
exit /b 0
