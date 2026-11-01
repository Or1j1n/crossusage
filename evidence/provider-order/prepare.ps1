param(
  [string]$RepoRoot
)

$ErrorActionPreference = 'Stop'
$evidenceDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
  $repoChild = [System.IO.Path]::GetFullPath((Join-Path $evidenceDir '..\..'))
  $siblingRepo = [System.IO.Path]::GetFullPath((Join-Path $evidenceDir '..\crossusage-source'))
  if (Test-Path (Join-Path $repoChild 'src\lib\settings.ts')) {
    $RepoRoot = $repoChild
  } elseif (Test-Path (Join-Path $siblingRepo 'src\lib\settings.ts')) {
    $RepoRoot = $siblingRepo
  } else {
    throw 'Pass -RepoRoot <path-to-crossusage-repository>.'
  }
}

$repo = (Resolve-Path $RepoRoot).Path
if (-not (Test-Path (Join-Path $repo 'src\lib\settings.ts'))) {
  throw "RepoRoot does not contain src/lib/settings.ts: $RepoRoot"
}

$beforeSource = & git -C $repo show 'v1.6.1:src/lib/settings.ts'
if ($LASTEXITCODE -ne 0) {
  throw 'Could not read v1.6.1:src/lib/settings.ts; ensure the v1.6.1 tag is available.'
}
$beforeSource | Set-Content -Path (Join-Path $evidenceDir 'before-settings.ts') -Encoding utf8

$env:CROSSUSAGE_REPO_ROOT = $repo
Push-Location $repo
try {
  & bun run vite --config (Join-Path $evidenceDir 'vite.config.mts') --host 127.0.0.1 --port 4317 --strictPort
  if ($LASTEXITCODE -ne 0) { throw "Vite exited with code $LASTEXITCODE" }
}
finally {
  Pop-Location
}
