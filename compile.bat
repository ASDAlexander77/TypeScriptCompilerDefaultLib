set BUILD_PATH=..\TypeScriptCompiler\__build\tsc\windows-msbuild-2026-release
set TOOL_PATH=%BUILD_PATH%\bin
set TSC_LIB_PATH=%BUILD_PATH%\lib
set GC_LIB_PATH=..\TypeScriptCompiler\3rdParty\gc\x64\release\lib
set LLVM_LIB_PATH=..\TypeScriptCompiler\3rdParty\llvm\x64\release\lib
%TOOL_PATH%\tsc.exe  --nowarn --shared-libs=%TOOL_PATH%\TypeScriptRuntime.dll --default-lib-path=__build --gc-lib-path=%GC_LIB_PATH% --tsc-lib-path=%TSC_LIB_PATH% --llvm-lib-path=%LLVM_LIB_PATH% --emit=exe %1