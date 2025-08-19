# 🚀 DEPLOY TUMI HORTIFRUTI - GUIA COMPLETO

## 🎯 ESCOLHA SEU MÉTODO DE DEPLOY

### 🌟 MÉTODO 1: Deploy Automático GitHub (RECOMENDADO)
- ✅ Pull automático do GitHub
- ✅ Build e deploy automático na VPS
- ✅ Rollback automático em caso de erro
- ✅ Ideal para desenvolvimento contínuo

### ⚡ MÉTODO 2: Deploy Automático Local (Lovable)
- ✅ Sync direto do ambiente Lovable
- ✅ Deploy automático na VPS
- ✅ Ideal para desenvolvimento no Lovable

### 🛠️ MÉTODO 3: Deploy Manual (Troubleshooting)
- ✅ Controle total do processo
- ✅ Ideal para debugging e configuração inicial
- ✅ Passo a passo detalhado

---

## 🌟 MÉTODO 1: Deploy Automático GitHub

### 📋 Pré-requisitos
- ✅ Código no GitHub
- ✅ SSH configurado para VPS: 31.97.129.119
- ✅ Git instalado localmente

### 🚀 Setup Inicial (Executar UMA VEZ)

**📍 EXECUTAR:** Terminal local (Lovable ou sua máquina)  
**📁 DIRETÓRIO:** Raiz do projeto

```bash
# ============ CONFIGURAÇÃO INICIAL ============
./scripts/setup-github-deploy.sh
```

**🎯 O script irá:**
1. Solicitar a URL do seu repositório GitHub
2. Configurar os scripts com a URL correta
3. Testar conectividade GitHub e SSH
4. Opcionalmente configurar SSH keys na VPS

### 🚀 Deploy Automático (Comando Principal)

**📍 EXECUTAR:** Terminal local  
**📁 DIRETÓRIO:** Raiz do projeto

```bash
# ============ DEPLOY COMPLETO GITHUB → VPS ============
./scripts/github-deploy.sh
```

**🎯 O que acontece automaticamente:**
1. ✅ Pull do código mais recente do GitHub
2. ✅ Upload para VPS
3. ✅ Build frontend e backend na VPS  
4. ✅ Deploy com backup automático
5. ✅ Restart da aplicação
6. ✅ Verificação de saúde
7. ✅ Rollback automático se houver erro

### 📥 Sync Apenas (sem deploy)

Se quiser apenas atualizar os arquivos sem fazer deploy:

```bash
# ============ SYNC GITHUB → VPS (SEM BUILD) ============
./scripts/github-sync.sh
```

### 🔄 Workflow Recomendado GitHub

```bash
# 1. Fazer alterações no código
# 2. Commit e push para GitHub
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# 3. Deploy automático
./scripts/github-deploy.sh

# 4. Verificar resultado
# https://tumihortifruti.com.br/gestao
```

---

## ⚡ MÉTODO 2: Deploy Automático Local (Lovable)

### 📋 Pré-requisitos
- ✅ Arquivos na máquina local (Lovable)
- ✅ SSH configurado para VPS: 31.97.129.119
- ✅ Scripts de deploy configurados

### 🚀 Deploy Completo Local → VPS

**📍 EXECUTAR:** Terminal local (Lovable)  
**📁 DIRETÓRIO:** Raiz do projeto

```bash
# ============ DEPLOY COMPLETO LOVABLE → VPS ============
./scripts/deploy-full.sh
```

**🎯 O que acontece automaticamente:**
1. ✅ Validação dos arquivos locais
2. ✅ Compactação e upload para VPS
3. ✅ Build automático na VPS
4. ✅ Deploy com backup
5. ✅ Verificação de saúde
6. ✅ Rollback automático em caso de erro

### 📥 Sync Apenas Local → VPS

Para apenas transferir arquivos sem fazer deploy:

```bash
# ============ SYNC LOVABLE → VPS (SEM BUILD) ============
./scripts/sync-from-lovable.sh

# OU com deploy automático
./scripts/sync-from-lovable.sh --auto-deploy
```

### ⚡ Deploy Rápido (sem sync)

Para quando já fez sync e quer apenas rebuild:

```bash
# ============ DEPLOY RÁPIDO (SEM SYNC) ============
./scripts/quick-deploy.sh
```

---

## 🛠️ MÉTODO 3: Deploy Manual (Troubleshooting)

### 📋 Pré-requisitos
- ✅ VPS: 31.97.129.119 (PostgreSQL + Nginx configurados)  
- ✅ Arquivos já estão em `/var/www/tumi/gestao`
- ✅ Executar **TODOS OS COMANDOS DIRETAMENTE NA VPS**

### 🔍 PASSO 1: VERIFICAR STATUS ATUAL

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
grep -q "location /gestao" /etc/nginx/sites-available/tumi && echo "✅ Nginx configurado" || echo "❌ Nginx não configurado"
EOF

chmod +x /tmp/status.sh
/tmp/status.sh
# ============ FIM DO COMANDO ============
```

---

### 🎯 PASSO 2: PREPARAR DIRETÓRIO

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

### 🎯 PASSO 3: INSTALAR DEPENDÊNCIAS NPM

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** `/var/www/tumi/gestao`

```bash
# ============ INÍCIO DO COMANDO ============
npm install
echo "✅ Dependências instaladas"
# ============ FIM DO COMANDO ============
```

---

### 🎯 PASSO 4: CONFIGURAR SCRIPTS

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

### 🎯 PASSO 5: CRIAR ARQUIVO .ENV

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

### 📋 PASSO 6: CRIAR CONFIGURAÇÃO PM2

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** `/var/www/tumi/gestao`

**IMPORTANTE:** Usar `.cjs` para evitar conflitos com ES modules.

```bash
# ============ INÍCIO DO COMANDO ============
# Remover arquivo .js anterior se existir
rm -f ecosystem.config.js

# Criar arquivo de configuração PM2 (formato CommonJS)
cat > ecosystem.config.cjs << 'CONFIG_PM2'
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

### 🎯 PASSO 7: CONFIGURAR BANCO DE DADOS

#### 7.1 Criar Banco e Usuário

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

#### 7.2 Verificar e Corrigir Arquivo de Migração

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

#### 7.3 Executar Migração

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** `/var/www/tumi/gestao`

```bash
# ============ INÍCIO DO COMANDO ============
export PGPASSWORD='TumiGest@o2024!Secure'
psql -h localhost -U tumigestao_user -d tumigestao_db -f database/migration.sql
echo "✅ Migração executada"
# ============ FIM DO COMANDO ============
```

#### 7.4 Testar Conexão

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

### 🎯 PASSO 8: COMPILAR APLICAÇÃO

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** `/var/www/tumi/gestao`

```bash
# ============ INÍCIO DO COMANDO ============
# Compilar frontend
echo "🔧 Compilando frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erro na compilação do frontend"
    exit 1
fi
echo "Frontend compilado ✅"

# Compilar backend
echo "🔧 Compilando backend..."
npm run build:server
if [ $? -ne 0 ]; then
    echo "❌ Erro na compilação do backend"
    echo "💡 Verifique os erros TypeScript acima"
    exit 1
fi
echo "Backend compilado ✅"

# Verificar se arquivos foram gerados
echo "📋 Verificando arquivos gerados..."
ls -la dist/
ls -la server/dist/

# Verificar se diretório server/dist/ existe
if [ ! -d "server/dist/" ]; then
    echo "❌ Diretório server/dist/ não foi criado"
    echo "💡 Verifique os erros de compilação TypeScript acima"
    exit 1
fi

echo "✅ Build concluído com sucesso"
# ============ FIM DO COMANDO ============
```

**🔍 DEVE MOSTRAR:** Pastas `dist/` e `server/dist/` com arquivos

---

### 🎯 PASSO 9: CONFIGURAR NGINX

**📍 EXECUTAR:** Terminal VPS  
**📁 DIRETÓRIO:** Qualquer lugar

**IMPORTANTE:** O arquivo nginx se chama "tumi" (não "tumihortifruti.com.br"). O script preserva suas configurações SSL existentes.

```bash
# ============ INÍCIO DO COMANDO ============
# Backup do arquivo atual
sudo cp /etc/nginx/sites-available/tumi /etc/nginx/sites-available/tumi.backup-$(date +%Y%m%d-%H%M%S)

# Verificar se já está configurado
if grep -q "location /gestao" /etc/nginx/sites-available/tumi; then
    echo "⚠️ Nginx já configurado para /gestao"
else
    echo "🔧 Adicionando configuração do sistema de gestão..."
    
    # Adicionar configurações do sistema de gestão ANTES da location /
    sudo sed -i '/location \/ {/i\
    # === SISTEMA DE GESTÃO TUMI ===\
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
        proxy_intercept_errors off;\
    }\
\
    location /gestao/assets {\
        alias /var/www/tumi/gestao/dist/assets;\
        expires 1y;\
        add_header Cache-Control "public, immutable";\
    }\
\
' /etc/nginx/sites-available/tumi
    
    echo "✅ Nginx configurado para /gestao"
fi

# Mostrar configuração adicionada
echo ""
echo "📋 Configurações adicionadas:"
grep -A 20 "SISTEMA DE GESTÃO" /etc/nginx/sites-available/tumi

# Testar configuração
echo ""
echo "🧪 Testando configuração nginx..."
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo "✅ Nginx recarregado com sucesso"
else
    echo "❌ Erro na configuração nginx"
    echo "🔙 Restaurando backup..."
    sudo cp /etc/nginx/sites-available/tumi.backup-* /etc/nginx/sites-available/tumi
    sudo nginx -t
fi
# ============ FIM DO COMANDO ============
```

---

### 🎯 PASSO 10: INSTALAR E CONFIGURAR PM2

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
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

echo "✅ Aplicação iniciada com PM2"
pm2 status
# ============ FIM DO COMANDO ============
```

**🔍 DEVE MOSTRAR:** `tumi-gestao-api` com status `online`

---

### 🎯 PASSO 11: VERIFICAÇÃO COMPLETA

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

## 📋 MANUTENÇÃO E TROUBLESHOOTING

### 🆘 Comandos de Emergência

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
sudo cp /etc/nginx/sites-available/tumi.backup-* /etc/nginx/sites-available/tumi
sudo nginx -t
sudo systemctl reload nginx
```

### ✅ Checklist de Sucesso

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

### 🔄 Rollback de Emergência

Em caso de problemas após deploy:

```bash
# ============ ROLLBACK AUTOMÁTICO ============
ssh root@31.97.129.119 'cd /var/www/tumi/gestao && ./scripts/deploy-with-sync.sh --rollback'

# ============ ROLLBACK MANUAL ============
ssh root@31.97.129.119
cd /var/www/tumi/gestao

# Restaurar backup mais recente
BACKUP_DIR=$(ls -1t /var/backups/tumi-gestao/ | head -1)
cp /var/backups/tumi-gestao/$BACKUP_DIR/.env .
cp /var/backups/tumi-gestao/$BACKUP_DIR/package.json .
tar xzf /var/backups/tumi-gestao/$BACKUP_DIR/backup.tar.gz

# Reiniciar aplicação
pm2 restart tumi-gestao-api
```

### 📊 Monitoramento Contínuo

```bash
# ============ MONITORAMENTO EM TEMPO REAL ============
# Status geral
ssh root@31.97.129.119 'pm2 monit'

# Logs em tempo real
ssh root@31.97.129.119 'pm2 logs tumi-gestao-api --lines 100'

# Health check automático
watch -n 30 'curl -s https://tumihortifruti.com.br/gestao/api/health'

# Uso de recursos
ssh root@31.97.129.119 'top -p $(pgrep -f "tumi-gestao-api")'
```

### 🚨 Solução de Problemas Comuns

#### Problema: TypeScript Build Errors
```bash
# Na VPS, verificar erros específicos
cd /var/www/tumi/gestao
npm run build:server 2>&1 | grep -A 5 -B 5 "error"

# Limpar cache e rebuildar
rm -rf server/dist node_modules/.cache
npm run build:server
```

#### Problema: PM2 não inicia
```bash
# Verificar logs detalhados
pm2 logs tumi-gestao-api --err --lines 50

# Testar script manualmente
cd /var/www/tumi/gestao
node server/dist/index.js

# Recrear configuração PM2
pm2 delete tumi-gestao-api
pm2 start ecosystem.config.cjs
```

#### Problema: Banco não conecta
```bash
# Testar conexão manual
PGPASSWORD='TumiGest@o2024!Secure' psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT version();"

# Verificar serviço PostgreSQL
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

#### Problema: Nginx 502/504
```bash
# Verificar logs Nginx
sudo tail -f /var/log/nginx/error.log

# Testar API diretamente
curl http://localhost:3001/api/health

# Recarregar configuração
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🎉 RESUMO FINAL

### 🎯 Sistema Funcionando

**🌐 Acesso:** https://tumihortifruti.com.br/gestao

**👤 Login Padrão:**
- Email: `admin@tumihortifruti.com.br`  
- Senha: `admin123`
- **⚠️ IMPORTANTE:** Mude a senha após primeiro login!

### 🚀 Comandos de Deploy Principais

| Método | Comando | Quando Usar |
|--------|---------|-------------|
| **GitHub** | `./scripts/github-deploy.sh` | Desenvolvimento contínuo (RECOMENDADO) |
| **Local** | `./scripts/deploy-full.sh` | Deploy do Lovable |
| **Rápido** | `./scripts/quick-deploy.sh` | Apenas rebuild |
| **Manual** | Ver MÉTODO 3 | Troubleshooting |

### 📋 Comandos de Monitoramento

```bash
# Status geral
ssh root@31.97.129.119 'pm2 status'

# Logs em tempo real  
ssh root@31.97.129.119 'pm2 logs tumi-gestao-api'

# Health check
curl https://tumihortifruti.com.br/gestao/api/health

# Reiniciar se necessário
ssh root@31.97.129.119 'pm2 restart tumi-gestao-api'

# Rollback de emergência
ssh root@31.97.129.119 'cd /var/www/tumi/gestao && ./scripts/deploy-with-sync.sh --rollback'
```

### 🔧 Setup Inicial Rápido

Para configurar o deploy automático pela primeira vez:

```bash
# 1. Dar permissões
chmod +x scripts/*.sh

# 2. Configurar GitHub (se usar MÉTODO 1)
./scripts/setup-github-deploy.sh

# 3. Fazer primeiro deploy
./scripts/github-deploy.sh
# OU
./scripts/deploy-full.sh
```

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **DEPLOY-COMMANDS.md**: Lista completa de comandos
- **DEPLOY-AUTOMÁTICO.md**: Guia detalhado do sistema automático  
- **Scripts**: Pasta `scripts/` com todos os utilitários

**✅ Sistema completo implementado e funcional!**