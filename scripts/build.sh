#!/bin/bash

rem call clean.bat

set BUILD=debug
set LLVM_BUILD=Debug
set ARCH=x64

if not "%1"=="release" (
	set BUILD=release
	set LLVM_BUILD=Release
)

set SRC=.
set OUTPUT=.

set ROOT=../..
set GC_LIB_PATH=%ROOT%/TypeScriptCompiler/__build/gc/msbuild/%ARCH%/%BUILD%/Debug
set LLVM_LIB_PATH=%ROOT%/TypeScriptCompiler/__build/llvm/msbuild/%ARCH%/%BUILD%/Debug/lib
set TSC_LIB_PATH=%ROOT%/TypeScriptCompiler/__build/tsc/windows-msbuild-%BUILD%/lib

rem Build DLL
%ROOT%/TypeScriptCompiler/__build/tsc/windows-msbuild-%BUILD%/bin/tsc --emit=dll %SRC%/src/lib.ts -o %OUTPUT%/dll/lib.dll

rem Build Lib
%ROOT%/TypeScriptCompiler/__build/tsc/windows-msbuild-%BUILD%/bin/tsc --emit=obj --export=none %SRC%/src/lib.ts -o %OUTPUT%/lib/lib.obj
%ROOT%/TypeScriptCompiler/3rdParty/llvm/%ARCH%/%LLVM_BUILD%/bin/llvm-lib %OUTPUT%/lib/lib.obj
