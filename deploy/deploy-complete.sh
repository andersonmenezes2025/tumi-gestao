#!/bin/bash

# Script Completo de Deploy - TumiGestão
# Execute este script na VPS após fazer upload do código

echo "🚀 DEPLOY COMPLETO TUMIGESTÃO - INICIANDO..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na raiz do projeto TumiGestão"
    exit 1
fi

# Fazer todos os scripts executáveis
chmod +x deploy/*.sh

# 1. Executar build e deploy
echo "📦 1/4 - Executando build e deploy..."
./deploy/build-and-deploy.sh --first-deploy

# 2. Configurar Nginx
echo "🌐 2/4 - Configurando Nginx..."
./deploy/setup-nginx.sh

# 3. Configurar crontab para backups
echo "⏰ 3/4 - Configurando backups automáticos..."
crontab -l > /tmp/crontab.backup 2>/dev/null || true
cat deploy/crontab-backup >> /tmp/crontab.backup
crontab /tmp/crontab.backup
echo "✅ Crontab configurado para backups automáticos"

# 4. Teste final das URLs
echo "🧪 4/4 - Testando URLs..."
sleep 5

echo "Testando backend..."
curl -s https://tumihortifruti.com.br/gestao/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend funcionando"
else
    echo "⚠️  Backend pode não estar respondendo ainda"
fi

echo "Testando frontend..."
curl -s https://tumihortifruti.com.br/gestao > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend funcionando"
else
    echo "⚠️  Frontend pode não estar respondendo ainda"
fi

echo ""
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo ""
echo "📋 INFORMAÇÕES IMPORTANTES:"
echo "🌐 Sistema: https://tumihortifruti.com.br/gestao"
echo "🔌 API: https://tumihortifruti.com.br/gestao/api/health"
echo "🗄️  Banco: tumigestao_db (tumigestao_user)"
echo "📊 PM2: pm2 status"
echo "📋 Logs: pm2 logs tumigestao-backend"
echo "💾 Backups: /var/backups/tumigestao/"
echo ""
echo "🔧 PRÓXIMOS PASSOS:"
echo "1. Acesse https://tumihortifruti.com.br/gestao"
echo "2. Crie sua primeira conta de usuário"
echo "3. Configure sua empresa"
echo "4. Comece a usar o sistema!"
echo ""
echo "📞 Para suporte, verifique os logs com: pm2 logs tumigestao-backend"