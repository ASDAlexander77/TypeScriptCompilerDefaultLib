#!/bin/bash

#clean.sh

BUILD=debug

if [ -o release ] ; then
	BUILD=release
fi

SRC=.
OUTPUT=.

ROOT=..
BUILD_PATH=$ROOT/TypeScriptCompiler/__build
BIN_PATH=$BUILD_PATH/tsc/linux-ninja-gcc-$BUILD/bin
export GC_LIB_PATH=$BUILD_PATH/gc/ninja/$BUILD
export LLVM_LIB_PATH=$BUILD_PATH/llvm/ninja/$BUILD/lib
export TSC_LIB_PATH=$BUILD_PATH/tsc/linux-ninja-gcc-$BUILD/lib

mkdir dll
mkdir lib

# Build DLL
$BIN_PATH/tsc --emit=dll $SRC/src/lib.ts -o $OUTPUT/dll/libTypeScriptDefaultLib.so

# Build Lib
$BIN_PATH/tsc --emit=obj --export=none $SRC/src/lib.ts -o $OUTPUT/lib/lib.o
#ar rcs $OUTPUT/lib/libTypeScriptDefaultLib.a $OUTPUT/lib/lib.o
llvm-ar rcs $OUTPUT/lib/libTypeScriptDefaultLib.a $OUTPUT/lib/lib.o
rm $OUTPUT/lib/lib.o

# Copy
BUILD_LIB_PATH=./__build/$BUILD/defaultlib
mkdir $BUILD_LIB_PATH
cp -r $SRC/dll $BUILD_LIB_PATH/dll/
cp -r $SRC/lib $BUILD_LIB_PATH/lib/
cp $SRC/src/* $BUILD_LIB_PATH/