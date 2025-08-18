#!/bin/bash

# Script de configuração para VPS - Tumi Hortifruti Gestão
# Executa como root ou usuário com sudo

set -e

echo "🚀 Iniciando configuração do Sistema de Gestão Tumi Hortifruti..."

# Configurações
DB_NAME="tumigestao_db"
DB_USER="tumigestao_user"
DB_PASSWORD="TumiGest@o2024!Secure"
APP_DIR="/var/www/tumi/gestao"
DOMAIN="tumihortifruti.com.br"

# ===== 1. CONFIGURAÇÃO DO BANCO DE DADOS =====
echo "📊 Configurando banco de dados PostgreSQL..."

# Criar banco e usuário
sudo -u postgres psql <<EOF
-- Criar banco se não existir
SELECT 'CREATE DATABASE $DB_NAME' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Criar usuário se não existir
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
EOF

echo "✅ Banco de dados configurado"

# ===== 2. EXECUTAR MIGRAÇÃO =====
echo "🗄️  Executando migração do banco..."

# Executar script de migração
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U $DB_USER -d $DB_NAME -f database/migration.sql

echo "✅ Migração executada com sucesso"

# ===== 3. CONFIGURAÇÃO DE DIRETÓRIOS =====
echo "📁 Configurando estrutura de diretórios..."

# Criar diretórios necessários
sudo mkdir -p $APP_DIR/{dist,logs,uploads}
sudo mkdir -p /var/log/tumi-gestao

# Ajustar permissões
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

echo "✅ Diretórios configurados"

# ===== 4. CONFIGURAÇÃO DO NGINX =====
echo "🌐 Configurando Nginx..."

# Criar configuração do Nginx
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<'EOF'
server {
    listen 80;
    server_name tumihortifruti.com.br www.tumihortifruti.com.br;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tumihortifruti.com.br www.tumihortifruti.com.br;

    # SSL será configurado pelo Certbot
    
    # Site principal (existente)
    root /var/www/tumi;
    index index.php index.html;

    # Logs
    access_log /var/log/nginx/tumi_access.log;
    error_log /var/log/nginx/tumi_error.log;

    # Sistema de Gestão - Servir arquivos estáticos
    location /gestao {
        alias /var/www/tumi/gestao/dist;
        try_files $uri $uri/ /gestao/index.html;
        
        # Cache para assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API do Sistema de Gestão - Proxy para Node.js
    location /gestao/api {
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Site principal PHP (mantém configuração existente)
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Bloquear acesso a arquivos sensíveis
    location ~ /\. {
        deny all;
    }
    
    location ~* \.(log|sql|md)$ {
        deny all;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

echo "✅ Nginx configurado"

# ===== 5. CONFIGURAÇÃO DO PM2 =====
echo "🔧 Configurando PM2..."

# Criar arquivo ecosystem.config.js
tee $APP_DIR/ecosystem.config.js > /dev/null <<'EOF'
module.exports = {
  apps: [{
    name: 'tumi-gestao-api',
    script: './dist/server/index.js',
    cwd: '/var/www/tumi/gestao',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_NAME: 'tumigestao_db',
      DB_USER: 'tumigestao_user',
      DB_PASSWORD: 'TumiGest@o2024!Secure',
      JWT_SECRET: 'tumi-gestao-jwt-secret-production-2024-secure',
      PRODUCTION_URL: 'https://tumihortifruti.com.br'
    },
    log_file: '/var/log/tumi-gestao/combined.log',
    out_file: '/var/log/tumi-gestao/out.log',
    error_file: '/var/log/tumi-gestao/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    max_memory_restart: '500M'
  }]
};
EOF

echo "✅ PM2 configurado"

# ===== 6. CONFIGURAÇÃO DE SEGURANÇA =====
echo "🔒 Configurando segurança..."

# Configurar UFW (se estiver instalado)
if command -v ufw > /dev/null; then
    sudo ufw allow 22/tcp      # SSH
    sudo ufw allow 80/tcp      # HTTP
    sudo ufw allow 443/tcp     # HTTPS
    sudo ufw allow 5432/tcp    # PostgreSQL (apenas localmente)
    # sudo ufw --force enable
fi

# Configurar logrotate para os logs da aplicação
sudo tee /etc/logrotate.d/tumi-gestao > /dev/null <<'EOF'
/var/log/tumi-gestao/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

echo "✅ Segurança configurada"

# ===== 7. SCRIPT DE BACKUP =====
echo "💾 Configurando backup automático..."

# Criar script de backup
sudo tee /usr/local/bin/backup-tumi-gestao > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/tumi-gestao"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="tumigestao_db"
DB_USER="tumigestao_user"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco de dados
PGPASSWORD="TumiGest@o2024!Secure" pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Backup dos arquivos da aplicação (se houver uploads)
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz -C /var/www/tumi/gestao uploads/ 2>/dev/null || true

# Manter apenas os backups dos últimos 7 dias
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
EOF

sudo chmod +x /usr/local/bin/backup-tumi-gestao

# Adicionar ao crontab (backup diário às 2h da manhã)
(sudo crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-tumi-gestao >> /var/log/tumi-gestao-backup.log 2>&1") | sudo crontab -

echo "✅ Backup configurado"

# ===== 8. FINALIZAÇÃO =====
echo "🎯 Finalizando configuração..."

# Recarregar Nginx
sudo systemctl reload nginx

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Enviar os arquivos da aplicação para: $APP_DIR"
echo "2. Instalar dependências: cd $APP_DIR && npm install"
echo "3. Fazer build da aplicação: npm run build && npm run build:server"
echo "4. Iniciar com PM2: pm2 start ecosystem.config.js"
echo "5. Configurar SSL: sudo certbot --nginx -d $DOMAIN"
echo ""
echo "📊 INFORMAÇÕES DO BANCO:"
echo "   Host: localhost"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo ""
echo "🔍 MONITORAMENTO:"
echo "   Logs da aplicação: tail -f /var/log/tumi-gestao/combined.log"
echo "   Status PM2: pm2 status"
echo "   Backup: /usr/local/bin/backup-tumi-gestao"
echo ""
echo "🌐 ACESSO:"
echo "   Sistema: https://$DOMAIN/gestao"
echo "   Login padrão: admin@tumihortifruti.com.br / admin123"
echo ""