#!/bin/bash

BUILD=debug
PIC=
TOOL=gcc

if [ "$1" == "release" ] ; then
	BUILD=release
fi

if [ "$2" == "clang" ] ; then
	TOOL=clang
fi

if [ "$3" == "pic" ] ; then
	PIC=-relocation-model=pic
fi

SRC=.
OUTPUT=.

if [ -z "${TOOL_PATH}" ]; then
	ROOT=..
	BUILD_PATH=$ROOT/TypeScriptCompiler/__build
	BIN_PATH=$BUILD_PATH/tsc/linux-ninja-$TOOL-$BUILD/bin
else
	BUILD_PATH=$TOOL_PATH
	BIN_PATH=$TOOL_PATH
fi

if [ -z "${GC_LIB_PATH}" ]; then
	export GC_LIB_PATH=$BUILD_PATH/gc/ninja/$BUILD
fi

if [ -z "${LLVM_LIB_PATH}" ]; then
	export LLVM_LIB_PATH=$BUILD_PATH/llvm/ninja/$BUILD/lib
fi

if [ -z "${TSC_LIB_PATH}" ]; then
	export TSC_LIB_PATH=$BUILD_PATH/tsc/linux-ninja-$TOOL-$BUILD/lib
fi

mkdir -p dll/$BUILD
mkdir -p lib/$BUILD
$BIN_PATH/tsc --emit=obj --export=none --no-default-lib $SRC/src/lib.linux.ts $PIC -o $OUTPUT/lib/$BUILD/lib.linux.o

# Build DLL
$BIN_PATH/tsc --emit=dll $SRC/src/lib.ts --obj=$OUTPUT/lib/$BUILD/lib.linux.o $PIC -verbose -o $OUTPUT/dll/$BUILD/libTypeScriptDefaultLib.so

# Build Lib
$BIN_PATH/tsc --emit=obj --export=none --no-default-lib $SRC/src/lib.ts $PIC -o $OUTPUT/lib/$BUILD/lib.o
ar rcs $OUTPUT/lib/libTypeScriptDefaultLib.a $OUTPUT/lib/$BUILD/lib.o
#llvm-ar rcs $OUTPUT/lib/$BUILD/libTypeScriptDefaultLib.a $OUTPUT/lib/$BUILD/lib.o $OUTPUT/lib/$BUILD/lib.linux.o

# Copy
BUILD_LIB_PATH=./__build/$BUILD/defaultlib
mkdir -p $BUILD_LIB_PATH
cp -r $SRC/dll/$BUILD $BUILD_LIB_PATH/
cp -r $SRC/lib/$BUILD $BUILD_LIB_PATH/
cp -r $SRC/src/* $BUILD_LIB_PATH/

#because there 2 compiles at the same time u need to split
rm $OUTPUT/lib/$BUILD/lib.o
rm $OUTPUT/lib/$BUILD/lib.linux.o
