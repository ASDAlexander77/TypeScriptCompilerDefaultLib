#!/bin/bash
# Runs every test in ./tests, release and debug, compiled and under the JIT.
#   ./tests.sh        the compiler's default memory model (gc)
#   ./tests.sh rc     -mm=rc, against the default library built for it; also TSLANG_MM=rc
# A test whose first line starts with "// gc only" is skipped under any other model.
MODEL="${1:-$TSLANG_MM}"

# The library paths the environment gives when the script starts. One it does not give is worked
# out again for each pass, release or debug: exported once by the first pass, it made every later
# one link the release libraries.
GIVEN_GC_LIB_PATH="$GC_LIB_PATH"
GIVEN_LLVM_LIB_PATH="$LLVM_LIB_PATH"
GIVEN_TSLANG_LIB_PATH="$TSLANG_LIB_PATH"

function test_script() {
    config="$1"
    mode="$2"
    fileName="$3"

    BUILD="debug"
    BUILD1="Debug"
    LLVM_BUILD="Debug"
    ARCH="x64"
    DBG="--di --opt_level=0"
    OPTIONS="--nowarn"
    TOOL="tslang"

    test="$fileName"
    if [ "$config" == "release" ]; then
        BUILD="release"
        BUILD1="release"
        LLVM_BUILD="Release"
        DBG=""
        OPTIONS="--opt --opt_level=3"
    fi

    if [ -n "$MODEL" ]; then
        OPTIONS="$OPTIONS -mm=$MODEL"
    fi

    SRC="."
    OUTPUT="."

    if [ -z "$TOOL_PATH" ]; then
        BUILD_PATH="../TypeScriptCompiler/__build"
        TOOL_PATH="../TypeScriptCompiler/__build/$TOOL/linux-ninja-gcc-$BUILD/bin"
        #DEFAULTLIB_BUILD_PATH="../TypeScriptCompilerDefaultLib/__build"
    else
        BUILD_PATH="$TOOL_PATH"
    fi

    # Compiled default lib is staged under ./__build/defaultlib/{dll,lib}/<mode>
    # relative to the DefaultLib repo root (the tests working directory).
    DEFAULTLIB_BUILD_PATH="./__build"

    export GC_LIB_PATH="${GIVEN_GC_LIB_PATH:-$BUILD_PATH/gc/ninja/$BUILD}"
    export LLVM_LIB_PATH="${GIVEN_LLVM_LIB_PATH:-$BUILD_PATH/llvm/ninja/$BUILD/lib}"
    export TSLANG_LIB_PATH="${GIVEN_TSLANG_LIB_PATH:-$BUILD_PATH/$TOOL/linux-ninja-gcc-$BUILD/lib}"
    export DEFAULT_LIB_PATH="${DEFAULT_LIB_PATH:-$DEFAULTLIB_BUILD_PATH}"

    if [ "$mode" == "compile" ]; then
        # apt install ninja-build libcurl4-openssl-dev
        # and -lcurl will be included in compile process in tslang
        compile_output=$( "$TOOL_PATH/$TOOL" $DBG $OPTIONS --shared-libs="$TOOL_PATH/libTypeScriptRuntime.so" --emit=exe "$SRC/tests/$test.ts" 2>&1 )
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
        run_output=$( "$TOOL_PATH/$TOOL" $DBG $OPTIONS --shared-libs="$TOOL_PATH/libTypeScriptRuntime.so" --emit=jit "$SRC/tests/$test.ts" 2>&1 )
        run_code=$?
    fi

    if [[ "$run_output" == *"Error"* ]]; then
        return 1
    fi

    return 0
}

failed_tests=()

# A test that needs the collector says so on its first line ("// gc only: WeakRef ..."): under
# rc, none or own the compiler rejects the collector's API, so it cannot pass there.
function gc_only() {
    head -n 1 "$1" | grep -q '^// gc only'
}

function tests() {
    config="$1"
    mode="$2"
    echo "Testing... $config, $mode"

    count=$(find ./tests -name "*.ts" | wc -l)
    index=0
    success=0
    skipped=0

    for file in ./tests/*.ts; do
        index=$((index + 1))
        testName="$(basename "$file")"
        printf "%d/%d Test #%d : %-40s  " "$success" "$count" "$index" "$testName"

        if [ -n "$MODEL" ] && [ "$MODEL" != "gc" ] && gc_only "$file"; then
            skipped=$((skipped + 1))
            printf "\e[33mSkipped\e[0m   (gc only)\n"
            continue
        fi

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
            failed_tests+=("$config/$mode: $testName")
            printf "\e[31mFailed\e[0m    "
        fi

        echo "$runtime sec"
    done

    find "$SRC/tests" -not -name "*.ts" -type f -delete
    echo "Finished $config, $mode : $success/$count passed, $skipped skipped"
}

if [ -n "$MODEL" ]; then
    echo "Memory model: $MODEL"
fi

tests "release" "compile"
tests "release" "jit"
tests "debug" "compile"
tests "debug" "jit"

if [ ${#failed_tests[@]} -gt 0 ]; then
    echo -e "\e[31mDone. ${#failed_tests[@]} test(s) failed:\e[0m"
    for t in "${failed_tests[@]}"; do
        echo -e "\e[31m  - $t\e[0m"
    done
    exit 1
fi

echo -e "\e[32mDone. All tests passed.\e[0m"
exit 0
