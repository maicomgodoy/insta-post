# Script PowerShell para iniciar ngrok tunnel para desenvolvimento
# Uso: .\scripts\start-ngrok.ps1 [porta]
# Exemplo: .\scripts\start-ngrok.ps1 3000

param(
    [int]$Port = 3000
)

Write-Host "🚀 Iniciando ngrok tunnel na porta $Port..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Instruções:" -ForegroundColor Yellow
Write-Host "1. Copie a URL HTTPS gerada pelo ngrok"
Write-Host "2. Use essa URL no Facebook Developer: https://{url-ngrok}/api/webhooks/facebook"
Write-Host "3. Exemplo: https://abc123.ngrok.io/api/webhooks/facebook"
Write-Host ""
Write-Host "⚠️  IMPORTANTE: A URL muda a cada vez que você reinicia o ngrok (no plano gratuito)" -ForegroundColor Red
Write-Host "   Você precisará atualizar a URL no Facebook Developer sempre que reiniciar"
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o túnel"
Write-Host ""

# Verificar se ngrok está instalado
try {
    $ngrokVersion = ngrok version 2>&1
    Write-Host "✅ Ngrok encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Ngrok não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar o ngrok:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://ngrok.com/download"
    Write-Host "2. Baixe e extraia o ngrok.exe"
    Write-Host "3. Adicione ao PATH ou coloque na pasta do projeto"
    Write-Host ""
    Write-Host "Ou use o Chocolatey: choco install ngrok" -ForegroundColor Cyan
    exit 1
}

# Iniciar ngrok
Write-Host "Iniciando túnel..." -ForegroundColor Cyan
ngrok http $Port
