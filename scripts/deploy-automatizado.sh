#!/bin/bash

# Script de deploy automatizado - Execução em sequência
# Sistema de Gestão Tumi Hortifruti

set -e

echo "🚀 ===== DEPLOY AUTOMATIZADO - TUMI GESTÃO ====="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar se está executando como root para partes que precisam
check_sudo() {
    if [ "$EUID" -eq 0 ]; then
        log_error "Não execute este script como root. Use sudo apenas quando necessário."
        exit 1
    fi
}

# ===== VERIFICAÇÕES INICIAIS =====
echo "🔍 Verificando pré-requisitos..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    log_error "Execute este script no diretório raiz do projeto (/var/www/tumi/gestao)"
    exit 1
fi

# Verificar se Node.js está instalado
if ! command_exists node; then
    log_error "Node.js não encontrado. Instale o Node.js v18 ou superior."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js v18+ é necessário. Versão atual: $(node -v)"
    exit 1
fi

# Verificar se PostgreSQL está instalado
if ! command_exists psql; then
    log_error "PostgreSQL não encontrado. Instale o PostgreSQL primeiro."
    exit 1
fi

# Verificar se PM2 está instalado
if ! command_exists pm2; then
    log_info "Instalando PM2..."
    npm install -g pm2
fi

log_success "Pré-requisitos verificados"

# ===== FASE 1: SETUP DO BANCO (se necessário) =====
echo ""
echo "📊 Verificando banco de dados..."

# Verificar se banco tumigestao_db existe
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw tumigestao_db; then
    log_success "Banco tumigestao_db já existe"
else
    log_info "Criando banco de dados..."
    
    # Executar setup do banco
    sudo -u postgres psql <<EOF
CREATE DATABASE tumigestao_db;
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'tumigestao_user') THEN
        CREATE USER tumigestao_user WITH PASSWORD 'TumiGest@o2024!Secure';
    END IF;
END
\$\$;
GRANT ALL PRIVILEGES ON DATABASE tumigestao_db TO tumigestao_user;
GRANT ALL ON SCHEMA public TO tumigestao_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tumigestao_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO tumigestao_user;
EOF

    log_success "Banco criado com sucesso"
fi

# Executar migração se arquivo existe
if [ -f "database/migration.sql" ]; then
    log_info "Executando migração do banco..."
    PGPASSWORD="TumiGest@o2024!Secure" psql -h localhost -U tumigestao_user -d tumigestao_db -f database/migration.sql
    log_success "Migração executada"
else
    log_warning "Arquivo de migração não encontrado"
fi

# ===== FASE 2: INSTALAÇÃO DE DEPENDÊNCIAS =====
echo ""
echo "📦 Instalando dependências..."

if [ -f "package.json" ]; then
    npm ci --only=production
    log_success "Dependências instaladas"
else
    log_error "package.json não encontrado"
    exit 1
fi

# ===== FASE 3: BUILD DA APLICAÇÃO =====
echo ""
echo "🔨 Compilando aplicação..."

# Instalar dependências de desenvolvimento para build
npm ci

# Build do frontend
if npm run build; then
    log_success "Frontend compilado"
else
    log_error "Erro no build do frontend"
    exit 1
fi

# Build do backend
if npm run build:server; then
    log_success "Backend compilado"
else
    log_error "Erro no build do backend"
    exit 1
fi

# ===== FASE 4: CONFIGURAÇÃO DE AMBIENTE =====
echo ""
echo "⚙️ Configurando ambiente..."

# Criar arquivo .env
cat > .env <<EOF
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
chmod 600 .env
log_success "Arquivo de ambiente configurado"

# ===== FASE 5: CONFIGURAÇÃO PM2 =====
echo ""
echo "🔄 Configurando PM2..."

# Criar arquivo ecosystem.config.js se não existir
if [ ! -f "ecosystem.config.js" ]; then
    cat > ecosystem.config.js <<EOF
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
fi

# Criar diretório de logs
sudo mkdir -p /var/log/tumi-gestao
sudo chown -R $USER:$USER /var/log/tumi-gestao

log_success "PM2 configurado"

# ===== FASE 6: CONFIGURAÇÃO NGINX =====
echo ""
echo "🌐 Configurando Nginx..."

# Verificar se Nginx está instalado
if ! command_exists nginx; then
    log_info "Instalando Nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# Criar configuração do Nginx
sudo tee /etc/nginx/sites-available/tumihortifruti.com.br > /dev/null <<'EOF'
server {
    listen 80;
    server_name tumihortifruti.com.br www.tumihortifruti.com.br;

    # Site principal
    root /var/www/tumi;
    index index.php index.html;

    # Sistema de Gestão - Arquivos estáticos
    location /gestao {
        alias /var/www/tumi/gestao/dist;
        try_files $uri $uri/ /gestao/index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API do Sistema de Gestão
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

    # Site principal PHP
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Segurança
    location ~ /\. {
        deny all;
    }
    
    location ~* \.(log|sql|md)$ {
        deny all;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/tumihortifruti.com.br /etc/nginx/sites-enabled/

# Testar configuração
if sudo nginx -t; then
    log_success "Configuração do Nginx OK"
    sudo systemctl reload nginx
else
    log_error "Erro na configuração do Nginx"
    exit 1
fi

# ===== FASE 7: INICIAR APLICAÇÃO =====
echo ""
echo "🚀 Iniciando aplicação..."

# Parar aplicação se estiver rodando
pm2 stop tumi-gestao-api 2>/dev/null || true

# Iniciar aplicação
if pm2 start ecosystem.config.js; then
    log_success "Aplicação iniciada com PM2"
    pm2 save
else
    log_error "Erro ao iniciar aplicação"
    exit 1
fi

# ===== FASE 8: VERIFICAÇÕES FINAIS =====
echo ""
echo "🔍 Verificando deployment..."

# Aguardar a aplicação iniciar
sleep 10

# Verificar se PM2 está rodando
if pm2 describe tumi-gestao-api | grep -q "online"; then
    log_success "PM2 status: Online"
else
    log_error "PM2 status: Offline"
    pm2 logs tumi-gestao-api --lines 10
    exit 1
fi

# Testar API
if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
    log_success "API respondendo"
else
    log_warning "API não está respondendo - verificar logs"
    pm2 logs tumi-gestao-api --lines 5
fi

# ===== CONFIGURAÇÃO SSL (se Certbot estiver disponível) =====
echo ""
echo "🔒 Verificando SSL..."

if command_exists certbot; then
    log_info "Certbot encontrado. Para configurar SSL, execute:"
    echo "sudo certbot --nginx -d tumihortifruti.com.br"
else
    log_warning "Certbot não encontrado. Instale com:"
    echo "sudo snap install --classic certbot"
    echo "sudo ln -s /snap/bin/certbot /usr/bin/certbot"
    echo "sudo certbot --nginx -d tumihortifruti.com.br"
fi

# ===== RESUMO FINAL =====
echo ""
echo "🎉 ===== DEPLOY CONCLUÍDO ====="
echo ""
log_success "Sistema implantado com sucesso!"
echo ""
echo "📋 INFORMAÇÕES:"
echo "   🌐 URL: http://tumihortifruti.com.br/gestao (HTTPS após SSL)"
echo "   👤 Login: admin@tumihortifruti.com.br"
echo "   🔑 Senha: admin123"
echo "   📊 Status: pm2 status"
echo "   📝 Logs: pm2 logs tumi-gestao-api"
echo ""
echo "📖 PRÓXIMOS PASSOS:"
echo "1. Configurar SSL: sudo certbot --nginx -d tumihortifruti.com.br"
echo "2. Testar o sistema no navegador"
echo "3. Alterar senha padrão do admin"
echo ""
echo "🔧 COMANDOS ÚTEIS:"
echo "   pm2 restart tumi-gestao-api  # Reiniciar"
echo "   pm2 logs tumi-gestao-api     # Ver logs"
echo "   pm2 monit                    # Monitor"
echo ""

# Mostrar status final
pm2 status tumi-gestao-api