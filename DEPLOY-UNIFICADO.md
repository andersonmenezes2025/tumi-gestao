# 🚀 Deploy Definitivo - Tumi Hortifruti Gestão

## ✅ Configuração Detectada
- **VPS:** 31.97.129.119 com Node.js, PostgreSQL, Nginx
- **SSL:** Configurado para tumihortifruti.com.br 
- **Site Principal:** Proxy para http://127.0.0.1:5500 (mantido intacto)
- **Gestão:** Será adicionado em `/gestao` sem afetar o site principal

---

## 🔍 ANTES DE COMEÇAR: Verificar Status Atual

Execute este comando para ver o que já foi feito:

```bash
# Script para verificar o que já está configurado
cat > /tmp/verificar_status.sh << 'EOF'
#!/bin/bash
echo "🔍 === STATUS ATUAL DO SISTEMA ==="

# 1. Verificar se código foi baixado
if [ -d "/var/www/tumi/gestao" ]; then
    echo "✅ Código: Baixado em /var/www/tumi/gestao"
    ls /var/www/tumi/gestao/package.json >/dev/null 2>&1 && echo "  📦 package.json encontrado"
else
    echo "❌ Código: NÃO baixado"
fi

# 2. Verificar Node.js
NODE_VERSION=$(node --version 2>/dev/null || echo "não instalado")
echo "🔧 Node.js: $NODE_VERSION"

# 3. Verificar dependências npm
if [ -d "/var/www/tumi/gestao/node_modules" ]; then
    echo "✅ NPM: Dependências instaladas"
else
    echo "❌ NPM: Dependências NÃO instaladas"
fi

# 4. Verificar banco PostgreSQL
if PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT 1;" &>/dev/null; then
    echo "✅ Banco: Configurado e acessível"
    # Verificar se tem dados
    USER_COUNT=$(PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db -t -c "SELECT COUNT(*) FROM profiles;" 2>/dev/null | tr -d ' ')
    if [ "$USER_COUNT" -gt 0 ] 2>/dev/null; then
        echo "  👤 Dados: $USER_COUNT usuários encontrados"
    else
        echo "  📭 Dados: Banco vazio ou migração necessária"
    fi
else
    echo "❌ Banco: NÃO configurado"
fi

# 5. Verificar PM2
if command -v pm2 >/dev/null 2>&1; then
    echo "✅ PM2: Instalado"
    if pm2 status | grep -q "tumi-gestao-api"; then
        echo "  🚀 App: tumi-gestao-api encontrado"
        pm2 status | grep tumi-gestao-api
    else
        echo "  📴 App: tumi-gestao-api NÃO encontrado"
    fi
else
    echo "❌ PM2: NÃO instalado"
fi

# 6. Verificar Nginx
if grep -q "location /gestao" /etc/nginx/sites-available/tumihortifruti.com.br 2>/dev/null; then
    echo "✅ Nginx: Configurado para /gestao"
else
    echo "❌ Nginx: NÃO configurado para /gestao"
fi

echo ""
echo "🎯 === PRÓXIMOS PASSOS ==="
echo "Use este resultado para pular etapas já concluídas ✅"
echo "Execute apenas os passos marcados com ❌"
EOF

chmod +x /tmp/verificar_status.sh
/tmp/verificar_status.sh
```

---

## 🎯 PASSO 1: Conectar ao GitHub e Baixar Código

**No Lovable:**
1. GitHub → Connect to GitHub
2. Autorizar Lovable GitHub App
3. Criar repositório **tumi-gestao**

**📍 EXECUTAR NO:** Terminal da sua máquina
```bash
📋 CÓDIGO PARA COPIAR (início):
ssh root@31.97.129.119
✂️ FIM DO CÓDIGO
```

**📍 EXECUTAR NO:** Terminal VPS (após conectar via SSH)
```bash
📋 CÓDIGO PARA COPIAR (início):
mkdir -p /var/www/tumi
cd /var/www/tumi
git clone https://github.com/SEU_USUARIO/tumi-gestao.git gestao
cd gestao
ls -la
echo "✅ Código baixado com sucesso"
✂️ FIM DO CÓDIGO
```

**🔍 VERIFICAR:** Deve aparecer arquivos como `package.json`, `src/`, `server/`, etc.

---

## 🎯 PASSO 2: Instalar Dependências e Configurar Node.js

**📍 EXECUTAR NO:** Terminal VPS (diretório `/var/www/tumi/gestao`)

```bash
📋 CÓDIGO PARA COPIAR (início):
# Verificar versão do Node.js (deve ser 18+)
node --version

# Se Node.js < 18, instalar versão correta
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar dependências
npm install

# Verificar se instalou corretamente
npm list --depth=0
echo "✅ Dependências instaladas"
✂️ FIM DO CÓDIGO
```

**🔍 VERIFICAR:** Deve mostrar versão Node.js 18+ e criar pasta `node_modules/`

---

## 🎯 PASSO 3: Criar Arquivos de Configuração

### 3.1 Adicionar Scripts ao package.json

**📍 EXECUTAR NO:** Terminal VPS (diretório `/var/www/tumi/gestao`)

```bash
📋 CÓDIGO PARA COPIAR (início):
cd /var/www/tumi/gestao
npm pkg set scripts.build:server="tsc --project tsconfig.server.json"
npm pkg set scripts.start:server="node server/dist/index.js"
npm run --silent | grep -E "(build:server|start:server)" && echo "✅ Scripts adicionados"
✂️ FIM DO CÓDIGO
```

**🔍 VERIFICAR:** Deve mostrar "✅ Scripts adicionados"

### 3.2 Arquivo .env de Produção

**📍 EXECUTAR NO:** Terminal VPS (diretório `/var/www/tumi/gestao`)

```bash
📋 CÓDIGO PARA COPIAR (início):
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://tumigestao_user:TumiGest@o2024!Secure@localhost:5432/tumigestao_db
JWT_SECRET=TumiHortifruti2024!SecureJWT#Key
CORS_ORIGIN=https://tumihortifruti.com.br
EOF
echo "✅ Arquivo .env criado"
✂️ FIM DO CÓDIGO
```

**🔍 VERIFICAR:** Arquivo `.env` deve ser criado no diretório atual

### 3.3 Configuração do PM2

**📍 EXECUTAR NO:** Terminal VPS (diretório `/var/www/tumi/gestao`)

```bash
📋 CÓDIGO PARA COPIAR (início):
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tumi-gestao-api',
    script: 'server/dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/tumi-gestao-error.log',
    out_file: '/var/log/pm2/tumi-gestao-out.log',
    log_file: '/var/log/pm2/tumi-gestao-combined.log',
    time: true
  }]
};
EOF
sudo mkdir -p /var/log/pm2
sudo chown -R www-data:www-data /var/log/pm2
echo "✅ Configuração PM2 criada"
✂️ FIM DO CÓDIGO
```

**🔍 VERIFICAR:** Arquivo `ecosystem.config.js` deve ser criado

---

## 🎯 PASSO 4: Configurar Banco de Dados

### 4.1 Criar Banco e Usuário

**📍 EXECUTAR NO:** Terminal VPS

```bash
📋 CÓDIGO PARA COPIAR (início):
sudo -u postgres psql << 'EOF'
CREATE DATABASE tumigestao_db;
CREATE USER tumigestao_user WITH ENCRYPTED PASSWORD 'TumiGest@o2024!Secure';
GRANT ALL PRIVILEGES ON DATABASE tumigestao_db TO tumigestao_user;
GRANT ALL ON SCHEMA public TO tumigestao_user;
\q
EOF
✂️ FIM DO CÓDIGO
```

### 4.2 Executar Migração do Banco

**📍 EXECUTAR NO:** Terminal VPS (diretório `/var/www/tumi/gestao`)

```bash
📋 CÓDIGO PARA COPIAR (início):
PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db -f database/migration.sql
✂️ FIM DO CÓDIGO
```

### 4.3 Testar Conexão com Banco

**📍 EXECUTAR NO:** Terminal VPS

```bash
📋 CÓDIGO PARA COPIAR (início):
PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT COUNT(*) FROM profiles;"
✂️ FIM DO CÓDIGO
```

**🔍 VERIFICAR:** Deve mostrar "count: 1" (usuário admin criado)

### 4.4 Comandos para Acessar o Banco Diretamente (se necessário)

**📍 PARA ACESSAR O BANCO:** Use este comando no Terminal VPS
```bash
📋 COMANDO PARA ACESSAR BANCO:
PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db
✂️ FIM DO COMANDO
```

**📍 COMANDOS SQL ÚTEIS** (executar dentro do banco após acessar):
```sql
📋 COMANDOS SQL (executar um por vez no prompt do banco):
-- Ver tabelas criadas
\dt

-- Ver usuários no sistema  
SELECT email, full_name, role FROM profiles;

-- Sair do banco
\q
✂️ FIM DOS COMANDOS SQL
```

---

## 🎯 PASSO 5: Compilar Aplicação

**📍 EXECUTAR NO:** Terminal VPS (diretório `/var/www/tumi/gestao`)

```bash
📋 CÓDIGO PARA COPIAR (início):
# Compilar frontend
npm run build

# Compilar backend  
npm run build:server

# Verificar se compilou corretamente
ls -la dist/
ls -la server/dist/

echo "✅ Aplicação compilada"
✂️ FIM DO CÓDIGO
```

**🔍 VERIFICAR:** Pastas `dist/` e `server/dist/` devem existir com arquivos compilados

---

## 🎯 PASSO 6: Configurar Nginx

**📍 EXECUTAR NO:** Terminal VPS

```bash
📋 CÓDIGO PARA COPIAR (início):
# Fazer backup da configuração atual
sudo cp /etc/nginx/sites-available/tumihortifruti.com.br /etc/nginx/sites-available/tumihortifruti.com.br.backup

# Script para atualizar Nginx de forma segura
sudo tee /tmp/update-nginx.sh > /dev/null << 'EOF'
#!/bin/bash
CONFIG_FILE="/etc/nginx/sites-available/tumihortifruti.com.br"
TEMP_FILE="/tmp/nginx-updated.conf"

# Verificar se já está configurado
if grep -q "location /gestao" "$CONFIG_FILE"; then
    echo "⚠️  Nginx já configurado para /gestao"
    exit 0
fi

# Adicionar configurações antes da location /
sed '/location \/ {/i\
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
' "$CONFIG_FILE" > "$TEMP_FILE"

# Testar configuração
if nginx -t -c /dev/null -p /etc/nginx/ -g "include $TEMP_FILE;"; then
    sudo mv "$TEMP_FILE" "$CONFIG_FILE"
    echo "✅ Nginx configurado com sucesso"
else
    echo "❌ Erro na configuração Nginx"
    rm -f "$TEMP_FILE"
    exit 1
fi
EOF

# Executar atualização
chmod +x /tmp/update-nginx.sh
sudo /tmp/update-nginx.sh

# Testar e recarregar
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Nginx configurado e recarregado"
✂️ FIM DO CÓDIGO
```

**🔍 VERIFICAR:** Execute `sudo nginx -t` - deve mostrar "syntax is ok" e "test is successful"

---

## 🎯 PASSO 7: Configurar PM2 e Iniciar Aplicação

**📍 EXECUTAR NO:** Terminal VPS (diretório `/var/www/tumi/gestao`)

```bash
📋 CÓDIGO PARA COPIAR (início):
# Instalar PM2 se não estiver instalado
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Configurar permissões
sudo chown -R www-data:www-data /var/www/tumi/gestao
sudo chmod -R 755 /var/www/tumi/gestao

# Parar processo anterior se existir
pm2 stop tumi-gestao-api 2>/dev/null || true
pm2 delete tumi-gestao-api 2>/dev/null || true

# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração PM2
pm2 save
pm2 startup

echo "✅ Aplicação iniciada com PM2"
✂️ FIM DO CÓDIGO
```

**🔍 VERIFICAR:** Execute `pm2 status` - deve aparecer `tumi-gestao-api` com status `online`

---

## 🎯 PASSO 8: Verificações Finais

**📍 EXECUTAR NO:** Terminal VPS

```bash
📋 CÓDIGO PARA COPIAR (início):
# Script completo de verificação
cat > /tmp/verificar_sistema.sh << 'EOF'
#!/bin/bash

echo "🔍 === VERIFICAÇÃO COMPLETA DO SISTEMA ==="

# 1. Verificar PM2
echo ""
echo "📋 1. Status PM2:"
if pm2 status | grep -q "tumi-gestao-api.*online"; then
    echo "✅ PM2: Aplicação rodando"
    pm2 status | grep tumi-gestao-api
else
    echo "❌ PM2: Aplicação NÃO está rodando"
    echo "📝 Logs PM2:"
    pm2 logs tumi-gestao-api --lines 5
fi

# 2. Verificar conexão com banco
echo ""
echo "🗃️ 2. Teste de Banco:"
if PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT email FROM profiles WHERE role='admin';" 2>/dev/null | grep -q "admin@tumihortifruti"; then
    echo "✅ Banco: Conectando e dados OK"
else
    echo "❌ Banco: Problema de conexão ou dados"
    echo "🔧 Testando conexão básica:"
    PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT 1;" 2>&1 || echo "Erro na conexão"
fi

# 3. Testar API local
echo ""
echo "🔌 3. API Local (porta 3001):"
API_LOCAL=$(curl -s -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null)
if echo "$API_LOCAL" | grep -q "200"; then
    echo "✅ API Local: Respondendo (200 OK)"
else
    echo "❌ API Local: Não respondeu corretamente"
    echo "🔍 Tentando curl detalhado:"
    curl -v http://localhost:3001/api/health 2>&1 | head -10
fi

# 4. Testar Nginx
echo ""
echo "🌐 4. Nginx e Frontend:"
NGINX_STATUS=$(curl -s -w "%{http_code}" -I https://tumihortifruti.com.br/gestao/ 2>/dev/null | tail -1)
if [ "$NGINX_STATUS" = "200" ]; then
    echo "✅ Nginx: Frontend acessível (200 OK)"
else
    echo "❌ Nginx: Frontend não acessível (código: $NGINX_STATUS)"
fi

# 5. Testar API via Nginx
echo ""
echo "🔗 5. API via Nginx:"
API_NGINX=$(curl -s -w "%{http_code}" https://tumihortifruti.com.br/gestao/api/health 2>/dev/null)
if echo "$API_NGINX" | grep -q "200"; then
    echo "✅ API via Nginx: Funcionando (200 OK)"
else
    echo "❌ API via Nginx: Não está funcionando"
    echo "🔍 Verificando configuração Nginx:"
    grep -A 5 -B 5 "gestao" /etc/nginx/sites-available/tumihortifruti.com.br | head -10
fi

# 6. Verificar logs se houver problema
echo ""
echo "📊 6. Status dos Serviços:"
systemctl is-active nginx postgres pm2 2>/dev/null || echo "Verificar manualmente: systemctl status nginx postgres"

# 7. Resumo
echo ""
echo "🎯 === RESUMO ==="
pm2 status | grep -q "tumi-gestao-api.*online" && echo "✅ PM2 OK" || echo "❌ PM2 Problema"
PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT 1;" &>/dev/null && echo "✅ Banco OK" || echo "❌ Banco Problema"
curl -s http://localhost:3001/api/health &>/dev/null && echo "✅ API Local OK" || echo "❌ API Local Problema"
curl -s https://tumihortifruti.com.br/gestao/api/health &>/dev/null && echo "✅ API Nginx OK" || echo "❌ API Nginx Problema"
curl -s -I https://tumihortifruti.com.br/gestao/ | grep -q "200" && echo "✅ Frontend OK" || echo "❌ Frontend Problema"

echo ""
if pm2 status | grep -q "tumi-gestao-api.*online" && curl -s https://tumihortifruti.com.br/gestao/api/health &>/dev/null; then
    echo "🎉 SISTEMA 100% FUNCIONAL!"
    echo "🌐 Acesse: https://tumihortifruti.com.br/gestao"
    echo "👤 Login: admin@tumihortifruti.com.br"
    echo "🔑 Senha: admin123"
else
    echo "⚠️  SISTEMA COM PROBLEMAS - Verifique os itens marcados com ❌"
fi
EOF

# Executar verificação
chmod +x /tmp/verificar_sistema.sh
/tmp/verificar_sistema.sh
✂️ FIM DO CÓDIGO
```

**🔍 VERIFICAR:** Se tudo estiver OK, deve mostrar "🎉 SISTEMA 100% FUNCIONAL!"

---

## 🎯 PASSO 9: Teste Final do Sistema

```bash
# Testar login (substitua se necessário)
curl -X POST https://tumihortifruti.com.br/gestao/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tumihortifruti.com.br","password":"admin123"}' \
  | jq '.'

echo ""
echo "🎉 DEPLOY CONCLUÍDO!"
echo ""
echo "📱 Acesse o sistema:"
echo "   🌐 URL: https://tumihortifruti.com.br/gestao"
echo "   👤 Login: admin@tumihortifruti.com.br"
echo "   🔑 Senha: admin123"
echo ""
echo "🔧 Comandos úteis:"
echo "   📊 Status: pm2 status"
echo "   📝 Logs: pm2 logs tumi-gestao-api"
echo "   🔄 Restart: pm2 restart tumi-gestao-api"
echo "   🛑 Parar: pm2 stop tumi-gestao-api"
echo ""
echo "⚠️  IMPORTANTE: Altere a senha padrão após primeiro login!"
```

---

## 🚨 Comandos de Emergência

### Se algo der errado:
```bash
# Restaurar backup do Nginx
sudo cp /etc/nginx/sites-available/tumihortifruti.com.br.backup /etc/nginx/sites-available/tumihortifruti.com.br
sudo systemctl reload nginx

# Parar aplicação
pm2 stop tumi-gestao-api
pm2 delete tumi-gestao-api

# Ver logs detalhados
tail -f /var/log/pm2/tumi-gestao-error.log
tail -f /var/log/nginx/error.log
```

### Verificar se tudo está funcionando:
```bash
# Status completo do sistema
echo "=== PM2 Status ==="
pm2 status

echo "=== Nginx Status ==="
sudo systemctl status nginx

echo "=== PostgreSQL Status ==="
sudo systemctl status postgresql

echo "=== Teste de Conectividade ==="
curl -s https://tumihortifruti.com.br/gestao/api/health | jq '.'
```

---

## ✅ CHECKLIST FINAL

Execute para verificar se tudo está correto:

```bash
echo "🔍 Verificando instalação completa..."

# 1. Verificar se PM2 está rodando
if pm2 status | grep -q "tumi-gestao-api.*online"; then
    echo "✅ PM2 - Aplicação rodando"
else
    echo "❌ PM2 - Aplicação não está rodando"
fi

# 2. Verificar se Nginx está configurado
if grep -q "location /gestao" /etc/nginx/sites-available/tumihortifruti.com.br; then
    echo "✅ Nginx - Configuração presente"
else
    echo "❌ Nginx - Configuração ausente"
fi

# 3. Verificar se API responde
if curl -s https://tumihortifruti.com.br/gestao/api/health | grep -q "ok\|healthy"; then
    echo "✅ API - Respondendo corretamente"
else
    echo "❌ API - Não está respondendo"
fi

# 4. Verificar se frontend carrega
if curl -s -I https://tumihortifruti.com.br/gestao | grep -q "200"; then
    echo "✅ Frontend - Acessível"
else
    echo "❌ Frontend - Não acessível"
fi

# 5. Verificar banco de dados
if PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT 1;" &>/dev/null; then
    echo "✅ Banco - Conectando corretamente"
else
    echo "❌ Banco - Problema de conexão"
fi

echo ""
echo "🎯 Se todos os itens estão ✅, seu sistema está 100% funcional!"
echo "🌐 Acesse: https://tumihortifruti.com.br/gestao"
```

---

## 🎉 SISTEMA PRONTO!

**Seguindo todos os passos acima em sequência, você terá:**

✅ Sistema 100% funcional em `https://tumihortifruti.com.br/gestao`  
✅ Site principal preservado e funcionando  
✅ API completa com autenticação  
✅ Banco de dados configurado  
✅ SSL funcionando  
✅ Monitoramento com PM2  
✅ Backup automático das configurações  
✅ Logs estruturados  

**Este documento é seu guia definitivo - não precisa de mais nada!**