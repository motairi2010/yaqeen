param(
  [string]$Root = "C:\Projects\Yaqeen_Project_Final\frontend"
)

Write-Host "==[ Add class=`"amount-sar`" to numeric cells/spans ]==" -ForegroundColor Cyan

$src = Join-Path $Root "src"
if(!(Test-Path $src)){ Write-Error "لم يتم العثور على مجلد src: $src"; exit 1 }

function Backup([string]$p){
  if(Test-Path $p){
    $d = Split-Path $p -Parent
    $n = Split-Path $p -Leaf
    $t = Get-Date -Format yyyyMMdd-HHmmss
    $b = Join-Path $d "backup"
    if(!(Test-Path $b)){ New-Item -ItemType Directory -Force $b | Out-Null }
    Copy-Item $p (Join-Path $b "$t-$n") -Force
  }
}

# استهدف ملفات الواجهة
$files = Get-ChildItem $src -Recurse -Include *.tsx,*.jsx,*.html,*.vue,*.js

# أرقام عربية/إنجليزية
$digitRange = "[0-9\u0660-\u0669]"
# عناصر بسيطة (بدون وسم داخلي) تحتوي رقماً
$pattern = '<(?<tag>span|div|td|th)(?<attrs>[^>]*)>(?<inner>[^<>]*'+$digitRange+'[^<>]*)</\k<tag>>'

$changed = 0
foreach($f in $files){
  $raw = Get-Content $f.FullName -Raw
  $useClassName = @(".tsx",".jsx") -contains $f.Extension.ToLower()

  $new = [System.Text.RegularExpressions.Regex]::Replace($raw, $pattern, { param($m)
    $tag   = $m.Groups["tag"].Value
    $attrs = $m.Groups["attrs"].Value
    $inner = $m.Groups["inner"].Value

    # لا تعدّل لو موجود مسبقاً
    if($attrs -match '(class(Name)?\s*=\s*["''])([^"'']*?\bamount-sar\b[^"'']*)(["''])'){
      return $m.Value
    }

    if($useClassName){
      if($attrs -match 'className\s*=\s*["'']([^"'']*)["'']'){
        $attrs = [regex]::Replace($attrs, 'className\s*=\s*["'']([^"'']*)["'']', { param($n) "className=`"$($n.Groups[1].Value) amount-sar`"" })
      } elseif($attrs -match 'class\s*=\s*["'']([^"'']*)["'']'){
        $attrs = [regex]::Replace($attrs, 'class\s*=\s*["'']([^"'']*)["'']', { param($n) "class=`"$($n.Groups[1].Value) amount-sar`"" })
      } else {
        $attrs += ' className="amount-sar"'
      }
    } else {
      if($attrs -match 'class\s*=\s*["'']([^"'']*)["'']'){
        $attrs = [regex]::Replace($attrs, 'class\s*=\s*["'']([^"'']*)["'']', { param($n) "class=`"$($n.Groups[1].Value) amount-sar`"" })
      } else {
        $attrs += ' class="amount-sar"'
      }
    }

    return "<$tag$attrs>$inner</$tag>"
  }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

  if($new -ne $raw){
    Backup $f.FullName
    $new | Set-Content $f.FullName -Encoding UTF8
    Write-Host "Updated: $($f.FullName)" -ForegroundColor Green
    $changed++
  }
}

Write-Host "`nتم تحديث $changed ملف/ملفات. الآن أي رقم يظهر داخل span/div/td/th سيأخذ الكلاس amount-sar ويظهر معه ﷼." -ForegroundColor Cyan
