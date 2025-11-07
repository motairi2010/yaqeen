param(
  [string]$Root = "C:\Projects\Yaqeen_Project_Final\frontend",
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

# ملخص العد
$summary = [ordered]@{ PASS = 0; WARN = 0; FAIL = 0 }
function _bump([string]$lvl){ if ($summary.Contains($lvl)) { $summary[$lvl]++ } }

function _msg([string]$lvl, [string]$text) {
  $c = switch ($lvl) {
    "PASS" { "Green" }
    "WARN" { "Yellow" }
    "FAIL" { "Red" }
    default { "White" }
  }
  Write-Host ("[{0}] {1}" -f $lvl, $text) -ForegroundColor $c
  if ($lvl -in @("PASS","WARN","FAIL")) { _bump $lvl }
}

function _exists([string]$path, [string]$label) {
  if (Test-Path $path) { _msg "PASS" "$label موجود: $path"; return $true }
  else { _msg "FAIL" "$label غير موجود: $path"; return $false }
}

# مسارات قياسية
$src       = Join-Path $Root "src"
$stylesDir = Join-Path $src "styles"
$assetsDir = Join-Path $src "assets"
$fontsDir  = Join-Path $assetsDir "fonts"

# 1) currency.css
$currencyCss = Join-Path $stylesDir "currency.css"
$hasCurrencyCss = _exists $currencyCss "styles/currency.css"
$css = ""
if ($hasCurrencyCss) {
  $css = Get-Content $currencyCss -Raw -Encoding UTF8
  if ($css -match '(?is)@font-face\s*{[^}]*font-family\s*:\s*["'']?RialSymbol["'']?') {
    _msg "PASS" "تم العثور على @font-face لخط RialSymbol"
    $urls = [regex]::Matches($css, '(?is)url\((["'']?)(?<u>[^)''""]+)\1\)')
    if ($urls.Count -gt 0) {
      $firstUrl = $urls[0].Groups["u"].Value
      $fontPath = if ([IO.Path]::IsPathRooted($firstUrl)) { $firstUrl } else { Join-Path (Split-Path $currencyCss -Parent) $firstUrl }
      if (Test-Path $fontPath) { _msg "PASS" "ملف الخط المشار إليه موجود: $fontPath" } else { _msg "WARN" "تعريف الخط موجود لكن ملف الخط غير موجود فعلياً: $fontPath" }
    } else {
      _msg "WARN" "تعريف @font-face موجود لكن لم أجد url(...) للخط"
    }
  } else {
    _msg "WARN" "لم أجد @font-face باسم RialSymbol داخل currency.css"
  }

  if ($css -match '(?is)\.sar-font\s*{') { _msg "PASS" "الكلاس .sar-font موجود" } else { _msg "WARN" "الكلاس .sar-font غير موجود في currency.css" }
}

# 2) CurrencySelect.jsx
$currencySelect = Join-Path $src "components\CurrencySelect.jsx"
if (_exists $currencySelect "components/CurrencySelect.jsx") {
  $sel = Get-Content $currencySelect -Raw -Encoding UTF8
  if ($sel -match 'sar-font') { _msg "PASS" "المكوّن يستخدم .sar-font" } else { _msg "WARN" "المكوّن لا يستخدم .sar-font صراحة" }
  if ($sel -match 'SAR' -or $sel -match 'currency["'']?\s*[:=]\s*["'']?SAR') { _msg "PASS" "المكوّن يتعامل مع عملة SAR" } else { _msg "WARN" "لم أجد إشارة صريحة لـ SAR داخل المكوّن" }
}

# 3) sar.svg + مرجع SarIcon.jsx
$sarSvg = Join-Path $assetsDir "sar.svg"
if (Test-Path $sarSvg) {
  _msg "PASS" "أيقونة sar.svg موجودة"
} else {
  _msg "WARN" "أيقونة sar.svg غير موجودة في assets"
  $refs = Get-ChildItem $src -Recurse -Include *.js,*.jsx,*.ts,*.tsx | Select-String -Pattern 'src/assets/sar\.svg|assets/sar\.svg|/sar\.svg'
  if ($refs) { _msg "FAIL" ("هناك مراجع لـ sar.svg في الشيفرة لكن الملف مفقود: {0}" -f (($refs | Select-Object -ExpandProperty Path -Unique) -join ', ')) }
}

# 4) الاستيرادات المسببة للشاشة البيضاء
$riyalRuntime = Join-Path $stylesDir "riyal.runtime.css"
$riyalPatchJs = Join-Path $src "utils\riyalPatch.js"
$riyalPatchTs = Join-Path $src "utils\riyalPatch.ts"

$allJs = Get-ChildItem $src -Recurse -Include *.js,*.jsx,*.ts,*.tsx -File
$importRuntimeHits = $allJs | Select-String -Pattern 'import\s+["'']\.\/styles\/riyal\.runtime\.css["'']'
$importPatchHits   = $allJs | Select-String -Pattern 'from\s+["'']\.\/utils\/riyalPatch["'']|watchRiyal\s*\('

if ($importRuntimeHits) {
  if (Test-Path $riyalRuntime) { _msg "PASS" "riyal.runtime.css موجود وهنالك ملفات تستورده" }
  else { _msg "FAIL" ("تم العثور على استيراد riyal.runtime.css لكن الملف غير موجود. الملفات: {0}" -f (($importRuntimeHits | Select-Object -ExpandProperty Path -Unique) -join ', ')) }
} else {
  _msg "WARN" "لا توجد استيرادات لـ riyal.runtime.css حالياً (جيد مؤقتاً لو نبي تشغيل سريع)."
}

if ($importPatchHits) {
  if ((Test-Path $riyalPatchJs) -or (Test-Path $riyalPatchTs)) {
    _msg "PASS" "riyalPatch موجود ويتوافق مع الاستيراد/الاستخدام"
  } else {
    _msg "FAIL" ("تم العثور على استخدام/استيراد watchRiyal/riyalPatch لكن الملف غير موجود: {0}" -f (($importPatchHits | Select-Object -ExpandProperty Path -Unique) -join ', '))
  }
} else {
  _msg "WARN" "لا توجد إشارات لـ watchRiyal()/riyalPatch حالياً (هذا يقلل مخاطر الشاشة البيضاء)."
}

# 5) توحيد مسار الخطوط
if (Test-Path $fontsDir) {
  $fonts = Get-ChildItem $fontsDir -File -ErrorAction SilentlyContinue
  if ($fonts.Count -gt 0) {
    _msg "PASS" ("عُثر على {0} ملف/ملفات خطوط داخل assets/fonts" -f $fonts.Count)
    $cands = $fonts | Where-Object { $_.Name -match '(rial|riyal|sar|symbol)' -or $_.Extension -match 'ttf|otf|woff2?' }
    if ($cands.Count -gt 0) {
      _msg "PASS" ("مرشّحات خطوط متعلقة بالريال: {0}" -f (($cands.Name) -join ', '))
    } else {
      _msg "WARN" "لم أجد ملفات خطوط يبدو أنها تخص الرمز ضمن assets/fonts"
    }
  } else {
    _msg "WARN" "مجلد assets/fonts موجود لكنه فارغ"
  }
} else {
  _msg "WARN" "المجلد assets/fonts غير موجود"
}

# 6) تذكير بخطأ PowerShell السابق
$psErrors = Get-ChildItem $Root -Recurse -Include *.ps1 -ErrorAction SilentlyContinue | Where-Object { param(
  [string]$Root = "C:\Projects\Yaqeen_Project_Final\frontend",
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

# ملخص العد
$summary = [ordered]@{ PASS = 0; WARN = 0; FAIL = 0 }
function _bump([string]$lvl){ if ($summary.Contains($lvl)) { $summary[$lvl]++ } }

function _msg([string]$lvl, [string]$text) {
  $c = switch ($lvl) {
    "PASS" { "Green" }
    "WARN" { "Yellow" }
    "FAIL" { "Red" }
    default { "White" }
  }
  Write-Host ("[{0}] {1}" -f $lvl, $text) -ForegroundColor $c
  if ($lvl -in @("PASS","WARN","FAIL")) { _bump $lvl }
}

function _exists([string]$path, [string]$label) {
  if (Test-Path $path) { _msg "PASS" "$label موجود: $path"; return $true }
  else { _msg "FAIL" "$label غير موجود: $path"; return $false }
}

# مسارات قياسية
$src       = Join-Path $Root "src"
$stylesDir = Join-Path $src "styles"
$assetsDir = Join-Path $src "assets"
$fontsDir  = Join-Path $assetsDir "fonts"

# 1) currency.css
$currencyCss = Join-Path $stylesDir "currency.css"
$hasCurrencyCss = _exists $currencyCss "styles/currency.css"
$css = ""
if ($hasCurrencyCss) {
  $css = Get-Content $currencyCss -Raw -Encoding UTF8
  if ($css -match '(?is)@font-face\s*{[^}]*font-family\s*:\s*["'']?RialSymbol["'']?') {
    _msg "PASS" "تم العثور على @font-face لخط RialSymbol"
    $urls = [regex]::Matches($css, '(?is)url\((["'']?)(?<u>[^)''""]+)\1\)')
    if ($urls.Count -gt 0) {
      $firstUrl = $urls[0].Groups["u"].Value
      $fontPath = if ([IO.Path]::IsPathRooted($firstUrl)) { $firstUrl } else { Join-Path (Split-Path $currencyCss -Parent) $firstUrl }
      if (Test-Path $fontPath) { _msg "PASS" "ملف الخط المشار إليه موجود: $fontPath" } else { _msg "WARN" "تعريف الخط موجود لكن ملف الخط غير موجود فعلياً: $fontPath" }
    } else {
      _msg "WARN" "تعريف @font-face موجود لكن لم أجد url(...) للخط"
    }
  } else {
    _msg "WARN" "لم أجد @font-face باسم RialSymbol داخل currency.css"
  }

  if ($css -match '(?is)\.sar-font\s*{') { _msg "PASS" "الكلاس .sar-font موجود" } else { _msg "WARN" "الكلاس .sar-font غير موجود في currency.css" }
}

# 2) CurrencySelect.jsx
$currencySelect = Join-Path $src "components\CurrencySelect.jsx"
if (_exists $currencySelect "components/CurrencySelect.jsx") {
  $sel = Get-Content $currencySelect -Raw -Encoding UTF8
  if ($sel -match 'sar-font') { _msg "PASS" "المكوّن يستخدم .sar-font" } else { _msg "WARN" "المكوّن لا يستخدم .sar-font صراحة" }
  if ($sel -match 'SAR' -or $sel -match 'currency["'']?\s*[:=]\s*["'']?SAR') { _msg "PASS" "المكوّن يتعامل مع عملة SAR" } else { _msg "WARN" "لم أجد إشارة صريحة لـ SAR داخل المكوّن" }
}

# 3) sar.svg + مرجع SarIcon.jsx
$sarSvg = Join-Path $assetsDir "sar.svg"
if (Test-Path $sarSvg) {
  _msg "PASS" "أيقونة sar.svg موجودة"
} else {
  _msg "WARN" "أيقونة sar.svg غير موجودة في assets"
  $refs = Get-ChildItem $src -Recurse -Include *.js,*.jsx,*.ts,*.tsx | Select-String -Pattern 'src/assets/sar\.svg|assets/sar\.svg|/sar\.svg'
  if ($refs) { _msg "FAIL" ("هناك مراجع لـ sar.svg في الشيفرة لكن الملف مفقود: {0}" -f (($refs | Select-Object -ExpandProperty Path -Unique) -join ', ')) }
}

# 4) الاستيرادات المسببة للشاشة البيضاء
$riyalRuntime = Join-Path $stylesDir "riyal.runtime.css"
$riyalPatchJs = Join-Path $src "utils\riyalPatch.js"
$riyalPatchTs = Join-Path $src "utils\riyalPatch.ts"

$allJs = Get-ChildItem $src -Recurse -Include *.js,*.jsx,*.ts,*.tsx -File
$importRuntimeHits = $allJs | Select-String -Pattern 'import\s+["'']\.\/styles\/riyal\.runtime\.css["'']'
$importPatchHits   = $allJs | Select-String -Pattern 'from\s+["'']\.\/utils\/riyalPatch["'']|watchRiyal\s*\('

if ($importRuntimeHits) {
  if (Test-Path $riyalRuntime) { _msg "PASS" "riyal.runtime.css موجود وهنالك ملفات تستورده" }
  else { _msg "FAIL" ("تم العثور على استيراد riyal.runtime.css لكن الملف غير موجود. الملفات: {0}" -f (($importRuntimeHits | Select-Object -ExpandProperty Path -Unique) -join ', ')) }
} else {
  _msg "WARN" "لا توجد استيرادات لـ riyal.runtime.css حالياً (جيد مؤقتاً لو نبي تشغيل سريع)."
}

if ($importPatchHits) {
  if ((Test-Path $riyalPatchJs) -or (Test-Path $riyalPatchTs)) {
    _msg "PASS" "riyalPatch موجود ويتوافق مع الاستيراد/الاستخدام"
  } else {
    _msg "FAIL" ("تم العثور على استخدام/استيراد watchRiyal/riyalPatch لكن الملف غير موجود: {0}" -f (($importPatchHits | Select-Object -ExpandProperty Path -Unique) -join ', '))
  }
} else {
  _msg "WARN" "لا توجد إشارات لـ watchRiyal()/riyalPatch حالياً (هذا يقلل مخاطر الشاشة البيضاء)."
}

# 5) توحيد مسار الخطوط
if (Test-Path $fontsDir) {
  $fonts = Get-ChildItem $fontsDir -File -ErrorAction SilentlyContinue
  if ($fonts.Count -gt 0) {
    _msg "PASS" ("عُثر على {0} ملف/ملفات خطوط داخل assets/fonts" -f $fonts.Count)
    $cands = $fonts | Where-Object { $_.Name -match '(rial|riyal|sar|symbol)' -or $_.Extension -match 'ttf|otf|woff2?' }
    if ($cands.Count -gt 0) {
      _msg "PASS" ("مرشّحات خطوط متعلقة بالريال: {0}" -f (($cands.Name) -join ', '))
    } else {
      _msg "WARN" "لم أجد ملفات خطوط يبدو أنها تخص الرمز ضمن assets/fonts"
    }
  } else {
    _msg "WARN" "مجلد assets/fonts موجود لكنه فارغ"
  }
} else {
  _msg "WARN" "المجلد assets/fonts غير موجود"
}

# 6) تذكير بخطأ PowerShell السابق
$psErrors = Get-ChildItem $Root -Recurse -Include *.ps1 -ErrorAction SilentlyContinue | Select-String -Pattern 'Cannot index into a null array'
if ($psErrors) {
  _msg "WARN" ("سابقاً ظهرت مشكلة PowerShell: Cannot index into a null array. راجع السكربتات: {0}" -f (($psErrors | Select-Object -ExpandProperty Path -Unique) -join ', '))
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
"{0} PASS, {1} WARN, {2} FAIL" -f $summary.PASS, $summary.WARN, $summary.FAIL | Write-Host

if ($Strict -and $summary.FAIL -gt 0) { exit 1 } else { exit 0 }
.Name -ne 'Verify-RiyalState.ps1' } | Select-String -Pattern 'Cannot index into a null array'
if ($psErrors) {
  _msg "WARN" ("سابقاً ظهرت مشكلة PowerShell: Cannot index into a null array. راجع السكربتات: {0}" -f (($psErrors | Select-Object -ExpandProperty Path -Unique) -join ', '))
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
"{0} PASS, {1} WARN, {2} FAIL" -f $summary.PASS, $summary.WARN, $summary.FAIL | Write-Host

if ($Strict -and $summary.FAIL -gt 0) { exit 1 } else { exit 0 }

