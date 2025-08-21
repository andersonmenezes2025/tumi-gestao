#!/bin/bash

# Script de Instalação Completa - TumiGestão VPS
# Domínio: tumihortifruti.com.br/gestao

echo "🚀 Iniciando instalação do TumiGestão na VPS..."

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# Instalar Node.js 18.x
echo "📦 Instalando Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Instalar PostgreSQL
echo "📦 Instalando PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Instalar Nginx
echo "📦 Instalando Nginx..."
apt install -y nginx

# Instalar PM2 globalmente
echo "📦 Instalando PM2..."
npm install -g pm2

# Instalar Certbot para SSL
echo "📦 Instalando Certbot..."
apt install -y certbot python3-certbot-nginx

# Criar diretório do projeto
echo "📂 Criando estrutura de diretórios..."
mkdir -p /var/www/tumi/gestao
chown -R www-data:www-data /var/www/tumi

# Configurar firewall
echo "🔒 Configurando firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3001
ufw --force enable

# Inicializar PM2 startup
echo "🔄 Configurando PM2 startup..."
pm2 startup systemd -u root --hp /root

echo "✅ Instalação base concluída!"
echo "📋 Próximos passos:"
echo "1. Executar script de configuração do PostgreSQL"
echo "2. Fazer upload do código do projeto"
echo "3. Executar build e configurações finais"