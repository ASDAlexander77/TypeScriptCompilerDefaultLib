function Test([string]$config, [string]$mode, [string]$fileName)
{
    $BUILD="debug"
    $BUILD1="Debug"
    $LLVM_BUILD="Debug"
    $ARCH="x64"
    $DBG="--di"
    $OPTIONS="--nowarn"

    $test=$fileName
    if ($config -eq "release") {
	    $BUILD="release"
	    $BUILD1="release"
	    $LLVM_BUILD="Release"
	    $DBG=""
    }

    $SRC="."
    $OUTPUT="."

    if ($Env:TOOL_PATH -eq $null) {
	    $BUILD_PATH="..\TypeScriptCompiler\__build"
	    $TOOL_PATH="..\TypeScriptCompiler\__build\tsc\windows-msbuild-$BUILD\bin"
	    $DEFAULTLIB_BUILD_PATH="..\TypeScriptCompilerDefaultLib\__build\$BUILD"
    } else {
	    $BUILD_PATH=$TOOL_PATH
	    $DEFAULTLIB_BUILD_PATH=$TOOL_PATH
    }

    if ($Env:GC_LIB_PATH -eq $null) {
	    $Env:GC_LIB_PATH="$BUILD_PATH\gc\msbuild\$ARCH\$BUILD\$BUILD1"
    }
    if ($Env:LLVM_LIB_PATH -eq $null) {
	    $Env:LLVM_LIB_PATH="$BUILD_PATH\llvm\msbuild\$ARCH\$BUILD\$BUILD1\lib"
    }
    if ($Env:TSC_LIB_PATH -eq $null) {
	    $Env:TSC_LIB_PATH="$BUILD_PATH\tsc\windows-msbuild-$BUILD\lib"
    }
    if ($Env:DEFAULT_LIB_PAT -eq $null) {
	    $Env:DEFAULT_LIB_PATH="$DEFAULTLIB_BUILD_PATH"
    }

    if ($mode -eq "compile") {
        $compile_output = & $TOOL_PATH\tsc.exe $DBG $OPTIONS --shared-libs=$TOOL_PATH\TypeScriptRuntime.dll --emit=exe $SRC\tests\$test.ts

        $compile_code = $LASTEXITCODE

        if ($compile_code -ne 0) {
            Write-Host "Compile Error" -ForegroundColor Red
            Write-Host "Output: $compile_output" 
            return $false
        }

        $run_output = & $SRC\tests\$test.exe

        $run_code = $LASTEXITCODE

        Get-ChildItem $SRC\tests\$test.* -exclude $SRC\tests\$test.ts | Remove-Item
    }

    if ($mode -eq "jit") {
        & $TOOL_PATH\tsc.exe $DBG $OPTIONS --shared-libs=$TOOL_PATH\TypeScriptRuntime.dll --emit=jit $SRC\tests\$test.ts

        $run_code = $LASTEXITCODE
    }

    if ($run_cdoe -eq 0) {
        return $true
    }

    return $false
}

Write-Host "Testing..."
Get-ChildItem ".\tests" -Filter *.ts | Foreach-Object {
    Write-Host -NoNewline "Running ... $_ ... "
    #Start-Process -NoNewWindow -FilePath "C:\wamp64\bin\mysql\mysql5.7.19\bin\mysql" -ArgumentList "-u root","-proot","-h localhost"

    $result = Test "release" "compile" $_.Basename

    if ($result -eq $true) {
        Write-Host "Success" -ForegroundColor Green
    }
    else {
        Write-Host "Failed" -ForegroundColor Red
    }
}

Write-Host "Done."