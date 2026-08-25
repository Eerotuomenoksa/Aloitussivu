[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$temporaryRoot = [IO.Path]::GetFullPath((Join-Path $workspaceRoot '.tmp'))
$packageRoot = [IO.Path]::GetFullPath((Join-Path $temporaryRoot 'rel09-staging-package'))
$zipPath = [IO.Path]::GetFullPath((Join-Path $temporaryRoot 'aloitussivu-rel09-staging.zip'))
$pathPrefix = $temporaryRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar

if (-not $packageRoot.StartsWith($pathPrefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Staging-paketin kohde ei ole työtilan .tmp-hakemistossa.'
}

Push-Location $workspaceRoot
try {
    & npm.cmd run build:staging
    if ($LASTEXITCODE -ne 0) {
        throw "Staging-build epäonnistui koodilla $LASTEXITCODE."
    }

    if (Test-Path -LiteralPath $packageRoot) {
        Remove-Item -LiteralPath $packageRoot -Recurse -Force
    }
    if (Test-Path -LiteralPath $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }

    $publicRoot = New-Item -ItemType Directory -Path (Join-Path $packageRoot 'public_html') -Force
    $secretsRoot = New-Item -ItemType Directory -Path (Join-Path $packageRoot 'secrets') -Force
    $null = New-Item -ItemType Directory -Path (Join-Path $packageRoot 'logs') -Force
    $null = New-Item -ItemType Directory -Path (Join-Path $packageRoot 'cache') -Force
    $null = New-Item -ItemType Directory -Path (Join-Path $packageRoot 'protected_uploads') -Force

    Get-ChildItem -LiteralPath (Join-Path $workspaceRoot 'dist') -Force |
        Copy-Item -Destination $publicRoot.FullName -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'deploy/cloudcity/staging-public.htaccess') -Destination (Join-Path $publicRoot.FullName '.htaccess') -Force

    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'api/bootstrap.php') -Destination $packageRoot -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'api/src') -Destination $packageRoot -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'api/cron') -Destination $packageRoot -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'api/public/api') -Destination $publicRoot.FullName -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'deploy/cloudcity/staging-config.example.php') -Destination (Join-Path $secretsRoot.FullName 'config.staging.example.php') -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'docs/rel09-tausta-ajot-ja-palautuskoe.md') -Destination (Join-Path $packageRoot 'REL09_INSTRUCTIONS.md') -Force

    foreach ($directory in @('logs', 'cache', 'protected_uploads')) {
        $null = New-Item -ItemType File -Path (Join-Path $packageRoot "$directory/.keep") -Force
    }

    $packageJson = Get-Content -LiteralPath (Join-Path $workspaceRoot 'package.json') -Raw | ConvertFrom-Json
    $commit = (& git rev-parse --short=12 HEAD).Trim()
    if ($LASTEXITCODE -ne 0 -or -not $commit) {
        $commit = 'unknown'
    }
    $workingTreeDirty = [bool](& git status --porcelain)
    [ordered]@{
        package = 'REL-09'
        mode = 'staging'
        version = [string]$packageJson.version
        commit = $commit
        workingTreeDirty = $workingTreeDirty
        builtAtUtc = [DateTime]::UtcNow.ToString('o')
        schemaMigrations = @('001_initial_schema', '002_add_link_reports_triage_index')
        backgroundJobs = @('ncsc')
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
    $hash = Get-FileHash -LiteralPath $zipPath -Algorithm SHA256

    [pscustomobject]@{
        PackageDirectory = $packageRoot
        Zip = $zipPath
        Sha256 = $hash.Hash.ToLowerInvariant()
    } | Format-List
}
finally {
    Pop-Location
}
