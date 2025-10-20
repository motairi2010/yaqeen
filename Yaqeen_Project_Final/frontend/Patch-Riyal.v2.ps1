param(
  [string]$Root=".",
  [switch]$Apply
)

$ErrorActionPreference="Stop"
Set-Location $Root

function Backup([string]$p){
  if(Test-Path $p){
    $dir=Split-Path $p -Parent
    $ts=Get-Date -Format "yyyyMMdd-HHmmss"
    $b=Join-Path $dir "backup"
    if(-not (Test-Path $b)){ New-Item -ItemType Directory -Force $b | Out-Null }
    Copy-Item $p (Join-Path $b "$ts-$(Split-Path $p -Leaf)") -Force
  }
}

# ========== CSS + FONT ==========
$fontsDir = ".\src\assets\fonts"; if(-not (Test-Path $fontsDir)){ New-Item -ItemType Directory -Force $fontsDir | Out-Null }
$ttf = Join-Path $fontsDir "Saudi-Riyal.ttf"
if(Test-Path $ttf){ Write-Host "[FONT] OK: $ttf" } else { Write-Host "[FONT] ضع ملف الخط هنا ثم أعد التشغيل: $ttf" -ForegroundColor Yellow }

$stylesDir = ".\src\styles"; if(-not (Test-Path $stylesDir)){ New-Item -ItemType Directory -Force $stylesDir | Out-Null }
$cssPath = Join-Path $stylesDir "riyal.css"
$css = @"
@font-face{
  font-family:""SaudiRiyalSymbol"";
  src:url(""../assets/fonts/Saudi-Riyal.ttf"") format(""truetype"");
  font-display:swap;
  unicode-range: U+0631; /* حرف الراء فقط */
}
.riyal-symbol, .sar-font{
  font-family: ""SaudiRiyalSymbol"", var(--font-ar, ""IBM Plex Sans Arabic"",""Tajawal"",""Noto Sans Arabic"",""Segoe UI"", system-ui, sans-serif);
}
"@
if(Test-Path $cssPath){ Backup $cssPath }
Set-Content $cssPath -Value $css -Encoding UTF8
Write-Host "[CSS] wrote src\styles\riyal.css"

# أضف الاستيراد في أول ملف دخول موجود
$entryCandidates = @(".\src\index.tsx",".\src\main.tsx",".\src\index.jsx",".\src\main.jsx",".\src\index.js",".\src\main.js")
$entry = $entryCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if($entry){
  $txt = Get-Content $entry -Raw -Encoding UTF8
  if($txt -notmatch 'styles/riyal\.css'){
    Backup $entry
    Set-Content $entry -Value ("import `"./styles/riyal.css`";`r`n" + $txt) -Encoding UTF8
    Write-Host ("[ENTRY] added import in {0}" -f $entry)
  } else {
    Write-Host ("[ENTRY] import exists in {0}" -f $entry)
  }
}else{
  Write-Host "[ENTRY] لم أجد index/main داخل src — تخطيت إضافة الاستيراد" -ForegroundColor Yellow
}

# ========== الاستبدال داخل نصوص العناصر فقط ==========
function ReplaceInTextNodes([string]$text, [string]$markup){
  $total = 0
  $pattern = '(?s)>([^<]*?)ريال([^<]*?)<'
  do{
    $prev = $text
    $script:c = 0
    $text = [regex]::Replace($text, $pattern, {
      param($m)
      $script:c++
      '>' + $m.Groups[1].Value + $markup + $m.Groups[2].Value + '<'
    })
    $total += $script:c
  } while($text -ne $prev)
  ,$text,$total
}

# اجمع الملفات
$files = @()
$files += Get-ChildItem -Path . -Recurse -File -Filter *.html
$files += Get-ChildItem -Path . -Recurse -File -Filter *.htm
$files += Get-ChildItem -Path . -Recurse -File -Filter *.jsx
$files += Get-ChildItem -Path . -Recurse -File -Filter *.tsx

$total=0
foreach($f in $files){
  $isJsx = @(".jsx",".tsx") -contains ([IO.Path]::GetExtension($f.FullName).ToLowerInvariant())
  $markup = if($isJsx){ '<span className="riyal-symbol">ر</span>' } else { '<span class="riyal-symbol">ر</span>' }

  $original = Get-Content $f.FullName -Raw -Encoding UTF8
  $res = ReplaceInTextNodes $original $markup
  $newText = $res[0]; $cnt = [int]$res[1]

  if($cnt -gt 0){
    if($Apply){ Backup $f.FullName; Set-Content $f.FullName -Value $newText -Encoding UTF8; Write-Host "[PATCH] $($f.FullName) -> $cnt" -ForegroundColor Green }
    else{ Write-Host "[DRY]  $($f.FullName) -> $cnt (معاينة فقط)" -ForegroundColor Yellow }
    $total += $cnt
  }
}
Write-Host "[SUMMARY] مجموع الاستبدالات: $total" -ForegroundColor Cyan
if(-not $Apply){ Write-Host "[HINT] أعد التشغيل مع -Apply لتنفيذ التعديلات." -ForegroundColor Yellow }
