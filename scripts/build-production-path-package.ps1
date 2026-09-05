[CmdletBinding()]
param(
    [string]$FirebaseEnvFile
)

$ErrorActionPreference = 'Stop'

$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$temporaryRoot = [IO.Path]::GetFullPath((Join-Path $workspaceRoot '.tmp'))
$packageJson = Get-Content -LiteralPath (Join-Path $workspaceRoot 'package.json') -Raw | ConvertFrom-Json
$version = [string]$packageJson.version
$versionSlug = $version -replace '[^0-9A-Za-z.-]', '-'
$packageRoot = [IO.Path]::GetFullPath((Join-Path $temporaryRoot "rel16-v$versionSlug-production-path-package"))
$zipPath = [IO.Path]::GetFullPath((Join-Path $temporaryRoot "aloitussivu-rel16-v$versionSlug-production-path.zip"))
$pathPrefix = $temporaryRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
$firebaseEnvNames = @(
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_APPCHECK_SITE_KEY'
)

function Read-DotEnvFile([string]$Path) {
    $values = @{}
    foreach ($line in Get-Content -LiteralPath $Path) {
        if ($line -match '^\s*#' -or $line -match '^\s*$') {
            continue
        }
        if ($line -notmatch '^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
            continue
        }
        $name = $Matches[1]
        $value = $Matches[2].Trim()
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        $values[$name] = $value
    }
    return $values
}

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

    if (-not $FirebaseEnvFile) {
        $FirebaseEnvFile = Join-Path $workspaceRoot '.env.local'
    }
    $firebaseEnvPath = [IO.Path]::GetFullPath($FirebaseEnvFile)
    if (-not (Test-Path -LiteralPath $firebaseEnvPath -PathType Leaf)) {
        throw "Firebase-julkiasetusten tiedostoa ei löydy: $firebaseEnvPath"
    }
    $firebaseEnv = Read-DotEnvFile $firebaseEnvPath
    $missingFirebaseEnv = @($firebaseEnvNames | Where-Object { [string]::IsNullOrWhiteSpace([string]$firebaseEnv[$_]) })
    if ($missingFirebaseEnv.Count -gt 0) {
        $missingNames = $missingFirebaseEnv -join ', '
        throw "Firebase-julkiasetuksia puuttuu: $missingNames"
    }

    $previousBuildEnv = @{}
    foreach ($name in $firebaseEnvNames) {
        $previousBuildEnv[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
        [Environment]::SetEnvironmentVariable($name, [string]$firebaseEnv[$name], 'Process')
    }
    foreach ($name in @('VITE_API_BASE', 'VITE_DATA_PROVIDER', 'VITE_FIREBASE_VALIDATE_REFERER')) {
        $previousBuildEnv[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
    }
    try {
        $env:VITE_API_BASE = '/aloitus/api/v1'
        $env:VITE_DATA_PROVIDER = 'cloudcity'
        $env:VITE_FIREBASE_VALIDATE_REFERER = 'https://seniorsurf.fi/aloitus/'
        & node scripts/validate-firebase-config.mjs
        if ($LASTEXITCODE -ne 0) {
            throw "Firebase-julkiasetusten verkkovarmennus epäonnistui koodilla $LASTEXITCODE."
        }
        & npm.cmd run build:cloudcity
        if ($LASTEXITCODE -ne 0) {
            throw "Cloudcity-build epäonnistui koodilla $LASTEXITCODE."
        }
    }
    finally {
        foreach ($name in $previousBuildEnv.Keys) {
            [Environment]::SetEnvironmentVariable($name, $previousBuildEnv[$name], 'Process')
        }
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
    $dataRoot = New-Item -ItemType Directory -Path (Join-Path $privateRoot.FullName 'data') -Force
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
    & node (Join-Path $workspaceRoot 'scripts/build-link-catalog.mjs') --output (Join-Path $dataRoot.FullName 'link-catalog.json')
    if ($LASTEXITCODE -ne 0) {
        throw "Linkkiluettelon muodostus epäonnistui koodilla $LASTEXITCODE."
    }
    $linkCatalog = Get-Content -LiteralPath (Join-Path $dataRoot.FullName 'link-catalog.json') -Raw | ConvertFrom-Json
    if ([int]$linkCatalog.schemaVersion -ne 1 -or @($linkCatalog.links).Count -lt 2000) {
        throw 'Tuotantopaketin linkkiluettelo on puutteellinen.'
    }
    $migrationsRoot = New-Item -ItemType Directory -Path (Join-Path $packageRoot 'database_migrations') -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'database/migrations/004_email_notifications.sql') -Destination $migrationsRoot.FullName -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'database/migrations/005_automated_link_checks.sql') -Destination $migrationsRoot.FullName -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'database/migrations/006_link_check_hardening.sql') -Destination $migrationsRoot.FullName -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'database/migrations/007_link_check_admin_actions.sql') -Destination $migrationsRoot.FullName -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'database/migrations/008_usage_privacy_cleanup.sql') -Destination $migrationsRoot.FullName -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'database/migrations/009_approved_links_municipality.sql') -Destination $migrationsRoot.FullName -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'database/migrations/010_link_content_corrections.sql') -Destination $migrationsRoot.FullName -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'database/migrations/011_site_content_editor.sql') -Destination $migrationsRoot.FullName -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'database/migrations/012_site_content_additional_locales.sql') -Destination $migrationsRoot.FullName -Force
    Copy-Item -LiteralPath (Join-Path $workspaceRoot 'docs/rel16-v110-tuotantopaivitys.md') -Destination (Join-Path $packageRoot 'DEPLOY_INSTRUCTIONS.md') -Force

    foreach ($directory in @('logs', 'cache', 'protected_uploads')) {
        $null = New-Item -ItemType File -Path (Join-Path $privateRoot.FullName "$directory/.keep") -Force
    }

    $builtJavaScript = (Get-ChildItem -LiteralPath (Join-Path $publicRoot.FullName 'assets') -Filter '*.js' -File |
        Get-Content -Raw) -join "`n"
    if (-not ($builtJavaScript -match '/aloitus/api/v1')) {
        throw 'Tuotantobundlesta puuttuu odotettu /aloitus/api/v1-polku.'
    }
    foreach ($name in @('VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID')) {
        if (-not $builtJavaScript.Contains([string]$firebaseEnv[$name])) {
            throw "Tuotantobundlesta puuttuu Firebase-julkiasetus $name."
        }
    }

    $currentCommit = (& git rev-parse --short=12 HEAD).Trim()
    $workingTreeDirty = [bool](& git status --porcelain)
    if ($LASTEXITCODE -ne 0 -or $workingTreeDirty -or $currentCommit -ne $commit) {
        throw 'Git-tila muuttui paketoinnin aikana. Tuotantopolun pakettia ei muodostettu.'
    }
    $buildId = "REL-16-v$version-$commit"
    $buildInfoJson = [ordered]@{
        package = 'REL-16'
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
        schemaMigrations = @('001_initial_schema', '002_add_link_reports_triage_index', '003_usage_context_daily', '004_email_notifications', '005_automated_link_checks', '006_link_check_hardening', '007_link_check_admin_actions', '008_usage_privacy_cleanup', '009_approved_links_municipality', '010_link_content_corrections', '011_site_content_editor', '012_site_content_additional_locales')
        backgroundJobs = @('ncsc', 'notifications', 'email-dispatch', 'link-check')
        manualTools = @('smtp-test')
        firebaseAuthenticationConfigured = $true
    } | ConvertTo-Json
    [IO.File]::WriteAllText(
        (Join-Path $packageRoot 'build-info.json'),
        $buildInfoJson + [Environment]::NewLine,
        [Text.UTF8Encoding]::new($false)
    )

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
