#!/bin/bash

# Script Bash para iniciar ngrok tunnel com domínio estático (GRATUITO)
# Uso: ./scripts/start-ngrok-static.sh [porta] [domínio]
# Exemplo: ./scripts/start-ngrok-static.sh 3000 meu-app-dev.ngrok-free.app
#
# IMPORTANTE: Configure o domínio estático no dashboard do ngrok primeiro:
# 1. Acesse: https://dashboard.ngrok.com/
# 2. Vá em Universal Gateway > Domains (menu lateral)
# 3. Crie um Free Static Domain
# 4. Use o nome do domínio aqui

PORT=${1:-3000}
DOMAIN=${2:-$NGROK_STATIC_DOMAIN}

if [ -z "$DOMAIN" ]; then
    echo "❌ Domínio estático não configurado!"
    echo ""
    echo "📋 Para usar domínio estático (URL fixa):"
    echo ""
    echo "1. Crie uma conta gratuita: https://dashboard.ngrok.com/signup"
    echo "2. Configure o authtoken: ngrok config add-authtoken SEU_TOKEN"
    echo "3. Crie um domínio estático: Universal Gateway > Domains (no dashboard)"
    echo "4. Use o script assim: ./scripts/start-ngrok-static.sh 3000 meu-app-dev.ngrok-free.app"
    echo ""
    echo "Ou defina a variável de ambiente:"
    echo "  export NGROK_STATIC_DOMAIN=\"meu-app-dev.ngrok-free.app\""
    echo ""
    exit 1
fi

echo "🚀 Iniciando ngrok tunnel com domínio estático..."
echo ""
echo "📋 Configuração:"
echo "  Porta: $PORT"
echo "  Domínio: $DOMAIN"
echo ""
echo "✅ Vantagens do domínio estático:"
echo "  • URL sempre a mesma (não muda a cada conexão)"
echo "  • Não precisa atualizar no Facebook Developer"
echo "  • Gratuito (1 domínio no plano gratuito)"
echo ""
echo "🔗 URL do webhook:"
echo "  https://$DOMAIN/api/webhooks/facebook"
echo ""
echo "Pressione Ctrl+C para parar o túnel"
echo ""

# Verificar se ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo "❌ Ngrok não encontrado!"
    echo ""
    echo "Para instalar o ngrok:"
    echo "  macOS: brew install ngrok/ngrok/ngrok"
    echo "  Linux: wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz"
    echo ""
    exit 1
fi

echo "✅ Ngrok encontrado"

# Iniciar ngrok com domínio estático
echo ""
echo "Iniciando túnel com domínio estático..."
ngrok http $PORT --domain=$DOMAIN
