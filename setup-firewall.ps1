# Run this script as Administrator to allow firewall access for mobile testing
# Right-click PowerShell and select "Run as Administrator", then run this script

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURING FIREWALL FOR MOBILE ACCESS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "`nPlease:" -ForegroundColor Yellow
    Write-Host "1. Close this window" -ForegroundColor White
    Write-Host "2. Right-click PowerShell and select Run as Administrator" -ForegroundColor White
    Write-Host "3. Navigate to: cd c:\VSCODE\anuranan_emp" -ForegroundColor White
    Write-Host "4. Run: .\setup-firewall.ps1" -ForegroundColor White
    Write-Host "`nPress any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "Running as Administrator... OK" -ForegroundColor Green
Write-Host ""

# Function to add firewall rule
function Add-FirewallRuleIfNotExists {
    param(
        [string]$DisplayName,
        [int]$Port
    )
    
    $existingRule = Get-NetFirewallRule -DisplayName $DisplayName -ErrorAction SilentlyContinue
    
    if ($existingRule) {
        Write-Host "OK Firewall rule already exists: $DisplayName" -ForegroundColor Yellow
    } else {
        try {
            New-NetFirewallRule -DisplayName $DisplayName -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow -ErrorAction Stop | Out-Null
            Write-Host "OK Added firewall rule: $DisplayName (Port $Port)" -ForegroundColor Green
        } catch {
            Write-Host "X Failed to add rule: $DisplayName" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Add firewall rules
Write-Host "Adding firewall rules...`n" -ForegroundColor Cyan

Add-FirewallRuleIfNotExists -DisplayName "Node Backend Port 4000" -Port 4000
Add-FirewallRuleIfNotExists -DisplayName "Next Frontend Port 3000" -Port 3000
Add-FirewallRuleIfNotExists -DisplayName "Next Frontend Port 3001" -Port 3001

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Start backend:  cd c:\VSCODE\anuranan_emp\backend && npm run dev" -ForegroundColor White
Write-Host "2. Start frontend: cd c:\VSCODE\anuranan_emp\frontend && npm run dev" -ForegroundColor White
Write-Host "3. On mobile, go to: http://192.168.0.183:3000" -ForegroundColor White
Write-Host ""
Write-Host "Make sure your mobile device is on the same WiFi network!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
