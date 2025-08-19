#!/bin/bash

# Script Mestre de Deploy - Integra sync, build e deploy
# Uso: ./scripts/deploy-with-sync.sh [--rollback]

set -e

APP_DIR="/var/www/tumi/gestao"
BACKUP_DIR="/var/backups/tumi-gestao"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_BACKUP="${BACKUP_DIR}/deploy-${TIMESTAMP}"
HEALTH_URL="http://localhost:3001/api/health"

echo "🚀 Sistema de Deploy Automático - Tumi Gestão"
echo "⏰ Iniciado em: $(date)"
echo ""

# ===== FUNÇÃO: ROLLBACK =====
rollback_deploy() {
    echo "🔄 Iniciando rollback para versão anterior..."
    
    # Encontrar último backup
    LAST_BACKUP=$(ls -td ${BACKUP_DIR}/deploy-* 2>/dev/null | head -n 2 | tail -n 1)
    
    if [ -z "$LAST_BACKUP" ]; then
        echo "❌ Nenhum backup encontrado para rollback"
        exit 1
    fi
    
    echo "📦 Restaurando backup: $LAST_BACKUP"
    
    # Parar aplicação
    pm2 stop tumi-gestao-api 2>/dev/null || true
    
    # Restaurar arquivos
    if [ -d "$LAST_BACKUP/dist" ]; then
        cp -r $LAST_BACKUP/dist $APP_DIR/
        echo "✅ Frontend restaurado"
    fi
    
    if [ -d "$LAST_BACKUP/server" ]; then
        cp -r $LAST_BACKUP/server $APP_DIR/
        echo "✅ Backend restaurado"
    fi
    
    # Reiniciar aplicação
    cd $APP_DIR
    pm2 start ecosystem.config.js 2>/dev/null || pm2 restart tumi-gestao-api
    
    echo "✅ Rollback concluído!"
    exit 0
}

# ===== VERIFICAR PARÂMETROS =====
if [ "$1" == "--rollback" ]; then
    rollback_deploy
fi

# ===== FUNÇÃO: HEALTH CHECK =====
health_check() {
    local max_attempts=10
    local attempt=1
    
    echo "🏥 Verificando saúde da aplicação..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f $HEALTH_URL > /dev/null 2>&1; then
            echo "✅ Aplicação saudável! (tentativa $attempt/$max_attempts)"
            return 0
        else
            echo "⏳ Tentativa $attempt/$max_attempts - aguardando..."
            sleep 3
            ((attempt++))
        fi
    done
    
    echo "❌ Aplicação não responde após $max_attempts tentativas"
    return 1
}

# ===== FUNÇÃO: BACKUP COMPLETO =====
create_backup() {
    echo "💾 Criando backup completo..."
    
    mkdir -p $DEPLOY_BACKUP
    
    # Backup de arquivos compilados
    if [ -d "$APP_DIR/dist" ]; then
        cp -r $APP_DIR/dist $DEPLOY_BACKUP/
        echo "  📁 Frontend backupado"
    fi
    
    if [ -d "$APP_DIR/server/dist" ]; then
        cp -r $APP_DIR/server $DEPLOY_BACKUP/
        echo "  📁 Backend backupado" 
    fi
    
    # Backup de configurações
    if [ -f "$APP_DIR/.env" ]; then
        cp $APP_DIR/.env $DEPLOY_BACKUP/
        echo "  ⚙️ Configurações backupadas"
    fi
    
    if [ -f "$APP_DIR/package.json" ]; then
        cp $APP_DIR/package.json $DEPLOY_BACKUP/
        echo "  📦 Package.json backupado"
    fi
    
    echo "✅ Backup completo salvo em: $DEPLOY_BACKUP"
}

# ===== 1. PRÉ-DEPLOY =====
echo "🔍 FASE 1: Verificações Pré-Deploy"
echo "=================================="

# Verificar diretório
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Diretório da aplicação não encontrado: $APP_DIR"
    exit 1
fi

cd $APP_DIR

# Verificar arquivos essenciais
if [ ! -f "package.json" ] || [ ! -f "server/index.ts" ]; then
    echo "❌ Arquivos essenciais não encontrados"
    exit 1
fi

echo "✅ Verificações pré-deploy concluídas"

# ===== 2. BACKUP =====
echo ""
echo "💾 FASE 2: Backup da Versão Atual"
echo "=================================="
create_backup

# ===== 3. BUILD =====
echo ""
echo "🔨 FASE 3: Build da Aplicação"
echo "=============================="

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --production=false

# Build frontend
echo "🎨 Compilando frontend..."
if ! npm run build; then
    echo "❌ Erro no build do frontend"
    echo "🔄 Executando rollback automático..."
    rollback_deploy
fi

# Build backend
echo "🔧 Compilando backend..."
if ! npm run build:server; then
    echo "❌ Erro no build do backend"
    echo "🔄 Executando rollback automático..."
    rollback_deploy
fi

echo "✅ Build concluído com sucesso!"

# ===== 4. DEPLOY =====
echo ""
echo "🚀 FASE 4: Deploy da Aplicação"
echo "==============================="

# Configurar ambiente
echo "⚙️ Configurando ambiente de produção..."
tee $APP_DIR/.env > /dev/null <<'EOF'
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tumigestao_db
DB_USER=tumigestao_user
DB_PASSWORD=TumiGest@o2024!Secure
JWT_SECRET=tumi-gestao-jwt-secret-production-2024-secure
PRODUCTION_URL=https://tumihortifruti.com.br
EOF

# Ajustar permissões
echo "🔒 Ajustando permissões..."
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR
sudo chmod 600 $APP_DIR/.env

# Reiniciar aplicação com PM2
echo "▶️ Reiniciando aplicação..."
pm2 stop tumi-gestao-api 2>/dev/null || true

if pm2 describe tumi-gestao-api > /dev/null 2>&1; then
    pm2 restart tumi-gestao-api
else
    pm2 start ecosystem.config.js
fi

pm2 save

# ===== 5. VERIFICAÇÃO =====
echo ""
echo "✅ FASE 5: Verificação Pós-Deploy"
echo "=================================="

# Health check
if health_check; then
    echo "🎉 Deploy realizado com sucesso!"
else
    echo "❌ Deploy falhou - executando rollback..."
    rollback_deploy
fi

# Verificar PM2
echo "📊 Status do PM2:"
pm2 status tumi-gestao-api

# ===== 6. LIMPEZA E RESUMO =====
echo ""
echo "🧹 FASE 6: Limpeza e Resumo"
echo "============================"

# Limpar arquivos temporários
rm -rf node_modules/.cache 2>/dev/null || true

# Manter apenas últimos 5 backups
cd $BACKUP_DIR
ls -td deploy-* 2>/dev/null | tail -n +6 | xargs rm -rf

echo ""
echo "🎊 DEPLOY AUTOMÁTICO CONCLUÍDO COM SUCESSO!"
echo "=========================================="
echo ""
echo "📈 INFORMAÇÕES:"
echo "   🌐 URL: https://tumihortifruti.com.br/gestao"
echo "   🕐 Horário: $(date)"
echo "   💾 Backup: $DEPLOY_BACKUP"
echo "   📁 Diretório: $APP_DIR"
echo ""
echo "📖 COMANDOS ÚTEIS:"
echo "   pm2 status                     # Status da aplicação"
echo "   pm2 logs tumi-gestao-api      # Logs em tempo real"
echo "   pm2 restart tumi-gestao-api   # Reiniciar"
echo ""
echo "🔄 ROLLBACK (se necessário):"
echo "   ./scripts/deploy-with-sync.sh --rollback"
echo ""

# Mostrar logs recentes
echo "📄 LOGS RECENTES:"
pm2 logs tumi-gestao-api --lines 5 --nostream

echo ""
echo "✨ Deploy automático finalizado! ✨"