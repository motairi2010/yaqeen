# Fix-DOM-Safe.ps1
param(
  [string]$Root = "C:\Projects\Yaqeen_Project_Final\frontend"
)

$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$p){ if(-not (Test-Path $p)){ New-Item -ItemType Directory -Force $p | Out-Null } }
function Backup([string]$path){
  if(Test-Path $path){
    $d = Split-Path $path -Parent
    $n = Split-Path $path -Leaf
    $t = Get-Date -Format "yyyyMMdd-HHmmss"
    $b = Join-Path $d "backup"
    Ensure-Dir $b
    Copy-Item $path (Join-Path $b "$t-$n") -Force
  }
}

# 1) تحقق من src
$src = Join-Path $Root "src"
if(-not (Test-Path $src)){ throw "لم أجد المجلد: $src" }

# 2) حضّر bootstrap.js وحقن الدوال الآمنة إن لزم
$bootstrap = Join-Path $src "bootstrap.js"
if(-not (Test-Path $bootstrap)){
  New-Item -ItemType File -Path $bootstrap -Force | Out-Null
}

$helperBlock = @"
\/* ==== DOM safe helpers injected by Fix-DOM-Safe.ps1 ==== *\/
function enumerateRoots() {
  const roots = [document];
  document.querySelectorAll("*").forEach(el => {
    if (el.shadowRoot) roots.push(el.shadowRoot);
    if (el instanceof HTMLIFrameElement && el.contentDocument) roots.push(el.contentDocument);
  });
  return roots;
}

function escapeCssId(id) {
  if (window.CSS && typeof CSS.escape === "function") return CSS.escape(id);
  return String(id).replace(/([ #.;?+*~':"!^\$\[\]\(\)=>|\/@])/g, "\\$1");
}

function safeGetById(rootLike, id) {
  if (!id) return null;
  if (rootLike && typeof rootLike.getElementById === "function") {
    return rootLike.getElementById(id);
  }
  if (rootLike && typeof rootLike.querySelector === "function") {
    try { return rootLike.querySelector(`#\${escapeCssId(id)}`); } catch { /* no-op */ }
  }
  return document.getElementById(id);
}

function safeQueryAll(rootLike, selector) {
  if (rootLike && typeof rootLike.querySelectorAll === "function") {
    return rootLike.querySelectorAll(selector);
  }
  return document.querySelectorAll(selector);
}
/* ==== end helpers ==== */
"@

$b = Get-Content $bootstrap -Raw -Encoding UTF8
if($b -notmatch 'function\s+safeGetById\s*\('){
  Backup $bootstrap
  if([string]::IsNullOrWhiteSpace($b)){
    $newB = $helperBlock
  } else {
    $newB = $helperBlock + "`r`n" + $b
  }
  Set-Content -Path $bootstrap -Value $newB -Encoding UTF8
  Write-Host "تم حقن الدوال الآمنة في: $($bootstrap)"
} else {
  Write-Host "الدوال الآمنة موجودة مسبقاً في: $($bootstrap)"
}

# 3) استبدال النداءات الخطِرة في كل ملفات src
$files = Get-ChildItem $src -Recurse -Include *.js,*.jsx,*.ts,*.tsx
$totalFilesChanged = 0
$totalRepl = 0

# نبدّل أي X.getElementById( ما عدا document أو window.document
$pattern = '\b(?!document\b|window\.document\b)([A-Za-z_$][\w$]*)\.getElementById\('

foreach($f in $files){
  $text = Get-Content $f.FullName -Raw -Encoding UTF8
  $matches = [System.Text.RegularExpressions.Regex]::Matches($text, $pattern)
  $count = $matches.Count
  if($count -gt 0){
    Backup $f.FullName
    $text = [System.Text.RegularExpressions.Regex]::Replace(
      $text,
      $pattern,
      'safeGetById($1, ',
      [System.Text.RegularExpressions.RegexOptions]::None
    )
    Set-Content -Path $f.FullName -Value $text -Encoding UTF8
    $totalFilesChanged++
    $totalRepl += $count
    Write-Host ("عدل: {0} | استبدالات: {1}" -f $f.FullName, $count)
  }
}

Write-Host "------------------------------------------"
Write-Host ("ملفات عُدّلت: {0}" -f $totalFilesChanged)
Write-Host ("إجمالي الاستبدالات: {0}" -f $totalRepl)
Write-Host "انتهى. شغّل مشروعك وتفضل اشبع اختبار."
