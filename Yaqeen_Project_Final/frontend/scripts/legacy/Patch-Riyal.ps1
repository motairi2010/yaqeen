param(
  [string]$Root=".",
  [switch]$Apply
)

$ErrorActionPreference="Stop"
Set-Location $Root

# ========== 0) إعداد الخط وملف CSS ==========
$fontsDir = ".\src\assets\fonts"
if(-not (Test-Path $fontsDir)){ New-Item -ItemType Directory -Force $fontsDir | Out-Null }
$ttf = Join-Path $fontsDir "Saudi-Riyal.ttf"
if(Test-Path $ttf){
  Write-Host "[FONT] OK: $ttf"
}else{
  Write-Host "[FONT] لم أجد $ttf - رجاءً ضع ملف الخط هناك ثم أعد التشغيل." -ForegroundColor Yellow
}

$stylesDir = ".\src\styles"
if(-not (Test-Path $stylesDir)){ New-Item -ItemType Directory -Force $stylesDir | Out-Null }
$cssPath = Join-Path $stylesDir "riyal.css"

$css = @"
@font-face{
  font-family:""SaudiRiyalSymbol"";
  src:url(""../assets/fonts/Saudi-Riyal.ttf"") format(""truetype"");
  font-display:swap;
  /* نقيّد الخط لحرف الراء فقط */
  unicode-range: U+0631;
}

/* نطبّق الخط على مواضع رمز الريال */
.riyal-symbol, .sar-font{
  font-family: ""SaudiRiyalSymbol"", var(--font-ar, ""IBM Plex Sans Arabic"",""Tajawal"",""Noto Sans Arabic"",""Segoe UI"", system-ui, sans-serif);
}
"@

# نسخة احتياطية بسيطة
function Backup([string]$p){
  if(Test-Path $p){
    $dir=Split-Path $p -Parent
    $ts=Get-Date -Format "yyyyMMdd-HHmmss"
    $b=Join-Path $dir "backup"
    if(-not (Test-Path $b)){ New-Item -ItemType Directory -Force $b | Out-Null }
    Copy-Item $p (Join-Path $b "$ts-$(Split-Path $p -Leaf)") -Force
  }
}

# اكتب/حدّث CSS
if(Test-Path $cssPath){ Backup $cssPath }
Set-Content $cssPath -Value $css -Encoding UTF8
Write-Host "[CSS] wrote src\styles\riyal.css"

# ========== 1) أضِف الاستيراد في index.js ==========
$index = ".\src\index.js"
if(Test-Path $index){
  $txt = Get-Content $index -Raw -Encoding UTF8
  if($txt -notmatch 'styles/riyal\.css'){
    $new = "import `"./styles/riyal.css`";`r`n" + $txt
    Backup $index
    Set-Content $index -Value $new -Encoding UTF8
    Write-Host "[INDEX] added import ./styles/riyal.css"
  } else {
    Write-Host "[INDEX] import موجود مسبقاً"
  }
}else{
  Write-Host "[INDEX] لم أجد src\index.js (تخطي إضافة الاستيراد)" -ForegroundColor Yellow
}

# ========== 2) استبدال كلمة "ريال" داخل النصوص إلى <span>ر</span> ==========
# نبدّل داخل نصوص العناصر فقط (لا نلمس السلاسل داخل الأكواد)
function ReplaceRiyalTextNodes([string]$text, [string]$spanMarkup, [ref]$outCount){
  $pattern = '(>[^<]*)ريال([^<]*<)'
  $total = 0
  do {
    $prev = $text
    $script:c = 0
    $span = $spanMarkup
    $eval = { param($m) $script:c++; $m.Groups[1].Value + $span + $m.Groups[2].Value }
    $text = [System.Text.RegularExpressions.Regex]::Replace($text, $pattern, $eval.GetNewClosure())
    $total += $script:c
  } while($text -ne $prev)
  $outCount.Value = $total
  return $text
}

$files = @()
$files += Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue -Include *.html,*.htm
$files += Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue -Include *.jsx,*.tsx

if($files.Count -eq 0){
  Write-Host "[SCAN] لم أعثر على ملفات HTML/JSX/TSX" -ForegroundColor Yellow
}else{
  $changedTotal = 0
  foreach($f in $files){
    $ext = [System.IO.Path]::GetExtension($f.FullName).ToLowerInvariant()
    $span = '<span class="riyal-symbol">ر</span>'
    if($ext -eq ".jsx" -or $ext -eq ".tsx"){ $span = '<span className="riyal-symbol">ر</span>' }

    $original = Get-Content $f.FullName -Raw -Encoding UTF8
    [int]$count = 0
    $newText = ReplaceRiyalTextNodes $original $span ([ref]$count)

    if($count -gt 0){
      if($Apply){
        Backup $f.FullName
        Set-Content $f.FullName -Value $newText -Encoding UTF8
        Write-Host ("[PATCH] {0} -> {1} استبدال(ات)" -f $f.FullName, $count) -ForegroundColor Green
      }else{
        Write-Host ("[DRY]  {0} -> {1} استبدال(ات) (معاينة فقط)" -f $f.FullName, $count) -ForegroundColor Yellow
      }
      $changedTotal += $count
    }
  }
  Write-Host ("[SUMMARY] مجموع الاستبدالات: {0}" -f $changedTotal) -ForegroundColor Cyan
  if(-not $Apply){ Write-Host "[HINT] أعد التشغيل مع -Apply لتنفيذ التعديلات." -ForegroundColor Yellow }
}
