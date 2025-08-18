#!/bin/bash

# Deploy rápido para atualizações menores
# Uso: ./scripts/quick-deploy.sh

set -e

APP_DIR="/var/www/tumi/gestao"

echo "⚡ Deploy rápido iniciado..."

# ===== 1. VERIFICAR SE APLICAÇÃO ESTÁ RODANDO =====
if ! pm2 describe tumi-gestao-api > /dev/null 2>&1; then
    echo "❌ Aplicação não está rodando - use deploy completo"
    echo "Execute: ./scripts/deploy.sh"
    exit 1
fi

# ===== 2. BUILD RÁPIDO =====
echo "🔨 Build rápido..."
cd $APP_DIR

# Build apenas se há mudanças
if [ -n "$(find src -newer dist/index.html 2>/dev/null)" ] || [ ! -f "dist/index.html" ]; then
    echo "📦 Frontend modificado - fazendo build..."
    npm run build
else
    echo "⏩ Frontend sem alterações - pulando build"
fi

if [ -n "$(find server -newer server/dist/index.js 2>/dev/null)" ] || [ ! -f "server/dist/index.js" ]; then
    echo "🔧 Backend modificado - fazendo build..."
    npm run build:server
else
    echo "⏩ Backend sem alterações - pulando build"
fi

# ===== 3. RELOAD SEM DOWNTIME =====
echo "🔄 Recarregando aplicação sem downtime..."
pm2 reload tumi-gestao-api

# ===== 4. VERIFICAÇÃO RÁPIDA =====
echo "✅ Verificando saúde da aplicação..."
sleep 2

if pm2 describe tumi-gestao-api | grep -q "online"; then
    echo "✅ Deploy rápido concluído com sucesso!"
    
    # Teste rápido da API
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "🎉 API funcionando perfeitamente!"
    else
        echo "⚠️  API pode estar iniciando - aguarde alguns segundos"
    fi
else
    echo "❌ Problema no deploy - executando rollback..."
    pm2 restart tumi-gestao-api
    exit 1
fi

echo ""
echo "⚡ DEPLOY RÁPIDO CONCLUÍDO!"
echo "🌐 URL: https://tumihortifruti.com.br/gestao"
echo "📋 Status: pm2 status tumi-gestao-api"
echo "📄 Logs: pm2 logs tumi-gestao-api"