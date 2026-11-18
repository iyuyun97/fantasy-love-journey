
# ============================================
# FANTASY LOVE JOURNEY
# WEBGL DIAGNOSTIC & BACKUP SCRIPT
# ============================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " FANTASY LOVE JOURNEY - WEBGL DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Project directory
$ProjectPath = Get-Location

$IndexFile = Join-Path $ProjectPath "templates/index.html"
$Scene4File = Join-Path $ProjectPath "static/js/scene4-libra.js"
$Scene3File = Join-Path $ProjectPath "static/js/scene3.js"
$ControllerFile = Join-Path $ProjectPath "static/js/ui-controller.js"

# Check files
$Files = @(
    $IndexFile,
    $Scene4File,
    $Scene3File,
    $ControllerFile
)

Write-Host "`n[1] Checking project files..." -ForegroundColor Yellow

foreach ($File in $Files) {
    if (Test-Path $File) {
        Write-Host "[OK] $File" -ForegroundColor Green
    }
    else {
        Write-Host "[MISSING] $File" -ForegroundColor Red
    }
}

# Stop if required files missing
if (!(Test-Path $IndexFile) -or !(Test-Path $Scene4File)) {
    Write-Host "`nRequired files not found." -ForegroundColor Red
    Write-Host "Run this script from the project root."
    exit
}

# Create backup
Write-Host "`n[2] Creating backup..." -ForegroundColor Yellow

$BackupFolder = Join-Path $ProjectPath "backup-webgl"

New-Item -ItemType Directory -Force -Path $BackupFolder | Out-Null

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

Copy-Item $IndexFile "$BackupFolder/index-$Timestamp.html"
Copy-Item $Scene4File "$BackupFolder/scene4-$Timestamp.js"

if (Test-Path $Scene3File) {
    Copy-Item $Scene3File "$BackupFolder/scene3-$Timestamp.js"
}

if (Test-Path $ControllerFile) {
    Copy-Item $ControllerFile "$BackupFolder/controller-$Timestamp.js"
}

Write-Host "[OK] Backup created: $BackupFolder" -ForegroundColor Green

# Read files
$Html = Get-Content $IndexFile -Raw
$Scene4 = Get-Content $Scene4File -Raw

Write-Host "`n[3] Checking canvas elements..." -ForegroundColor Yellow

$CanvasMatches = [regex]::Matches(
    $Html,
    '<canvas\b[^>]*\bid=["'']([^"'']+)["''][^>]*>',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)

foreach ($Match in $CanvasMatches) {
    Write-Host "[CANVAS] $($Match.Groups[1].Value)" -ForegroundColor Cyan
}

Write-Host "`n[4] Checking Libra canvas..." -ForegroundColor Yellow

if ($Html -match 'id=["'']libraCanvas["'']') {
    Write-Host "[OK] libraCanvas exists." -ForegroundColor Green
}
else {
    Write-Host "[WARNING] libraCanvas is missing." -ForegroundColor Red
}

Write-Host "`n[5] Checking Scene 4 WebGL initialization..." -ForegroundColor Yellow

if ($Scene4 -match 'new\s+THREE\.WebGLRenderer') {
    Write-Host "[OK] THREE.WebGLRenderer found." -ForegroundColor Green
}
else {
    Write-Host "[WARNING] WebGLRenderer not found." -ForegroundColor Red
}

if ($Scene4 -match 'getContext\s*\(\s*["'']2d["'']') {
    Write-Host "[WARNING] Scene 4 requests a 2D context." -ForegroundColor Red
}

if ($Scene4 -match 'getContext\s*\(\s*["'']webgl') {
    Write-Host "[WARNING] Scene 4 manually requests WebGL." -ForegroundColor Yellow
}

Write-Host "`n[6] Checking renderer lifecycle..." -ForegroundColor Yellow

if ($Scene4 -match 'renderer\.dispose\s*\(') {
    Write-Host "[OK] renderer.dispose() found." -ForegroundColor Green
}
else {
    Write-Host "[WARNING] renderer.dispose() not found." -ForegroundColor Yellow
}

Write-Host "`n[7] Checking Scene 4 initialization..." -ForegroundColor Yellow

if ($Scene4 -match 'function\s+initScene4') {
    Write-Host "[OK] initScene4() found." -ForegroundColor Green
}
elseif ($Scene4 -match 'initScene4\s*=') {
    Write-Host "[OK] initScene4 assignment found." -ForegroundColor Green
}
else {
    Write-Host "[WARNING] initScene4() not detected." -ForegroundColor Yellow
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " DIAGNOSTIC COMPLETED" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`nNo source files were modified." -ForegroundColor Yellow
Write-Host "Backup location: $BackupFolder" -ForegroundColor Cyan

Write-Host "`nNext: inspect the reported canvas and renderer conflicts."
    