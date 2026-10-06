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

# The output folders, from tslang itself (--print-default-lib-dir), with the same build and model
# flags it compiles with below: defaultlib/{lib,dll}/<arch>/<vendor>/<os>/<env>/<build>/<model>, composed
# the way tslang later looks the library up (see tslang/include/TypeScript/Defines.h). Spelled out
# here, the two would drift apart.
LIB_OUT=$($BIN_PATH/$TOOL_NAME --print-default-lib-dir=lib $DBG_OPTS $MM_OPT)
DLL_OUT=$($BIN_PATH/$TOOL_NAME --print-default-lib-dir=dll $DBG_OPTS $MM_OPT)
if [ -z "$LIB_OUT" ] || [ -z "$DLL_OUT" ] ; then
	echo "$BIN_PATH/$TOOL_NAME cannot name the output folders (--print-default-lib-dir): it predates the per-target layout, or is missing"
	exit 1
fi

rm -rf $DLL_OUT $LIB_OUT
mkdir -p $DLL_OUT
mkdir -p $LIB_OUT
$TOOL $DBG_GCC $CPP_FLAGS -c $SRC/src/wrappers/io.cpp -o $OUTPUT/$LIB_OUT/io.o
$TOOL $DBG_GCC $CPP_FLAGS -c $SRC/src/wrappers/datetime.cpp -o $OUTPUT/$LIB_OUT/datetime.o
$TOOL $DBG_GCC $CPP_FLAGS -c $SRC/src/wrappers/regex.cpp -o $OUTPUT/$LIB_OUT/regex.o
$TOOL $DBG_GCC $CPP_FLAGS -c $SRC/src/wrappers/thread.cpp -o $OUTPUT/$LIB_OUT/thread.o
$TOOL $DBG_GCC $CPP_FLAGS -c $SRC/src/wrappers/http_linux.cpp -o $OUTPUT/$LIB_OUT/http_linux.o
$TOOL $DBG_GCC $CPP_FLAGS -c $SRC/src/wrappers/memory.cpp -o $OUTPUT/$LIB_OUT/memory.o

$BIN_PATH/$TOOL_NAME $DBG_OPTS $MM_OPT --emit=obj --export=none --nowarn --no-default-lib $SRC/src/lib.linux.ts $PIC -o $OUTPUT/$LIB_OUT/lib.linux.o

# Build Lib
$BIN_PATH/$TOOL_NAME $DBG_OPTS $MM_OPT --emit=obj --export=none --nowarn --no-default-lib $SRC/src/lib.ts $PIC -o $OUTPUT/$LIB_OUT/lib.o
$ARC rcs $OUTPUT/$LIB_OUT/libTypeScriptDefaultLibCore.a $OUTPUT/$LIB_OUT/lib.o $OUTPUT/$LIB_OUT/lib.linux.o $OUTPUT/$LIB_OUT/io.o $OUTPUT/$LIB_OUT/datetime.o $OUTPUT/$LIB_OUT/regex.o $OUTPUT/$LIB_OUT/thread.o $OUTPUT/$LIB_OUT/http_linux.o $OUTPUT/$LIB_OUT/memory.o

# A static archive cannot record its own dependencies on ELF (there is no ld.bfd equivalent of
# the `#pragma comment(lib, ...)` http.cpp uses on Windows), so programs linking
# -lTypeScriptDefaultLib failed with undefined curl_* references. libTypeScriptDefaultLib.a is
# therefore a GNU linker script (as glibc's libc.so is) that pulls in the real archive plus the
# system libraries it needs. The compiler keeps passing -lTypeScriptDefaultLib unchanged.
cat > $OUTPUT/$LIB_OUT/libTypeScriptDefaultLib.a <<EOF
/* GNU ld script: TypeScriptDefaultLib and its external dependencies */
INPUT(-lTypeScriptDefaultLibCore -lcurl)
EOF

# Build DLL
# Linked with g++ plus -lm so libstdc++/libm become NEEDED entries of the .so rather than
# unresolved symbols the loading process happens to provide. The gc build still leaves GC_*
# undefined on purpose: they must bind to the one collector already in the process
# (libTypeScriptRuntime.so under the JIT, libgc.a in an exe); linking libgc.a in here would
# give the library a second, separate heap.
g++ -shared $DBG_GCC $OUTPUT/$LIB_OUT/lib.o $OUTPUT/$LIB_OUT/lib.linux.o $OUTPUT/$LIB_OUT/io.o $OUTPUT/$LIB_OUT/datetime.o $OUTPUT/$LIB_OUT/regex.o $OUTPUT/$LIB_OUT/thread.o $OUTPUT/$LIB_OUT/http_linux.o $OUTPUT/$LIB_OUT/memory.o -lcurl -lm -o $OUTPUT/$DLL_OUT/libTypeScriptDefaultLib.so

# Copy
# Stage into a single shared defaultlib tree with per-target, per-build and per-model subfolders
# under dll/ and lib/. Only the current build's subfolders are refreshed, and they are refreshed
# from the source tree, so the other targets and modes (debug/release) staged by separate runs are
# preserved and so are the models staged by earlier runs of this one - only this run's model was
# removed from the source tree above. LIB_OUT/DLL_OUT start with defaultlib/, so they go under
# STAGE_PATH; the declarations go to its defaultlib/ root, shared by every build.
STAGE_PATH=./__build
BUILD_LIB_PATH=$STAGE_PATH/defaultlib/
rm -rf $STAGE_PATH/$DLL_OUT $STAGE_PATH/$LIB_OUT
mkdir -p $STAGE_PATH/$DLL_OUT
mkdir -p $STAGE_PATH/$LIB_OUT

# Record which compiler built this library, so a mismatch (e.g. after an ABI or
# codegen change in tslang) can be diagnosed from the artifact alone.
$BIN_PATH/$TOOL_NAME --version > $BUILD_LIB_PATH/COMPILER_VERSION.txt 2>&1

# cleanup intermediate object files
rm $OUTPUT/$LIB_OUT/*.o

cp -r $SRC/$DLL_OUT/* $STAGE_PATH/$DLL_OUT/
cp -r $SRC/$LIB_OUT/* $STAGE_PATH/$LIB_OUT/
cp -r $SRC/src/* $BUILD_LIB_PATH
