#!/bin/bash

# Script para sincronizar código do Lovable para deploy na VPS
# Uso: ./scripts/sync-from-lovable.sh

set -e

# Configurações
PROJECT_NAME="tumi-gestao"
VPS_HOST="your-vps-ip"
VPS_USER="root"
VPS_PATH="/var/www/tumi/gestao"
TEMP_DIR="/tmp/${PROJECT_NAME}-sync"

echo "🔄 Iniciando sincronização Lovable → VPS..."

# ===== 1. VALIDAÇÃO PRÉ-SYNC =====
echo "🔍 Validando ambiente..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se tem as dependências necessárias
if ! command -v npm &> /dev/null; then
    echo "❌ NPM não encontrado"
    exit 1
fi

# ===== 2. BUILD LOCAL =====
echo "🔨 Fazendo build local para validação..."

# Instalar dependências
npm ci --silent

# Build do frontend
echo "📦 Build do frontend..."
npm run build

# Build do backend
echo "🔧 Build do backend..."
npm run build:server

echo "✅ Build local concluído com sucesso!"

# ===== 3. PREPARAR PARA SYNC =====
echo "📋 Preparando arquivos para sincronização..."

# Criar diretório temporário
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Copiar arquivos essenciais (excluindo node_modules e .git)
rsync -av \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude 'tmp' \
    --exclude '*.log' \
    ./ $TEMP_DIR/

# ===== 4. COMPACTAR E PREPARAR =====
echo "📦 Compactando arquivos..."
cd /tmp
tar -czf ${PROJECT_NAME}-deploy.tar.gz ${PROJECT_NAME}-sync/

echo "✅ Arquivos preparados: /tmp/${PROJECT_NAME}-deploy.tar.gz"

# ===== 5. INSTRUÇÕES DE SYNC =====
echo ""
echo "🚀 PRÓXIMOS PASSOS PARA DEPLOY NA VPS:"
echo ""
echo "1. Fazer upload do arquivo para a VPS:"
echo "   scp /tmp/${PROJECT_NAME}-deploy.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/"
echo ""
echo "2. Conectar na VPS e executar:"
echo "   ssh ${VPS_USER}@${VPS_HOST}"
echo "   cd /tmp"
echo "   tar -xzf ${PROJECT_NAME}-deploy.tar.gz"
echo "   cp -r ${PROJECT_NAME}-sync/* ${VPS_PATH}/"
echo "   cd ${VPS_PATH}"
echo "   chmod +x scripts/deploy.sh"
echo "   ./scripts/deploy.sh"
echo ""
echo "3. OU usar o script de deploy automatizado:"
echo "   ./scripts/deploy-automatizado.sh"
echo ""

# ===== 6. SCRIPT DE DEPLOY REMOTO (OPCIONAL) =====
if [ "$1" == "--auto-deploy" ]; then
    echo "🚁 Executando deploy automatizado..."
    
    # Upload do arquivo
    echo "📤 Enviando arquivos para VPS..."
    scp /tmp/${PROJECT_NAME}-deploy.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/
    
    # Executar deploy remoto
    echo "🔄 Executando deploy remoto..."
    ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
        set -e
        cd /tmp
        tar -xzf tumi-gestao-deploy.tar.gz
        cp -r tumi-gestao-sync/* /var/www/tumi/gestao/
        cd /var/www/tumi/gestao
        chmod +x scripts/deploy.sh
        ./scripts/deploy.sh
ENDSSH
    
    echo "✅ Deploy automatizado concluído!"
fi

# ===== 7. LIMPEZA =====
echo "🧹 Limpando arquivos temporários..."
rm -rf $TEMP_DIR
rm -f /tmp/${PROJECT_NAME}-deploy.tar.gz

echo ""
echo "🎉 Sincronização preparada com sucesso!"
echo "💡 Use --auto-deploy para fazer deploy automaticamente"
echo "   Exemplo: ./scripts/sync-from-lovable.sh --auto-deploy"