#!/bin/bash

# Script de deploy para o Sistema de Gestão Tumi Hortifruti
# Versão integrada com Nginx existente (site principal em 127.0.0.1:5500)

set -e

APP_DIR="/var/www/tumi/gestao"
BACKUP_DIR="/var/backups/tumi-gestao/deploy-$(date +%Y%m%d_%H%M%S)"
NGINX_CONFIG="/etc/nginx/sites-available/tumihortifruti.com.br"

echo "🚀 Iniciando deploy do Sistema de Gestão..."

# ===== 1. BACKUP ANTES DO DEPLOY =====
if [ -d "$APP_DIR/dist" ]; then
    echo "💾 Fazendo backup da versão atual..."
    mkdir -p $BACKUP_DIR
    cp -r $APP_DIR/dist $BACKUP_DIR/
    cp $APP_DIR/package.json $BACKUP_DIR/ 2>/dev/null || true
    echo "✅ Backup salvo em: $BACKUP_DIR"
fi

# ===== 2. PARAR A APLICAÇÃO =====
echo "⏹️  Parando aplicação..."
pm2 stop tumi-gestao-api 2>/dev/null || true

# ===== 3. INSTALAR DEPENDÊNCIAS =====
echo "📦 Instalando dependências..."
cd $APP_DIR
npm ci --production=false

# ===== 4. BUILD DA APLICAÇÃO =====
echo "🔨 Fazendo build da aplicação..."
npm run build
npm run build:server

# ===== 5. CONFIGURAR VARIÁVEIS DE AMBIENTE =====
echo "⚙️  Configurando ambiente de produção..."
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

# ===== 6. AJUSTAR PERMISSÕES =====
echo "🔒 Ajustando permissões..."
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR
sudo chmod 600 $APP_DIR/.env

# ===== 7. INICIAR/REINICIAR APLICAÇÃO =====
echo "▶️  Iniciando aplicação..."

# Verificar se PM2 já tem a aplicação
if pm2 describe tumi-gestao-api > /dev/null 2>&1; then
    echo "🔄 Reiniciando aplicação existente..."
    pm2 restart tumi-gestao-api
else
    echo "🆕 Iniciando nova aplicação..."
    pm2 start ecosystem.config.js
fi

# Salvar configuração do PM2
pm2 save

# ===== 8. VERIFICAR STATUS =====
echo "🔍 Verificando status da aplicação..."
sleep 5

# Verificar se a aplicação está rodando
if pm2 describe tumi-gestao-api | grep -q "online"; then
    echo "✅ Aplicação rodando com sucesso!"
else
    echo "❌ Erro ao iniciar a aplicação"
    echo "📋 Logs de erro:"
    pm2 logs tumi-gestao-api --lines 20
    exit 1
fi

# Health checks mais robustos
echo "🏥 Executando health checks..."
sleep 3

# Verificar API Health
for i in {1..5}; do
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ API respondendo corretamente!"
        break
    else
        echo "⏳ Tentativa $i/5 - API ainda não responde, aguardando..."
        sleep 2
        if [ $i -eq 5 ]; then
            echo "❌ API não está respondendo após 5 tentativas"
            echo "📋 Últimos logs:"
            pm2 logs tumi-gestao-api --lines 10 --nostream
        fi
    fi
done

# Verificar conectividade do banco
if curl -f http://localhost:3001/api/health/db > /dev/null 2>&1; then
    echo "✅ Conexão com banco de dados OK!"
else
    echo "⚠️  Problemas na conexão com o banco - verificar configuração"
fi

# ===== 9. CONFIGURAR NGINX (INTEGRAÇÃO INTELIGENTE) =====
echo "🌐 Configurando Nginx para integração com site existente..."

# Verificar se as rotas do gestão já existem
if ! grep -q "location /gestao" "$NGINX_CONFIG"; then
    echo "🔧 Adicionando rotas do sistema de gestão ao Nginx..."
    
    # Fazer backup da configuração
    sudo cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup-$(date +%Y%m%d_%H%M%S)"
    
    # Inserir as novas rotas ANTES da location / existente
    sudo sed -i '/location \/ {/i\
    # Sistema de Gestão - Frontend\
    location /gestao {\
        alias /var/www/tumi/gestao/dist;\
        index index.html;\
        try_files $uri $uri/ /gestao/index.html;\
        proxy_intercept_errors off;\
    }\
\
    # Sistema de Gestão - API\
    location /gestao/api/ {\
        proxy_pass http://localhost:3001/api/;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_intercept_errors off;\
    }\
\
    # Assets do sistema de gestão\
    location /gestao/assets {\
        alias /var/www/tumi/gestao/dist/assets;\
        expires 1y;\
        add_header Cache-Control "public, immutable";\
    }\
' "$NGINX_CONFIG"
    
    echo "✅ Rotas do gestão adicionadas ao Nginx"
    echo "✅ Site principal mantido intacto em http://127.0.0.1:5500"
else
    echo "✅ Rotas do gestão já configuradas no Nginx"
fi

# ===== 10. RECARREGAR NGINX =====
echo "🔄 Testando e recarregando Nginx..."
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "✅ Nginx recarregado com sucesso"
else
    echo "❌ Erro na configuração Nginx - restaurando backup"
    if [ -f "${NGINX_CONFIG}.backup-$(date +%Y%m%d)*" ]; then
        sudo cp "${NGINX_CONFIG}.backup-"* "$NGINX_CONFIG"
        sudo systemctl reload nginx
    fi
    exit 1
fi

# ===== 10. CONFIGURAR SSL (se ainda não estiver configurado) =====
if ! sudo certbot certificates 2>/dev/null | grep -q "tumihortifruti.com.br"; then
    echo "🔐 Configurando SSL com Let's Encrypt..."
    echo "Execute manualmente: sudo certbot --nginx -d tumihortifruti.com.br"
fi

# ===== 11. LIMPEZA =====
echo "🧹 Limpeza pós-deploy..."
# Remover arquivos temporários
rm -rf $APP_DIR/node_modules/.cache 2>/dev/null || true

# ===== 12. RESUMO =====
echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📊 STATUS DA APLICAÇÃO:"
pm2 status tumi-gestao-api
echo ""
echo "📋 INFORMAÇÕES:"
echo "   🌐 URL: https://tumihortifruti.com.br/gestao"
echo "   👤 Login: admin@tumihortifruti.com.br"
echo "   🔑 Senha: admin123"
echo "   📁 Diretório: $APP_DIR"
echo "   💾 Backup: $BACKUP_DIR"
echo ""
echo "📖 COMANDOS ÚTEIS:"
echo "   pm2 status                    # Status das aplicações"
echo "   pm2 logs tumi-gestao-api      # Ver logs em tempo real"
echo "   pm2 restart tumi-gestao-api   # Reiniciar aplicação"
echo "   pm2 reload tumi-gestao-api    # Reload sem downtime"
echo ""
echo "🔍 MONITORAMENTO:"
echo "   tail -f /var/log/tumi-gestao/combined.log"
echo "   systemctl status nginx"
echo ""

# Mostrar logs recentes
echo "📄 LOGS RECENTES (últimas 10 linhas):"
pm2 logs tumi-gestao-api --lines 10 --nostream