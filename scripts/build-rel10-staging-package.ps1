[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$temporaryRoot = [IO.Path]::GetFullPath((Join-Path $workspaceRoot '.tmp'))
$packageRoot = [IO.Path]::GetFullPath((Join-Path $temporaryRoot 'rel10-staging-package'))
$zipPath = [IO.Path]::GetFullPath((Join-Path $temporaryRoot 'aloitussivu-rel10-staging.zip'))
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
    foreach ($directory in @('logs', 'cache', 'protected_uploads')) {
        $null = New-Item -ItemType Directory -Path (Join-Path $packageRoot $directory) -Force
    }

    Get-ChildItem -LiteralPath (Join-Path $workspaceRoot 'dist') -Force |
        Copy-Item -Destination $publicRoot.FullName -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'deploy/cloudcity/staging-public.htaccess') -Destination (Join-Path $publicRoot.FullName '.htaccess') -Force

    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'api/bootstrap.php') -Destination $packageRoot -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'api/src') -Destination $packageRoot -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'api/cron') -Destination $packageRoot -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'api/public/api') -Destination $publicRoot.FullName -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'deploy/cloudcity/staging-config.example.php') -Destination (Join-Path $secretsRoot.FullName 'config.staging.example.php') -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'docs/rel10-wordpress-esittely-ja-ohjaus.md') -Destination (Join-Path $packageRoot 'REL10_INSTRUCTIONS.md') -Force

    foreach ($directory in @('logs', 'cache', 'protected_uploads')) {
        $null = New-Item -ItemType File -Path (Join-Path $packageRoot "$directory/.keep") -Force
    }

    $packageJson = Get-Content -LiteralPath (Join-Path $workspaceRoot 'package.json') -Raw | ConvertFrom-Json
    $commit = (& git rev-parse --short=12 HEAD).Trim()
    if ($LASTEXITCODE -ne 0 -or -not $commit) {
        throw 'Julkaisukandidaatin commit-tunnistetta ei voitu ratkaista.'
    }
    $workingTreeDirty = [bool](& git status --porcelain)
    if ($workingTreeDirty) {
        throw 'Julkaisukandidaatti on rakennettava puhtaasta työpuusta.'
    }
    $version = [string]$packageJson.version
    $buildId = "REL-10-v$version-$commit"
    [ordered]@{
        package = 'REL-10'
        mode = 'staging'
        buildId = $buildId
        version = $version
        commit = $commit
        workingTreeDirty = $false
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
        Zip = $zipPath
        Sha256 = $hash
    } | Format-List
}
finally {
    Pop-Location
}
