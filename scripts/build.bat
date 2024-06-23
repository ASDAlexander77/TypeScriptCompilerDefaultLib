rem call clean.bat

set BUILD=debug
set BUILD1=Debug
set LLVM_BUILD=Debug
set ARCH=x64

if not "%1"=="release" (
	set BUILD=release
	set BUILD1=release
	set LLVM_BUILD=Release
)

set SRC=.
set OUTPUT=.

set ROOT=..\..
set BUILD_PATH=%ROOT%\TypeScriptCompiler\__build
set _3RD_PATH=%ROOT%\TypeScriptCompiler\3rdParty
set GC_LIB_PATH=%BUILD_PATH%\gc\msbuild\%ARCH%\%BUILD%\Debug
set LLVM_LIB_PATH=%BUILD_PATH%\llvm\msbuild\%ARCH%\%BUILD%\Debug\lib
set TSC_LIB_PATH=%BUILD_PATH%\tsc\windows-msbuild-%BUILD%\lib

mkdir dll
mkdir lib

rem Build DLL
%BUILD_PATH%\tsc\windows-msbuild-%BUILD%\bin\tsc.exe --emit=dll %SRC%\src\lib.ts -o %OUTPUT%\dll\TypeScriptDefaultLib.dll

rem Build Lib
%BUILD_PATH%\tsc\windows-msbuild-%BUILD%\bin\tsc.exe --emit=obj --export=none %SRC%\src\lib.ts -o %OUTPUT%\lib\lib.obj
%_3RD_PATH%\llvm\%ARCH%\%LLVM_BUILD%\bin\llvm-lib.exe /out:%OUTPUT%\lib\TypeScriptDefaultLib.lib %OUTPUT%\lib\lib.obj
del %OUTPUT%\lib\lib.obj
