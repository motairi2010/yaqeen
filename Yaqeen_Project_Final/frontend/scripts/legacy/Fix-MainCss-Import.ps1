param(
  [string]$Root = (Get-Location).Path,
  [switch]$DryRun
)

function Step($m){ Write-Host "==> $m" -ForegroundColor Cyan }
function Ensure([string]$p){
  if(!(Test-Path -LiteralPath $p)){ throw "المسار غير موجود: $p" }
  (Resolve-Path -LiteralPath $p).Path
}
function NewBackup([string]$root){
  $b = Join-Path $root ("backup\fix-maincss-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
  New-Item -ItemType Directory -Force $b | Out-Null
  $b
}
function Backup([string]$file,[string]$root,[string]$b){
  if(!(Test-Path -LiteralPath $file)){ return }
  $abs = (Resolve-Path -LiteralPath $file).Path
  $rel = $abs.Substring($root.Length).TrimStart('\','/')
  $dst = Join-Path $b $rel
  New-Item -ItemType Directory -Force (Split-Path $dst -Parent) | Out-Null
  Copy-Item -LiteralPath $abs -Destination $dst -Force
}

$root   = Ensure $Root
$file   = Join-Path $root "src\main.css"
$backup = NewBackup $root

if(!(Test-Path -LiteralPath $file)){ throw "ما لقيت الملف: $file" }

# تأكد أن styles/currency.css موجود، وإن ما كان موجود أنشئه
$currency = Join-Path $root "src\styles\currency.css"
if(!(Test-Path -LiteralPath $currency)){
  New-Item -ItemType Directory -Force (Split-Path $currency -Parent) | Out-Null
  '/* currency.css */ .amount-sar{direction:rtl;unicode-bidi:isolate;white-space:nowrap;}' |
    Set-Content -LiteralPath $currency -Encoding UTF8
  Step "أنشأت: src\styles\currency.css"
}

$raw = Get-Content -LiteralPath $file -Raw

# شيل أي 'import "./styles/currency.css";' الغلط
$fixed = [regex]::Replace($raw, '^\s*import\s+["'']\.\/styles\/currency\.css["'']\s*;\s*(\r?\n)?', '', 'Multiline')
# شيل أي @import مكرر لنفس الملف
$fixed = [regex]::Replace($fixed, '^\s*@import\s+(?:url\()?["'']\.\/styles\/currency\.css["'']\)?\s*;\s*(\r?\n)?', '', 'Multiline')
# قص أي أسطر/فراغات في البداية
$fixed = [regex]::Replace($fixed, '^\s*', '')

$directive = '@import "./styles/currency.css";'
$new = $directive + "`r`n" + $fixed

if($new -ne $raw){
  Step "تعديل: $file"
  if(!$DryRun){ Backup $file $root $backup; Set-Content -LiteralPath $file -Value $new -Encoding UTF8 }
}else{
  Step "لا تغييرات مطلوبة"
}

Step "جاهز. ابْنِ التغييرات: npm run build && npm run dev"
