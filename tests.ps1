function Test([string]$config, [string]$mode, [string]$fileName)
{
    $BUILD="debug"
    $BUILD1="Debug"
    $VER="-2026"
    $LLVM_BUILD="Debug"
    $ARCH="x64"
    $DBG="--di"
    $OPTIONS="--nowarn"
    $TOOL="tslang"

    $test=$fileName
    if ($config -eq "release") {
	    $BUILD="release"
	    $BUILD1="release"
	    $LLVM_BUILD="Release"
	    $DBG=""
    }

    $SRC="."
    $OUTPUT="."

    if ($null -eq $Env:TOOL_PATH) {
	    $BUILD_PATH="..\TypeScriptCompiler\__build"
	    $TOOL_PATH="..\TypeScriptCompiler\__build\$TOOL\windows-msbuild$VER-$BUILD\bin"
	    $DEFAULTLIB_BUILD_PATH="..\TypeScriptCompilerDefaultLib\__build\$BUILD"
    } else {
	    $BUILD_PATH=$TOOL_PATH
	    $DEFAULTLIB_BUILD_PATH=$TOOL_PATH
    }

    if ($null -eq $Env:GC_LIB_PATH) {
	    $Env:GC_LIB_PATH="$BUILD_PATH\gc\msbuild\$ARCH\$BUILD\$BUILD1"
    }
    if ($null -eq $Env:LLVM_LIB_PATH) {
	    $Env:LLVM_LIB_PATH="$BUILD_PATH\llvm\msbuild\$ARCH\$BUILD\$BUILD1\lib"
    }
    if ($null -eq $Env:TSC_LIB_PATH) {
	    $Env:TSC_LIB_PATH="$BUILD_PATH\$TOOL\windows-msbuild$VER-$BUILD\lib"
    }
    if ($null -eq $Env:DEFAULT_LIB_PAT) {
	    $Env:DEFAULT_LIB_PATH="$DEFAULTLIB_BUILD_PATH"
    }

    $DBG_ARGS = if ($DBG -ne "") { @($DBG) } else { @() }

    if ($mode -eq "compile") {
        $compile_error_output = ($compile_output = & $TOOL_PATH\$TOOL.exe @DBG_ARGS $OPTIONS --shared-libs=$TOOL_PATH\TypeScriptRuntime.dll --emit=exe $SRC\tests\$test.ts) 2>&1

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
        $run_error_output = ($run_output = & $TOOL_PATH\$TOOL.exe @DBG_ARGS $OPTIONS --shared-libs=$TOOL_PATH\TypeScriptRuntime.dll --emit=jit $SRC\tests\$test.ts) 2>&1

        $run_code = $LASTEXITCODE
    }

    if (($run_error_output | Where-Object {$_.GetType().fullname.Contains("ErrorRecord")} | Measure-Object).Count -gt 0) {
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
    Get-ChildItem ".\tests" -Filter *.ts | Foreach-Object {
        $index++

        $testName = "$_ ".PadRight(40, '.')
        Write-Host -NoNewline "$success/$count Test #$index : $testName  "
        #Start-Process -NoNewWindow -FilePath "C:\wamp64\bin\mysql\mysql5.7.19\bin\mysql" -ArgumentList "-u root","-proot","-h localhost"

        $time = (Measure-Command { $result = Test "release" "compile" $_.Basename }).TotalSeconds
        $time = [math]::Round($time, 2).ToString("0.00")

        if ($result -eq $true) {
            $success++
            Write-Host -NoNewline "Passed    " -ForegroundColor Green
        }
        else {
            Write-Host -NoNewline "Failed    " -ForegroundColor Red
        }

        Write-Host "$time sec"
    }

    Get-ChildItem -Path $SRC\tests -Include *.pdb,*.ilk,*.exe | Remove-Item

    Write-Host "Finished $config, $mode"
}

Tests "release" "compile"
Tests "release" "jit"
Tests "debug" "compile"
Tests "debug" "jit"

Write-Host "Done."