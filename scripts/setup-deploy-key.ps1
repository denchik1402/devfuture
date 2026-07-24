# One PowerShell script: create deploy SSH key + print what to paste where.
# Run on your Windows PC (NOT inside SSH):
#   powershell -ExecutionPolicy Bypass -File .\scripts\setup-deploy-key.ps1

$ErrorActionPreference = "Stop"
$keyPath = Join-Path $env:USERPROFILE ".ssh\devfuture_deploy"
$pubPath = "$keyPath.pub"

New-Item -ItemType Directory -Force -Path (Join-Path $env:USERPROFILE ".ssh") | Out-Null

if (-not (Test-Path $keyPath)) {
  # Empty passphrase for GitHub Actions
  ssh-keygen -t ed25519 -C "github-actions-devfuture" -f $keyPath -N '""'
  Write-Host "Key created: $keyPath" -ForegroundColor Green
} else {
  Write-Host "Key already exists: $keyPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========== 1) PUBLIC key → put on SERVER ==========" -ForegroundColor Cyan
Write-Host "ssh root@132.243.16.225"
Write-Host "Then on server:"
Write-Host "  mkdir -p ~/.ssh && chmod 700 ~/.ssh"
Write-Host "  echo 'PASTE_LINE_BELOW' >> ~/.ssh/authorized_keys"
Write-Host "  chmod 600 ~/.ssh/authorized_keys"
Write-Host ""
Get-Content $pubPath
Write-Host ""
Write-Host "========== 2) PRIVATE key → GitHub Secret SSH_PRIVATE_KEY ==========" -ForegroundColor Cyan
Write-Host "GitHub repo → Settings → Secrets and variables → Actions → New repository secret"
Write-Host "Also create:"
Write-Host "  SSH_HOST = 132.243.16.225"
Write-Host "  SSH_USER = root"
Write-Host "  SSH_PRIVATE_KEY = (everything below, including BEGIN/END lines)"
Write-Host ""
Get-Content $keyPath -Raw
Write-Host ""
Write-Host "========== 3) Test login ==========" -ForegroundColor Cyan
Write-Host "ssh -i `"$keyPath`" root@132.243.16.225"
