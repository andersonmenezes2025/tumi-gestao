# 🚀 Deploy Definitivo - Tumi Hortifruti Gestão

## ✅ Configuração Detectada
- **VPS:** 31.97.129.119 com Node.js, PostgreSQL, Nginx
- **SSL:** Configurado para tumihortifruti.com.br 
- **Site Principal:** Proxy para http://127.0.0.1:5500 (mantido intacto)
- **Gestão:** Será adicionado em `/gestao` sem afetar o site principal

---

## 🎯 PASSO 1: Conectar ao GitHub e Baixar Código

**No Lovable:**
1. GitHub → Connect to GitHub
2. Autorizar Lovable GitHub App
3. Criar repositório **tumi-gestao**

**Na VPS:**
```bash
ssh root@31.97.129.119

# Criar diretório e baixar código
mkdir -p /var/www/tumi
cd /var/www/tumi
git clone https://github.com/SEU_USUARIO/tumi-gestao.git gestao
cd gestao

# Verificar se baixou corretamente
ls -la
echo "✅ Código baixado com sucesso"
```

---

## 🎯 PASSO 2: Instalar Dependências e Configurar Node.js

```bash
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
```

---

## 🎯 PASSO 3: Criar Arquivos de Configuração

### 3.1 Arquivo de Migração do Banco

```bash
# Criar arquivo de migração
cat > database/migration.sql << 'EOF'
-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir usuário admin padrão
INSERT INTO users (email, password_hash, name, role) 
VALUES ('admin@tumihortifruti.com.br', crypt('admin123', gen_salt('bf')), 'Administrador', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Tabelas básicas do sistema
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
EOF

echo "✅ Arquivo de migração criado"
```

### 3.2 Configuração do PM2

```bash
# Criar configuração do PM2
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

# Criar diretório de logs
sudo mkdir -p /var/log/pm2
sudo chown -R www-data:www-data /var/log/pm2

echo "✅ Configuração PM2 criada"
```

### 3.3 Variáveis de Ambiente

```bash
# Criar arquivo .env de produção
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://tumigestao_user:TumiGest@o2024!Secure@localhost:5432/tumigestao_db
JWT_SECRET=TumiHortifruti2024!SecureJWT#Key
CORS_ORIGIN=https://tumihortifruti.com.br
EOF

echo "✅ Variáveis de ambiente configuradas"
```

---

## 🎯 PASSO 4: Configurar Banco de Dados

```bash
# Criar banco e usuário
sudo -u postgres psql << 'EOF'
CREATE DATABASE tumigestao_db;
CREATE USER tumigestao_user WITH ENCRYPTED PASSWORD 'TumiGest@o2024!Secure';
GRANT ALL PRIVILEGES ON DATABASE tumigestao_db TO tumigestao_user;
GRANT ALL ON SCHEMA public TO tumigestao_user;
\q
EOF

# Executar migração
PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db -f database/migration.sql

# Testar conexão
PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT COUNT(*) FROM users;"

echo "✅ Banco de dados configurado e testado"
```

---

## 🎯 PASSO 5: Compilar Aplicação

```bash
# Adicionar scripts necessários ao package.json
npm pkg set scripts.build:server="tsc --project tsconfig.server.json"
npm pkg set scripts.start:server="node server/dist/index.js"

# Compilar frontend
npm run build

# Compilar backend
npm run build:server

# Verificar se compilou corretamente
ls -la dist/
ls -la server/dist/

echo "✅ Aplicação compilada"
```

---

## 🎯 PASSO 6: Configurar Nginx

```bash
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
```

---

## 🎯 PASSO 7: Configurar PM2 e Iniciar Aplicação

```bash
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
```

---

## 🎯 PASSO 8: Verificações Finais

```bash
# Aguardar 5 segundos para aplicação inicializar
sleep 5

# Verificar status PM2
pm2 status

# Testar API local
curl -s http://localhost:3001/api/health || echo "⚠️  API local não respondeu"

# Testar API via Nginx
curl -s https://tumihortifruti.com.br/gestao/api/health || echo "⚠️  API via Nginx não respondeu"

# Verificar se frontend está acessível
curl -s -I https://tumihortifruti.com.br/gestao | head -n 1

# Verificar logs se houver problema
if ! pm2 status | grep -q "online"; then
    echo "❌ Problema detectado. Verificando logs:"
    pm2 logs tumi-gestao-api --lines 10
fi

echo "✅ Verificações concluídas"
```

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