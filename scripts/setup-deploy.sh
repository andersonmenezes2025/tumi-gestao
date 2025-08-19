#!/bin/bash

# Script de configuração inicial para deploy automático
# Execute uma vez: ./scripts/setup-deploy.sh

echo "🔧 Configurando sistema de deploy automático..."

# ===== 1. PERMISSÕES =====
echo "🔒 Configurando permissões dos scripts..."
chmod +x scripts/*.sh
chmod +x setup-scripts.sh

echo "✅ Permissões configuradas"

# ===== 2. VALIDAR SCRIPTS =====
echo "🔍 Validando scripts de deploy..."

REQUIRED_SCRIPTS=(
    "scripts/sync-from-lovable.sh"
    "scripts/deploy-with-sync.sh" 
    "scripts/deploy-full.sh"
    "scripts/quick-deploy.sh"
    "scripts/monitor.sh"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo "  ✅ $script"
    else
        echo "  ❌ $script (não encontrado)"
    fi
done

# ===== 3. CONFIGURAÇÃO DE ENDEREÇOS =====
echo ""
echo "⚙️ Configuração de endereços:"
echo ""
echo "📝 Edite os seguintes arquivos para configurar o IP da sua VPS:"
echo ""
echo "1. scripts/sync-from-lovable.sh:"
echo "   VPS_HOST=\"seu-ip-aqui\"" 
echo ""
echo "2. scripts/deploy-full.sh:"
echo "   VPS_HOST=\"seu-ip-aqui\""
echo ""

# ===== 4. TESTE DE CONECTIVIDADE =====
read -p "🌐 Digite o IP da sua VPS para teste (ou Enter para pular): " vps_ip

if [ -n "$vps_ip" ]; then
    echo "🔍 Testando conectividade com $vps_ip..."
    
    if ping -c 1 "$vps_ip" > /dev/null 2>&1; then
        echo "✅ VPS acessível via ping"
        
        if ssh -o ConnectTimeout=5 root@"$vps_ip" "echo 'Conexão SSH OK'" 2>/dev/null; then
            echo "✅ SSH funcionando"
            
            # Oferecer configuração automática
            read -p "🤖 Configurar IPs automaticamente? (y/N): " auto_config
            
            if [[ $auto_config =~ ^[Yy]$ ]]; then
                # Atualizar IPs nos scripts
                sed -i "s/VPS_HOST=\"your-vps-ip\"/VPS_HOST=\"$vps_ip\"/g" scripts/sync-from-lovable.sh
                sed -i "s/VPS_HOST=\"your-vps-ip\"/VPS_HOST=\"$vps_ip\"/g" scripts/deploy-full.sh
                
                echo "✅ IPs configurados automaticamente"
            fi
        else
            echo "⚠️ SSH não configurado ou sem acesso"
        fi
    else
        echo "❌ VPS não acessível"
    fi
fi

# ===== 5. RESUMO =====
echo ""
echo "🎉 CONFIGURAÇÃO CONCLUÍDA!"
echo "========================"
echo ""
echo "📋 Scripts disponíveis:"
echo "  ./scripts/deploy-full.sh          - Deploy completo automático"
echo "  ./scripts/deploy-with-sync.sh     - Deploy com rollback (VPS)"
echo "  ./scripts/sync-from-lovable.sh    - Sync manual" 
echo "  ./scripts/quick-deploy.sh         - Deploy rápido (VPS)"
echo "  ./scripts/monitor.sh              - Monitoramento (VPS)"
echo ""
echo "🚀 Para deploy agora:"
echo "  ./scripts/deploy-full.sh"
echo ""
echo "📖 Documentação completa:"
echo "  cat DEPLOY-COMMANDS.md"
echo ""

# ===== 6. VERIFICAR DEPENDÊNCIAS =====
echo "🔍 Verificando dependências..."

DEPS_OK=true

if ! command -v npm >/dev/null 2>&1; then
    echo "❌ NPM não encontrado"
    DEPS_OK=false
fi

if ! command -v rsync >/dev/null 2>&1; then
    echo "❌ rsync não encontrado (instale: apt install rsync)"
    DEPS_OK=false
fi

if ! command -v curl >/dev/null 2>&1; then
    echo "❌ curl não encontrado (instale: apt install curl)"
    DEPS_OK=false
fi

if [ "$DEPS_OK" = true ]; then
    echo "✅ Todas as dependências OK"
else
    echo "⚠️ Algumas dependências faltando"
fi

echo ""
echo "✨ Sistema de deploy automático pronto! ✨"