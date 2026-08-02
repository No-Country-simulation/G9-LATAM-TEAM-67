$ErrorActionPreference = "Stop"

Push-Location $PSScriptRoot
try {
    & ".\mvnw.cmd" "clean" "test"
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}
finally {
    Pop-Location
}
