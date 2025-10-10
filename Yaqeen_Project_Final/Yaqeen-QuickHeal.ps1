param([string]$Root="C:\Projects\Yaqeen_Project_Final\frontend")

function Backup($p){ if(Test-Path $p){$d=Split-Path $p -Parent; $n=Split-Path $p -Leaf; $t=Get-Date -Format yyyyMMdd-HHmmss; $b=Join-Path $d "backup"; New-Item -ItemType Directory -Force $b|Out-Null; Copy-Item $p (Join-Path $b "$t-$n")}}

$src=Join-Path $Root "src"
$css=Join-Path (Join-Path $src "styles") "invoices.css"
if(!(Test-Path $css)){ Write-Host "⚠️ $css غير موجود. أنشئه أولاً (مرحلة 1/2/3)."; exit 1 }

# --- package.json: إضافة سكربت dev إن كان مفقودًا
$pkg=Join-Path $Root "package.json"
if(Test-Path $pkg){
  $j=Get-Content $pkg -Raw|ConvertFrom-Json
  if(-not $j.scripts){$j|Add-Member scripts (@{})}
  if(-not $j.scripts.dev){
    $deps=@()
    if($j.dependencies){$deps+=$j.dependencies.PSObject.Properties.Name}
    if($j.devDependencies){$deps+=$j.devDependencies.PSObject.Properties.Name}
    $cmd=$null
    if($deps -contains "next"){$cmd="next dev"}
    elseif($deps -contains "vite" -or $deps -contains "@vitejs/plugin-react"){$cmd="vite"}
    elseif($deps -contains "react-scripts"){$cmd="react-scripts start"}
    elseif($deps -contains "webpack-dev-server"){$cmd="webpack serve"}
    if($cmd){ $j.scripts.dev=$cmd; Backup $pkg; ($j|ConvertTo-Json -Depth 50)|Set-Content $pkg -Encoding UTF8; Write-Host "✅ أضفت dev=$cmd" } else { Write-Host "ℹ️ لم أتعرف على الإطار. نفّذ: npm run  لرؤية السكربتات المتاحة." }
  } else { Write-Host "ℹ️ سكربت dev موجود: $($j.scripts.dev)" }
} else { Write-Host "⚠️ package.json غير موجود في $Root" }

# --- Helpers
function RelPath([string]$fromFile,[string]$toFile){
  $fromDir=[IO.Path]::GetDirectoryName($fromFile)
  $fromUri=[Uri]((Resolve-Path $fromDir).Path + [IO.Path]::DirectorySeparatorChar)
  $toUri=[Uri](Resolve-Path $toFile).Path
  $rel=$fromUri.MakeRelativeUri($toUri).ToString()
  if(-not $rel.StartsWith(".") -and -not $rel.StartsWith("..")){ $rel="./$rel" }
  $rel -replace "\\","/"
}
function AddImportCss([string]$code,[string]$imp){
  if($code -match 'styles\/invoices\.css'){return $code}
  $line="import `"$imp`";"
  $lines=$code -split "`r?`n"
  $idx=($lines|Select-String '^\s*import\s').LineNumber|Sort-Object -Desc|Select-Object -First 1
  if($idx){$lines=@($lines[0..($idx-1)]) + @($line) + @($lines[$idx..($lines.Length-1)])} else {$lines=@($line)+$lines}
  $lines -join "`r`n"
}
function AddClassFirst([string]$code,[string]$cls){
  foreach($tag in "form","div"){
    $p1="<${tag}([^>]*className\s*=\s*""([^""]*)"")([^>]*)>"
    if($code -match $p1){
      return ([regex]::Replace($code,$p1,{
        param($m)
        $b=$m.Groups[1].Value; $c=$m.Groups[2].Value; $a=$m.Groups[3].Value
        if($c -notmatch "(^|\s)$([regex]::Escape($cls))(\s|$)"){ $c=("$c $cls").Trim() }
        return "<$tag$b"+"className=""$c"""+"$a>"
      },1))
    }
    $p2="<${tag}([^>]*)>"
    if($code -match $p2){
      return ([regex]::Replace($code,$p2,{
        param($m)
        $r=$m.Groups[1].Value
        return "<$tag$r className=""$cls"">"
      },1))
    }
  }
  $code
}

# --- طبّق على ملفات الفواتير
$cands=Get-ChildItem -Path $src -Recurse -Include *.jsx,*.tsx | Where-Object { $_.FullName -match '(?i)invoice' }
if(!$cands){ Write-Host "ℹ️ لا ملفات لها علاقة بـ invoice مُكتشفة. تخطّيت."; exit 0 }
foreach($f in $cands){
  $code=Get-Content $f.FullName -Raw; $orig=$code
  $rel=RelPath $f.FullName $css
  $code=AddImportCss $code $rel
  $code=AddClassFirst $code "invoice-page"
  if($code -ne $orig){ Backup $f.FullName; [IO.File]::WriteAllText($f.FullName,$code,(New-Object Text.UTF8Encoding $false)); Write-Host "✅ عُدّل: $($f.FullName)" } else { Write-Host "ℹ️ لا تغيير: $($f.FullName)" }
}
Write-Host "`nتم."
