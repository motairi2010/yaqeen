param(
  [string]$Root = "C:\Projects\Yaqeen_Project_Final\frontend",
  [ValidateSet('before','after')]
  [string]$Side = 'after'
)

Write-Host "==[ Fix SAR (﷼) Now ]==" -ForegroundColor Cyan

$src       = Join-Path $Root "src"
$public    = Join-Path $Root "public"
$stylesDir = Join-Path $src  "styles"
$cssFile   = Join-Path $stylesDir "currency.css"

function Ensure-Dir($p){ if(!(Test-Path $p)){ New-Item -ItemType Directory -Force $p | Out-Null } }
function Backup($p){
  if(Test-Path $p){
    $d=Split-Path $p -Parent; $n=Split-Path $p -Leaf
    $t=Get-Date -Format yyyyMMdd-HHmmss
    $b=Join-Path $d "backup"; Ensure-Dir $b
    Copy-Item $p (Join-Path $b "$t-$n") -Force
  }
}

if(!(Test-Path $src)){ Write-Error "لم أجد src تحت $Root"; exit 1 }
Ensure-Dir $stylesDir

# 1) اكتب/حدّث currency.css
$css = @'
:root{
  --sar-font:"IBM Plex Sans Arabic","Noto Sans Arabic","Segoe UI","Arial Unicode MS",Arial,Tahoma,sans-serif;
  --sar-gap:.45rem;
  --sar-size:1em;
}
.amount-sar{ font-family:var(--sar-font); unicode-bidi:plaintext; }
body.sar-before .amount-sar::before{ content:"﷼"; margin-inline-end:var(--sar-gap); font-size:var(--sar-size); line-height:1; }
body.sar-after  .amount-sar::after { content:"﷼"; margin-inline-start:var(--sar-gap); font-size:var(--sar-size); line-height:1; }

/* للمدخلات */
.currency-wrap{ position:relative; display:inline-block; font-family:var(--sar-font); }
body.sar-before .currency-wrap::before{ content:"﷼"; position:absolute; inset-inline-start:.75rem; top:50%; transform:translateY(-50%); font-size:var(--sar-size); opacity:.95; pointer-events:none; }
body.sar-before .currency-wrap>input{ padding-inline-start:1.8rem; }
body.sar-after  .currency-wrap::after { content:"﷼"; position:absolute; inset-inline-end:.75rem;  top:50%; transform:translateY(-50%); font-size:var(--sar-size); opacity:.95; pointer-events:none; }
body.sar-after  .currency-wrap>input{ padding-inline-end:1.8rem; }
'@
Backup $cssFile
$css | Set-Content $cssFile -Encoding UTF8
Write-Host "Wrote: $cssFile" -ForegroundColor Green

# 2) استيراد CSS + تعيين sar-before/after
$entryCandidates = @(
  "src\index.tsx","src\index.jsx","src\index.ts","src\index.js",
  "src\main.tsx" ,"src\main.jsx" ,"src\main.ts" ,"src\main.js"
) | ForEach-Object { Join-Path $Root $_ }
$entry = $null; foreach($e in $entryCandidates){ if(Test-Path $e){ $entry=$e; break } }

if($entry){
  $raw = Get-Content $entry -Raw
  $changed = $false
  if($raw -notmatch 'import\s+["'']\.\/styles\/currency\.css["'']'){
    $raw = 'import "./styles/currency.css";' + "`r`n" + $raw
    $changed = $true
    Write-Host "Injected CSS import into: $entry" -ForegroundColor Green
  }
  if($raw -notmatch 'document\.body\.classList\.add\(["'']sar-'){
    $raw = "document.body.classList.add('sar-$Side');`r`n" + $raw
    $changed = $true
    Write-Host "Injected body class sar-$Side into: $entry" -ForegroundColor Green
  }
  if($changed){ Backup $entry; $raw | Set-Content $entry -Encoding UTF8 }
} else {
  # لا ملف دخول → أضف رابط CSS + كلاس body في public\index.html
  $idx = Join-Path $public "index.html"
  if(Test-Path $idx){
    $html = Get-Content $idx -Raw
    if($html -notmatch 'href="/src/styles/currency.css"'){
      $injection = '  <link rel="stylesheet" href="/src/styles/currency.css">' + "`r`n" + '</head>'
      $html = $html -ireplace '</head>', $injection
      Write-Host "Added <link> to currency.css in index.html" -ForegroundColor Green
    }
    if($html -match '<body([^>]*)class=["'']([^"'']*)["'']'){
      if($html -notmatch 'sar-(before|after)'){
        $html = [regex]::Replace($html,'<body([^>]*)class=["'']([^"'']*)["'']', { param($m) "<body$($m.Groups[1].Value) class=""$($m.Groups[2].Value) sar-$Side"""} )
        Write-Host "Appended sar-$Side to body class in index.html" -ForegroundColor Green
      }
    } elseif($html -match '<body([^>]*)>'){
      $html = [regex]::Replace($html,'<body([^>]*)>', { param($m) "<body$($m.Groups[1].Value) class=""sar-$Side"">"} )
      Write-Host "Added body class sar-$Side to index.html" -ForegroundColor Green
    }
    Backup $idx; $html | Set-Content $idx -Encoding UTF8
  } else {
    Write-Host "No entry and public\index.html missing — تخطّيت خطوة الاستيراد عبر HTML" -ForegroundColor Yellow
  }
}

# 3) إصلاح POS.jsx: إجبار rowsHtml على Template literal + class="amount-sar"
$pos = Join-Path $Root "src\pages\POS.jsx"
if(Test-Path $pos){
  $posRaw = Get-Content $pos -Raw
  $orig = $posRaw

  # استبدال أي className="amount-sar" داخل النصوص إلى class="amount-sar"
  $posRaw = $posRaw -replace 'className\s*=\s*["'']amount-sar["'']', 'class="amount-sar"'

  $newBlock = @'
const rowsHtml = cart.map(i => `
  <tr>
    <td>${esc(i.name)}</td>
    <td>${i.qty}</td>
    <td>${sarFmt(i.price)}</td>
    <td class="amount-sar">${sarFmt((i.price * i.qty) * (1 + (i.vat ?? 0.15)))}</td>
  </tr>
`).join("");
'@

  $pattern = 'const\s+rowsHtml\s*=\s*cart\.map\([\s\S]*?\)\.join\(""\);\s*'
  if([regex]::IsMatch($posRaw, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)){
    $posRaw = [regex]::Replace($posRaw, $pattern, $newBlock, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    Write-Host "Replaced existing rowsHtml block in POS.jsx" -ForegroundColor Green
  } else {
    if($posRaw -match 'const\s+html\s*='){
      $posRaw = $posRaw -replace 'const\s+html\s*=', $newBlock + "`r`nconst html ="
      Write-Host "Inserted rowsHtml block before const html in POS.jsx" -ForegroundColor Green
    } else {
      $posRaw += "`r`n`r`n" + $newBlock
      Write-Host "Appended rowsHtml block to end of POS.jsx" -ForegroundColor Green
    }
  }

  if($posRaw -ne $orig){ Backup $pos; $posRaw | Set-Content $pos -Encoding UTF8 } else { Write-Host "No change needed in POS.jsx" -ForegroundColor Yellow }
} else {
  Write-Host "لم أجد POS.jsx — تخطّيت تعديله" -ForegroundColor Yellow
}

Write-Host "`n== تم. شغّل التطبيق الآن (npm start). ينبغي أن ترى ﷼ فقط بجانب الأرقام." -ForegroundColor Cyan
