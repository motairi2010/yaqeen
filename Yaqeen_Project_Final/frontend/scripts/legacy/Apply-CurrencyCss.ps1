param([string]$Root=(Get-Location).Path,[switch]$DryRun)
function Step($m){ Write-Host "==> $m" -ForegroundColor Cyan }
function Ensure([string]$p){ if(!(Test-Path -LiteralPath $p)){ throw "المسار غير موجود: $p" } (Resolve-Path -LiteralPath $p).Path }
function NewBackup([string]$root){ $b=Join-Path $root ("backup\apply-currencycss-" + (Get-Date -Format "yyyyMMdd-HHmmss")); New-Item -ItemType Directory -Force $b|Out-Null; $b }
function Backup([string]$file,[string]$root,[string]$b){ if(!(Test-Path -LiteralPath $file)){return}; $abs=(Resolve-Path -LiteralPath $file).Path; $rel=$abs.Substring($root.Length).TrimStart('\','/'); $dst=Join-Path $b $rel; New-Item -ItemType Directory -Force (Split-Path $dst -Parent)|Out-Null; Copy-Item -LiteralPath $abs -Destination $dst -Force }
$root=Ensure $Root; $src=Join-Path $root "src"; $backup=NewBackup $root
$stylesDir = Join-Path $src "styles"; New-Item -ItemType Directory -Force $stylesDir | Out-Null
$currencyCssPath = Join-Path $stylesDir "currency.css"
'/* src/styles/currency.css */' + "`r`n" + '.amount-sar { direction: rtl; unicode-bidi: isolate; white-space: nowrap; }' | Set-Content -LiteralPath $currencyCssPath -Encoding UTF8
$entry = Join-Path $src "index.js"; if(!(Test-Path $entry)){ $entry = Join-Path $src "main.jsx" }
$t = Get-Content -LiteralPath $entry -Raw
$t = [regex]::Replace($t,'^\s*import\s+["'']\.\/styles\/currency\.css["''];\s*\r?\n','', 'Multiline')
$t = 'import "./styles/currency.css";' + "`r`n" + $t
Backup $entry $root $backup; Set-Content -LiteralPath $entry -Value $t -Encoding UTF8
$mainCss = Join-Path $src "main.css"
if(Test-Path $mainCss){
  $raw = Get-Content -LiteralPath $mainCss -Raw
  $fixed = [regex]::Replace($raw,'^\s*import\s+["'']\.\/styles\/currency\.css["'']\s*;\s*(\r?\n)?','', 'Multiline')
  $fixed = [regex]::Replace($fixed,'^\s*@import\s+(?:url\()?["'']\.\/styles\/currency\.css["'']\)?\s*;\s*(\r?\n)?','', 'Multiline')
  if($fixed -ne $raw){ Backup $mainCss $root $backup; Set-Content -LiteralPath $mainCss -Value $fixed -Encoding UTF8 }
}
Step "تم. ابنِ وشغّل: npm run build && npm run dev"
