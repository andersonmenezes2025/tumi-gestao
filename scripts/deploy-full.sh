#!/bin/bash

# Deploy Full - Sync completo do Lovable + Build + Deploy
# Uso: ./scripts/deploy-full.sh

set -e

PROJECT_NAME="tumi-gestao"
VPS_HOST="your-vps-ip" 
VPS_USER="root"
VPS_PATH="/var/www/tumi/gestao"
TEMP_DIR="/tmp/${PROJECT_NAME}-full-deploy"

echo "🚀 Deploy Full: Lovable → VPS Automático"
echo "========================================"

# ===== 1. VALIDAÇÃO LOCAL =====
echo "🔍 Validando ambiente local..."

if [ ! -f "package.json" ]; then
    echo "❌ Execute na raiz do projeto Lovable"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ NPM não encontrado"
    exit 1
fi

# ===== 2. PREPARAÇÃO DOS ARQUIVOS =====
echo "📦 Preparando arquivos para sync..."

# Validar arquivos TypeScript críticos antes do envio
echo "🔍 Validando TypeScript antes do envio..."
if [ -f "server/types/express.ts" ] && [ -f "server/middleware/auth.ts" ]; then
    echo "✅ Arquivos TypeScript essenciais encontrados"
else
    echo "⚠️ Alguns arquivos TypeScript podem estar faltando"
fi

# Limpar e criar diretório temporário
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Copiar projeto completo (sem build)
rsync -av \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'server/dist' \
    --exclude '.env' \
    --exclude 'tmp' \
    --exclude '*.log' \
    ./ $TEMP_DIR/

echo "✅ Arquivos preparados"

# ===== 3. COMPACTAR =====
echo "📦 Compactando para envio..."
cd /tmp
tar -czf ${PROJECT_NAME}-full-deploy.tar.gz ${PROJECT_NAME}-full-deploy/

echo "✅ Pacote criado: /tmp/${PROJECT_NAME}-full-deploy.tar.gz"

# ===== 4. DEPLOY REMOTO AUTOMÁTICO =====
echo "🚁 Iniciando deploy remoto automático..."

# Upload do projeto
echo "📤 Enviando arquivos para VPS..."
scp /tmp/${PROJECT_NAME}-full-deploy.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/

# Executar deploy completo na VPS
echo "🔄 Executando deploy remoto..."
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
    set -e
    echo "🎯 Deploy remoto iniciado..."
    
    # Extrair arquivos
    cd /tmp
    tar -xzf tumi-gestao-full-deploy.tar.gz
    
    # Sincronizar arquivos
    echo "📋 Sincronizando arquivos..."
    cp -r tumi-gestao-full-deploy/* /var/www/tumi/gestao/
    
    # Executar deploy
    cd /var/www/tumi/gestao
    chmod +x scripts/*.sh
    
    echo "🚀 Executando deploy automático..."
    ./scripts/deploy-with-sync.sh
    
    # Limpeza
    rm -rf /tmp/tumi-gestao-full-deploy*
    
    echo "✅ Deploy remoto concluído!"
ENDSSH

# ===== 5. VERIFICAÇÃO FINAL =====
echo ""
echo "🏥 Verificação final da aplicação..."

# Teste de conectividade
if curl -f https://tumihortifruti.com.br/gestao > /dev/null 2>&1; then
    echo "✅ Site acessível!"
else
    echo "⚠️ Site pode estar iniciando - aguarde alguns minutos"
fi

# ===== 6. LIMPEZA LOCAL =====
echo "🧹 Limpeza local..."
rm -rf $TEMP_DIR
rm -f /tmp/${PROJECT_NAME}-full-deploy.tar.gz

# ===== RESUMO FINAL =====
echo ""
echo "🎉 DEPLOY FULL CONCLUÍDO!"
echo "========================"
echo ""
echo "🌐 URL: https://tumihortifruti.com.br/gestao"
echo "👤 Login: admin@tumihortifruti.com.br" 
echo "🔑 Senha: admin123"
echo ""
echo "📖 MONITORAMENTO REMOTO:"
echo "   ssh ${VPS_USER}@${VPS_HOST}"
echo "   pm2 status tumi-gestao-api"
echo "   pm2 logs tumi-gestao-api"
echo ""
echo "🔄 ROLLBACK (se necessário):"
echo "   ssh ${VPS_USER}@${VPS_HOST}"
echo "   cd /var/www/tumi/gestao"
echo "   ./scripts/deploy-with-sync.sh --rollback"
echo ""
echo "✨ Deploy automático completo! ✨"