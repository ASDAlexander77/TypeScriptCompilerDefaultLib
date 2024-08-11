rem call clean.bat

set BUILD=debug
set BUILD1=Debug
set LLVM_BUILD=Debug
set ARCH=x64
set DBG=--di

if "%1"=="release" (
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

rmdir /S /Q dll\%BUILD%
rmdir /S /Q lib\%BUILD%

mkdir dll\%BUILD%
mkdir lib\%BUILD%

rem Build DLL
%TOOL_PATH%\tsc.exe %DBG% --emit=dll %SRC%\src\lib.ts -o %OUTPUT%\dll\%BUILD%\TypeScriptDefaultLib.dll

rem Build Lib
%TOOL_PATH%\tsc.exe %DBG% --emit=obj --export=none %SRC%\src\lib.ts -o %OUTPUT%\lib\%BUILD%\lib.obj
rem %TOOL_PATH%\tsc.exe %DBG% --emit=llvm --export=none %SRC%\src\lib.ts -o %OUTPUT%\lib\%BUILD%\lib.ll

llvm-lib.exe /out:%OUTPUT%\lib\%BUILD%\TypeScriptDefaultLib.lib %OUTPUT%\lib\%BUILD%\lib.obj

del %OUTPUT%\lib\%BUILD%\lib.obj

set BUILD_LIB_PATH=.\__build\%BUILD%\defaultlib
rmdir /S /Q %BUILD_LIB_PATH%
mkdir %BUILD_LIB_PATH%
xcopy %SRC%\dll\%BUILD% %BUILD_LIB_PATH%\dll /h /i /c /k /e /r /y
xcopy %SRC%\lib\%BUILD% %BUILD_LIB_PATH%\lib /h /i /c /k /e /r /y
xcopy %SRC%\src\*.* %BUILD_LIB_PATH% /h /c /k /e /r /y