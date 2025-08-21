#!/bin/bash

# Script de Atualização Rápida - TumiGestão
# Para atualizações futuras sem reconfigurar tudo

echo "🔄 Atualizando TumiGestão..."

# Navegar para o diretório do projeto
cd /var/www/tumi/gestao

# Parar aplicação
echo "⏸️  Parando aplicação..."
pm2 stop tumigestao-backend

# Fazer backup rápido
echo "💾 Backup rápido..."
mkdir -p /var/backups/tumigestao/quick
cp .env /var/backups/tumigestao/quick/.env.$(date +%Y%m%d_%H%M%S)

# Atualizar dependências se necessário
echo "📦 Verificando dependências..."
npm install --production=false

# Rebuild backend
echo "🔨 Compilando backend..."
npm run build:server

# Rebuild frontend
echo "🔨 Compilando frontend..."
npm run build

# Ajustar permissões
chown -R www-data:www-data dist/public
chmod -R 755 dist/public

# Reiniciar aplicação
echo "🚀 Reiniciando aplicação..."
pm2 restart tumigestao-backend

# Aguardar e verificar status
sleep 3
pm2 status

echo "✅ Atualização concluída!"
echo "🌐 Teste em: https://tumihortifruti.com.br/gestao"