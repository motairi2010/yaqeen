# Patch-CurrencyMenu.ps1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function New-Dir([string]$p){ if(-not (Test-Path $p)){ New-Item -ItemType Directory -Force $p | Out-Null } }
function Backup([string]$p){
  if(Test-Path $p){
    $dir = Split-Path $p -Parent; New-Dir (Join-Path $dir "backup")
    $ts = Get-Date -Format "yyyyMMdd-HHmmss"
    Copy-Item $p (Join-Path $dir "backup\$ts-$(Split-Path $p -Leaf)") -Force
  }
}

$root      = (Get-Location).Path
$fontsDir  = Join-Path $root "src\assets\fonts"
$styles    = Join-Path $root "src\styles\currency.css"
$bootstrap = Join-Path $root "src\bootstrap.js"
$cmpFile   = Join-Path $root "src\components\CurrencySelect.jsx"

New-Dir $fontsDir
New-Dir (Split-Path $styles)
New-Dir (Split-Path $cmpFile)

# 1) جهّز خط رمز الريال: src\assets\fonts\RialSymbol.ttf
$dstFont = Join-Path $fontsDir "RialSymbol.ttf"
if(-not (Test-Path $dstFont)){
  $roots = @("$env:USERPROFILE\Downloads","$env:USERPROFILE\Desktop","$env:USERPROFILE\Documents",$root) | Where-Object { Test-Path $_ }
  $pat = '(?i)(riyal|rial|sar|saudi|riy[ae]l|ريال|رمز|السعود)'
  $cand = foreach($r in $roots){ Get-ChildItem $r -Recurse -Include *.ttf -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -match $pat } } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if($cand){
    Copy-Item $cand.FullName $dstFont -Force
    Write-Host "Copied font: $($cand.FullName) -> $dstFont"
  } else {
    Write-Host "⚠️ ضع ملف الخط يدويًا هنا ثم أعد تشغيل السكربت:" -ForegroundColor Yellow
    Write-Host $dstFont
    throw "Font file missing: $dstFont"
  }
} else { Write-Host "Font ready: $dstFont" }

# 2) اربط الخط داخل bootstrap.js (محدود على U+0631 فقط)
if(-not (Test-Path $bootstrap)){ New-Item -ItemType File -Path $bootstrap -Force | Out-Null }
$boot = Get-Content $bootstrap -Raw -Encoding UTF8
if($boot -notmatch 'RialSymbol\.ttf'){
  Backup $bootstrap
  $inject = @"
import rialFontUrl from "./assets/fonts/RialSymbol.ttf";
/* inject RialSymbol font (scoped to Arabic Raa only) */
(() => {
  const css = "@font-face{
  font-family:`"RialSymbol`";
  src:url(" + rialFontUrl + ") format(`"truetype`");
  font-display:swap;
  unicode-range: U+0631; /* ر فقط */
}";
  const el = document.createElement("style");
  el.setAttribute("data-rial","1");
  el.appendChild(document.createTextNode(css));
  document.head.appendChild(el);
})();
"@
  Set-Content $bootstrap -Value ($inject + "`r`n" + $boot) -Encoding UTF8
  Write-Host "Injected font loader into src\bootstrap.js"
} else {
  Write-Host "Font loader already present in bootstrap.js"
}

# 3) CSS للقائمة: فعّل خط الرمز على خيار SAR فقط
$cssBlock = @'
/* ===== currency.css (menu rules) ===== */
.currency-ui,
.currency-ui option{
  font-family: var(--font-ar, "IBM Plex Sans Arabic","Tajawal","Noto Sans Arabic","Segoe UI", system-ui, sans-serif);
}
/* فعّل خط الرمز على خيار SAR فقط (نكتب "ر" في نص الخيار) */
.currency-ui option.sar-font{
  font-family: "RialSymbol", var(--font-ar, "IBM Plex Sans Arabic","Tajawal","Noto Sans Arabic","Segoe UI", system-ui, sans-serif);
}
'
if(-not (Test-Path $styles)){
  Set-Content $styles -Value $cssBlock -Encoding UTF8
} elseif((Get-Content $styles -Raw -Encoding UTF8) -notmatch 'option\.sar-font'){
  Add-Content $styles "`r`n$cssBlock"
}
Write-Host "currency.css updated."

# 4) مكوّن القائمة: خيار SAR يطبع "ر" ليظهر الرمز الصحيح بخط RialSymbol
$cmpCode = @'
import React from "react";

/**
 * CurrencySelect: يظهر رمز الريال الصحيح داخل خيار SAR عبر خط "RialSymbol" الذي يحوّل حرف "ر" إلى الرمز.
 */
export default function CurrencySelect({
  value = "SAR",
  onChange = () => {},
  className = "",
  lang = "ar",
  allowed = ["SAR","USD","EUR"],
}) {
  const all = [
    { code: "SAR", label: (lang === "ar" ? "ر ريال سعودي" : "ر SAR"), className: "sar-font" },
    { code: "USD", label: "$ USD" },
    { code: "EUR", label: "€ EUR" },
  ];
  const opts = all.filter(o => allowed.includes(o.code));

  return (
    <select
      dir="rtl"
      className={`currency-ui ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={lang === "ar" ? "العملة" : "Currency"}
    >
      {opts.map(o => (
        <option key={o.code} value={o.code} className={o.className || ""}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
'
Backup $cmpFile
Set-Content $cmpFile -Value $cmpCode -Encoding UTF8
Write-Host "CurrencySelect.jsx written."

# 5) اربط CSS في ملف الدخول لو مش مربوط
$entries = @("index.tsx","main.tsx","index.jsx","main.jsx","index.ts","index.js") | ForEach-Object { Join-Path $root "src\$_" }
$entry = $entries | Where-Object { Test-Path $_ } | Select-Object -First 1
if($entry){
  $et = Get-Content $entry -Raw -Encoding UTF8
  if($et -notmatch 'styles\/currency\.css'){
    Backup $entry
    Set-Content $entry -Value ('import "./styles/currency.css";' + "`r`n" + $et) -Encoding UTF8
    Write-Host "Imported styles/currency.css in $([IO.Path]::GetFileName($entry))"
  } else {
    Write-Host "styles/currency.css already imported in $([IO.Path]::GetFileName($entry))"
  }
} else {
  Write-Host "⚠️ لم أجد ملف دخول داخل src." -ForegroundColor Yellow
}

# 6) تنظيف كاشات الباندل الخبيثة
$cacheDirs = @("node_modules\.cache","node_modules\.vite","build","dist") | ForEach-Object { Join-Path $root $_ }
foreach($d in $cacheDirs){ if(Test-Path $d){ Remove-Item $d -Recurse -Force -ErrorAction SilentlyContinue } }

Write-Host "تم. الآن شغّل dev server ثم Ctrl+F5 في المتصفح." -ForegroundColor Green
