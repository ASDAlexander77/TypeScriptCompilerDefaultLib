# Checks that every function the declarations (src\lib.d.ts and what it references) give the library's
# users has the signature src\lib.ts compiles to. A program is compiled against the declarations, and
# calls a function by its declared type; lib.ts is compiled on its own, and defines it with its own.
# Where the two differ the call passes or reads the wrong things: `Number.toString` returned nothing
# while lib.d.ts said string, and a program printing its result crashed.
#   .\scripts\check_declarations.ps1        the compiler of the sibling build tree, or $Env:TOOL_PATH
# Exit code 1 lists each function whose declared and compiled signatures differ.
param([string]$Tool)

$ErrorActionPreference = "Stop"

$Root = Split-Path $PSScriptRoot -Parent
if (-not $Tool) {
    $ToolPath = if ($Env:TOOL_PATH) { $Env:TOOL_PATH } else { "$Root\..\TypeScriptCompiler\__build\tslang\windows-msbuild-2026-release\bin" }
    $Tool = Join-Path $ToolPath "tslang.exe"
}

if (-not (Test-Path $Tool)) {
    Write-Error "tslang.exe not found at '$Tool': give -Tool or set TOOL_PATH"
}

# the declarations as a default library: a folder whose `defaultlib` is src
$Work = Join-Path ([System.IO.Path]::GetTempPath()) ("tslang-check-declarations-" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $Work | Out-Null
$Junction = Join-Path $Work "defaultlib"
New-Item -ItemType Junction -Path $Junction -Target (Join-Path $Root "src") | Out-Null

try {
    $Program = Join-Path $Work "program.ts"
    Set-Content -Path $Program -Value "function main() {`n}"

    # the paths the environment may point at an installed library would win over the folder given
    $Env:TSLANG_LIB_PATH = $null
    $Env:DEFAULT_LIB_PATH = $null

    $DeclaredMlir = Join-Path $Work "declared.mlir"
    $CompiledMlir = Join-Path $Work "compiled.mlir"
    & $Tool --emit=mlir --nowarn --default-lib-path="$Work" $Program 2> $DeclaredMlir
    if ($LASTEXITCODE -ne 0) {
        Get-Content $DeclaredMlir | Select-Object -First 20
        Write-Error "the declarations do not compile"
    }

    # as build_core.bat compiles it
    & $Tool --emit=mlir --export=none --nowarn --no-default-lib (Join-Path $Root "src\lib.ts") 2> $CompiledMlir
    if ($LASTEXITCODE -ne 0) {
        Get-Content $CompiledMlir | Select-Object -First 20
        Write-Error "src\lib.ts does not compile"
    }

    function Get-Signatures([string]$mlir) {
        $signatures = @{}
        foreach ($line in [System.IO.File]::ReadLines($mlir)) {
            if ($line -match '^\s*ts\.Func (?:private )?@(\S+) (!ts\.func<.*>)\s*(\{|attributes|$)') {
                if (-not $signatures.ContainsKey($Matches[1])) {
                    $signatures[$Matches[1]] = $Matches[2].Trim()
                }
            }
        }

        return $signatures
    }

    # spellings of one signature: `int` and `s32` (both a 32-bit integer), a `void` result and none, and
    # `T | null` of a class or an opaque pointer and T (a pointer that may be null either way)
    function Get-Normalized([string]$signature) {
        $signature = $signature -replace '\bsi(\d+)\b', 'i$1'
        $signature = $signature -replace ', !ts\.void, (true|false)>$', ', , $1>'
        $signature = $signature -replace '!ts\.union<(!ts\.class<@[^,>]+, !ts\.class_storage<@[^>]+>>|!ts\.opaque), !ts\.null>', '$1'
        return $signature
    }

    $declared = Get-Signatures $DeclaredMlir
    $compiled = Get-Signatures $CompiledMlir

    $checked = 0
    $mismatches = @()
    foreach ($name in ($declared.Keys | Sort-Object)) {
        if (-not $compiled.ContainsKey($name)) {
            continue
        }

        $checked++
        if ((Get-Normalized $declared[$name]) -ne (Get-Normalized $compiled[$name])) {
            $mismatches += "$name`n  declared: $($declared[$name])`n  compiled: $($compiled[$name])"
        }
    }

    Write-Host "checked $checked functions declared and compiled"
    if ($mismatches.Count -gt 0) {
        $mismatches | ForEach-Object { Write-Host $_ }
        Write-Host "$($mismatches.Count) declaration(s) differ from what lib.ts compiles to"
        exit 1
    }

    Write-Host "every declaration matches"
}
finally {
    # the junction only, not what it points at
    if (Test-Path $Junction) {
        [System.IO.Directory]::Delete($Junction, $false)
    }

    Remove-Item -Recurse -Force $Work
}
