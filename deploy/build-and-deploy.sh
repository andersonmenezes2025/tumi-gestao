#!/bin/bash

# Script de Build e Deploy - TumiGestão

PROJECT_DIR="/var/www/tumi/gestao"
BACKUP_DIR="/var/backups/tumigestao"

echo "🚀 Iniciando processo de build e deploy..."

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Parar aplicação PM2 se estiver rodando
echo "⏸️  Parando aplicação..."
pm2 stop tumigestao-backend 2>/dev/null || echo "Aplicação não estava rodando"

# Navegar para o diretório do projeto
cd $PROJECT_DIR

# Fazer backup do .env atual se existir
if [ -f ".env" ]; then
    cp .env .env.backup
    echo "📋 Backup do .env criado"
fi

# Copiar arquivo de produção
cp .env.production .env
echo "⚙️  Configuração de produção aplicada"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install --production=false

# Build do backend
echo "🔨 Compilando backend..."
npm run build:server

# Build do frontend
echo "🔨 Compilando frontend..."
npm run build

# Verificar se os builds foram criados
if [ ! -f "server/dist/index.js" ]; then
    echo "❌ Erro: Build do backend falhou"
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Erro: Build do frontend falhou"
    exit 1
fi

# Configurar permissões
chown -R www-data:www-data $PROJECT_DIR/dist/public
chmod -R 755 $PROJECT_DIR/dist/public

# Copiar ecosystem.config.js se não existir
if [ ! -f "ecosystem.config.js" ]; then
    echo "📋 Copiando configuração do PM2..."
    # O arquivo já deve estar na raiz do projeto
fi

# Criar diretórios de log
mkdir -p /var/log/pm2
chown -R root:root /var/log/pm2

# Executar schema do banco (só na primeira vez)
if [ "$1" = "--first-deploy" ]; then
    echo "🗄️  Configurando banco de dados..."
    PGPASSWORD='TumiGestao2024' psql -h localhost -U tumigestao_user -d tumigestao_db -f deploy/database-schema.sql
fi

# Iniciar aplicação com PM2
echo "🚀 Iniciando aplicação..."
pm2 start ecosystem.config.js --env production

# Salvar configuração do PM2
pm2 save

# Verificar status
sleep 3
pm2 status

echo "✅ Deploy concluído!"
echo "🌐 Frontend: https://tumihortifruti.com.br/gestao"
echo "🔌 Backend: https://tumihortifruti.com.br/gestao/api/health"
echo "📊 Status PM2: pm2 status"
echo "📋 Logs: pm2 logs tumigestao-backend"