#!/bin/bash
# scripts/build.sh <debug|release> [gcc|clang] [pic] [gc|rc|none]

TOOL_BUILD=release
BUILD=debug
PIC=
TOOL=gcc
ARC=ar
DBG_OPTS=--di\ --opt_level=0
DBG_GCC=-g
CPP_FLAGS=-std=c++17
TOOL_NAME=tslang

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
	CPP_FLAGS=$CPP_FLAGS\ -fPIC
fi

# Memory model ($4). The default library is not model-neutral: under gc it allocates through
# Boehm and pulls libgc in with it, under rc it maintains the block header's reference count
# and follows the +1 return convention, under none it does neither. A program links the build
# that matches its own -mm=, so each model needs its own. See tslang/include/TypeScript/Defines.h.
MM=gc
if [ -n "$4" ] ; then
	MM=$4
fi
MM_OPT=-mm=$MM

SRC=.
OUTPUT=.

if [ -z "${TOOL_PATH}" ]; then
	ROOT=..
	BUILD_PATH=$ROOT/TypeScriptCompiler/__build
	BIN_PATH=$BUILD_PATH/$TOOL_NAME/ninja/$TOOL_BUILD/bin
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

if [ -z "${TSLANG_LIB_PATH}" ]; then
	export TSLANG_LIB_PATH=$BUILD_PATH/$TOOL_NAME/ninja/$BUILD/lib
fi

rm -rf dll/$BUILD/$MM lib/$BUILD/$MM
mkdir -p dll/$BUILD/$MM
mkdir -p lib/$BUILD/$MM
$TOOL $DBG_GCC $CPP_FLAGS -c $SRC/src/wrappers/io.cpp -o $OUTPUT/lib/$BUILD/$MM/io.o
$TOOL $DBG_GCC $CPP_FLAGS -c $SRC/src/wrappers/datetime.cpp -o $OUTPUT/lib/$BUILD/$MM/datetime.o
$TOOL $DBG_GCC $CPP_FLAGS -c $SRC/src/wrappers/regex.cpp -o $OUTPUT/lib/$BUILD/$MM/regex.o
$TOOL $DBG_GCC $CPP_FLAGS -c $SRC/src/wrappers/thread.cpp -o $OUTPUT/lib/$BUILD/$MM/thread.o
$TOOL $DBG_GCC $CPP_FLAGS -c $SRC/src/wrappers/http_linux.cpp -o $OUTPUT/lib/$BUILD/$MM/http_linux.o

$BIN_PATH/$TOOL_NAME $DBG_OPTS $MM_OPT --emit=obj --export=none --nowarn --no-default-lib $SRC/src/lib.linux.ts $PIC -o $OUTPUT/lib/$BUILD/$MM/lib.linux.o

# Build Lib
$BIN_PATH/$TOOL_NAME $DBG_OPTS $MM_OPT --emit=obj --export=none --nowarn --no-default-lib $SRC/src/lib.ts $PIC -o $OUTPUT/lib/$BUILD/$MM/lib.o
$ARC rcs $OUTPUT/lib/$BUILD/$MM/libTypeScriptDefaultLib.a $OUTPUT/lib/$BUILD/$MM/lib.o $OUTPUT/lib/$BUILD/$MM/lib.linux.o $OUTPUT/lib/$BUILD/$MM/io.o $OUTPUT/lib/$BUILD/$MM/datetime.o $OUTPUT/lib/$BUILD/$MM/regex.o $OUTPUT/lib/$BUILD/$MM/thread.o $OUTPUT/lib/$BUILD/$MM/http_linux.o

# Build DLL
gcc -shared $DBG_GCC $OUTPUT/lib/$BUILD/$MM/lib.o $OUTPUT/lib/$BUILD/$MM/lib.linux.o $OUTPUT/lib/$BUILD/$MM/io.o $OUTPUT/lib/$BUILD/$MM/datetime.o $OUTPUT/lib/$BUILD/$MM/regex.o $OUTPUT/lib/$BUILD/$MM/thread.o $OUTPUT/lib/$BUILD/$MM/http_linux.o -lcurl -o $OUTPUT/dll/$BUILD/$MM/libTypeScriptDefaultLib.so

# Copy
# Stage into a single shared defaultlib tree with per-build subfolders under dll/ and lib/,
# each holding one subfolder per memory model. Only the current build's subfolders are
# refreshed, and they are refreshed from the source tree, so the other mode (debug/release)
# staged by a separate run is preserved and so are the models staged by earlier runs of this
# one - only this run's model was removed from the source tree above.
BUILD_LIB_PATH=./__build/defaultlib/
rm -rf $BUILD_LIB_PATH/dll/$BUILD/$MM $BUILD_LIB_PATH/lib/$BUILD/$MM
mkdir -p $BUILD_LIB_PATH/dll/$BUILD/$MM
mkdir -p $BUILD_LIB_PATH/lib/$BUILD/$MM

# Record which compiler built this library, so a mismatch (e.g. after an ABI or
# codegen change in tslang) can be diagnosed from the artifact alone.
$BIN_PATH/$TOOL_NAME --version > $BUILD_LIB_PATH/COMPILER_VERSION.txt 2>&1

# cleanup intermediate object files
rm $OUTPUT/lib/$BUILD/$MM/*.o

cp -r $SRC/dll/$BUILD/$MM/* $BUILD_LIB_PATH/dll/$BUILD/$MM/
cp -r $SRC/lib/$BUILD/$MM/* $BUILD_LIB_PATH/lib/$BUILD/$MM/
cp -r $SRC/src/* $BUILD_LIB_PATH
