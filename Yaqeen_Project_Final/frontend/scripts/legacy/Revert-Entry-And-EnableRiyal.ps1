param([string]$Root="C:\Projects\Yaqeen_Project_Final\frontend")
$ErrorActionPreference="Stop"

$src = Join-Path $Root "src"
$entryCandidates = @("index.js","index.jsx","main.jsx","bootstrap.js") | ForEach-Object { Join-Path $src $_ }
$entry = $entryCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if(!$entry){ throw "لم أعثر على ملف دخول ضمن src" }

# اختر أحدث نسخة احتياطية من مجلد backup بجانب ملف الدخول
$dir = Split-Path $entry -Parent
$backupDir = Join-Path $dir "backup"
if(!(Test-Path $backupDir)){ throw "لا يوجد مجلد backup بجانب ملف الدخول. لا أستطيع الاسترجاع." }
$leaf = Split-Path $entry -Leaf
$latest = Get-ChildItem $backupDir -File | Where-Object { $_.Name -like "*-$leaf" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if(!$latest){ throw "لا يوجد نسخة احتياطية مطابقة لـ $leaf" }

Copy-Item $latest.FullName $entry -Force
Write-Host "[RESTORE] رجّعت $leaf من: $($latest.Name)" -ForegroundColor Green

# عدّل الاستيرادات/الاستدعاء لتكون آمنة ومرة واحدة
$txt = Get-Content $entry -Raw -Encoding UTF8

# نظّف الاستيرادات/الاستدعاءات القديمة لو كانت موجودة
$txt = $txt -replace '(?m)^\s*import\s+["'']\.\/styles\/riyal\.runtime\.css["'']\s*;?\s*',''
$txt = $txt -replace '(?m)^\s*import\s*\{?\s*watchRiyal\s*\}?\s*from\s*["'']\.\/utils\/riyalPatch["'']\s*;?\s*',''
$txt = $txt -replace '(?m)^\s*watchRiyal\s*\(\)\s*;?\s*',''
$txt = $txt -replace '(?m)^\s*if\s*\(typeof\s+window\s*!==\s*["'']undefined["'']\)\s*watchRiyal\(\)\s*;?\s*',''

# أضِف الاستيرادات في الأعلى
$header = @"
import "./styles/riyal.runtime.css";
import { watchRiyal } from "./utils/riyalPatch";
"@
$txt = $header + "`r`n" + $txt

# أضِف حارس مَرّة واحدة في الأسفل
$guard = @"
if (typeof window !== "undefined" && !window.__RIYAL_WATCHING__) {
  window.__RIYAL_WATCHING__ = true;
  requestAnimationFrame(() => { try { watchRiyal(); } catch(e){ console.warn("[watchRiyal failed]", e); } });
}
"@
$txt = $txt.TrimEnd() + "`r`n" + $guard + "`r`n"

Set-Content $entry -Encoding UTF8 -Value $txt
Write-Host "[PATCH] فعّلت مراقب «ريال» بصيغة آمنة في: $entry" -ForegroundColor Green
