# Script PowerShell para iniciar ngrok tunnel com dominio estatico (GRATUITO)
# Uso: .\scripts\start-ngrok-static.ps1 [porta] [dominio]
# Exemplo: .\scripts\start-ngrok-static.ps1 3000 meu-app-dev.ngrok-free.app
#
# IMPORTANTE: Configure o dominio estatico no dashboard do ngrok primeiro:
# 1. Acesse: https://dashboard.ngrok.com/
# 2. Va em Universal Gateway > Domains (menu lateral)
# 3. Crie um Free Static Domain
# 4. Use o nome do dominio aqui

param(
    [int]$Port = 3000,
    [string]$Domain = "parmigiana-clinton-cheerless.ngrok-free.dev"
)

# Se nao especificar dominio, usar variavel de ambiente ou padrao
if ([string]::IsNullOrWhiteSpace($Domain)) {
    $Domain = $env:NGROK_STATIC_DOMAIN
}

# Se ainda nao tiver dominio, usar o padrao do projeto
if ([string]::IsNullOrWhiteSpace($Domain)) {
    $Domain = "parmigiana-clinton-cheerless.ngrok-free.dev"
}

if ([string]::IsNullOrWhiteSpace($Domain)) {
    Write-Host "Dominio estatico nao configurado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para usar dominio estatico (URL fixa):" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Crie uma conta gratuita: https://dashboard.ngrok.com/signup"
    Write-Host "2. Configure o authtoken: ngrok config add-authtoken SEU_TOKEN"
    Write-Host "3. Crie um dominio estatico: Universal Gateway > Domains (no dashboard)"
    Write-Host "4. Use o script assim: .\scripts\start-ngrok-static.ps1 3000 meu-app-dev.ngrok-free.app"
    Write-Host ""
    Write-Host "Ou defina a variavel de ambiente:" -ForegroundColor Cyan
    Write-Host '  $env:NGROK_STATIC_DOMAIN = "meu-app-dev.ngrok-free.app"' -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "Iniciando ngrok tunnel com dominio estatico..." -ForegroundColor Green
Write-Host ""
Write-Host "Configuracao:" -ForegroundColor Yellow
Write-Host "  Porta: $Port"
Write-Host "  Dominio: $Domain"
Write-Host ""
Write-Host "Vantagens do dominio estatico:" -ForegroundColor Green
Write-Host "  - URL sempre a mesma (nao muda a cada conexao)"
Write-Host "  - Nao precisa atualizar no Facebook Developer"
Write-Host "  - Gratuito (1 dominio no plano gratuito)"
Write-Host ""
Write-Host "URL do webhook:" -ForegroundColor Cyan
Write-Host "  https://$Domain/api/webhooks/facebook"
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o tunel"
Write-Host ""

# Verificar se ngrok esta instalado
try {
    $ngrokVersion = ngrok version 2>&1
    Write-Host "Ngrok encontrado" -ForegroundColor Green
} catch {
    Write-Host "Ngrok nao encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar o ngrok:" -ForegroundColor Yellow
    Write-Host "  choco install ngrok" -ForegroundColor Cyan
    Write-Host "  ou acesse: https://ngrok.com/download"
    Write-Host ""
    exit 1
}

# Verificar se esta autenticado (tentando listar dominios)
Write-Host "Verificando autenticacao..." -ForegroundColor Yellow
try {
    $domainsCheck = ngrok api domains list 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Ngrok nao esta autenticado!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Configure o authtoken:" -ForegroundColor Yellow
        Write-Host "  1. Acesse: https://dashboard.ngrok.com/get-started/your-authtoken"
        Write-Host "  2. Execute: ngrok config add-authtoken SEU_TOKEN"
        Write-Host ""
    } else {
        Write-Host "Ngrok autenticado" -ForegroundColor Green
    }
} catch {
    Write-Host "Nao foi possivel verificar autenticacao" -ForegroundColor Yellow
}

# Iniciar ngrok com dominio estatico
Write-Host ""
Write-Host "Iniciando tunel com dominio estatico..." -ForegroundColor Cyan
ngrok http $Port --domain=$Domain
