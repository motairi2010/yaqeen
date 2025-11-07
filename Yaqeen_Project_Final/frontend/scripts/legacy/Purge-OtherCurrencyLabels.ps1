param(
  [string]$Root = "C:\Projects\Yaqeen_Project_Final\frontend",
  [ValidateSet('before','after')]
  [string]$DefaultSide = 'after'
)

Write-Host "==[ Purge other currency labels & enforce SAR symbol (﷼) ]==" -ForegroundColor Cyan

$src       = Join-Path $Root "src"
$public    = Join-Path $Root "public"
$stylesDir = Join-Path $src  "styles"
$utilsDir  = Join-Path $src  "utils"

if(!(Test-Path $src)){ Write-Error "لم يتم العثور على src تحت: $Root"; exit 1 }

function Ensure-Dir([string]$p){ if(!(Test-Path $p)){ New-Item -ItemType Directory -Force $p | Out-Null } }
function Backup([string]$p){
  if(Test-Path $p){
    $d=Split-Path $p -Parent; $n=Split-Path $p -Leaf
    $t=Get-Date -Format yyyyMMdd-HHmmss
    $b=Join-Path $d "backup"; Ensure-Dir $b
    Copy-Item $p (Join-Path $b "$t-$n") -Force
  }
}

Ensure-Dir $public; Ensure-Dir $stylesDir; Ensure-Dir $utilsDir

# 1) CSS عالمي لإضافة ﷼ فقط (قبل/بعد) للنصوص ولحقول الإدخال
$cssPath = Join-Path $stylesDir "currency.css"
$css = @'
:root {
  --sar-gap: .45rem;
  --sar-font: "IBM Plex Sans Arabic","Noto Sans Arabic","Segoe UI",
              "Arial Unicode MS",Arial,Tahoma,sans-serif;
}

/* للنصوص (قيم المبالغ) */
.amount-sar { font-family: var(--sar-font); }
body.sar-before .amount-sar::before { content: "﷼"; margin-inline-end: var(--sar-gap); }
body.sar-after  .amount-sar::after  { content: "﷼"; margin-inline-start: var(--sar-gap); }

/* لحقول الإدخال: لفّ input بحاوية */
.currency-wrap { position: relative; display: inline-block; font-family: var(--sar-font); }
body.sar-before .currency-wrap::before{
  content: "﷼"; position: absolute; inset-inline-start: .75rem; top: 50%;
  transform: translateY(-50%); opacity: .95; pointer-events: none;
}
body.sar-before .currency-wrap > input{ padding-inline-start: 1.8rem; }

body.sar-after .currency-wrap::after{
  content: "﷼"; position: absolute; inset-inline-end: .75rem; top: 50%;
  transform: translateY(-50%); opacity: .95; pointer-events: none;
}
body.sar-after .currency-wrap > input{ padding-inline-end: 1.8rem; }
'@
Backup $cssPath
$css | Set-Content $cssPath -Encoding UTF8
Write-Host "Wrote CSS: $cssPath" -ForegroundColor Green

# 1.a) @import للـ CSS في styles رئيسي
$imports = @(
  Join-Path $src "index.css",
  Join-Path $src "styles.css",
  Join-Path $stylesDir "index.css"
)
$importLine = '@import "./styles/currency.css";'
$imported = $false
foreach($f in $imports){
  if(Test-Path $f){
    $raw = Get-Content $f -Raw
    if($raw -notmatch [regex]::Escape($importLine)){
      Backup $f
      ($importLine + "`r`n" + $raw) | Set-Content $f -Encoding UTF8
      Write-Host "Injected import into: $f" -ForegroundColor Green
    } else {
      Write-Host "Already imported in: $f" -ForegroundColor DarkGray
    }
    $imported = $true; break
  }
}
if(-not $imported){
  $fallback = Join-Path $src "index.css"
  if(!(Test-Path $fallback)){
    $importLine | Set-Content $fallback -Encoding UTF8
    Write-Host "Created: $fallback (تأكد أنه داخل البندل)" -ForegroundColor Yellow
  }
}

# 1.b) ضبط موضع الرمز على <body> (before/after)
$entry = $null
$entry1 = Join-Path $src "main.tsx"
$entry2 = Join-Path $src "index.tsx"
if(Test-Path $entry1){ $entry = $entry1 } elseif(Test-Path $entry2){ $entry = $entry2 }
if($entry){
  $raw = Get-Content $entry -Raw
  if($raw -notmatch 'document\.body\.classList\.add\(["'']sar-'){
    Backup $entry
    $inject = "document.body.classList.add('sar-$DefaultSide');`r`n"
    ($inject + $raw) | Set-Content $entry -Encoding UTF8
    Write-Host "Injected default side (sar-$DefaultSide) into: $(Split-Path $entry -Leaf)" -ForegroundColor Green
  } else {
    Write-Host "Body SAR side already set." -ForegroundColor DarkGray
  }
} else {
  Write-Host "Entry not found. أضف يدويًا: document.body.classList.add('sar-$DefaultSide');" -ForegroundColor Yellow
}

# 2) أداة تنسيق رقم بالعربية + دالة نص ﷼ فقط (للاستخدام البرمجي عند الحاجة)
$utilPath = Join-Path $utilsDir "formatSAR.ts"
$util = @'
export type SarSide = "before" | "after";
export function formatNumberAr(value: number){
  return new Intl.NumberFormat("ar-SA", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value ?? 0));
}
export function formatSAR(value: number, side: SarSide = "after"){
  const n = formatNumberAr(value);
  return side === "before" ? `﷼ ${n}` : `${n} ﷼`;
}
'@
Backup $utilPath
$util | Set-Content $utilPath -Encoding UTF8
Write-Host "Wrote util: $utilPath" -ForegroundColor Green

# 3) إصلاح Intl: منع style:'currency' وأي currencyDisplay، وتحويل currency:'...' إلى decimal فقط
$codeFiles = Get-ChildItem $src -Recurse -Include *.ts,*.tsx,*.js,*.jsx | Where-Object { $_.FullName -notmatch '\\backup\\' -and $_.FullName -notmatch '\\_backups' }
$fixedIntl = 0
foreach($f in $codeFiles){
  $raw = Get-Content $f.FullName -Raw
  $new = $raw

  # غيّر style:"currency" إلى style:"decimal"
  $new = [regex]::Replace($new, 'style\s*:\s*["'']currency["'']', 'style:"decimal"')

  # احذف currencyDisplay: "symbol"/"narrowSymbol"/"code"/"name"
  $new = [regex]::Replace($new, 'currencyDisplay\s*:\s*["''](symbol|narrowSymbol|code|name)["'']\s*,?', '')

  # احذف currency:"SAR" أو أي كود آخر عند وجود style:"decimal"
  $new = [regex]::Replace($new, 'currency\s*:\s*["''][A-Z]{3}["'']\s*,?', '')

  if($new -ne $raw){
    Backup $f.FullName
    $new | Set-Content $f.FullName -Encoding UTF8
    Write-Host "Normalized Intl to decimal in: $($f.FullName)" -ForegroundColor Green
    $fixedIntl++
  }
}
Write-Host "Files normalized (Intl): $fixedIntl"

# 4) إزالة أي نصوص عملة ثابتة حين تكون ملتصقة بمبلغ: (ر.س | ر.‏س | SAR | ريال)
#   - نستهدف فقط الحالات القريبة من أرقام (عربية/إنجليزية) لتفادي حذف كلمة 'ريال' في نصوص وصفية.
$arabDigits = '\x{0660}-\x{0669}'
$numberRe = "[0-9$arabDigits][0-9$arabDigits\.,٬٫\s]*"

$patterns = @(
  # ... رقم [فراغ] (ر.س|ريال|SAR)
  "(?<=$numberRe)\s*(ر\.?\s?\.?\s?س|ريال|SAR)",
  # (ر.س|ريال|SAR) [فراغ] ... رقم
  "(ر\.?\s?\.?\s?س|ريال|SAR)\s*(?=$numberRe)"
)

$replacedLabels = 0
foreach($f in $codeFiles){
  $raw = Get-Content $f.FullName -Raw
  $new = $raw
  foreach($pat in $patterns){
    $new = [regex]::Replace($new, $pat, "", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  }
  if($new -ne $raw){
    Backup $f.FullName
    $new | Set-Content $f.FullName -Encoding UTF8
    Write-Host "Removed hard-coded labels around amounts in: $($f.FullName)" -ForegroundColor Green
    $replacedLabels++
  }
}
Write-Host "Files cleaned (labels near numbers): $replacedLabels"

# 5) إنشاء أيقونة SVG احتياطية (إن احتجتها لاحقًا)
$sarSvgPath = Join-Path $public "sar.svg"
if(!(Test-Path $sarSvgPath)){
  $svg = @'
<!-- public/sar.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <rect width="24" height="24" fill="none"/>
  <text x="12" y="17" text-anchor="middle"
        font-family="IBM Plex Sans Arabic, Noto Sans Arabic, Segoe UI, Arial, Tahoma, sans-serif"
        font-size="16" fill="currentColor">&#xFDFC;</text>
</svg>
'@
  $svg | Set-Content $sarSvgPath -Encoding UTF8
  Write-Host "Wrote fallback icon: $sarSvgPath" -ForegroundColor DarkGray
}

Write-Host "`n== تم. الآن تظهر ﷼ فقط (بدون ر.س/ريال/SAR). أعد تشغيل dev server. ==" -ForegroundColor Cyan
