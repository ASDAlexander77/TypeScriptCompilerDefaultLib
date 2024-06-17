#!/bin/bash

#clean.sh

BUILD=debug

if [ -o release ] ; then
	BUILD=release
fi

SRC=.
OUTPUT=.

ROOT=..
export GC_LIB_PATH=$ROOT/TypeScriptCompiler/__build/gc/ninja/$BUILD
export LLVM_LIB_PATH=$ROOT/TypeScriptCompiler/__build/llvm/ninja/$BUILD/lib
export TSC_LIB_PATH=$ROOT/TypeScriptCompiler/__build/tsc/linux-ninja-gcc-$BUILD/lib

mkdir dll
mkdir lib

# Build DLL
$ROOT/TypeScriptCompiler/__build/tsc/linux-ninja-gcc-$BUILD/bin/tsc --emit=dll $SRC/src/lib.ts -o $OUTPUT/dll/liblib.so

# Build Lib
$ROOT/TypeScriptCompiler/__build/tsc/linux-ninja-gcc-$BUILD/bin/tsc --emit=obj --export=none $SRC/src/lib.ts -o $OUTPUT/lib/lib.o
#ar rcs $OUTPUT/lib/lib.a $OUTPUT/lib/lib.o
llvm-ar rcs $OUTPUT/lib/lib.a $OUTPUT/lib/lib.o
