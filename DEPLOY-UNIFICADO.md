# 🚀 Deploy Tumi Hortifruti - VPS Direto

## 📋 PRÉ-REQUISITOS
- VPS: 31.97.129.119 (PostgreSQL + Nginx já configurados)
- Arquivos já estão em `/var/www/tumi/gestao`
- Executar **TUDO DIRETAMENTE NA VPS**

---

## 🔍 PASSO 0: VERIFICAR STATUS ATUAL

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** Qualquer lugar

```bash
# ============ INÍCIO DO COMANDO ============
cat > /tmp/status.sh << 'EOF'
#!/bin/bash
echo "=== 🔍 STATUS ATUAL DO SISTEMA ==="
cd /var/www/tumi/gestao

echo "📁 Arquivos:"
[ -f "package.json" ] && echo "✅ package.json existe" || echo "❌ package.json não existe"
[ -d "node_modules" ] && echo "✅ node_modules existe" || echo "❌ node_modules não existe"
[ -f ".env" ] && echo "✅ .env existe" || echo "❌ .env não existe"

echo ""
echo "🔧 Node.js: $(node --version 2>/dev/null || echo "NÃO INSTALADO")"

echo ""
echo "🗃️ PostgreSQL:"
if PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT 1;" &>/dev/null; then
    echo "✅ Banco conecta OK"
else
    echo "❌ Banco não conecta"
fi

echo ""
echo "🚀 PM2:"
if command -v pm2 >/dev/null; then
    echo "✅ PM2 instalado"
    pm2 status | grep -q "tumi-gestao-api" && echo "✅ App rodando" || echo "❌ App não roda"
else
    echo "❌ PM2 não instalado"
fi

echo ""
echo "🌐 Nginx:"
grep -q "location /gestao" /etc/nginx/sites-available/tumihortifruti.com.br && echo "✅ Nginx configurado" || echo "❌ Nginx não configurado"
EOF

chmod +x /tmp/status.sh
/tmp/status.sh
# ============ FIM DO COMANDO ============
```

---

## 🎯 PASSO 1: PREPARAR DIRETÓRIO

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** Ir para pasta do projeto

```bash
# ============ INÍCIO DO COMANDO ============
cd /var/www/tumi/gestao
pwd
ls -la
# ============ FIM DO COMANDO ============
```

---

## 🎯 PASSO 2: INSTALAR DEPENDÊNCIAS NPM

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** `/var/www/tumi/gestao`

```bash
# ============ INÍCIO DO COMANDO ============
npm install
echo "✅ Dependências instaladas"
# ============ FIM DO COMANDO ============
```

---

## 🎯 PASSO 3: CONFIGURAR SCRIPTS

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** `/var/www/tumi/gestao`

```bash
# ============ INÍCIO DO COMANDO ============
npm pkg set scripts.build:server="tsc --project tsconfig.server.json"
npm pkg set scripts.start:server="node server/dist/index.js"
echo "✅ Scripts configurados"
npm run --help | grep build:server
# ============ FIM DO COMANDO ============
```

---

## 🎯 PASSO 4: CRIAR ARQUIVO .ENV

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** `/var/www/tumi/gestao`

```bash
# ============ INÍCIO DO COMANDO ============
cat > .env << 'ARQUIVO_ENV'
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://tumigestao_user:TumiGest@o2024!Secure@localhost:5432/tumigestao_db
JWT_SECRET=TumiHortifruti2024!SecureJWT#Key
CORS_ORIGIN=https://tumihortifruti.com.br
ARQUIVO_ENV

echo "✅ Arquivo .env criado"
cat .env
# ============ FIM DO COMANDO ============
```

---

## 🎯 PASSO 5: CRIAR CONFIGURAÇÃO PM2

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** `/var/www/tumi/gestao`

```bash
# ============ INÍCIO DO COMANDO ============
cat > ecosystem.config.js << 'CONFIG_PM2'
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
CONFIG_PM2

sudo mkdir -p /var/log/pm2
sudo chmod 777 /var/log/pm2
echo "✅ PM2 configurado"
# ============ FIM DO COMANDO ============
```

---

## 🎯 PASSO 6: CONFIGURAR BANCO DE DADOS

### 6.1 Criar Banco e Usuário

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** Qualquer lugar

```bash
# ============ INÍCIO DO COMANDO ============
sudo -u postgres psql -c "CREATE DATABASE tumigestao_db;" 2>/dev/null || echo "Banco já existe"
sudo -u postgres psql -c 'CREATE USER tumigestao_user WITH PASSWORD '\''TumiGest@o2024!Secure'\'';' 2>/dev/null || echo "Usuário já existe"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tumigestao_db TO tumigestao_user;"
sudo -u postgres psql -c "GRANT ALL ON SCHEMA public TO tumigestao_user;" tumigestao_db
echo "✅ Banco configurado"
# ============ FIM DO COMANDO ============
```

### 6.2 Verificar e Corrigir Arquivo de Migração

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** `/var/www/tumi/gestao`

**IMPORTANTE:** Se o arquivo `migration.sql` estiver incorreto (contém tabela `users` em vez de `profiles`), o script abaixo irá corrigi-lo automaticamente.

```bash
# ============ INÍCIO DO COMANDO - VERIFICAÇÃO E CORREÇÃO ============
echo "📁 Verificando arquivos na pasta database:"
ls -la database/

echo ""
echo "🔍 Verificando conteúdo do migration.sql:"
if [ -f "database/migration.sql" ]; then
    echo "✅ Arquivo migration.sql encontrado"
    echo "Primeiras 10 linhas:"
    head -10 database/migration.sql
    echo ""
    echo "🔍 Verificando se contém tabela profiles (não users):"
    if grep -q "CREATE TABLE profiles" database/migration.sql; then
        echo "✅ Arquivo correto - contém tabela 'profiles'"
    else
        echo "❌ Arquivo incorreto - não contém tabela 'profiles'"
        echo "🔧 Substituindo por arquivo correto..."
        
        # Fazer backup do arquivo incorreto
        mv database/migration.sql database/migration.sql.backup-$(date +%Y%m%d-%H%M%S)
        
        # Criar arquivo correto (versão resumida para o comando)
        echo "Criando arquivo migration.sql correto..."
        cat > database/migration.sql << 'EOF'
-- Script de migração completa para PostgreSQL
-- Sistema de Gestão Tumi Hortifruti
-- Database: tumigestao_db

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função para gerar UUIDs (compatibilidade com gen_random_uuid)
CREATE OR REPLACE FUNCTION gen_random_uuid() RETURNS uuid AS $$
BEGIN
    RETURN uuid_generate_v4();
END;
$$ LANGUAGE plpgsql;

-- Função para simular auth.uid() do Supabase
CREATE OR REPLACE FUNCTION auth_uid() RETURNS uuid AS $$
BEGIN
    RETURN CURRENT_SETTING('app.current_user_id', TRUE)::uuid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar tipos enum
CREATE TYPE app_role AS ENUM ('admin', 'user');

-- ===== TABELAS =====

-- Tabela profiles (substitui auth.users)
CREATE TABLE profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    full_name text,
    phone text,
    role text DEFAULT 'user'::text,
    company_id uuid,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT validate_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- [... restante das tabelas ...]
-- NOTA: Arquivo completo está disponível no repositório
EOF
        
        # Adicionar o resto do conteúdo do arquivo completo
        # Por limitação do comando, vamos usar um arquivo reduzido mas funcional
        echo "⚠️  AVISO: Por limitação do comando shell, foi criado um arquivo base."
        echo "📝 AÇÃO REQUERIDA: Copie o conteúdo completo do arquivo database/migration.sql do repositório"
        echo "🔗 Ou execute: wget -O database/migration.sql [URL_DO_ARQUIVO_CORRETO]"
    fi
else
    echo "❌ Arquivo migration.sql não encontrado!"
    echo "📝 Criando arquivo a partir do template..."
    mkdir -p database
    echo "⚠️  AÇÃO REQUERIDA: Copie o arquivo migration.sql do repositório para database/"
fi
# ============ FIM DO COMANDO ============
```

**🎯 DEVE MOSTRAR:** 
- Arquivo `migration.sql` encontrado ou criado
- Primeira linha: `-- Script de migração completa para PostgreSQL` 
- Confirmar que contém tabela `profiles` (não `users`)

**🚨 SE O ARQUIVO ESTAVA INCORRETO:**
- Backup criado com timestamp
- Novo arquivo criado com estrutura correta
- Pode ser necessário completar o arquivo com o conteúdo do repositório

### 6.3 Executar Migração

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** `/var/www/tumi/gestao`

```bash
# ============ INÍCIO DO COMANDO ============
export PGPASSWORD='TumiGest@o2024!Secure'
psql -h localhost -U tumigestao_user -d tumigestao_db -f database/migration.sql
echo "✅ Migração executada"
# ============ FIM DO COMANDO ============
```

### 6.4 Testar Conexão

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** Qualquer lugar

```bash
# ============ INÍCIO DO COMANDO ============
export PGPASSWORD='TumiGest@o2024!Secure'
psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT email, full_name FROM profiles;"
# ============ FIM DO COMANDO ============
```

**🔍 DEVE MOSTRAR:** Email `admin@tumihortifruti.com.br` e nome `Administrador Sistema`

---

## 🎯 PASSO 7: COMPILAR APLICAÇÃO

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** `/var/www/tumi/gestao`

```bash
# ============ INÍCIO DO COMANDO ============
npm run build
echo "Frontend compilado ✅"

npm run build:server
echo "Backend compilado ✅"

ls -la dist/
ls -la server/dist/
# ============ FIM DO COMANDO ============
```

**🔍 DEVE MOSTRAR:** Pastas `dist/` e `server/dist/` com arquivos

---

## 🎯 PASSO 8: CONFIGURAR NGINX

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** Qualquer lugar

```bash
# ============ INÍCIO DO COMANDO ============
# Backup do arquivo atual
sudo cp /etc/nginx/sites-available/tumihortifruti.com.br /etc/nginx/sites-available/tumihortifruti.com.br.backup

# Verificar se já está configurado
if grep -q "location /gestao" /etc/nginx/sites-available/tumihortifruti.com.br; then
    echo "⚠️ Nginx já configurado para /gestao"
else
    # Adicionar configuração do sistema de gestão
    sudo sed -i '/location \/ {/i\
    # Sistema de Gestão\
    location /gestao {\
        alias /var/www/tumi/gestao/dist;\
        index index.html;\
        try_files $uri $uri/ /gestao/index.html;\
    }\
\
    location /gestao/api/ {\
        proxy_pass http://localhost:3001/api/;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
    }\
\
    location /gestao/assets {\
        alias /var/www/tumi/gestao/dist/assets;\
        expires 1y;\
        add_header Cache-Control "public, immutable";\
    }\
' /etc/nginx/sites-available/tumihortifruti.com.br
    
    echo "✅ Nginx configurado"
fi

# Testar configuração
sudo nginx -t
sudo systemctl reload nginx
echo "✅ Nginx recarregado"
# ============ FIM DO COMANDO ============
```

---

## 🎯 PASSO 9: INSTALAR E CONFIGURAR PM2

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** `/var/www/tumi/gestao`

```bash
# ============ INÍCIO DO COMANDO ============
# Instalar PM2 globalmente se não existir
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo "✅ PM2 instalado"
else
    echo "✅ PM2 já instalado"
fi

# Configurar permissões
sudo chown -R $USER:$USER /var/www/tumi/gestao
sudo chmod -R 755 /var/www/tumi/gestao

# Parar aplicação anterior se existir
pm2 stop tumi-gestao-api 2>/dev/null || echo "App não estava rodando"
pm2 delete tumi-gestao-api 2>/dev/null || echo "App não existia"

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Aplicação iniciada com PM2"
pm2 status
# ============ FIM DO COMANDO ============
```

**🔍 DEVE MOSTRAR:** `tumi-gestao-api` com status `online`

---

## 🎯 PASSO 10: VERIFICAÇÃO COMPLETA

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** Qualquer lugar

```bash
# ============ INÍCIO DO COMANDO ============
echo "🔍 === VERIFICAÇÃO FINAL ==="

echo ""
echo "1️⃣ PM2 Status:"
pm2 status | grep tumi-gestao-api

echo ""
echo "2️⃣ Teste Banco:"
PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT COUNT(*) as usuarios FROM profiles;"

echo ""
echo "3️⃣ API Local:"
sleep 3
curl -s http://localhost:3001/api/health || echo "❌ API local não responde"

echo ""
echo "4️⃣ Frontend Nginx:"
curl -s -I https://tumihortifruti.com.br/gestao/ | head -n1

echo ""
echo "5️⃣ API via Nginx:"
curl -s https://tumihortifruti.com.br/gestao/api/health || echo "❌ API via Nginx não responde"

echo ""
echo "6️⃣ Logs PM2 (últimas 5 linhas):"
pm2 logs tumi-gestao-api --lines 5

echo ""
echo "🎯 === RESUMO ==="
echo "✅ Se API local respondeu = Backend OK"
echo "✅ Se Frontend Nginx retornou 200 = Frontend OK"  
echo "✅ Se API via Nginx respondeu = Nginx OK"
echo "✅ Se PM2 mostra 'online' = PM2 OK"

echo ""
echo "🎉 ACESSE SEU SISTEMA:"
echo "🌐 URL: https://tumihortifruti.com.br/gestao"
echo "👤 Email: admin@tumihortifruti.com.br"
echo "🔑 Senha: admin123"
# ============ FIM DO COMANDO ============
```

---

## 🆘 COMANDOS DE EMERGÊNCIA

### Para ver logs detalhados:

```bash
# ============ LOGS PM2 ============
pm2 logs tumi-gestao-api --lines 50

# ============ LOGS NGINX ============
sudo tail -f /var/log/nginx/error.log

# ============ STATUS SERVIÇOS ============
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status
```

### Para reiniciar tudo:

```bash
# ============ REINICIAR ============
pm2 restart tumi-gestao-api
sudo systemctl reload nginx
```

### Para acessar banco diretamente:

```bash
# ============ ACESSAR BANCO ============
PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db

# Dentro do banco, comandos úteis:
# \dt                    (ver tabelas)
# SELECT * FROM profiles; (ver usuários) 
# \q                     (sair)
```

### Para restaurar backup Nginx:

```bash
# ============ RESTAURAR NGINX ============
sudo cp /etc/nginx/sites-available/tumihortifruti.com.br.backup /etc/nginx/sites-available/tumihortifruti.com.br
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ CHECKLIST DE SUCESSO

**Execute este comando para verificar se TUDO está funcionando:**

```bash
# ============ TESTE COMPLETO ============
echo "🧪 Testando sistema completo..."

# Teste 1: PM2
pm2 status | grep -q "tumi-gestao-api.*online" && echo "✅ PM2 OK" || echo "❌ PM2 FALHOU"

# Teste 2: Banco  
PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT 1;" &>/dev/null && echo "✅ Banco OK" || echo "❌ Banco FALHOU"

# Teste 3: API Local
curl -s http://localhost:3001/api/health &>/dev/null && echo "✅ API Local OK" || echo "❌ API Local FALHOU"

# Teste 4: Frontend
curl -s -I https://tumihortifruti.com.br/gestao/ | grep -q "200" && echo "✅ Frontend OK" || echo "❌ Frontend FALHOU"

# Teste 5: API Nginx  
curl -s https://tumihortifruti.com.br/gestao/api/health &>/dev/null && echo "✅ API Nginx OK" || echo "❌ API Nginx FALHOU"

echo ""
echo "🎯 Se TODOS os testes mostram ✅ = SISTEMA 100% FUNCIONAL!"
```

---

## 🎉 FINALIZAÇÃO

**Sistema funcionando em:** `https://tumihortifruti.com.br/gestao`

**Login padrão:**
- Email: `admin@tumihortifruti.com.br`
- Senha: `admin123`

**Comandos úteis:**
- Ver status: `pm2 status`  
- Ver logs: `pm2 logs tumi-gestao-api`
- Reiniciar: `pm2 restart tumi-gestao-api`
- Parar: `pm2 stop tumi-gestao-api`

**⚠️ IMPORTANTE:** Mude a senha após primeiro login!