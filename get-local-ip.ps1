# Get Local IP Address for Mobile Access
# Run this script to find your computer's IP address for mobile testing

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   LOCAL IP ADDRESS FOR MOBILE ACCESS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get all IPv4 addresses
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
    Select-Object IPAddress, InterfaceAlias

if ($ipAddresses) {
    Write-Host "Found the following IP addresses:" -ForegroundColor Green
    Write-Host ""
    
    foreach ($ip in $ipAddresses) {
        Write-Host "  Network: $($ip.InterfaceAlias)" -ForegroundColor Yellow
        Write-Host "  IP Address: $($ip.IPAddress)" -ForegroundColor White
        Write-Host ""
    }
    
    # Get the first non-loopback IP
    $primaryIp = $ipAddresses[0].IPAddress
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   CONFIGURATION" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    Write-Host "1. Update your frontend\.env.local file:" -ForegroundColor Green
    Write-Host "   NEXT_PUBLIC_API_URL=http://$primaryIp`:4000" -ForegroundColor White
    Write-Host ""
    
    Write-Host "2. Access from mobile device:" -ForegroundColor Green
    Write-Host "   Frontend: http://$primaryIp`:3000" -ForegroundColor White
    Write-Host "   Backend:  http://$primaryIp`:4000" -ForegroundColor White
    Write-Host ""
    
    Write-Host "3. Ensure both devices are on the same WiFi network" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "4. You may need to allow firewall access:" -ForegroundColor Yellow
    Write-Host "   Run PowerShell as Administrator and execute:" -ForegroundColor White
    Write-Host "   New-NetFirewallRule -DisplayName 'Node Backend' -Direction Inbound -Protocol TCP -LocalPort 4000 -Action Allow" -ForegroundColor Gray
    Write-Host "   New-NetFirewallRule -DisplayName 'Next Frontend' -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow" -ForegroundColor Gray
    Write-Host ""
    
    # Copy to clipboard if available
    $envLine = "NEXT_PUBLIC_API_URL=http://$primaryIp`:4000"
    try {
        Set-Clipboard -Value $envLine
        Write-Host "✓ Environment variable copied to clipboard!" -ForegroundColor Green
    } catch {
        # Clipboard not available, that is okay
    }
    
} else {
    Write-Host "No network IP addresses found." -ForegroundColor Red
    Write-Host "Make sure you are connected to a network (WiFi or Ethernet)." -ForegroundColor Yellow
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
