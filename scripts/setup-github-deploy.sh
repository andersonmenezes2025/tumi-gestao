#!/bin/bash
# ============================================
# 🔧 SETUP INICIAL GITHUB DEPLOY
# ============================================

set -e

echo "🔧 === CONFIGURAÇÃO INICIAL GITHUB DEPLOY ==="

# Configurações
VPS_HOST="31.97.129.119"
VPS_USER="root"
VPS_PATH="/var/www/tumi/gestao"

# Função para validar URL do GitHub
validate_github_url() {
    local url=$1
    if [[ $url =~ ^https://github\.com/[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+\.git$ ]]; then
        return 0
    else
        return 1
    fi
}

echo ""
echo "📋 PASSO 1: Configurar Repositório GitHub"
echo "───────────────────────────────────────────"

# Solicitar URL do repositório GitHub
while true; do
    echo ""
    echo "🔗 Digite a URL do seu repositório GitHub:"
    echo "   Exemplo: https://github.com/usuario/tumi-gestao.git"
    read -p "   URL: " GITHUB_REPO
    
    if validate_github_url "$GITHUB_REPO"; then
        break
    else
        echo "❌ URL inválida. Use o formato: https://github.com/usuario/repositorio.git"
    fi
done

echo "✅ Repositório configurado: $GITHUB_REPO"

echo ""
echo "📋 PASSO 2: Configurar Scripts"
echo "──────────────────────────────"

# Atualizar scripts com a URL do GitHub
echo "🔧 Atualizando scripts com repositório..."

# Atualizar github-deploy.sh
if [ -f "scripts/github-deploy.sh" ]; then
    sed -i "s|GITHUB_REPO=\".*\"|GITHUB_REPO=\"$GITHUB_REPO\"|" scripts/github-deploy.sh
    echo "✅ github-deploy.sh atualizado"
else
    echo "❌ scripts/github-deploy.sh não encontrado"
fi

# Atualizar github-sync.sh
if [ -f "scripts/github-sync.sh" ]; then
    sed -i "s|GITHUB_REPO=\".*\"|GITHUB_REPO=\"$GITHUB_REPO\"|" scripts/github-sync.sh
    echo "✅ github-sync.sh atualizado"
else
    echo "❌ scripts/github-sync.sh não encontrado"
fi

echo ""
echo "📋 PASSO 3: Testar Conectividade"
echo "─────────────────────────────────"

# Testar Git
echo "🔍 Verificando Git..."
if command -v git &> /dev/null; then
    echo "✅ Git instalado: $(git --version)"
else
    echo "❌ Git não instalado"
    echo "💡 Execute: sudo apt update && sudo apt install -y git"
    exit 1
fi

# Testar acesso ao GitHub
echo ""
echo "🔍 Testando acesso ao repositório GitHub..."
if git ls-remote "$GITHUB_REPO" HEAD &>/dev/null; then
    echo "✅ Repositório GitHub acessível"
else
    echo "❌ Não foi possível acessar o repositório"
    echo "💡 Verifique se:"
    echo "   - A URL está correta"
    echo "   - O repositório é público OU você tem acesso"
    echo "   - Suas credenciais GitHub estão configuradas"
    exit 1
fi

# Testar SSH para VPS
echo ""
echo "🔍 Testando conectividade SSH com VPS..."
if ssh -o ConnectTimeout=10 "$VPS_USER@$VPS_HOST" "echo 'SSH OK'" &>/dev/null; then
    echo "✅ Conexão SSH funcionando"
else
    echo "❌ Não foi possível conectar via SSH"
    echo "💡 Configure SSH primeiro:"
    echo "   ssh-copy-id $VPS_USER@$VPS_HOST"
    echo "   # ou"
    echo "   ssh $VPS_USER@$VPS_HOST"
    exit 1
fi

echo ""
echo "📋 PASSO 4: Configurar SSH Keys na VPS (Opcional)"
echo "──────────────────────────────────────────────────"

read -p "🔑 Deseja configurar SSH keys para GitHub na VPS? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔧 Configurando SSH keys na VPS..."
    
    ssh "$VPS_USER@$VPS_HOST" << 'REMOTE_SSH_SETUP'
# Verificar se já existe chave SSH
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "🔑 Gerando chave SSH..."
    ssh-keygen -t rsa -b 4096 -C "deploy@tumihortifruti.com.br" -f ~/.ssh/id_rsa -N ""
    echo "✅ Chave SSH gerada"
else
    echo "✅ Chave SSH já existe"
fi

echo ""
echo "📋 Chave pública SSH (adicione ao GitHub):"
echo "──────────────────────────────────────────"
cat ~/.ssh/id_rsa.pub
echo "──────────────────────────────────────────"
echo ""
echo "💡 Para adicionar ao GitHub:"
echo "   1. Acesse: https://github.com/settings/keys"
echo "   2. Clique em 'New SSH key'"
echo "   3. Cole a chave pública acima"
echo "   4. Dê um nome: 'VPS Deploy Key'"
REMOTE_SSH_SETUP

    echo ""
    echo "🔑 SSH keys configuradas na VPS"
    echo "💡 Não esqueça de adicionar a chave pública ao GitHub!"
fi

echo ""
echo "📋 PASSO 5: Dar Permissões aos Scripts"
echo "──────────────────────────────────────"

echo "🔧 Configurando permissões..."
chmod +x scripts/*.sh 2>/dev/null || true
echo "✅ Permissões configuradas"

echo ""
echo "🎉 === CONFIGURAÇÃO CONCLUÍDA ==="
echo ""
echo "📋 RESUMO DA CONFIGURAÇÃO:"
echo "   🔗 Repositório: $GITHUB_REPO"
echo "   🖥️  VPS: $VPS_HOST"
echo "   📁 Destino: $VPS_PATH"
echo ""
echo "🚀 COMANDOS DISPONÍVEIS:"
echo "   📥 Sync apenas:     ./scripts/github-sync.sh"
echo "   🚀 Deploy completo: ./scripts/github-deploy.sh"
echo "   ⚡ Deploy rápido:   ./scripts/quick-deploy.sh"
echo ""
echo "💡 PRIMEIRO DEPLOY:"
echo "   Execute: ./scripts/github-deploy.sh"
echo ""
echo "📚 DOCUMENTAÇÃO COMPLETA:"
echo "   Veja: DEPLOY-UNIFICADO.md"
echo ""
echo "✅ Setup concluído com sucesso!"