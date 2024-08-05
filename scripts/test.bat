set BUILD=debug
set BUILD1=Debug
set LLVM_BUILD=Debug
set ARCH=x64
set DBG=--di
set OPTIONS=--no-warn

set test=%1
if "%2"=="release" (
	set BUILD=release
	set BUILD1=release
	set LLVM_BUILD=Release
	set DBG=
)

set SRC=.
set OUTPUT=.

if "%TOOL_PATH%"=="" (
	set BUILD_PATH=..\TypeScriptCompiler\__build
	set TOOL_PATH=..\TypeScriptCompiler\__build\tsc\windows-msbuild-%BUILD%\bin
	set DEFAULTLIB_BUILD_PATH=..\TypeScriptCompilerDefaultLib\__build\%BUILD%
) else (
	set BUILD_PATH=%TOOL_PATH%
	set DEFAULTLIB_BUILD_PATH=%TOOL_PATH%
)

if "%GC_LIB_PATH%"=="" (
	set GC_LIB_PATH=%BUILD_PATH%\gc\msbuild\%ARCH%\%BUILD%\%BUILD1%
)
if "%LLVM_LIB_PATH%"=="" (
	set LLVM_LIB_PATH=%BUILD_PATH%\llvm\msbuild\%ARCH%\%BUILD%\%BUILD1%\lib
)
if "%TSC_LIB_PATH%"=="" (
	set TSC_LIB_PATH=%BUILD_PATH%\tsc\windows-msbuild-%BUILD%\lib
)
if "%DEFAULT_LIB_PATH%"=="" (
	set DEFAULT_LIB_PATH=%DEFAULTLIB_BUILD_PATH%
)

rem Build DLL
%TOOL_PATH%\tsc.exe %DBG% %OPTIONS% --shared-libs=%TOOL_PATH%\TypeScriptRuntime.dll --emit=jit %SRC%\tests\%test%.ts

rem Build Lib
%TOOL_PATH%\tsc.exe %DBG% %OPTIONS% --shared-libs=%TOOL_PATH%\TypeScriptRuntime.dll --emit=exe %SRC%\tests\%test%.ts
%test%.exe
del %test%.exe
