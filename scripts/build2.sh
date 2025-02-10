#!/bin/bash

TOOL_BUILD=release
BUILD=debug
PIC=
TOOL=gcc
ARC=ar
DBG_OPTS=--di\ --opt_level=0
DBG_GCC=-g
CPP_FLAGS=-std=c++11 -stdlib=libstdc++

if [ "$1" == "release" ] ; then
	TOOL_BUILD=release
	BUILD=release
	DBG_OPTS=--opt\ --opt_level=3
	DBG_GCC=-O3
fi

if [ "$2" == "clang" ] ; then
	TOOL=clang
	ARC=llvm-ar
fi

if [ "$3" == "pic" ] ; then
	PIC=-relocation-model=pic
fi

SRC=.
OUTPUT=.

if [ -z "${TOOL_PATH}" ]; then
	ROOT=..
	BUILD_PATH=$ROOT/TypeScriptCompiler/__build
	BIN_PATH=$BUILD_PATH/tsc/linux-ninja-$TOOL-$TOOL_BUILD/bin
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
$TOOL $DBG_GCC $CPP_FLAGS -c $SRC/src/wrappers/regex.ts -o $OUTPUT/lib/$BUILD/regex.o

$BIN_PATH/tsc $DBG_OPTS --emit=obj --export=none --no-default-lib $SRC/src/lib.linux.ts $PIC -o $OUTPUT/lib/$BUILD/lib.linux.o

# Build Lib
$BIN_PATH/tsc $DBG_OPTS --emit=obj --export=none --no-default-lib $SRC/src/lib.ts $PIC -o $OUTPUT/lib/$BUILD/lib.o
$ARC rcs $OUTPUT/lib/$BUILD/libTypeScriptDefaultLib.a $OUTPUT/lib/$BUILD/lib.o $OUTPUT/lib/$BUILD/lib.linux.o $OUTPUT/lib/$BUILD/regex.o

# Build DLL
gcc -shared $DBG_GCC $OUTPUT/lib/$BUILD/lib.o $OUTPUT/lib/$BUILD/lib.linux.o $OUTPUT/lib/$BUILD/regex.o -o $OUTPUT/dll/$BUILD/libTypeScriptDefaultLib.so

# Copy
BUILD_LIB_PATH=./__build/$BUILD/defaultlib/
mkdir -p $BUILD_LIB_PATH/dll/
mkdir -p $BUILD_LIB_PATH/lib/
cp -r $SRC/dll/$BUILD/* $BUILD_LIB_PATH/dll/
cp -r $SRC/lib/$BUILD/* $BUILD_LIB_PATH/lib/
cp -r $SRC/src/* $BUILD_LIB_PATH

#because there 2 compiles at the same time u need to split
#rm $OUTPUT/lib/$BUILD/lib.o
#rm $OUTPUT/lib/$BUILD/lib.linux.o
