# install-mongodb-windows.ps1
# Installs MongoDB Community Server via winget and starts the MongoDB service.
# Run PowerShell as Administrator.

$ErrorActionPreference = "Stop"

function Assert-Admin {
  $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()
  ).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
  if (-not $isAdmin) { throw "Run this script as Administrator." }
}

function Assert-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $name"
  }
}

Assert-Admin
Assert-Command "winget"

Write-Host "Installing MongoDB Community Server..."
winget install --id MongoDB.Server -e --accept-package-agreements --accept-source-agreements

Write-Host "Starting MongoDB service..."
$svc = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if (-not $svc) {
  Write-Host "MongoDB service not found. Listing possible services:"
  Get-Service | Where-Object { $_.Name -like "*mongo*" -or $_.DisplayName -like "*mongo*" } |
    Format-Table Name, DisplayName, Status -AutoSize
  throw "MongoDB service not found."
}

if ($svc.Status -ne "Running") { Start-Service -Name "MongoDB" }
Write-Host "MongoDB is running."
Write-Host "Test with: mongosh mongodb://localhost:27017"
