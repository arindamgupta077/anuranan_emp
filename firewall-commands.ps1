# FIREWALL CONFIGURATION COMMANDS
# Copy and paste these commands into PowerShell running as Administrator

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   FIREWALL CONFIGURATION COMMANDS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Copy and paste the following commands into PowerShell (Run as Administrator):`n" -ForegroundColor Yellow

$commands = @"
New-NetFirewallRule -DisplayName "Node Backend Port 4000" -Direction Inbound -Protocol TCP -LocalPort 4000 -Action Allow

New-NetFirewallRule -DisplayName "Next Frontend Port 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow

New-NetFirewallRule -DisplayName "Next Frontend Port 3001" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
"@

Write-Host $commands -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   HOW TO RUN AS ADMINISTRATOR" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Click Start menu" -ForegroundColor White
Write-Host "2. Type 'PowerShell'" -ForegroundColor White
Write-Host "3. Right-click on 'Windows PowerShell'" -ForegroundColor White
Write-Host "4. Select 'Run as administrator'" -ForegroundColor White
Write-Host "5. Click 'Yes' on the UAC prompt" -ForegroundColor White
Write-Host "6. Paste the commands above" -ForegroundColor White

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
