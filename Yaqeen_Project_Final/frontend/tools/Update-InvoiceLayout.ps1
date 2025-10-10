<#
  Update-InvoiceLayout.ps1 (ASCII-safe)
  - Creates:
      src/config/invoiceFields.js
      src/styles/invoice-grid.css
      src/components/InvoiceHeaderGrid.jsx + .tsx
  - Injects into invoice form files:
      import InvoiceHeaderGrid ...
      <InvoiceHeaderGrid /> after first <form ...>
  - Makes backups under: src\backup\<timestamp>
#>

[CmdletBinding(SupportsShouldProcess=$true)]
param(
  [string]$Root = "C:\Projects\Yaqeen_Project_Final\frontend",
  [switch]$NoInject
)

function Ensure-Dir([string]$p){
  if(-not (Test-Path $p)){ New-Item -ItemType Directory -Force $p | Out-Null }
}

function Backup-File([string]$file, [string]$srcRoot, [string]$backupRoot){
  if(-not (Test-Path $file)){ return }
  $full = (Resolve-Path $file).Path
  $srcFull = (Resolve-Path $srcRoot).Path
  if($full.StartsWith($srcFull, [System.StringComparison]::OrdinalIgnoreCase)){
    $rel = $full.Substring($srcFull.Length) -replace '^[\\/]+',''
  } else {
    $rel = Split-Path $full -Leaf
  }
  $dest = Join-Path $backupRoot $rel
  Ensure-Dir (Split-Path $dest -Parent)
  Copy-Item $full $dest -Force
}

function Get-RelativeImport([string]$fromFile, [string]$toFile){
  $fromDir = Split-Path $fromFile -Parent
  $uFrom = New-Object System.Uri(($fromDir.TrimEnd('\') + '\'))
  $uTo   = New-Object System.Uri($toFile)
  $rel   = $uFrom.MakeRelativeUri($uTo).ToString() -replace '%20',' '
  $rel   = $rel -replace '\\','/' -replace '\.jsx$','' -replace '\.tsx$',''
  if(-not $rel.StartsWith('.')){ $rel = './' + $rel }
  return $rel
}

Write-Host ">> Root: $Root"

$src = Join-Path $Root "src"
$cfg = Join-Path $src "config"
$cmp = Join-Path $src "components"
$sty = Join-Path $src "styles"

Ensure-Dir $src
Ensure-Dir $cfg
Ensure-Dir $cmp
Ensure-Dir $sty

# Backups
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $src ("backup\" + $stamp)
Ensure-Dir $backupRoot

# 1) config
$cfgFile = Join-Path $cfg "invoiceFields.js"
@'
export const INVOICE_FIELDS = [
  { key: "customer",      label: "\u0627\u0644\u0639\u0645\u064a\u0644",        span: 2 },
  { key: "invoiceDate",   label: "\u0627\u0644\u062a\u0627\u0631\u064a\u062e",  span: 1 },
  { key: "invoiceNumber", label: "\u0631\u0642\u0645\u0020\u0627\u0644\u0641\u0627\u062a\u0648\u0631\u0629",  span: 1 },
  { key: "paymentTerms",  label: "\u0634\u0631\u0648\u0637\u0020\u0627\u0644\u062f\u0641\u0639",    span: 1 },
  { key: "warehouse",     label: "\u0627\u0644\u0645\u0633\u062a\u0648\u062f\u0639",      span: 1 },
  { key: "paymentMethod", label: "\u0637\u0631\u064a\u0642\u0629\u0020\u0627\u0644\u062f\u0641\u0639",   span: 1 },
  { key: "notes",         label: "\u0645\u0644\u0627\u062d\u0638\u0627\u062a",       span: 4, full: true }
];
'@ | Set-Content $cfgFile -Encoding ASCII
Write-Host "Wrote: $(($cfgFile).Replace($Root,''))"

# 2) styles
$cssFile = Join-Path $sty "invoice-grid.css"
@'
.invoice-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;direction:rtl}
.invoice-grid .cell{display:flex;flex-direction:column}
.invoice-grid .cell label{font-weight:600;margin-bottom:6px}
.invoice-grid input,.invoice-grid select,.invoice-grid textarea{width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:10px}
.span-1{grid-column:span 1}.span-2{grid-column:span 2}.span-3{grid-column:span 3}.span-4{grid-column:span 4}.full{grid-column:1 / -1}
'@ | Set-Content $cssFile -Encoding ASCII
Write-Host "Wrote: $(($cssFile).Replace($Root,''))"

# 3) component (JSX/TSX)
$cmpJsx = Join-Path $cmp "InvoiceHeaderGrid.jsx"
$cmpTsx = Join-Path $cmp "InvoiceHeaderGrid.tsx"
$componentCode = @'
import React from "react";
import { INVOICE_FIELDS } from "../config/invoiceFields";
import "../styles/invoice-grid.css";

export default function InvoiceHeaderGrid({ values = {}, onChange, renderField }) {
  const fallback = (f) => (
    f.key === "notes"
      ? <textarea name={f.key} rows={3} defaultValue={values[f.key] || ""} onChange={e=>onChange?.(f.key, e.target.value)} />
      : <input name={f.key} defaultValue={values[f.key] || ""} onChange={e=>onChange?.(f.key, e.target.value)} />
  );

  return (
    <div className="invoice-grid">
      {INVOICE_FIELDS.map(f => (
        <div key={f.key} className={`cell ${f.full ? "full" : ""} span-${f.span || 1}`}>
          <label htmlFor={f.key}>{f.label}</label>
          {renderField ? renderField(f) : fallback(f)}
        </div>
      ))}
    </div>
  );
}
'@
$componentCode | Set-Content $cmpJsx -Encoding ASCII
$componentCode | Set-Content $cmpTsx -Encoding ASCII
Write-Host "Wrote: $(($cmpJsx).Replace($Root,''))"
Write-Host "Wrote: $(($cmpTsx).Replace($Root,''))"

if($NoInject){
  Write-Host "-- Created files only (NoInject). Backups: $backupRoot"
  exit 0
}

# 4) injection
$targetFiles = Get-ChildItem $src -Recurse -Include *.jsx,*.tsx,*.js,*.ts |
  Where-Object {
    $_.Name -match 'Invoice.*Form|Form.*Invoice|InvoiceForm' -and
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.Name -notmatch '\.d\.ts$'
  }

if(-not $targetFiles){
  Write-Warning "No invoice form files found. You can run with -NoInject and add <InvoiceHeaderGrid /> manually."
  Write-Host "-- Backups: $backupRoot"
  exit 0
}

foreach($f in $targetFiles){
  $file = $f.FullName
  $relImport = Get-RelativeImport -fromFile $file -toFile $cmpJsx
  $text = Get-Content $file -Raw -Encoding UTF8

  if($text -match 'InvoiceHeaderGrid'){
    Write-Host "Skip (already has InvoiceHeaderGrid): $(($file).Replace($Root,''))"
    continue
  }

  Backup-File -file $file -srcRoot $src -backupRoot $backupRoot

  $lines = $text -split "`r?`n"
  $importIdx = 0
  for($i=0; $i -lt $lines.Count; $i++){
    if($lines[$i] -match '^\s*import\s'){
      $importIdx = $i + 1
    } elseif($i -gt 0){
      break
    }
  }
  $importLine = "import InvoiceHeaderGrid from '$relImport';"
  if($importIdx -gt 0){
    $lines = $lines[0..($importIdx-1)] + $importLine + $lines[$importIdx..($lines.Count-1)]
  } else {
    $lines = @($importLine) + $lines
  }

  $formInserted = $false
  for($j=0; $j -lt $lines.Count; $j++){
    if($lines[$j] -match '<form(\s|>)'){
      $indent = ($lines[$j] -replace '(^\s*).*$','$1')
      $insert = "$indent  <InvoiceHeaderGrid />"
      if($j -lt $lines.Count - 1){
        $lines = $lines[0..$j] + $insert + $lines[($j+1)..($lines.Count-1)]
      } else {
        $lines = $lines + $insert
      }
      $formInserted = $true
      break
    }
  }

  if(-not $formInserted){
    Write-Warning "No <form> found in: $(($file).Replace($Root,'')) — import added only."
  }

  $newText = ($lines -join "`r`n")
  Set-Content $file -Value $newText -Encoding UTF8
  Write-Host "Injected into: $(($file).Replace($Root,''))"
}

Write-Host "-- Backups: $backupRoot"
Write-Host "Done."
