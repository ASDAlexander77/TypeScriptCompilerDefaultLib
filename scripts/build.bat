rem call clean.bat

set BUILD=debug
set BUILD1=Debug
set LLVM_BUILD=Debug
set ARCH=x64

if "%1"=="release" (
	set BUILD=release
	set BUILD1=release
	set LLVM_BUILD=Release
)

set SRC=.
set OUTPUT=.

if "%TOOL_PATH%"=="" (
	set BUILD_PATH=..\TypeScriptCompiler\__build
	set TOOL_PATH=..\TypeScriptCompiler\__build\tsc\windows-msbuild-%BUILD%\bin
) else (
	set BUILD_PATH=%TOOL_PATH%
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

mkdir dll
mkdir lib

rem Build DLL
%TOOL_PATH%\tsc.exe --emit=dll %SRC%\src\lib.ts -o %OUTPUT%\dll\TypeScriptDefaultLib.dll

rem Build Lib
%TOOL_PATH%\tsc.exe --emit=obj --export=none %SRC%\src\lib.ts -o %OUTPUT%\lib\lib.obj
rem %_3RD_PATH%\llvm-lib.exe /out:%OUTPUT%\lib\TypeScriptDefaultLib.lib %OUTPUT%\lib\lib.obj

for /f "usebackq tokens=*" %%i in (`vswhere -legacy -latest -property installationPath`) do (
  set VSPATH="%%i\Common7\Tools\VsDevCmd.bat"
)

call %VSPATH%
lib.exe /out:%OUTPUT%\lib\TypeScriptDefaultLib.lib %OUTPUT%\lib\lib.obj

del %OUTPUT%\lib\lib.obj

set BUILD_LIB_PATH=.\__build\%BUILD%\defaultlib
mkdir %BUILD_LIB_PATH%
xcopy %SRC%\dll %BUILD_LIB_PATH%\dll /h /i /c /k /e /r /y
xcopy %SRC%\lib %BUILD_LIB_PATH%\lib /h /i /c /k /e /r /y
xcopy %SRC%\src\*.* %BUILD_LIB_PATH% /h /c /k /e /r /y