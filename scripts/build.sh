#!/bin/bash

#clean.sh

BUILD=debug

if [ -o release ] ; then
	BUILD=release
fi

SRC=.
OUTPUT=.

ROOT=..
GC_LIB_PATH=%ROOT%/TypeScriptCompiler/__build/gc/ninja/$BUILD
LLVM_LIB_PATH=%ROOT%/TypeScriptCompiler/__build/llvm/ninja/$BUILD/lib
TSC_LIB_PATH=%ROOT%/TypeScriptCompiler/__build/tsc/linux-ninja-gcc-$BUILD/lib

# Build DLL
$ROOT/TypeScriptCompiler/__build/tsc/linux-ninja-gcc-$BUILD/bin/tsc --emit=dll $SRC/src/lib.ts -o $OUTPUT/dll/lib.dll

# Build Lib
$ROOT/TypeScriptCompiler/__build/tsc/linux-ninja-gcc-$BUILD/bin/tsc --emit=obj --export=none $SRC/src/lib.ts -o $OUTPUT/lib/lib.obj
llvm-lib $OUTPUT/lib/lib.obj
