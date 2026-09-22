function Test([string]$config, [string]$mode, [string]$fileName)
{
    $BUILD="debug"
    $BUILD1="Debug"
    $VER="-2026"
    $LLVM_BUILD="Debug"
    $ARCH="x64"
    $DBG="--di --opt_level=0"
    $OPTIONS="--nowarn"
    $TOOL="tslang"

    $test=$fileName
    if ($config -eq "release") {
	    $BUILD="release"
	    $BUILD1="release"
	    $LLVM_BUILD="Release"
	    $DBG=""
        $OPTIONS+=" --opt --opt_level=3"
    }

    $SRC="."
    $OUTPUT="."

    if ($null -eq $Env:TOOL_PATH) {
	    $BUILD_PATH="..\TypeScriptCompiler\__build"
	    #$TOOL_PATH="..\TypeScriptCompiler\__build\$TOOL\windows-msbuild$VER-$BUILD\bin"
        $TOOL_PATH="..\TypeScriptCompiler\__build\$TOOL\windows-msbuild$VER-release\bin"
	    $DEFAULTLIB_BUILD_PATH="..\TypeScriptCompilerDefaultLib\__build"
    } else {
        $TOOL_PATH=$Env:TOOL_PATH
	    $BUILD_PATH=$TOOL_PATH
	    # Compiled default lib is staged under .\__build\defaultlib\{dll,lib}\<mode>
	    # relative to the DefaultLib repo root (the tests working directory).
	    $DEFAULTLIB_BUILD_PATH=".\__build"
    }

    if ($null -eq $Env:GC_LIB_PATH) {
	    $Env:GC_LIB_PATH="$BUILD_PATH\gc\msbuild\$ARCH\$BUILD\$BUILD1"
    }
    if ($null -eq $Env:LLVM_LIB_PATH) {
	    $Env:LLVM_LIB_PATH="$BUILD_PATH\llvm\msbuild\$ARCH\$BUILD\$BUILD1\lib"
    }
    if ($null -eq $Env:TSLANG_LIB_PATH) {
	    $Env:TSLANG_LIB_PATH="$BUILD_PATH\$TOOL\windows-msbuild$VER-$BUILD\lib"
    }
    if ($null -eq $Env:DEFAULT_LIB_PAT) {
	    $Env:DEFAULT_LIB_PATH="$DEFAULTLIB_BUILD_PATH"
    }

    $DBG_ARGS = [string[]]$(if ($DBG -ne "") { $DBG -split " " } else { @() })
    $OPTIONS_ARGS = [string[]]$(if ($OPTIONS -ne "") { $OPTIONS -split " " } else { @() })

    $isX86 = ($Env:TSLANG_ARCH -eq "x86")

    if ($isX86) {
        # 32-bit exes link statically; --shared-libs=...TypeScriptRuntime.dll below is an x64
        # JIT-only DLL (tslang.cpp's clSharedLibs, read only by --emit=jit in jit.cpp) that
        # --emit=exe never consumes, so it is dropped here rather than passed and ignored.
        # --gc-lib-path/--tslang-lib-path/--default-lib-path are passed explicitly (not left to
        # the $Env: defaults set above) so a value already sitting in the environment for this
        # session can't leak into the x86 build; the compiler appends "x86" to the first two
        # itself, and computes the x86 default-lib subdirectory under the same base path used
        # for x64 (see getDefaultLibSubDir). --default-lib-path here is deliberate isolation,
        # not a behavior change: it is the same $DEFAULTLIB_BUILD_PATH the $Env:DEFAULT_LIB_PATH
        # default above already carries, so this only stops that env var (guarded by the
        # `$Env:DEFAULT_LIB_PAT` typo elsewhere in this function, never fixed here) from being
        # the sole thing standing between an x86 run and a stale x64 value.
        $GC_LIB_PATH_X86="..\TypeScriptCompiler\3rdParty\gc\x64\$BUILD\lib"
        $TSLANG_LIB_PATH_X86="..\TypeScriptCompiler\__build\tslang-runtime\$BUILD"
        $ARCH_ARGS = @("-mtriple=i686-pc-windows-msvc", "--gc-lib-path=$GC_LIB_PATH_X86", "--tslang-lib-path=$TSLANG_LIB_PATH_X86", "--default-lib-path=$DEFAULTLIB_BUILD_PATH")
    }

    if ($mode -eq "compile") {
        if ($isX86) {
            $compile_error_output = ($compile_output = & $TOOL_PATH\$TOOL.exe @DBG_ARGS @OPTIONS_ARGS @ARCH_ARGS --emit=exe $SRC\tests\$test.ts) 2>&1
        } else {
            $compile_error_output = ($compile_output = & $TOOL_PATH\$TOOL.exe @DBG_ARGS @OPTIONS_ARGS --shared-libs=$TOOL_PATH\TypeScriptRuntime.dll --emit=exe $SRC\tests\$test.ts) 2>&1
        }

        $compile_code = $LASTEXITCODE

        if ($compile_code -ne 0) {
            Write-Host "Compile Error" -ForegroundColor Red
            Write-Host "Output: $compile_output" 
            return $false
        }

        $run_error_output = ($run_output = & $SRC\tests\$test.exe) 2>&1

        $run_code = $LASTEXITCODE

        Get-ChildItem $SRC\tests\$test.* -Exclude *.ts | Remove-Item
    }

    if ($mode -eq "jit") {
        $run_error_output = ($run_output = & $TOOL_PATH\$TOOL.exe @DBG_ARGS @OPTIONS_ARGS --shared-libs=$TOOL_PATH\TypeScriptRuntime.dll --emit=jit $SRC\tests\$test.ts) 2>&1

        $run_code = $LASTEXITCODE
    }

    if (($run_error_output | Where-Object {$_.GetType().fullname.Contains("ErrorRecord")} | Measure-Object).Count -gt 0) {
        return $false
    }

    if (($run_output -join "`n") -notmatch "ALL DONE") {
        Write-Host "Run Error (no 'ALL DONE' marker)" -ForegroundColor Red
        Write-Host "Output: $run_output"
        return $false
    }

    return $true
}

function Tests([string]$config, [string]$mode)
{
    Write-Host "Testing..."

    $count = (Get-ChildItem ".\tests" -Filter *.ts | Measure-Object).Count

    $index = 0
    $success = 0
    $failedTests = @()
    Get-ChildItem ".\tests" -Filter *.ts | Foreach-Object {
        $index++

        $testName = "$_ ".PadRight(40, '.')
        Write-Host -NoNewline "$success/$count Test #$index : $testName  "

        $time = (Measure-Command { $result = Test $config $mode $_.Basename }).TotalSeconds
        $time = [math]::Round($time, 2).ToString("0.00")

        if ($result -eq $true) {
            $success++
            Write-Host -NoNewline "Passed    " -ForegroundColor Green
        }
        else {
            $failedTests += $_.Name
            Write-Host -NoNewline "Failed    " -ForegroundColor Red
        }

        Write-Host "$time sec"
    }

    Get-ChildItem -Path $SRC\tests -Include *.pdb,*.ilk,*.exe | Remove-Item

    Write-Host "Finished $config, $mode : $success/$count passed"

    return $failedTests
}

$allFailedTests = @()

if ($Env:TSLANG_ARCH -eq "x86") {
    # The JIT (jit.cpp) refuses x86 targets by design; only the two compile passes apply.
    Write-Host "jit is host-only; skipped for x86" -ForegroundColor Yellow
    $allFailedTests += Tests "release" "compile" | ForEach-Object { "release/compile: $_" }
    $allFailedTests += Tests "debug" "compile" | ForEach-Object { "debug/compile: $_" }
} else {
    $allFailedTests += Tests "release" "compile" | ForEach-Object { "release/compile: $_" }
    $allFailedTests += Tests "release" "jit" | ForEach-Object { "release/jit: $_" }
    $allFailedTests += Tests "debug" "compile" | ForEach-Object { "debug/compile: $_" }
    $allFailedTests += Tests "debug" "jit" | ForEach-Object { "debug/jit: $_" }
}

if ($allFailedTests.Count -gt 0) {
    Write-Host "Done. $($allFailedTests.Count) test(s) failed:" -ForegroundColor Red
    $allFailedTests | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}

Write-Host "Done. All tests passed." -ForegroundColor Green
exit 0