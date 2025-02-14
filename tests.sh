#!/bin/bash

function test_script() {
    config="$1"
    mode="$2"
    fileName="$3"

    BUILD="debug"
    BUILD1="Debug"
    LLVM_BUILD="Debug"
    ARCH="x64"
    DBG="--di"
    OPTIONS="--nowarn"

    test="$fileName"
    if [ "$config" == "release" ]; then
        BUILD="release"
        BUILD1="release"
        LLVM_BUILD="Release"
        DBG=""
    fi

    SRC="."
    OUTPUT="."

    if [ -z "$TOOL_PATH" ]; then
        BUILD_PATH="../TypeScriptCompiler/__build"
        TOOL_PATH="../TypeScriptCompiler/__build/tsc/linux-ninja-gcc-$BUILD/bin"
        DEFAULTLIB_BUILD_PATH="../TypeScriptCompilerDefaultLib/__build/$BUILD"
    else
        BUILD_PATH="$TOOL_PATH"
        DEFAULTLIB_BUILD_PATH="$TOOL_PATH"
    fi

    export GC_LIB_PATH="${GC_LIB_PATH:-$BUILD_PATH/gc/ninja/$BUILD}"
    export LLVM_LIB_PATH="${LLVM_LIB_PATH:-$BUILD_PATH/llvm/ninja/$BUILD/lib}"
    export TSC_LIB_PATH="${TSC_LIB_PATH:-$BUILD_PATH/tsc/linux-ninja-gcc-$BUILD/lib}"
    export DEFAULT_LIB_PATH="${DEFAULT_LIB_PATH:-$DEFAULTLIB_BUILD_PATH}"

    if [ "$mode" == "compile" ]; then
        compile_output=$( "$TOOL_PATH/tsc" $DBG $OPTIONS --shared-libs="$TOOL_PATH/libTypeScriptRuntime.so" --emit=exe "$SRC/tests/$test.ts" 2>&1 )
        compile_code=$?

        if [ $compile_code -ne 0 ]; then
            echo -e "\e[31mCompile Error\e[0m"
            echo "Output: $compile_output"
            return 1
        fi

        run_output=$( "$SRC/tests/$test" 2>&1 )
        run_code=$?
    fi

    if [ "$mode" == "jit" ]; then
        run_output=$( "$TOOL_PATH/tsc" $DBG $OPTIONS --shared-libs="$TOOL_PATH/libTypeScriptRuntime.so" --emit=jit "$SRC/tests/$test.ts" 2>&1 )
        run_code=$?
    fi

    if [[ "$run_output" == *"Error"* ]]; then
        return 1
    fi

    return 0
}

function tests() {
    config="$1"
    mode="$2"
    echo "Testing... $config, $mode"

    count=$(find ./tests -name "*.ts" | wc -l)
    index=0
    success=0

    for file in ./tests/*.ts; do
        index=$((index + 1))
        testName="$(basename "$file")"
        printf "%d/%d Test #%d : %-40s  " "$success" "$count" "$index" "$testName"

        start=$(date +%s.%N)
        test_script "$config" "$mode" "$(basename "$file" .ts)"
        result=$?
        end=$(date +%s.%N)

        #runtime=$(printf "%.2f" $((end - start)))
        runtime=$(awk -v a="$end" -v b="$start" 'BEGIN { printf "%s", a-b }' </dev/null)

        if [ $result -eq 0 ]; then
            success=$((success + 1))
            printf "\e[32mPassed\e[0m    "
        else
            printf "\e[31mFailed\e[0m    "
        fi

        echo "$runtime sec"
    done

    find "$SRC/tests" -not -name "*.ts" -type f -delete
    echo "Finished $config, $mode"
}

tests "release" "compile"
tests "release" "jit"
tests "debug" "compile"
tests "debug" "jit"

echo "Done."
