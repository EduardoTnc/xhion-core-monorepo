# Script para reiniciar servidores de XHION Core
# Uso: .\reiniciar.ps1

Write-Host "REINICIANDO SERVIDORES DE XHION CORE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Detener procesos de Node.js
Write-Host "Deteniendo procesos de Node.js..." -ForegroundColor Yellow
try {
    taskkill /IM node.exe /F 2>$null
    Write-Host "Procesos de Node.js detenidos" -ForegroundColor Green
} catch {
    Write-Host "No habia procesos de Node.js corriendo" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Esperando 2 segundos..." -ForegroundColor Gray
Start-Sleep -Seconds 2

# Paso 2: Iniciar Backend
Write-Host ""
Write-Host "Iniciando Backend (NestJS)..." -ForegroundColor Yellow
Write-Host "   Puerto: 3000" -ForegroundColor Gray
Write-Host "   Directorio: xhion-core-api" -ForegroundColor Gray

$backendPath = "c:\Users\eduar\Desktop\Proyectos\xhion-core-monorepo\xhion-core-api"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $backendPath; Write-Host 'BACKEND - NestJS' -ForegroundColor Cyan; pnpm run start:dev"

Write-Host "Backend iniciado en nueva ventana" -ForegroundColor Green

# Paso 3: Esperar a que backend inicie
Write-Host ""
Write-Host "Esperando 8 segundos para que backend inicie..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# Paso 4: Iniciar Frontend
Write-Host ""
Write-Host "Iniciando Frontend (Vite + React)..." -ForegroundColor Yellow
Write-Host "   Puerto: 5173" -ForegroundColor Gray
Write-Host "   Directorio: xhion-core-client" -ForegroundColor Gray

$frontendPath = "c:\Users\eduar\Desktop\Proyectos\xhion-core-monorepo\xhion-core-client"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $frontendPath; Write-Host 'FRONTEND - React + Vite' -ForegroundColor Cyan; pnpm run dev"

Write-Host "Frontend iniciado en nueva ventana" -ForegroundColor Green

# Paso 5: Resumen
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SERVIDORES REINICIADOS EXITOSAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs:" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor Gray
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor White
Write-Host "   1. Espera ~10 segundos a que ambos servidores inicien" -ForegroundColor Gray
Write-Host "   2. Abre el navegador en http://localhost:5173" -ForegroundColor Gray
Write-Host "   3. Presiona Ctrl+Shift+R para recargar sin cache" -ForegroundColor Gray
Write-Host "   4. Prueba el modal 'Asignar Empleado'" -ForegroundColor Gray
Write-Host ""
Write-Host "Si hay errores, revisa las ventanas de Backend y Frontend" -ForegroundColor Yellow
Write-Host ""

# Opcional: Abrir navegador automaticamente
Write-Host "Abrir navegador automaticamente? (S/N)" -ForegroundColor Cyan
$respuesta = Read-Host

if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Host "Esperando 5 segundos mas..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
    Start-Process "http://localhost:5173"
    Write-Host "Navegador abierto" -ForegroundColor Green
}

Write-Host ""
Write-Host "Listo! Presiona cualquier tecla para cerrar..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
