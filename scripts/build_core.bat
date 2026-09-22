rem Shared build body for the Windows default-library builds. Not meant to be run
rem directly - go through build_vs.bat (MSVC) or build_llvm.bat (LLVM), which pick the
rem toolchain and delegate here. Keeping one body is deliberate: the two entry points
rem drifted apart once before, and build_llvm.bat silently lost its debug-info flag.
rem
rem   %1  release | debug   (default: debug)
rem   %2  memory model      (default: gc)
rem
rem The caller sets TSLANG_CC / TSLANG_AR / TSLANG_TOOLCHAIN. TSLANG_ARCH (x64 | x86,
rem default x64) picks the target architecture; see the ARCH block below.

echo on

if "%TSLANG_CC%"=="" set TSLANG_CC=cl
if "%TSLANG_AR%"=="" set TSLANG_AR=lib.exe
if "%TSLANG_TOOLCHAIN%"=="" set TSLANG_TOOLCHAIN=msvc

set TOOL_BUILD=release
set VER=-2026
set BUILD=debug
set BUILD1=Debug
set LLVM_BUILD=Debug
if "%TSLANG_ARCH%"=="" set TSLANG_ARCH=x64
set ARCH=%TSLANG_ARCH%
if not "%ARCH%"=="x64" if not "%ARCH%"=="x86" (
	echo ""
	echo "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
	echo "XXX TSLANG_ARCH must be x64 or x86 XXX"
	echo "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
	echo ""
	exit /b 1
)
rem ARCH_DIR nests the x86 tree one level under lib\ and dll\, next to today's flat
rem x64 layout (defaultlib/{lib,dll}/x86/...; see tslang/include/TypeScript/Defines.h).
rem TRIPLE_OPT tells tslang.exe to target i686 instead of its host x64.
set ARCH_DIR=
set TRIPLE_OPT=
if "%ARCH%"=="x86" (
	set ARCH_DIR=\x86
	set TRIPLE_OPT=-mtriple=i686-pc-windows-msvc
)
rem clang-cl targets x64 regardless of which vcvarsall was called, so an x86 LLVM build
rem needs an explicit -m32. TSLANG_CC_TOOL keeps the bare executable name (no flags) for
rem the "where" check below - "where" cannot resolve "clang-cl -m32" as one token.
set TSLANG_CC_TOOL=%TSLANG_CC%
if "%TSLANG_TOOLCHAIN%"=="llvm" if "%ARCH%"=="x86" set "TSLANG_CC=%TSLANG_CC% -m32"
set DBG=--di --opt_level=0
rem /Z7, not /Zi: the wrappers are archived into a static .lib, so their debug info has to
rem live inside each .obj. /Zi would park it in an external vc140.pdb in the current directory,
rem which is never staged next to the .lib and is overwritten by the next memory model's build,
rem leaving consumers unable to step into io.cpp/datetime.cpp/etc. This matches what tslang's
rem --di already does for the .ts objects.
rem /MTd, /MT: the wrappers' C runtime has to match the one tslang links against. A debug program
rem (--di, no --opt) picks this debug archive and links the static debug CRT (libcmtd,
rem _ITERATOR_DEBUG_LEVEL=2); an --opt program picks the release archive and the static release CRT
rem (see tslang/tslang/exe.cpp). Without a flag cl defaults to /MT, so the debug archive carried
rem release-CRT wrappers and a debug `tslang --emit=exe` against it failed with LNK2038 mismatches.
set DBG_CL=/MTd /Z7 /std:c++latest
set TOOL_NAME=tslang

if "%1"=="release" (
	set TOOL_BUILD=release
	set BUILD=release
	set BUILD1=release
	set LLVM_BUILD=Release
	set DBG=--opt --opt_level=3
	set DBG_CL=/MT /std:c++latest
)

rem Memory model (%2). The default library is not model-neutral: under gc it allocates through
rem Boehm and pulls libgc in with it, under rc it maintains the block header's reference count
rem and follows the +1 return convention, under none it does neither. A program links the build
rem that matches its own -mm=, so each model needs its own. See tslang/include/TypeScript/Defines.h.
set MM=gc
if not "%2"=="" set MM=%2
set MM_OPT=-mm=%MM%

rem One variable per output tree, set once here and used everywhere below (rd, md, /Fo,
rem -o, --obj, del, xcopy, the final exist check), so an x86 build never lands a file in
rem the x64 tree by way of a spot that forgot to add ARCH_DIR.
set LIB_OUT=lib%ARCH_DIR%\%BUILD%\%MM%
set DLL_OUT=dll%ARCH_DIR%\%BUILD%\%MM%

rem The DLL build below links TypeScriptAsyncRuntime.lib. TSLANG_LIB_PATH (set further
rem down) defaults to the compiler's own build tree, which has no x86 subdirectory, so
rem an x86 build points --tslang-lib-path at the separate tslang-runtime tree instead
rem (tslang appends "x86" to it itself, same as --gc-lib-path).
set TSLANG_RUNTIME_OPT=
if "%ARCH%"=="x86" set TSLANG_RUNTIME_OPT=--tslang-lib-path=..\TypeScriptCompiler\__build\tslang-runtime\%BUILD%

set SRC=.
set OUTPUT=.

if "%TOOL_PATH%"=="" (
	set BUILD_PATH=..\TypeScriptCompiler\__build
	set TOOL_PATH=..\TypeScriptCompiler\__build\%TOOL_NAME%\windows-msbuild%VER%-%TOOL_BUILD%\bin
) else (
	set BUILD_PATH=%TOOL_PATH%
)

if "%GC_LIB_PATH%"=="" (
	set GC_LIB_PATH=%BUILD_PATH%\gc\msbuild\%ARCH%\%BUILD%\%BUILD1%
)
rem Boehm built as a DLL: the import library gc.lib (not the static one) + gc.dll. The DLL build
rem below links it, because TypeScriptDefaultLib.dll always shares a process with another gc
rem binary - TypeScriptRuntime.dll under the JIT, a user's shared library - and a static gc.lib
rem would give it a collector of its own that frees what they hold. The static lib\ archive
rem links no collector at all, so it is unaffected.
rem See TypeScriptCompiler/tslang/docs/single-gc-collector-design.md.
rem Always the x64 gcdll tree, even for an x86 build (%ARCH% deliberately not used here):
rem tslang appends "x86" to --gc-lib-path itself when the target is x86, so this path
rem must stay the flat x64 one or that segment would be doubled.
if "%GC_SHARED_LIB_PATH%"=="" (
	set GC_SHARED_LIB_PATH=..\TypeScriptCompiler\3rdParty\gcdll\x64\%BUILD%\lib
)
if "%LLVM_LIB_PATH%"=="" (
	set LLVM_LIB_PATH=%BUILD_PATH%\llvm\msbuild\%ARCH%\%BUILD%\%BUILD1%\lib
)
if "%TSLANG_LIB_PATH%"=="" (
	set TSLANG_LIB_PATH=%BUILD_PATH%\%TOOL_NAME%\windows-msbuild%VER%-%BUILD%\lib
)

rem Check if Visual Studio is installed at default locations. Both toolchains need this:
rem clang-cl compiles against the MSVC headers and the Windows SDK just as cl does.
if not "%VSWHERE_PATH%"=="" goto vswhere_done

if exist "%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe" (
	set "VSWHERE_PATH=%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe"
	goto vswhere_done
)
if exist "%ProgramFiles%\Microsoft Visual Studio\Installer\vswhere.exe" (
	set "VSWHERE_PATH=%ProgramFiles%\Microsoft Visual Studio\Installer\vswhere.exe"
	goto vswhere_done
)
for /f "delims=" %%v in ('where vswhere 2^>nul') do set "VSWHERE_PATH=%%v"
if "%VSWHERE_PATH%"=="" (
	echo ""
	echo "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
	echo "XXX Visual Studio was not found XXX"
	echo "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
	echo ""
	exit /b 1
)
:vswhere_done

set "VSWHERE_PATH=%VSWHERE_PATH:"=%"

rem vcvarsall.bat takes the target arch as its argument (x64 or x86) - both live in the
rem same VC\Auxiliary\Build directory as the old arch-specific vcvars64.bat.
for /f "usebackq tokens=*" %%i in (`"%VSWHERE_PATH%" -legacy -latest -property installationPath`) do (
  set "VSPATH="%%i\VC\Auxiliary\Build\vcvarsall.bat""
)

call %VSPATH% %ARCH%

rem vcvarsall sets up the MSVC headers and the Windows SDK but does not put the LLVM tools
rem on PATH. Check up front rather than letting a missing clang-cl fail five times over
rem and still fall through to the staging step with no objects to archive.
where %TSLANG_CC_TOOL% >nul 2>&1
if errorlevel 1 (
	echo ""
	echo "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
	echo "XXX compiler %TSLANG_CC_TOOL% is not on PATH"
	echo "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
	echo ""
	exit /b 1
)
where %TSLANG_AR% >nul 2>&1
if errorlevel 1 (
	echo ""
	echo "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
	echo "XXX archiver %TSLANG_AR% is not on PATH"
	echo "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
	echo ""
	exit /b 1
)

rem Only now that the toolchain is known good, clear this model's output folders -
rem an earlier wipe would leave them empty whenever a check above bails out.
rd /S /Q %DLL_OUT%
rd /S /Q %LIB_OUT%

md %DLL_OUT%
md %LIB_OUT%

rem echo on

rem Build native wrappers for C++ code
%TSLANG_CC% %DBG_CL% /EHsc /Wall /c /Fo%OUTPUT%\%LIB_OUT%\ %SRC%\src\wrappers\io.cpp
%TSLANG_CC% %DBG_CL% /EHsc /Wall /c /Fo%OUTPUT%\%LIB_OUT%\ %SRC%\src\wrappers\datetime.cpp
%TSLANG_CC% %DBG_CL% /EHsc /Wall /c /Fo%OUTPUT%\%LIB_OUT%\ %SRC%\src\wrappers\regex.cpp
%TSLANG_CC% %DBG_CL% /EHsc /Wall /c /Fo%OUTPUT%\%LIB_OUT%\ %SRC%\src\wrappers\thread.cpp
%TSLANG_CC% %DBG_CL% /EHsc /Wall /c /Fo%OUTPUT%\%LIB_OUT%\ %SRC%\src\wrappers\http.cpp

rem Build OS-specific Lib
echo Build OS-specific Lib
%TOOL_PATH%\%TOOL_NAME%.exe %TRIPLE_OPT% %DBG% %MM_OPT% --emit=obj --export=none --nowarn --no-default-lib %SRC%\src\lib.win32.ts -o %OUTPUT%\%LIB_OUT%\lib.win32.obj

rem Build DLL
echo Build DLL
%TOOL_PATH%\%TOOL_NAME%.exe %TRIPLE_OPT% %DBG% %MM_OPT% --emit=dll --gc-lib-path=%GC_SHARED_LIB_PATH% %TSLANG_RUNTIME_OPT% --embed-declarations=false --nowarn --no-default-lib %SRC%\src\lib.ts --obj=%OUTPUT%\%LIB_OUT%\lib.win32.obj --obj=%OUTPUT%\%LIB_OUT%\io.obj --obj=%OUTPUT%\%LIB_OUT%\datetime.obj --obj=%OUTPUT%\%LIB_OUT%\regex.obj --obj=%OUTPUT%\%LIB_OUT%\thread.obj --obj=%OUTPUT%\%LIB_OUT%\http.obj -o %OUTPUT%\%DLL_OUT%\TypeScriptDefaultLib.dll

rem Build Lib
echo Build Lib
%TOOL_PATH%\%TOOL_NAME%.exe %TRIPLE_OPT% %DBG% %MM_OPT% --emit=obj --export=none --nowarn --no-default-lib %SRC%\src\lib.ts -o %OUTPUT%\%LIB_OUT%\lib.obj
rem %TOOL_PATH%\%TOOL_NAME%.exe %TRIPLE_OPT% %DBG% %MM_OPT% --emit=llvm --export=none %SRC%\src\lib.ts -o %OUTPUT%\%LIB_OUT%\lib.ll
rem %TOOL_PATH%\%TOOL_NAME%.exe %TRIPLE_OPT% %DBG% %MM_OPT% --emit=mlir --export=none %SRC%\src\lib.ts 2> %OUTPUT%\%LIB_OUT%\lib.mlir

%TSLANG_AR% /out:%OUTPUT%\%LIB_OUT%\TypeScriptDefaultLib.lib %OUTPUT%\%LIB_OUT%\lib.obj %OUTPUT%\%LIB_OUT%\lib.win32.obj %OUTPUT%\%LIB_OUT%\io.obj %OUTPUT%\%LIB_OUT%\datetime.obj %OUTPUT%\%LIB_OUT%\regex.obj %OUTPUT%\%LIB_OUT%\thread.obj %OUTPUT%\%LIB_OUT%\http.obj

del %OUTPUT%\%LIB_OUT%\lib.obj
del %OUTPUT%\%LIB_OUT%\lib.win32.obj
del %OUTPUT%\%LIB_OUT%\io.obj
del %OUTPUT%\%LIB_OUT%\datetime.obj
del %OUTPUT%\%LIB_OUT%\regex.obj
del %OUTPUT%\%LIB_OUT%\thread.obj
del %OUTPUT%\%LIB_OUT%\http.obj

rem Stage into a single shared defaultlib tree with per-build subfolders under
rem dll\ and lib\. Only the current build's subfolders are refreshed so the
rem other mode (debug/release) staged by a separate run is preserved.
set BUILD_LIB_PATH=.\__build\defaultlib
rd /S /Q %BUILD_LIB_PATH%\%DLL_OUT%
rd /S /Q %BUILD_LIB_PATH%\%LIB_OUT%
md %BUILD_LIB_PATH%\%DLL_OUT%
md %BUILD_LIB_PATH%\%LIB_OUT%

rem Record which compiler built this library, so a mismatch (e.g. after an ABI or
rem codegen change in tslang) can be diagnosed from the artifact alone. The wrapper
rem toolchain is recorded too, since the MSVC and LLVM builds share one output tree.
%TOOL_PATH%\%TOOL_NAME%.exe --version > %BUILD_LIB_PATH%\COMPILER_VERSION.txt 2>&1
echo wrappers: %TSLANG_TOOLCHAIN% (%TSLANG_CC%, %TSLANG_AR%) >> %BUILD_LIB_PATH%\COMPILER_VERSION.txt
echo arch: %ARCH% >> %BUILD_LIB_PATH%\COMPILER_VERSION.txt

xcopy %SRC%\%DLL_OUT% %BUILD_LIB_PATH%\%DLL_OUT% /h /i /c /k /e /r /y
xcopy %SRC%\%LIB_OUT% %BUILD_LIB_PATH%\%LIB_OUT% /h /i /c /k /e /r /y
xcopy %SRC%\src\*.d.ts %BUILD_LIB_PATH% /h /c /k /e /r /y
xcopy %SRC%\src\generics\*.ts %BUILD_LIB_PATH%\generics /h /c /k /e /r /y

if exist .\%DLL_OUT%\TypeScriptDefaultLib.dll (
	echo ""
	echo "||||||||||||||||||||||||||||"
	echo "|||||||||| SUCCESS |||||||||"
	echo "||||||||||||||||||||||||||||"
	echo ""
	exit /b 0
) else (
	echo ""
	echo "XXXXXXXXXXXXXXXXXXXXXXXXXXX"
	echo "XXXXXXXXXX FAILED XXXXXXXXX"
	echo "XXXXXXXXXXXXXXXXXXXXXXXXXXX"
	echo ""
	exit /b 1
)
