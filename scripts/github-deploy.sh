#!/bin/bash
# ============================================
# 🚀 DEPLOY AUTOMÁTICO GITHUB → VPS
# ============================================

set -e

# Configurações
PROJECT_NAME="tumi-gestao"
VPS_HOST="31.97.129.119"
VPS_USER="root"
VPS_PATH="/var/www/tumi/gestao"
GITHUB_REPO="https://github.com/YOUR_USERNAME/tumi-gestao.git"  # Atualizar com repo real
TEMP_DIR="/tmp/tumi-deploy-github-$$"

echo "🚀 === DEPLOY AUTOMÁTICO GITHUB → VPS ==="
echo "📍 Repositório: $GITHUB_REPO"
echo "📍 VPS: $VPS_HOST"
echo "📍 Destino: $VPS_PATH"

# Função para limpeza
cleanup() {
    echo "🧹 Limpando arquivos temporários..."
    rm -rf "$TEMP_DIR"
    exit $1
}

# Trap para limpeza em caso de erro
trap 'cleanup 1' ERR
trap 'cleanup 0' EXIT

# Validações iniciais
echo ""
echo "🔍 Validações iniciais..."

# Verificar se git está instalado
if ! command -v git &> /dev/null; then
    echo "❌ Git não está instalado"
    echo "💡 Execute: sudo apt update && sudo apt install -y git"
    exit 1
fi

# Verificar conectividade SSH
echo "🔌 Testando conectividade SSH..."
if ! ssh -o ConnectTimeout=5 "$VPS_USER@$VPS_HOST" "echo 'SSH OK'" &>/dev/null; then
    echo "❌ Não foi possível conectar via SSH"
    echo "💡 Verifique: ssh $VPS_USER@$VPS_HOST"
    exit 1
fi

echo "✅ Validações OK"

# Criar diretório temporário
echo ""
echo "📁 Criando diretório temporário..."
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Clone/Pull do repositório GitHub
echo ""
echo "📥 Fazendo download do repositório GitHub..."
if [ -d ".git" ]; then
    echo "🔄 Atualizando repositório existente..."
    git pull origin main
else
    echo "📥 Clonando repositório..."
    git clone "$GITHUB_REPO" .
fi

# Validar arquivos essenciais
echo ""
echo "🔍 Validando arquivos essenciais..."
REQUIRED_FILES=("package.json" "src/App.tsx" "server/index.ts" "database/migration.sql")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Arquivo essencial não encontrado: $file"
        exit 1
    else
        echo "✅ $file"
    fi
done

# Criar pacote para transfer
echo ""
echo "📦 Criando pacote para transferência..."
tar czf "../${PROJECT_NAME}-github.tar.gz" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.env \
    --exclude=dist \
    --exclude=server/dist \
    --exclude=tmp \
    --exclude="*.log" \
    --exclude=.DS_Store \
    .

echo "✅ Pacote criado: ${PROJECT_NAME}-github.tar.gz"

# Upload para VPS
echo ""
echo "📤 Enviando pacote para VPS..."
scp "../${PROJECT_NAME}-github.tar.gz" "$VPS_USER@$VPS_HOST:/tmp/"

# Deploy remoto
echo ""
echo "🚀 Executando deploy na VPS..."
ssh "$VPS_USER@$VPS_HOST" << 'REMOTE_SCRIPT'
set -e

echo "📁 Preparando deploy..."
cd /tmp
tar xzf tumi-gestao-github.tar.gz

echo "🔄 Sincronizando arquivos..."
# Fazer backup dos arquivos importantes
mkdir -p /var/backups/tumi-gestao/$(date +%Y%m%d-%H%M%S)
if [ -f "/var/www/tumi/gestao/.env" ]; then
    cp /var/www/tumi/gestao/.env /var/backups/tumi-gestao/$(date +%Y%m%d-%H%M%S)/
fi

# Sincronizar arquivos (preservar .env se existir)
rsync -av --exclude='.env' ./ /var/www/tumi/gestao/

echo "🔧 Configurando permissões..."
chmod +x /var/www/tumi/gestao/scripts/*.sh
cd /var/www/tumi/gestao

echo "🚀 Executando deploy..."
if [ -f "scripts/deploy-with-sync.sh" ]; then
    ./scripts/deploy-with-sync.sh
else
    echo "❌ Script deploy-with-sync.sh não encontrado"
    echo "💡 Executando deploy manual..."
    
    # Instalar dependências
    npm install
    
    # Build
    npm run build
    npm run build:server
    
    # Restart PM2
    pm2 restart tumi-gestao-api || pm2 start ecosystem.config.cjs
fi

echo "🧹 Limpando arquivos temporários..."
rm -f /tmp/tumi-gestao-github.tar.gz
rm -rf /tmp/src /tmp/server /tmp/package.json 2>/dev/null || true

echo "✅ Deploy remoto concluído"
REMOTE_SCRIPT

# Verificação final
echo ""
echo "🔍 Verificação final..."
sleep 5

echo "🌐 Testando aplicação..."
if curl -s "https://tumihortifruti.com.br/gestao/" | grep -q "Tumi\|Login\|html"; then
    echo "✅ Frontend funcionando"
else
    echo "⚠️ Frontend pode não estar funcionando"
fi

if curl -s "https://tumihortifruti.com.br/gestao/api/health" | grep -q "ok\|health\|success"; then
    echo "✅ API funcionando"
else
    echo "⚠️ API pode não estar funcionando"
fi

echo ""
echo "🎉 === DEPLOY GITHUB CONCLUÍDO ==="
echo "🔗 Acesso: https://tumihortifruti.com.br/gestao"
echo "👤 Login: admin@tumihortifruti.com.br"
echo "🔑 Senha: admin123"
echo ""
echo "📋 Comandos úteis:"
echo "   ssh $VPS_USER@$VPS_HOST 'pm2 status'"
echo "   ssh $VPS_USER@$VPS_HOST 'pm2 logs tumi-gestao-api'"
echo "   ssh $VPS_USER@$VPS_HOST 'curl localhost:3001/api/health'"
echo ""
echo "🔄 Rollback (se necessário):"
echo "   ssh $VPS_USER@$VPS_HOST 'cd /var/www/tumi/gestao && ./scripts/deploy-with-sync.sh --rollback'"