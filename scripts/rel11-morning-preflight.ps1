[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$expectedBuildId = 'REL-11-v0.74.6-6974967944fb'
$expectedCommit = '6974967944fb'
$expectedVersion = '0.74.6'

$packages = @(
    [pscustomobject]@{
        Name = 'staging'
        Path = Join-Path $workspaceRoot '.tmp\aloitussivu-rel11-staging.zip'
        Bytes = 838198
        Sha256 = '03620b1b6265223f712c07b90b5f25d2fc96d3b04666bdebd5da563ec46a0648'
    },
    [pscustomobject]@{
        Name = 'production-path'
        Path = Join-Path $workspaceRoot '.tmp\aloitussivu-rel11-production-path.zip'
        Bytes = 824590
        Sha256 = '2fca11c90ca1fdcf3ec0bfd10ae6e1a9e465100b3ea4fde44f6b3935c50db479'
    }
)

Push-Location $workspaceRoot
try {
    $workingTree = @(& git status --porcelain)
    if ($LASTEXITCODE -ne 0) {
        throw 'Git-työpuun tilaa ei voitu tarkistaa.'
    }
    if ($workingTree.Count -gt 0) {
        throw 'Git-työpuu ei ole puhdas. Selvitä muutokset ennen huomisen pakettien käyttöä.'
    }

    & git cat-file -e "$expectedCommit`^{commit}"
    if ($LASTEXITCODE -ne 0) {
        throw "Pakettien lähdecommittia $expectedCommit ei löydy paikallisesta repositoriosta."
    }

    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem

    $results = foreach ($package in $packages) {
        if (-not (Test-Path -LiteralPath $package.Path -PathType Leaf)) {
            throw "Paketti puuttuu: $($package.Path)"
        }

        $file = Get-Item -LiteralPath $package.Path
        if ($file.Length -ne $package.Bytes) {
            throw "$($package.Name): tiedostokoko $($file.Length) ei vastaa odotettua arvoa $($package.Bytes)."
        }

        $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $package.Path).Hash.ToLowerInvariant()
        if ($hash -ne $package.Sha256) {
            throw "$($package.Name): SHA-256 ei täsmää."
        }

        $archive = [IO.Compression.ZipFile]::OpenRead($file.FullName)
        try {
            $entries = @($archive.Entries)
            if ($entries.Count -ne 115) {
                throw "$($package.Name): ZIPissä on $($entries.Count) merkintää, odotettiin 115."
            }

            $unsafePaths = @($entries | Where-Object {
                $_.FullName.StartsWith('/') -or
                $_.FullName -match '^[A-Za-z]:' -or
                $_.FullName -match '(^|/)(\.\.?)(/|$)'
            })
            if ($unsafePaths.Count -gt 0) {
                throw "$($package.Name): ZIPissä on vaarallinen polku."
            }

            $forbiddenFiles = @($entries | Where-Object {
                $_.FullName -match '(^|/)secrets/config\.php$' -or
                [IO.Path]::GetFileName($_.FullName) -like '.env*' -or
                $_.FullName -match '(firebase-admin|service-account|service_account).*\.json$'
            })
            if ($forbiddenFiles.Count -gt 0) {
                throw "$($package.Name): ZIPissä on oikea asetus-, ympäristö- tai Admin SDK -tiedosto."
            }

            if ($package.Name -eq 'production-path') {
                $configEntry = $entries |
                    Where-Object { $_.FullName -eq 'private_root/secrets/config.production.example.php' } |
                    Select-Object -First 1
                if (-not $configEntry) {
                    throw 'production-path: tuotannon konfiguraatiomalli puuttuu.'
                }

                $configReader = [IO.StreamReader]::new($configEntry.Open())
                try {
                    $configContents = $configReader.ReadToEnd()
                }
                finally {
                    $configReader.Dispose()
                }
                if ($configContents -notmatch 'mysql:host=dbtqq\.db\.cchosting\.fi;') {
                    throw 'production-path: tuotantotietokannan palvelin ei ole dbtqq.db.cchosting.fi.'
                }
            }

            $buildInfoEntry = $entries | Where-Object { $_.FullName -eq 'build-info.json' } | Select-Object -First 1
            if (-not $buildInfoEntry) {
                throw "$($package.Name): build-info.json puuttuu."
            }

            $reader = [IO.StreamReader]::new($buildInfoEntry.Open())
            try {
                $buildInfo = $reader.ReadToEnd() | ConvertFrom-Json
            }
            finally {
                $reader.Dispose()
            }

            if (
                $buildInfo.buildId -ne $expectedBuildId -or
                $buildInfo.commit -ne $expectedCommit -or
                $buildInfo.version -ne $expectedVersion -or
                $buildInfo.mode -ne $package.Name -or
                $buildInfo.workingTreeDirty -ne $false
            ) {
                throw "$($package.Name): build-info.json ei vastaa lukittua ehdokasta."
            }

            $buffer = New-Object byte[] 65536
            foreach ($entry in $entries) {
                $stream = $entry.Open()
                try {
                    while ($stream.Read($buffer, 0, $buffer.Length) -gt 0) {}
                }
                finally {
                    $stream.Dispose()
                }
            }

            [pscustomobject]@{
                Package = $package.Name
                BuildId = $buildInfo.buildId
                Bytes = $file.Length
                Files = $entries.Count
                Sha256 = $hash
                Result = 'PASS'
            }
        }
        finally {
            $archive.Dispose()
        }
    }

    $results | Format-Table -AutoSize
    Write-Host ''
    Write-Host 'HUOMISAAMUN PAIKALLINEN ENNAKKOTARKISTUS: PASS'
    Write-Host 'Seuraava vaihe: varmista tuotannon database=up ja tee uuden tuotantopaketin esivienti.'
}
finally {
    Pop-Location
}
