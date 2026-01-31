@echo off
echo ==========================================
echo Ouverture des ports pour CollabTask...
echo ==========================================
netsh advfirewall firewall add rule name="CollabTask_Backend" dir=in action=allow protocol=TCP localport=5000
netsh advfirewall firewall add rule name="CollabTask_Expo" dir=in action=allow protocol=TCP localport=8081,19000,19001
echo Done! Please restart your terminal.
pause
