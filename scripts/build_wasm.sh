#!/bin/bash
# Builds the default library for WebAssembly (wasm32-unknown-unknown, wasm64-unknown-unknown) on a
# Linux host: scripts/build_wasm.bat's counterpart, which explains the differences from the other
# targets (no C++ wrappers: the host the program runs in implements them and the C library).
#
#   scripts/build_wasm.sh [wasm32|wasm64] [release|debug] [rc|none|own]   (default: every one)
#
# TOOL_PATH: the directory holding tslang (default: ../TypeScriptCompiler/__build/tslang/ninja/release/bin)
# LLVM_AR:   llvm-ar (default: llvm-ar on PATH)
#
# Output: __build/defaultlib/lib/<arch>/unknown/unknown/unknown/<mode>/<model>/libTypeScriptDefaultLib.a

ROOT=$(cd "$(dirname "$0")/.." && pwd)
ARCHES=${1:-"wasm32 wasm64"}
MODES=${2:-"release debug"}
MODELS=${3:-"rc none own"}

TOOL_PATH=${TOOL_PATH:-$ROOT/../TypeScriptCompiler/__build/tslang/ninja/release/bin}
TSLANG=$TOOL_PATH/tslang
LLVM_AR=${LLVM_AR:-llvm-ar}

if [ ! -x "$TSLANG" ] ; then
	echo "tslang not found in $TOOL_PATH: set TOOL_PATH"
	exit 1
fi

if ! command -v "$LLVM_AR" > /dev/null ; then
	echo "llvm-ar not found: put LLVM's bin folder on PATH or set LLVM_AR"
	exit 1
fi

for ARCH in $ARCHES ; do
	case "$ARCH" in wasm32|wasm64) ;; *) echo "unknown arch \"$ARCH\": wasm32 or wasm64" ; exit 1 ;; esac
	TRIPLE=$ARCH-unknown-unknown
	for MODE in $MODES ; do
		case "$MODE" in
			release) DBG="--opt --opt_level=3" ;;
			debug) DBG="--di --opt_level=0" ;;
			*) echo "unknown mode \"$MODE\": release or debug" ; exit 1 ;;
		esac
		for MM in $MODELS ; do
			case "$MM" in
				rc|none|own) ;;
				gc) echo "-mm=gc has no wasm build: the Boehm collector is not built for wasm. Use rc, none or own." ; exit 1 ;;
				*) echo "unknown memory model \"$MM\": rc, none or own" ; exit 1 ;;
			esac

			echo "=== $ARCH $MODE $MM"
			# the archive's folder, from tslang itself with the flags it compiles with below
			LIB_DIR=$("$TSLANG" --print-default-lib-dir=lib -mtriple=$TRIPLE $DBG -mm=$MM)
			if [ -z "$LIB_DIR" ] ; then
				echo "$TSLANG cannot name the output folder (--print-default-lib-dir): it predates the per-target layout"
				exit 1
			fi

			OBJ=$ROOT/__build/obj-$ARCH-$MODE-$MM
			LIB_OUT=$ROOT/__build/$LIB_DIR
			rm -rf "$OBJ" "$LIB_OUT"
			mkdir -p "$OBJ" "$LIB_OUT"

			TSC="$TSLANG -mtriple=$TRIPLE $DBG -mm=$MM --emit=obj --export=none --nowarn --no-default-lib"
			$TSC "$ROOT/src/lib.wasm.ts" -o "$OBJ/lib.wasm.o" || exit 1
			$TSC "$ROOT/src/lib.ts" -o "$OBJ/lib.o" || exit 1
			"$LLVM_AR" rcs "$LIB_OUT/libTypeScriptDefaultLib.a" "$OBJ/lib.o" "$OBJ/lib.wasm.o" || exit 1
			rm -rf "$OBJ"
		done
	done
	"$TSLANG" --version > "$ROOT/__build/defaultlib/COMPILER_VERSION.$ARCH.txt" 2>&1
done

# the declarations a program compiled against this tree reads (the same for every target)
mkdir -p "$ROOT/__build/defaultlib"
cp -r "$ROOT/src/"* "$ROOT/__build/defaultlib/"
