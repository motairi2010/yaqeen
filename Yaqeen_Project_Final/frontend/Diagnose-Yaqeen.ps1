<# =======================================================================
 Diagnose-Yaqeen.ps1  (PS 5.1-compatible)
 يجمع: Node/NPM, Git, تنظيف وتثبيت, Build/Start, scripts & deps,
 شجرة src (عمق 2 بدون -Depth), ونسخة منقحة من .env
======================================================================= #>

param([string]$Root = ".")

$ErrorActionPreference = "Continue"
$Root = (Resolve-Path $Root).Path
if (!(Test-Path (Join-Path $Root "package.json"))) {
  Write-Host "لم أجد package.json في $Root" -ForegroundColor Red
  exit 1
}

$ts   = Get-Date -Format "yyyyMMdd-HHmmss"
$diag = Join-Path $Root "diagnostics"
$log  = Join-Path $diag "diag-$ts.log"
$envSan = Join-Path $diag ".env.sanitized"
New-Item -ItemType Directory -Force $diag | Out-Null

function Write-Section([string]$title) {
  "=== $title ===" | Tee-Object -FilePath $log -Append | Out-Host
}

function Run([string]$cmd, [string[]]$argList) {
  Write-Section "$cmd $($argList -join ' ')"
  try {
    & $cmd @args 2>&1 | Tee-Object -FilePath $log -Append | Out-Host
    if ($LASTEXITCODE -ne $null) { "ExitCode: $LASTEXITCODE" | Tee-Object -FilePath $log -Append | Out-Host }
  } catch {
    "ERROR: $($_.Exception.Message)" | Tee-Object -FilePath $log -Append | Out-Host
  }
}

function Remove-PathRobust([string]$p) {
  if (!(Test-Path $p)) { return }
  try {
    Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction Stop
  } catch {
    cmd /c "rmdir /s /q `"$p`""
  }
}

function Sanitize-Env([string]$inPath, [string]$outPath) {
  if (!(Test-Path $inPath)) {
    Write-Section ".env"
    "لم يتم العثور على .env" | Tee-Object -FilePath $log -Append | Out-Host
    return
  }
  $lines = Get-Content -LiteralPath $inPath -Encoding UTF8
  $safe = New-Object System.Collections.Generic.List[string]
  foreach ($l in $lines) {
    if ($l -match '^\s*#' -or $l -match '^\s*$') { continue }
    $name, $val = $l -split '=', 2
    if ($name -match '^(PORT|NODE_ENV|VITE_[A-Z0-9_]+|REACT_APP_[A-Z0-9_]+)$') {
      $safe.Add("$name=$val")
    } elseif ($name -match '(KEY|SECRET|TOKEN|PASS|PWD|DATABASE|URL|SMTP|PRIVATE|CLIENT|AWS|AZURE|GOOGLE|OPENAI|SUPABASE|POSTGRES|MYSQL|MONGODB|REDIS|JWT|STRIPE|PAYPAL|EMAIL)') {
      $safe.Add("$name=****")
    } else {
      $safe.Add("$name=[hidden]")
    }
  }
  Set-Content -LiteralPath $outPath -Encoding UTF8 -Value ($safe -join "`r`n")
  Write-Section ".env (sanitized)"
  Get-Content -LiteralPath $outPath | Tee-Object -FilePath $log -Append | Out-Host
}

# 1) Node & NPM
Write-Section "Node & NPM versions"
Run "node" @("-v")
Run "npm"  @("-v")

# 2) Git
Write-Section "Git status"
$inside = ""
try { $inside = (git rev-parse --is-inside-work-tree 2>$null).Trim() } catch {}
if ($inside -eq "true") {
  Run "git" @("status","--porcelain=v1","-b")
  Run "git" @("remote","-v")
} else {
  "هذا المجلد ليس مستودع Git" | Tee-Object -FilePath $log -Append | Out-Host
}

# 3) package.json: scripts & deps
Write-Section "package.json (scripts & dependencies)"
try {
  $pkgRaw = Get-Content (Join-Path $Root "package.json") -Raw -Encoding UTF8
  $pkg = $pkgRaw | ConvertFrom-Json
  "== scripts ==" | Tee-Object -FilePath $log -Append | Out-Host
  ($pkg.scripts.PSObject.Properties | ForEach-Object { "$($_.Name): $($_.Value)" }) | Tee-Object -FilePath $log -Append | Out-Host
  "== dependencies ==" | Tee-Object -FilePath $log -Append | Out-Host
  ($pkg.dependencies.PSObject.Properties | ForEach-Object { "$($_.Name): $($_.Value)" }) | Tee-Object -FilePath $log -Append | Out-Host
  "== devDependencies ==" | Tee-Object -FilePath $log -Append | Out-Host
  ($pkg.devDependencies.PSObject.Properties | ForEach-Object { "$($_.Name): $($_.Value)" }) | Tee-Object -FilePath $log -Append | Out-Host
} catch {
  "تعذّر قراءة package.json: $($_.Exception.Message)" | Tee-Object -FilePath $log -Append | Out-Host
}

# 4) .env sanitized
Sanitize-Env (Join-Path $Root ".env") $envSan

# 5) تنظيف وتثبيت
Write-Section "Clean install"
Set-Location $Root
if (Test-Path "node_modules") {
  "Removing node_modules..." | Tee-Object -FilePath $log -Append | Out-Host
  Remove-PathRobust "node_modules"
}
if (Test-Path "package-lock.json") {
  "Removing package-lock.json..." | Tee-Object -FilePath $log -Append | Out-Host
  Remove-PathRobust "package-lock.json"
}
$use = "npm"
if (Test-Path "pnpm-lock.yaml") { $use = "pnpm" }
elseif (Test-Path "yarn.lock") { $use = "yarn" }

switch ($use) {
  "pnpm" { Run "pnpm" @("install") }
  "yarn" { Run "yarn" @("install","--check-files") }
  default {
    if (Test-Path "package-lock.json") { Run "npm" @("ci") } else { Run "npm" @("install") }
  }
}

# 6) Build/Start (45s)
Write-Section "Build / Start"
$hasBuild = $false
try { if ($pkg.scripts.build) { $hasBuild = $true } } catch {}
if ($hasBuild) {
  Run "npm" @("run","build","--","--no-color")
} else {
  "لا يوجد build. سأشغّل start لمدة 45 ثانية." | Tee-Object -FilePath $log -Append | Out-Host
  $outFile = Join-Path $diag "start-$ts.out.txt"
  $errFile = Join-Path $diag "start-$ts.err.txt"
  $p = Start-Process -FilePath "npm" -ArgumentList @("run","start") -RedirectStandardOutput $outFile -RedirectStandardError $errFile -PassThru -WorkingDirectory $Root
  if (Wait-Process -Id $p.Id -Timeout 45 -ErrorAction SilentlyContinue) {
    "انتهى start خلال 45 ثانية." | Tee-Object -FilePath $log -Append | Out-Host
  } else {
    "تم إيقاف start بعد 45 ثانية." | Tee-Object -FilePath $log -Append | Out-Host
    try { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue } catch {}
  }
  Write-Section "start stdout (truncated)"
  if (Test-Path $outFile) { Get-Content $outFile -TotalCount 500 | Tee-Object -FilePath $log -Append | Out-Host }
  Write-Section "start stderr (truncated)"
  if (Test-Path $errFile) { Get-Content $errFile -TotalCount 500 | Tee-Object -FilePath $log -Append | Out-Host }
}

# 7) شجرة src عمق 2 (بدون -Depth لمراعاة PS 5.1)
Write-Section "src tree (depth=2)"
$src = Join-Path $Root "src"
if (Test-Path $src) {
  # مستوى 0
  Get-ChildItem -LiteralPath $src | ForEach-Object {
    if ($_.PSIsContainer) { "[DIR]  .\src\{0}" -f $_.Name } else { "      .\src\{0}" -f $_.Name }
  } | Tee-Object -FilePath $log -Append | Out-Host
  # مستوى 1
  Get-ChildItem -LiteralPath $src -Directory | ForEach-Object {
    $lvl1 = $_
    Get-ChildItem -LiteralPath $lvl1.FullName | ForEach-Object {
      $rel = ".\src\{0}\{1}" -f $lvl1.Name, $_.Name
      if ($_.PSIsContainer) { "[DIR]  $rel" } else { "      $rel" }
    } | Tee-Object -FilePath $log -Append | Out-Host
  }
} else {
  "لا يوجد مجلد src" | Tee-Object -FilePath $log -Append | Out-Host
}

Write-Section "DONE"
"تم إنشاء التقرير: $log" | Tee-Object -FilePath $log -Append | Out-Host
"أرفِق محتوى هذا الملف هنا كاملاً." | Tee-Object -FilePath $log -Append | Out-Host



