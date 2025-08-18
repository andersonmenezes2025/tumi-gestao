# 🚀 Deploy Unificado - Tumi Hortifruti Gestão

## 📋 Visão Geral do Sistema

**Infraestrutura Atual:**
- VPS: 31.97.129.119 (Hostinger)
- Domínio: tumihortifruti.com.br (SSL configurado)
- Estrutura: Site principal em `/var/www/tumi`, Sistema em `/var/www/tumi/gestao`
- Stack: Node.js, PostgreSQL, Nginx, PM2

**Workflow de Deploy:**
```
Lovable → GitHub → Automated Deploy → Production
```

---

## 🔧 Setup Inicial (Execute Uma Vez)

### 1. Conectar Lovable ao GitHub

No Lovable:
1. Clique em **GitHub** → **Connect to GitHub**
2. Autorize a Lovable GitHub App
3. Selecione sua conta/organização
4. Crie o repositório **tumi-gestao**

### 2. Configurar Webhook de Deploy na VPS

```bash
# SSH na VPS
ssh root@31.97.129.119

# Criar script de deploy automatizado
sudo tee /var/www/tumi/deploy-webhook.sh > /dev/null << 'EOF'
#!/bin/bash

# Deploy automatizado via GitHub webhook
set -e

APP_DIR="/var/www/tumi/gestao"
BACKUP_DIR="/var/backups/tumi-gestao/auto-$(date +%Y%m%d_%H%M%S)"
REPO_URL="https://github.com/SEU_USUARIO/tumi-gestao.git"

echo "🔄 Deploy automático iniciado: $(date)"

# Backup antes do deploy
if [ -d "$APP_DIR" ]; then
    echo "💾 Fazendo backup..."
    mkdir -p $BACKUP_DIR
    cp -r $APP_DIR $BACKUP_DIR/
fi

# Clone/Pull do repositório
if [ ! -d "$APP_DIR/.git" ]; then
    echo "📥 Clonando repositório..."
    rm -rf $APP_DIR
    git clone $REPO_URL $APP_DIR
else
    echo "📥 Atualizando repositório..."
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/main
fi

cd $APP_DIR

# Instalar dependências apenas se package.json mudou
if [ ! -f "node_modules/.installed" ] || [ "package.json" -nt "node_modules/.installed" ]; then
    echo "📦 Instalando dependências..."
    npm ci --production=false
    touch node_modules/.installed
fi

# Build da aplicação
echo "🔨 Fazendo build..."
npm run build
npm run build:server

# Configurar ambiente de produção
echo "⚙️ Configurando ambiente..."
tee .env > /dev/null << 'ENV_EOF'
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tumigestao_db
DB_USER=tumigestao_user
DB_PASSWORD=TumiGest@o2024!Secure
JWT_SECRET=tumi-gestao-jwt-secret-production-2024
PRODUCTION_URL=https://tumihortifruti.com.br
ENV_EOF

# Aplicar migrações do banco
if [ -f "database/migration.sql" ]; then
    echo "🗄️ Aplicando migrações..."
    sudo -u postgres psql -d tumigestao_db -f database/migration.sql || true
fi

# Configurar permissões
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR
sudo chmod 600 $APP_DIR/.env

# Restart da aplicação com zero downtime
echo "🔄 Reiniciando aplicação..."
if pm2 describe tumi-gestao-api > /dev/null 2>&1; then
    pm2 reload tumi-gestao-api
else
    pm2 start ecosystem.config.js
fi

pm2 save

# Recarregar Nginx
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deploy concluído com sucesso: $(date)"

# Health check
sleep 3
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "🎉 Aplicação funcionando!"
    # Log do sucesso
    echo "$(date): Deploy SUCCESS" >> /var/log/tumi-gestao-deploy.log
else
    echo "❌ Erro no health check - verificar logs"
    pm2 logs tumi-gestao-api --lines 10
    echo "$(date): Deploy FAILED - Health check" >> /var/log/tumi-gestao-deploy.log
    exit 1
fi
EOF

# Dar permissões
chmod +x /var/www/tumi/deploy-webhook.sh

# Criar arquivo de log
sudo touch /var/log/tumi-gestao-deploy.log
sudo chown www-data:www-data /var/log/tumi-gestao-deploy.log
```

### 3. Configurar Ecosystem PM2

```bash
# Criar configuração PM2 otimizada
cd /var/www/tumi/gestao
tee ecosystem.config.js > /dev/null << 'EOF'
module.exports = {
  apps: [{
    name: 'tumi-gestao-api',
    script: 'server/dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/tumi-gestao/error.log',
    out_file: '/var/log/tumi-gestao/out.log',
    log_file: '/var/log/tumi-gestao/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s',
    max_memory_restart: '500M',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'dist'],
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF

# Criar diretório de logs
sudo mkdir -p /var/log/tumi-gestao
sudo chown -R www-data:www-data /var/log/tumi-gestao
```

### 4. Configurar Nginx para Subpath

```bash
# Backup da configuração atual
sudo cp /etc/nginx/sites-available/tumihortifruti.com.br /etc/nginx/sites-available/tumihortifruti.com.br.backup

# Atualizar configuração do Nginx
sudo tee /etc/nginx/sites-available/tumihortifruti.com.br > /dev/null << 'EOF'
server {
    listen 80;
    server_name tumihortifruti.com.br www.tumihortifruti.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tumihortifruti.com.br www.tumihortifruti.com.br;

    # SSL Configuration (mantém suas configurações existentes)
    ssl_certificate /etc/letsencrypt/live/tumihortifruti.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tumihortifruti.com.br/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'" always;

    # Site principal (mantém sua configuração atual)
    location / {
        root /var/www/tumi;
        index index.html index.htm;
        try_files $uri $uri/ =404;
    }

    # Sistema de Gestão - Frontend
    location /gestao {
        alias /var/www/tumi/gestao/dist;
        index index.html;
        try_files $uri $uri/ /gestao/index.html;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Sistema de Gestão - API
    location /gestao/api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Assets do sistema
    location /gestao/assets {
        alias /var/www/tumi/gestao/dist/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Testar e recarregar Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Configurar Banco de Dados

```bash
# Criar banco e usuário se não existirem
sudo -u postgres psql << 'EOF'
-- Criar banco se não existir
SELECT 'CREATE DATABASE tumigestao_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tumigestao_db')\gexec

-- Criar usuário se não existir
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'tumigestao_user') THEN
      CREATE USER tumigestao_user WITH ENCRYPTED PASSWORD 'TumiGest@o2024!Secure';
   END IF;
END
$$;

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE tumigestao_db TO tumigestao_user;
GRANT ALL ON SCHEMA public TO tumigestao_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tumigestao_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tumigestao_user;

\q
EOF
```

---

## 🎯 Deploy Manual (Primeira Vez)

### 1. Na VPS, execute o deploy inicial:

```bash
# SSH na VPS
ssh root@31.97.129.119

# Configurar URL do seu repositório GitHub
REPO_URL="https://github.com/SEU_USUARIO/tumi-gestao.git"
sed -i "s|REPO_URL=\".*\"|REPO_URL=\"$REPO_URL\"|" /var/www/tumi/deploy-webhook.sh

# Executar primeiro deploy
/var/www/tumi/deploy-webhook.sh
```

### 2. Verificar se tudo está funcionando:

```bash
# Status da aplicação
pm2 status

# Logs em tempo real
pm2 logs tumi-gestao-api

# Testar API
curl http://localhost:3001/api/health

# Testar no browser
# https://tumihortifruti.com.br/gestao
```

---

## 🔄 Deploys Futuros (Totalmente Automatizado)

### Opção 1: GitHub Actions (Recomendado)

Crie `.github/workflows/deploy.yml` no seu repositório:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v0.1.7
      with:
        host: 31.97.129.119
        username: root
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          /var/www/tumi/deploy-webhook.sh
```

**Setup dos Secrets no GitHub:**
1. Gere uma chave SSH: `ssh-keygen -t rsa -b 4096 -C "github-actions"`
2. Adicione a chave pública na VPS: `cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys`
3. No GitHub: Settings → Secrets → Add `VPS_SSH_KEY` (chave privada)

### Opção 2: Deploy Manual via Git

```bash
# No Lovable, após mudanças, commit será automático para GitHub
# Na VPS, execute:
ssh root@31.97.129.119
/var/www/tumi/deploy-webhook.sh
```

### Opção 3: Script Local de Deploy

Crie este script na sua máquina local:

```bash
#!/bin/bash
# deploy-remoto.sh

echo "🚀 Executando deploy no servidor..."
ssh root@31.97.129.119 '/var/www/tumi/deploy-webhook.sh'

if [ $? -eq 0 ]; then
    echo "✅ Deploy concluído com sucesso!"
    echo "🌐 Acesse: https://tumihortifruti.com.br/gestao"
else
    echo "❌ Erro no deploy - verificar logs no servidor"
fi
```

---

## 📊 Monitoramento e Manutenção

### Scripts de Monitoramento

```bash
# Status completo do sistema
alias tumi-status='pm2 status && systemctl status nginx && systemctl status postgresql'

# Logs em tempo real
alias tumi-logs='pm2 logs tumi-gestao-api --lines 50'

# Health check completo
alias tumi-health='curl -s http://localhost:3001/api/health && echo "" && curl -s -I https://tumihortifruti.com.br/gestao'

# Restart seguro
alias tumi-restart='pm2 reload tumi-gestao-api'
```

### Backup Automático

```bash
# Criar script de backup diário
sudo tee /var/www/tumi/backup-daily.sh > /dev/null << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/tumi-gestao/daily-$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup do código
cp -r /var/www/tumi/gestao $BACKUP_DIR/

# Backup do banco
sudo -u postgres pg_dump tumigestao_db > $BACKUP_DIR/database.sql

# Manter apenas os últimos 7 dias
find /var/backups/tumi-gestao/daily-* -type d -mtime +7 -exec rm -rf {} \;

echo "$(date): Backup concluído em $BACKUP_DIR"
EOF

chmod +x /var/www/tumi/backup-daily.sh

# Adicionar ao cron
echo "0 2 * * * /var/www/tumi/backup-daily.sh" | sudo crontab -
```

---

## 🔧 Comandos Úteis

### Deploy e Desenvolvimento
```bash
# Deploy completo
/var/www/tumi/deploy-webhook.sh

# Deploy apenas do frontend (mais rápido)
cd /var/www/tumi/gestao && npm run build && pm2 reload tumi-gestao-api

# Rollback para backup anterior
cp -r /var/backups/tumi-gestao/auto-YYYYMMDD_HHMMSS/gestao /var/www/tumi/ && pm2 restart tumi-gestao-api
```

### Debugging
```bash
# Logs detalhados
tail -f /var/log/tumi-gestao/combined.log

# Verificar configuração do Nginx
sudo nginx -t

# Testar conexão do banco
sudo -u postgres psql -d tumigestao_db -c "\dt"

# Status dos serviços
systemctl status nginx postgresql
pm2 monit
```

### Manutenção
```bash
# Limpar logs antigos
pm2 flush
sudo truncate -s 0 /var/log/tumi-gestao/*.log

# Atualizar dependências
cd /var/www/tumi/gestao && npm update

# Verificar espaço em disco
df -h
du -sh /var/www/tumi/gestao/
```

---

## 🚨 Solução de Problemas

### Problemas Comuns

**1. Erro 502 Bad Gateway**
```bash
pm2 status  # Verificar se a API está rodando
pm2 restart tumi-gestao-api
sudo systemctl restart nginx
```

**2. Erro de Conexão com Banco**
```bash
sudo systemctl status postgresql
sudo -u postgres psql -d tumigestao_db -c "SELECT version();"
```

**3. Erro de Permissões**
```bash
sudo chown -R www-data:www-data /var/www/tumi/gestao
sudo chmod -R 755 /var/www/tumi/gestao
```

**4. Erro de Build**
```bash
cd /var/www/tumi/gestao
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Rollback de Emergência

```bash
# Voltar para a versão anterior
LATEST_BACKUP=$(ls -td /var/backups/tumi-gestao/auto-* | head -n 1)
echo "Restaurando backup: $LATEST_BACKUP"
cp -r $LATEST_BACKUP/gestao /var/www/tumi/
pm2 restart tumi-gestao-api
```

---

## 📈 Próximos Passos (Opcionais)

### 1. Monitoramento Avançado
- Configurar alertas via email/Slack
- Métricas de performance
- Uptime monitoring

### 2. CDN e Cache
- CloudFlare para cache de assets
- Redis para cache de API
- Compressão Gzip otimizada

### 3. Segurança Adicional
- Firewall com fail2ban
- Rate limiting no Nginx
- Backup para cloud (AWS S3)

---

## ✅ Checklist de Sucesso

### Setup Inicial Completo
- [ ] Lovable conectado ao GitHub
- [ ] Script de deploy configurado na VPS
- [ ] PM2 ecosystem configurado
- [ ] Nginx configurado para subpath `/gestao`
- [ ] Banco de dados criado e migrado
- [ ] SSL funcionando
- [ ] GitHub Actions configurado (opcional)

### Deploy Funcionando
- [ ] Acesso a `https://tumihortifruti.com.br/gestao` ✅
- [ ] API respondendo em `/gestao/api/health` ✅
- [ ] Login funcionando ✅
- [ ] PM2 mostrando aplicação online ✅

### Automação Ativa
- [ ] Push no GitHub dispara deploy automático
- [ ] Backup diário configurado
- [ ] Logs estruturados
- [ ] Comandos de monitoramento criados

---

## 🎯 Resumo do Workflow Final

```
1. Desenvolvimento no Lovable
2. Commit automático no GitHub
3. GitHub Actions executa deploy (ou manual)
4. Aplicação atualizada em produção
5. Verificação automática de health
6. Backup automático criado
7. ✅ Sistema funcionando!
```

**🚀 Deploy em produção:** https://tumihortifruti.com.br/gestao
**⚡ Tempo de deploy:** 2-3 minutos
**🔄 Zero downtime:** PM2 reload
**💾 Backup automático:** A cada deploy
**📊 Monitoramento:** PM2 + logs estruturados

---

*Este documento substitui todos os outros guias de deploy e unifica todo o processo em um workflow otimizado e automatizado.*