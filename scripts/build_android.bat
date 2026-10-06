@rem Builds the default library for Android (API 29) on a Windows host, the Android counterpart of
@rem scripts/build.sh.
@rem
@rem   scripts\build_android.bat [abi] [release|debug] [gc|rc|none]
@rem
@rem   abi    arm64-v8a | x86_64   (default: both)
@rem   mode   release | debug      (default: both)
@rem   model  gc | rc | none       (default: all three - see build.sh on why each needs its own)
@rem
@rem Needs:
@rem   ANDROID_NDK_HOME  the Android NDK (tested with r30), e.g. C:\Android\android-ndk-r30
@rem   TOOL_PATH         the directory holding a tslang.exe with Android support (#506); defaults
@rem                     to the compiler's release build tree next to this repository
@rem
@rem Output, into the one default-library tree every target shares (a program compiled for Android
@rem takes --default-lib-path=__build, the directory holding defaultlib\, as any other does):
@rem   __build\defaultlib\lib\<arch>\unknown\linux\android\<mode>\<model>\libTypeScriptDefaultLib.a
@rem     (arch: aarch64 for arm64-v8a, x86_64 for x86_64; tslang --print-default-lib-dir names it)
@rem   __build\defaultlib\*.d.ts ...  (shared by every target)
@rem
@rem Differences from build.sh:
@rem - HTTP is src\wrappers\http_stub.cpp, not http_linux.cpp: libcurl is not part of Android, so
@rem   fetch() throws instead. The archive is therefore the library itself, with no linker script
@rem   pulling in -lcurl.
@rem - Everything is position independent, the archive too: Android executables must be PIE.
@rem - Only the static library: tslang links it into every Android binary, executable and shared
@rem   library alike, so an app ships one self-contained .so (no dll\ tree, unlike build.sh).
@rem
@rem API 29 is the floor: lib.linux.ts calls timespec_get, which Bionic has from 29 on.
@echo off
setlocal

if "%ANDROID_NDK_HOME%"=="" (
    echo ANDROID_NDK_HOME is not set: point it at the Android NDK, e.g. C:\Android\android-ndk-r30
    exit /b 1
)

set ABI=%~1
set MODE=%~2
set MM=%~3

if "%ABI%"=="" (
    call "%~f0" arm64-v8a "%MODE%" "%MM%" || exit /b 1
    call "%~f0" x86_64 "%MODE%" "%MM%" || exit /b 1
    exit /b 0
)
if "%MODE%"=="" (
    call "%~f0" %ABI% release "%MM%" || exit /b 1
    call "%~f0" %ABI% debug "%MM%" || exit /b 1
    exit /b 0
)
if "%MM%"=="" (
    call "%~f0" %ABI% %MODE% gc || exit /b 1
    call "%~f0" %ABI% %MODE% rc || exit /b 1
    call "%~f0" %ABI% %MODE% none || exit /b 1
    exit /b 0
)

if "%ABI%"=="arm64-v8a" (
    set TRIPLE=aarch64-linux-android29
) else if "%ABI%"=="x86_64" (
    set TRIPLE=x86_64-linux-android29
) else (
    echo unknown ABI "%ABI%": arm64-v8a or x86_64
    exit /b 1
)

if "%MODE%"=="release" (
    set DBG=--opt --opt_level=3
    set DBG_CXX=-O3
) else if "%MODE%"=="debug" (
    set DBG=--di --opt_level=0
    set DBG_CXX=-g
) else (
    echo unknown mode "%MODE%": release or debug
    exit /b 1
)

if not "%MM%"=="gc" if not "%MM%"=="rc" if not "%MM%"=="none" (
    echo unknown memory model "%MM%": gc, rc or none
    exit /b 1
)

set ROOT=%~dp0..
if "%TOOL_PATH%"=="" set TOOL_PATH=%ROOT%\..\TypeScriptCompiler\__build\tslang\windows-msbuild-2026-release\bin
set TSLANG="%TOOL_PATH%\tslang.exe"
if not exist %TSLANG% (
    echo tslang.exe not found in "%TOOL_PATH%": set TOOL_PATH
    exit /b 1
)

set NDK_BIN=%ANDROID_NDK_HOME%\toolchains\llvm\prebuilt\windows-x86_64\bin
set CXX="%NDK_BIN%\clang++.exe" --target=%TRIPLE% -fPIC -std=c++17 %DBG_CXX%
set AR="%NDK_BIN%\llvm-ar.exe"
set TSC=%TSLANG% -mtriple=%TRIPLE% -relocation-model=pic %DBG% -mm=%MM% --emit=obj --export=none --nowarn --no-default-lib

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
set OBJ=%ROOT%\__build\obj-android-%ABI%-%MODE%-%MM%
set LIB_OUT=%ROOT%\__build\%LIB_DIR%

echo === %ABI% %MODE% %MM%
if exist "%OBJ%" rd /s /q "%OBJ%"
if exist "%LIB_OUT%" rd /s /q "%LIB_OUT%"
md "%OBJ%" "%LIB_OUT%"

for %%w in (io datetime regex thread http_stub memory) do (
    %CXX% -c "%ROOT%\src\wrappers\%%w.cpp" -o "%OBJ%\%%w.o" || exit /b 1
)

%TSC% "%ROOT%\src\lib.linux.ts" -o "%OBJ%\lib.linux.o" || exit /b 1
%TSC% "%ROOT%\src\lib.ts" -o "%OBJ%\lib.o" || exit /b 1

set OBJS="%OBJ%\lib.o" "%OBJ%\lib.linux.o" "%OBJ%\io.o" "%OBJ%\datetime.o" "%OBJ%\regex.o" "%OBJ%\thread.o" "%OBJ%\http_stub.o" "%OBJ%\memory.o"
%AR% rcs "%LIB_OUT%\libTypeScriptDefaultLib.a" %OBJS% || exit /b 1

rd /s /q "%OBJ%"

rem the declarations a program compiled against this tree reads (the same for every target), and
rem which compiler built this ABI's archives, beside the other targets' records
xcopy /E /I /Y /Q "%ROOT%\src" "%OUT%" > nul || exit /b 1
%TSLANG% --version > "%OUT%\COMPILER_VERSION.android-%ABI%.txt" 2>&1
exit /b 0
