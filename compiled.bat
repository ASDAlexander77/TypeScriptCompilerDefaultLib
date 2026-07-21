set BUILD_PATH=..\TypeScriptCompiler\__build\tslang\windows-msbuild-2026-debug
set TOOL_PATH=%BUILD_PATH%\bin
set TSLANG_LIB_PATH=%BUILD_PATH%\lib
set GC_LIB_PATH=..\TypeScriptCompiler\3rdParty\gc\x64\debug\lib
set LLVM_LIB_PATH=..\TypeScriptCompiler\3rdParty\llvm\x64\debug\lib
%TOOL_PATH%\tslang.exe  --nowarn --shared-libs=%TOOL_PATH%\TypeScriptRuntime.dll --default-lib-path=__build\debug --gc-lib-path=%GC_LIB_PATH% --tslang-lib-path=%TSLANG_LIB_PATH% --llvm-lib-path=%LLVM_LIB_PATH% --di --opt_level=0 --emit=exe %1