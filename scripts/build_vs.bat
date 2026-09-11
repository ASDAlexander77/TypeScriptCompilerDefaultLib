rem call clean.bat

echo on

set TOOL_BUILD=release
set VER=-2026
set BUILD=debug
set BUILD1=Debug
set LLVM_BUILD=Debug
set ARCH=x64
set DBG=--di --opt_level=0
set DBG_CL=/Zi /std:c++latest
set TOOL_NAME=tslang

if "%1"=="release" (
	set TOOL_BUILD=release
	set BUILD=release
	set BUILD1=release
	set LLVM_BUILD=Release
	set DBG=--opt --opt_level=3
	set DBG_CL=/std:c++latest
)

rem Memory model (%2). The default library is not model-neutral: under gc it allocates through
rem Boehm and pulls libgc in with it, under rc it maintains the block header's reference count
rem and follows the +1 return convention, under none it does neither. A program links the build
rem that matches its own -mm=, so each model needs its own. See tslang/include/TypeScript/Defines.h.
set MM=gc
if not "%2"=="" set MM=%2
set MM_OPT=-mm=%MM%

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
if "%LLVM_LIB_PATH%"=="" (
	set LLVM_LIB_PATH=%BUILD_PATH%\llvm\msbuild\%ARCH%\%BUILD%\%BUILD1%\lib
)
if "%TSLANG_LIB_PATH%"=="" (
	set TSLANG_LIB_PATH=%BUILD_PATH%\%TOOL_NAME%\windows-msbuild%VER%-%BUILD%\lib
)

rd /S /Q dll\%BUILD%\%MM%
rd /S /Q lib\%BUILD%\%MM%

md dll\%BUILD%\%MM%
md lib\%BUILD%\%MM%

rem Check if Visual Studio is installed at default locations
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

for /f "usebackq tokens=*" %%i in (`"%VSWHERE_PATH%" -legacy -latest -property installationPath`) do (
  set "VSPATH="%%i\VC\Auxiliary\Build\vcvars64.bat""
)

call %VSPATH%

rem echo on

rem Build native wrappers for C++ code
cl %DBG_CL% /EHsc /Wall /c /Fo%OUTPUT%\lib\%BUILD%\%MM%\ %SRC%\src\wrappers\io.cpp
cl %DBG_CL% /EHsc /Wall /c /Fo%OUTPUT%\lib\%BUILD%\%MM%\ %SRC%\src\wrappers\datetime.cpp
cl %DBG_CL% /EHsc /Wall /c /Fo%OUTPUT%\lib\%BUILD%\%MM%\ %SRC%\src\wrappers\regex.cpp
cl %DBG_CL% /EHsc /Wall /c /Fo%OUTPUT%\lib\%BUILD%\%MM%\ %SRC%\src\wrappers\thread.cpp
cl %DBG_CL% /EHsc /Wall /c /Fo%OUTPUT%\lib\%BUILD%\%MM%\ %SRC%\src\wrappers\http.cpp

rem Build OS-specific Lib
echo Build OS-specific Lib
%TOOL_PATH%\%TOOL_NAME%.exe %DBG% %MM_OPT% --emit=obj --export=none --nowarn --no-default-lib %SRC%\src\lib.win32.ts -o %OUTPUT%\lib\%BUILD%\%MM%\lib.win32.obj

rem Build DLL
echo Build DLL
%TOOL_PATH%\%TOOL_NAME%.exe %DBG% %MM_OPT% --emit=dll --embed-declarations=false --nowarn --no-default-lib %SRC%\src\lib.ts --obj=%OUTPUT%\lib\%BUILD%\%MM%\lib.win32.obj --obj=%OUTPUT%\lib\%BUILD%\%MM%\io.obj --obj=%OUTPUT%\lib\%BUILD%\%MM%\datetime.obj --obj=%OUTPUT%\lib\%BUILD%\%MM%\regex.obj --obj=%OUTPUT%\lib\%BUILD%\%MM%\thread.obj --obj=%OUTPUT%\lib\%BUILD%\%MM%\http.obj -o %OUTPUT%\dll\%BUILD%\%MM%\TypeScriptDefaultLib.dll

rem Build Lib
echo Build Lib
%TOOL_PATH%\%TOOL_NAME%.exe %DBG% %MM_OPT% --emit=obj --export=none --nowarn --no-default-lib %SRC%\src\lib.ts -o %OUTPUT%\lib\%BUILD%\%MM%\lib.obj
rem %TOOL_PATH%\%TOOL_NAME%.exe %DBG% %MM_OPT% --emit=llvm --export=none %SRC%\src\lib.ts -o %OUTPUT%\lib\%BUILD%\%MM%\lib.ll
rem %TOOL_PATH%\%TOOL_NAME%.exe %DBG% %MM_OPT% --emit=mlir --export=none %SRC%\src\lib.ts 2> %OUTPUT%\lib\%BUILD%\%MM%\lib.mlir

lib.exe /out:%OUTPUT%\lib\%BUILD%\%MM%\TypeScriptDefaultLib.lib %OUTPUT%\lib\%BUILD%\%MM%\lib.obj %OUTPUT%\lib\%BUILD%\%MM%\lib.win32.obj %OUTPUT%\lib\%BUILD%\%MM%\io.obj %OUTPUT%\lib\%BUILD%\%MM%\datetime.obj %OUTPUT%\lib\%BUILD%\%MM%\regex.obj %OUTPUT%\lib\%BUILD%\%MM%\thread.obj %OUTPUT%\lib\%BUILD%\%MM%\http.obj

del %OUTPUT%\lib\%BUILD%\%MM%\lib.obj
del %OUTPUT%\lib\%BUILD%\%MM%\lib.win32.obj
del %OUTPUT%\lib\%BUILD%\%MM%\io.obj
del %OUTPUT%\lib\%BUILD%\%MM%\datetime.obj
del %OUTPUT%\lib\%BUILD%\%MM%\regex.obj
del %OUTPUT%\lib\%BUILD%\%MM%\thread.obj
del %OUTPUT%\lib\%BUILD%\%MM%\http.obj

rem Stage into a single shared defaultlib tree with per-build subfolders under
rem dll\ and lib\. Only the current build's subfolders are refreshed so the
rem other mode (debug/release) staged by a separate run is preserved.
set BUILD_LIB_PATH=.\__build\defaultlib
rd /S /Q %BUILD_LIB_PATH%\dll\%BUILD%\%MM%
rd /S /Q %BUILD_LIB_PATH%\lib\%BUILD%\%MM%
md %BUILD_LIB_PATH%\dll\%BUILD%\%MM%
md %BUILD_LIB_PATH%\lib\%BUILD%\%MM%

rem Record which compiler built this library, so a mismatch (e.g. after an ABI or
rem codegen change in tslang) can be diagnosed from the artifact alone.
%TOOL_PATH%\%TOOL_NAME%.exe --version > %BUILD_LIB_PATH%\COMPILER_VERSION.txt 2>&1

xcopy %SRC%\dll\%BUILD%\%MM% %BUILD_LIB_PATH%\dll\%BUILD%\%MM% /h /i /c /k /e /r /y
xcopy %SRC%\lib\%BUILD%\%MM% %BUILD_LIB_PATH%\lib\%BUILD%\%MM% /h /i /c /k /e /r /y
xcopy %SRC%\src\*.d.ts %BUILD_LIB_PATH% /h /c /k /e /r /y
xcopy %SRC%\src\generics\*.ts %BUILD_LIB_PATH%\generics /h /c /k /e /r /y

if exist .\dll\%BUILD%\%MM%\TypeScriptDefaultLib.dll (
	echo ""
	echo "||||||||||||||||||||||||||||"
	echo "|||||||||| SUCCESS |||||||||"
	echo "||||||||||||||||||||||||||||"
	echo ""
) else (
	echo ""
	echo "XXXXXXXXXXXXXXXXXXXXXXXXXXX"
	echo "XXXXXXXXXX FAILED XXXXXXXXX"
	echo "XXXXXXXXXXXXXXXXXXXXXXXXXXX"
	echo ""
)