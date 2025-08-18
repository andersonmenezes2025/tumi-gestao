#!/bin/bash

# Script para configurar permissões dos scripts de deploy
# Execute uma vez: ./setup-scripts.sh

echo "🔧 Configurando permissões dos scripts..."

# Dar permissão de execução para todos os scripts
chmod +x scripts/*.sh
chmod +x setup-scripts.sh

echo "✅ Permissões configuradas:"
ls -la scripts/*.sh

echo ""
echo "📋 Scripts disponíveis:"
echo "  ./scripts/sync-from-lovable.sh          - Sync do Lovable"
echo "  ./scripts/sync-from-lovable.sh --auto-deploy - Deploy automatizado"
echo "  ./scripts/deploy.sh                     - Deploy na VPS"
echo "  ./scripts/quick-deploy.sh               - Deploy rápido"
echo "  ./scripts/monitor.sh                    - Monitoramento"
echo "  ./scripts/setup-vps.sh                  - Setup inicial da VPS"
echo "  ./scripts/deploy-automatizado.sh        - Setup + Deploy completo"
echo ""
echo "🎉 Scripts prontos para uso!"