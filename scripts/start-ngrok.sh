#!/bin/bash

# Script para iniciar ngrok tunnel para desenvolvimento
# Uso: ./scripts/start-ngrok.sh [porta]
# Exemplo: ./scripts/start-ngrok.sh 3000

PORT=${1:-3000}

echo "🚀 Iniciando ngrok tunnel na porta $PORT..."
echo ""
echo "📋 Instruções:"
echo "1. Copie a URL HTTPS gerada pelo ngrok"
echo "2. Use essa URL no Facebook Developer: https://{url-ngrok}/api/webhooks/facebook"
echo "3. Exemplo: https://abc123.ngrok.io/api/webhooks/facebook"
echo ""
echo "⚠️  IMPORTANTE: A URL muda a cada vez que você reinicia o ngrok (no plano gratuito)"
echo "   Você precisará atualizar a URL no Facebook Developer sempre que reiniciar"
echo ""
echo "Pressione Ctrl+C para parar o túnel"
echo ""

# Iniciar ngrok
ngrok http $PORT
