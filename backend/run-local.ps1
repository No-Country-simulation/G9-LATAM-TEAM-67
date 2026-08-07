$ErrorActionPreference = "Stop"

$envPath = Join-Path $PSScriptRoot ".env"
$requiredVariables = @(
    "DB_URL",
    "DB_USERNAME",
    "DB_PASSWORD",
    "JWT_SECRET",
    "JWT_EXPIRATION",
    "CLASSIFIER_API_URL"
)

if (-not (Test-Path -LiteralPath $envPath -PathType Leaf)) {
    throw "No se encontró backend/.env. Créalo a partir de .env.example con valores locales reales."
}

$loadedVariables = [System.Collections.Generic.List[string]]::new()

foreach ($line in Get-Content -LiteralPath $envPath) {
    $trimmedLine = $line.Trim()

    if ([string]::IsNullOrWhiteSpace($trimmedLine) -or $trimmedLine.StartsWith("#")) {
        continue
    }

    $separatorIndex = $trimmedLine.IndexOf("=")
    if ($separatorIndex -lt 1) {
        throw "Línea inválida en backend/.env. Usa el formato CLAVE=VALOR."
    }

    $name = $trimmedLine.Substring(0, $separatorIndex).Trim()
    $value = $trimmedLine.Substring($separatorIndex + 1).Trim()

    if ($name -notmatch "^[A-Za-z_][A-Za-z0-9_]*$") {
        throw "Nombre de variable inválido en backend/.env."
    }

    [Environment]::SetEnvironmentVariable($name, $value, "Process")
    $loadedVariables.Add($name)
}

$missingVariables = @(
    $requiredVariables | Where-Object {
        [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($_, "Process"))
    }
)

if ($missingVariables.Count -gt 0) {
    throw "Faltan variables obligatorias en backend/.env: $($missingVariables -join ', ')"
}

if ($env:CLASSIFIER_API_URL -notmatch "/predict/?$") {
    throw "CLASSIFIER_API_URL debe contener la ruta completa /predict."
}

$usesTnsAlias = $env:DB_URL -match "^jdbc:oracle:thin:@(?!//)[A-Za-z0-9_.-]+$"
if ($usesTnsAlias) {
    $walletPath = Join-Path $PSScriptRoot "src/main/resources/wallet"
    $tnsnamesPath = Join-Path $walletPath "tnsnames.ora"
    $sqlnetPath = Join-Path $walletPath "sqlnet.ora"

    if (-not (Test-Path -LiteralPath $tnsnamesPath -PathType Leaf) -or
        -not (Test-Path -LiteralPath $sqlnetPath -PathType Leaf)) {
        throw "La conexión usa un alias TNS. Coloca tnsnames.ora y sqlnet.ora en backend/src/main/resources/wallet."
    }

    [Environment]::SetEnvironmentVariable(
        "TNS_ADMIN",
        (Resolve-Path -LiteralPath $walletPath).Path,
        "Process"
    )
    Write-Host "TNS_ADMIN configurado desde el wallet local."
}

$loadedRequiredVariables = $requiredVariables | Where-Object { $loadedVariables.Contains($_) }
Write-Host "Variables cargadas: $($loadedRequiredVariables -join ', ')"
Write-Host "Iniciando Spring Boot..."

Push-Location $PSScriptRoot
try {
    & ".\mvnw.cmd" "spring-boot:run"
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}
finally {
    Pop-Location
}
