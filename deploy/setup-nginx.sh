#!/bin/bash

# Script de Configuração do Nginx - TumiGestão

echo "🌐 Configurando Nginx para TumiGestão..."

# Fazer backup da configuração atual se existir
if [ -f "/etc/nginx/sites-available/tumi" ]; then
    cp /etc/nginx/sites-available/tumi /etc/nginx/sites-available/tumi.backup.$(date +%Y%m%d_%H%M%S)
    echo "📋 Backup da configuração anterior criado"
fi

# Copiar nova configuração
cp /var/www/tumi/gestao/deploy/nginx-config /etc/nginx/sites-available/tumi

# Remover link simbólico existente se houver
rm -f /etc/nginx/sites-enabled/tumi

# Criar novo link simbólico
ln -s /etc/nginx/sites-available/tumi /etc/nginx/sites-enabled/

# Testar configuração do Nginx
echo "🧪 Testando configuração do Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração do Nginx válida!"
    
    # Recarregar Nginx
    systemctl reload nginx
    echo "🔄 Nginx recarregado com sucesso!"
    
    # Verificar status do Nginx
    systemctl status nginx --no-pager -l
    
    echo ""
    echo "🌐 URLs de teste:"
    echo "Frontend: https://tumihortifruti.com.br/gestao"
    echo "Backend Health: https://tumihortifruti.com.br/gestao/api/health"
    echo ""
    echo "📝 Para configurar SSL (se ainda não estiver configurado):"
    echo "sudo certbot --nginx -d tumihortifruti.com.br -d www.tumihortifruti.com.br"
    
else
    echo "❌ Erro na configuração do Nginx!"
    echo "Verifique os logs com: sudo nginx -t"
    exit 1
fi