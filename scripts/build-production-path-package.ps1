[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$temporaryRoot = [IO.Path]::GetFullPath((Join-Path $workspaceRoot '.tmp'))
$packageJson = Get-Content -LiteralPath (Join-Path $workspaceRoot 'package.json') -Raw | ConvertFrom-Json
$version = [string]$packageJson.version
$versionSlug = $version -replace '[^0-9A-Za-z.-]', '-'
$packageRoot = [IO.Path]::GetFullPath((Join-Path $temporaryRoot "rel13-v$versionSlug-production-path-package"))
$zipPath = [IO.Path]::GetFullPath((Join-Path $temporaryRoot "aloitussivu-rel13-v$versionSlug-production-path.zip"))
$pathPrefix = $temporaryRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar

if (-not $packageRoot.StartsWith($pathPrefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Tuotantopaketin kohde ei ole työtilan .tmp-hakemistossa.'
}

Push-Location $workspaceRoot
try {
    $workingTreeDirty = [bool](& git status --porcelain)
    if ($LASTEXITCODE -ne 0) {
        throw 'Git-työpuun tilaa ei voitu tarkistaa.'
    }
    if ($workingTreeDirty) {
        throw 'Tuotantopolun paketti on rakennettava puhtaasta työpuusta.'
    }
    $commit = (& git rev-parse --short=12 HEAD).Trim()
    if ($LASTEXITCODE -ne 0 -or -not $commit) {
        throw 'Tuotantopolun paketin commit-tunnistetta ei voitu ratkaista.'
    }

    $previousApiBase = $env:VITE_API_BASE
    $previousProvider = $env:VITE_DATA_PROVIDER
    try {
        $env:VITE_API_BASE = '/aloitus/api/v1'
        $env:VITE_DATA_PROVIDER = 'cloudcity'
        & npm.cmd run build:cloudcity
        if ($LASTEXITCODE -ne 0) {
            throw "Cloudcity-build epäonnistui koodilla $LASTEXITCODE."
        }
    }
    finally {
        $env:VITE_API_BASE = $previousApiBase
        $env:VITE_DATA_PROVIDER = $previousProvider
    }

    if (Test-Path -LiteralPath $packageRoot) {
        Remove-Item -LiteralPath $packageRoot -Recurse -Force
    }
    if (Test-Path -LiteralPath $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }

    $publicRoot = New-Item -ItemType Directory -Path (Join-Path $packageRoot 'wordpress_aloitus') -Force
    $privateRoot = New-Item -ItemType Directory -Path (Join-Path $packageRoot 'private_root') -Force
    $secretsRoot = New-Item -ItemType Directory -Path (Join-Path $privateRoot.FullName 'secrets') -Force
    foreach ($directory in @('logs', 'cache', 'protected_uploads')) {
        $null = New-Item -ItemType Directory -Path (Join-Path $privateRoot.FullName $directory) -Force
    }

    Get-ChildItem -LiteralPath (Join-Path $workspaceRoot 'dist') -Force |
        Copy-Item -Destination $publicRoot.FullName -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'deploy/cloudcity/production-subdir.htaccess') -Destination (Join-Path $publicRoot.FullName '.htaccess') -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'api/public/api') -Destination $publicRoot.FullName -Recurse -Force

    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'api/bootstrap.php') -Destination $privateRoot.FullName -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'api/src') -Destination $privateRoot.FullName -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'api/cron') -Destination $privateRoot.FullName -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'deploy/cloudcity/production-config.example.php') -Destination (Join-Path $secretsRoot.FullName 'config.production.example.php') -Force
    $migrationsRoot = New-Item -ItemType Directory -Path (Join-Path $packageRoot 'database_migrations') -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'database/migrations/004_email_notifications.sql') -Destination $migrationsRoot.FullName -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'docs/rel13-v0760-sahkoposti-ilmoitukset.md') -Destination (Join-Path $packageRoot 'DEPLOY_INSTRUCTIONS.md') -Force

    foreach ($directory in @('logs', 'cache', 'protected_uploads')) {
        $null = New-Item -ItemType File -Path (Join-Path $privateRoot.FullName "$directory/.keep") -Force
    }

    $builtJavaScript = Get-ChildItem -LiteralPath (Join-Path $publicRoot.FullName 'assets') -Filter '*.js' -File |
        Get-Content -Raw
    if (-not ($builtJavaScript -match '/aloitus/api/v1')) {
        throw 'Tuotantobundlesta puuttuu odotettu /aloitus/api/v1-polku.'
    }

    $currentCommit = (& git rev-parse --short=12 HEAD).Trim()
    $workingTreeDirty = [bool](& git status --porcelain)
    if ($LASTEXITCODE -ne 0 -or $workingTreeDirty -or $currentCommit -ne $commit) {
        throw 'Git-tila muuttui paketoinnin aikana. Tuotantopolun pakettia ei muodostettu.'
    }
    $buildId = "REL-13-v$version-$commit"
    [ordered]@{
        package = 'REL-13'
        mode = 'production-path'
        buildId = $buildId
        publicUrl = 'https://seniorsurf.fi/aloitus/'
        publicApiBase = '/aloitus/api/v1'
        publicUploadTarget = '/website.wp33403/aloitus/'
        privateUploadTarget = '/aloitus-production/'
        version = $version
        commit = $commit
        workingTreeDirty = $false
        builtAtUtc = [DateTime]::UtcNow.ToString('o')
        schemaMigrations = @('001_initial_schema', '002_add_link_reports_triage_index', '003_usage_context_daily', '004_email_notifications')
        backgroundJobs = @('ncsc', 'notifications', 'email-dispatch')
        manualTools = @('smtp-test')
    } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $packageRoot 'build-info.json') -Encoding utf8

    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [IO.Compression.ZipFile]::Open($zipPath, [IO.Compression.ZipArchiveMode]::Create)
    try {
        Get-ChildItem -LiteralPath $packageRoot -Recurse -Force -File | ForEach-Object {
            $relativePath = $_.FullName.Substring($packageRoot.Length).TrimStart('\', '/').Replace('\', '/')
            $null = [IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive,
                $_.FullName,
                $relativePath,
                [IO.Compression.CompressionLevel]::Optimal
            )
        }
    }
    finally {
        $archive.Dispose()
    }

    $sha256 = [Security.Cryptography.SHA256]::Create()
    try {
        $zipStream = [IO.File]::OpenRead($zipPath)
        try {
            $hashBytes = $sha256.ComputeHash($zipStream)
        }
        finally {
            $zipStream.Dispose()
        }
    }
    finally {
        $sha256.Dispose()
    }
    $hash = ([BitConverter]::ToString($hashBytes)).Replace('-', '').ToLowerInvariant()
    [pscustomobject]@{
        BuildId = $buildId
        PackageDirectory = $packageRoot
        PublicUploadDirectory = $publicRoot.FullName
        PrivateUploadDirectory = $privateRoot.FullName
        FileCount = @(Get-ChildItem -LiteralPath $packageRoot -Recurse -Force -File).Count
        Zip = $zipPath
        Sha256 = $hash
    } | Format-List
}
finally {
    Pop-Location
}
