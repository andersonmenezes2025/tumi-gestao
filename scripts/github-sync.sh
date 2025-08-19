#!/bin/bash
# ============================================
# 📥 SYNC GITHUB → VPS (sem deploy)
# ============================================

set -e

# Configurações
PROJECT_NAME="tumi-gestao"
VPS_HOST="31.97.129.119"
VPS_USER="root"
VPS_PATH="/var/www/tumi/gestao"
GITHUB_REPO="https://github.com/YOUR_USERNAME/tumi-gestao.git"  # Atualizar com repo real
TEMP_DIR="/tmp/tumi-sync-github-$$"

echo "📥 === SYNC GITHUB → VPS ==="
echo "📍 Repositório: $GITHUB_REPO"
echo "📍 VPS: $VPS_HOST"
echo "📍 Destino: $VPS_PATH"

# Função para limpeza
cleanup() {
    echo "🧹 Limpando arquivos temporários..."
    rm -rf "$TEMP_DIR"
}

# Trap para limpeza
trap cleanup EXIT

# Validações iniciais
echo ""
echo "🔍 Validações iniciais..."

# Verificar git
if ! command -v git &> /dev/null; then
    echo "❌ Git não está instalado"
    echo "💡 Execute: sudo apt update && sudo apt install -y git"
    exit 1
fi

# Verificar SSH
echo "🔌 Testando conectividade SSH..."
if ! ssh -o ConnectTimeout=5 "$VPS_USER@$VPS_HOST" "echo 'SSH OK'" &>/dev/null; then
    echo "❌ Não foi possível conectar via SSH"
    echo "💡 Verifique: ssh $VPS_USER@$VPS_HOST"
    exit 1
fi

echo "✅ Validações OK"

# Criar diretório temporário
echo ""
echo "📁 Preparando sync..."
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Clone do repositório
echo ""
echo "📥 Baixando código do GitHub..."
git clone "$GITHUB_REPO" .

# Validar arquivos essenciais
echo ""
echo "🔍 Validando arquivos..."
REQUIRED_FILES=("package.json" "src/App.tsx" "server/index.ts")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Arquivo essencial não encontrado: $file"
        exit 1
    fi
done

echo "✅ Arquivos validados"

# Criar pacote
echo ""
echo "📦 Preparando pacote..."
tar czf "../${PROJECT_NAME}-sync.tar.gz" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.env \
    --exclude=dist \
    --exclude=server/dist \
    --exclude=tmp \
    --exclude="*.log" \
    --exclude=.DS_Store \
    .

# Upload para VPS
echo ""
echo "📤 Enviando arquivos para VPS..."
scp "../${PROJECT_NAME}-sync.tar.gz" "$VPS_USER@$VPS_HOST:/tmp/"

# Sync remoto (sem build)
echo ""
echo "🔄 Sincronizando arquivos na VPS..."
ssh "$VPS_USER@$VPS_HOST" << 'REMOTE_SYNC'
set -e

echo "📁 Extraindo arquivos..."
cd /tmp
tar xzf tumi-gestao-sync.tar.gz

echo "💾 Fazendo backup da configuração atual..."
mkdir -p /var/backups/tumi-gestao-sync/$(date +%Y%m%d-%H%M%S)
if [ -f "/var/www/tumi/gestao/.env" ]; then
    cp /var/www/tumi/gestao/.env /var/backups/tumi-gestao-sync/$(date +%Y%m%d-%H%M%S)/
fi
if [ -f "/var/www/tumi/gestao/ecosystem.config.cjs" ]; then
    cp /var/www/tumi/gestao/ecosystem.config.cjs /var/backups/tumi-gestao-sync/$(date +%Y%m%d-%H%M%S)/
fi

echo "🔄 Sincronizando código..."
# Preservar arquivos de configuração
rsync -av \
    --exclude='.env' \
    --exclude='ecosystem.config.cjs' \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='server/dist' \
    ./ /var/www/tumi/gestao/

echo "🔧 Configurando permissões..."
chmod +x /var/www/tumi/gestao/scripts/*.sh 2>/dev/null || true

echo "🧹 Limpando..."
rm -f /tmp/tumi-gestao-sync.tar.gz
rm -rf /tmp/src /tmp/server /tmp/scripts /tmp/package.json 2>/dev/null || true

echo "✅ Sync concluído - arquivos atualizados"
REMOTE_SYNC

echo ""
echo "✅ === SYNC CONCLUÍDO ==="
echo "📁 Arquivos sincronizados em: $VPS_PATH"
echo ""
echo "📋 Próximos passos:"
echo "   1. Para fazer deploy completo:"
echo "      ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && ./scripts/deploy-with-sync.sh'"
echo ""
echo "   2. Para deploy rápido:"
echo "      ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && ./scripts/quick-deploy.sh'"
echo ""
echo "   3. Para deploy automático direto do GitHub:"
echo "      ./scripts/github-deploy.sh"