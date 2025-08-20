# 🚀 Deploy Manual - TumiGestão VPS

## 📋 Pré-requisitos do Servidor

### Especificações Mínimas
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: 2GB (recomendado 4GB+)
- **Storage**: 20GB SSD (recomendado 50GB+)
- **CPU**: 2 cores (recomendado 4 cores+)
- **Network**: Porta 80, 443, 3000, 5432 abertas

### Usuário e Permissões
```bash
# Criar usuário para aplicação
sudo adduser tumigestao
sudo usermod -aG sudo tumigestao
su - tumigestao
```

## 🔧 Instalação das Dependências

### 1. Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js (v18+)
```bash
# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 3. Instalar PostgreSQL
```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Iniciar e habilitar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar status
sudo systemctl status postgresql
```

### 4. Instalar NGINX
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Instalar PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 6. Instalar Certbot (SSL)
```bash
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

## 🗄️ Configuração do Banco de Dados

### 1. Configurar PostgreSQL
```bash
# Acessar PostgreSQL como superuser
sudo -u postgres psql

# Dentro do PostgreSQL:
CREATE DATABASE tumigestao_db;
CREATE USER tumigestao_user WITH PASSWORD 'SUA_SENHA_SEGURA_AQUI';
GRANT ALL PRIVILEGES ON DATABASE tumigestao_db TO tumigestao_user;
GRANT USAGE ON SCHEMA public TO tumigestao_user;
GRANT CREATE ON SCHEMA public TO tumigestao_user;
\q
```

### 2. Configurar Acesso Remoto (se necessário)
```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Alterar linha:
listen_addresses = '*'

# Editar pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Adicionar linha (ajustar IP conforme necessário):
host    tumigestao_db    tumigestao_user    0.0.0.0/0    md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### 3. Script de Criação das Tabelas
```bash
# Salvar como: database_schema.sql
```

```sql
-- Tabela de empresas
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cnpj TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3b82f6',
    secondary_color TEXT DEFAULT '#64748b',
    website TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    whatsapp_number TEXT,
    creator_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de perfis
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de categorias de produtos
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de unidades de produtos
CREATE TABLE product_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de produtos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    category_id UUID REFERENCES product_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    barcode TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    cost_price NUMERIC DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER,
    profit_margin_percentage NUMERIC DEFAULT 30,
    unit TEXT DEFAULT 'un',
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    document TEXT,
    document_type TEXT DEFAULT 'cpf',
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    birth_date DATE,
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de fornecedores
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    cnpj TEXT,
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de vendas
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    customer_id UUID REFERENCES customers(id),
    sale_number TEXT NOT NULL,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'draft',
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de itens de venda
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity NUMERIC NOT NULL,
    unit_price NUMERIC NOT NULL,
    discount_percentage NUMERIC DEFAULT 0,
    total_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de orçamentos
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    valid_until DATE,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    public_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de itens de orçamento
CREATE TABLE quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de contas a receber
CREATE TABLE accounts_receivable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    customer_id UUID REFERENCES customers(id),
    sale_id UUID REFERENCES sales(id),
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    payment_amount NUMERIC,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de contas a pagar
CREATE TABLE accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    description TEXT NOT NULL,
    supplier_name TEXT,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    payment_amount NUMERIC,
    status TEXT DEFAULT 'pending',
    category TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de compras de produtos
CREATE TABLE product_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    product_id UUID NOT NULL REFERENCES products(id),
    supplier_id UUID REFERENCES suppliers(id),
    supplier_name TEXT,
    quantity NUMERIC NOT NULL DEFAULT 0,
    unit_cost NUMERIC NOT NULL DEFAULT 0,
    total_cost NUMERIC NOT NULL DEFAULT 0,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de eventos da agenda
CREATE TABLE agenda_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    type TEXT DEFAULT 'meeting',
    status TEXT DEFAULT 'scheduled',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de integrações
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    config JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de fluxos de automação
CREATE TABLE automation_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'custom',
    trigger_type TEXT NOT NULL,
    trigger_config JSONB DEFAULT '{}',
    configuration JSONB DEFAULT '{}',
    trigger_conditions JSONB DEFAULT '{}',
    actions JSONB DEFAULT '[]',
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT true,
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de logs de automação
CREATE TABLE automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    automation_flow_id UUID REFERENCES automation_flows(id),
    execution_id TEXT,
    status TEXT NOT NULL,
    trigger_type TEXT,
    trigger_data JSONB DEFAULT '{}',
    result_data JSONB DEFAULT '{}',
    execution_time_ms INTEGER,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de insights de IA
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    confidence_score NUMERIC,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'active',
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de solicitações de orçamento online
CREATE TABLE online_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    company_name TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending',
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de itens de solicitação online
CREATE TABLE online_quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    online_quote_id UUID NOT NULL REFERENCES online_quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    total_price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de campanhas de marketing
CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    subject TEXT,
    content TEXT NOT NULL,
    target_audience JSONB DEFAULT '{}',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de leads do CRM
CREATE TABLE crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT DEFAULT 'manual',
    status TEXT DEFAULT 'new',
    notes TEXT,
    last_contact_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de logs de auditoria
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    company_id UUID,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de sessões de usuário
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_token TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de rate limiting
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT NOT NULL,
    ip_address INET NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_sales_company_id ON sales(company_id);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_quotes_company_id ON quotes(company_id);
CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_automation_flows_company_id ON automation_flows(company_id);
CREATE INDEX idx_ai_insights_company_id ON ai_insights(company_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em tabelas relevantes
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Executar Script de Criação
```bash
# Executar o script
sudo -u postgres psql -d tumigestao_db -f database_schema.sql
```

## 📁 Deploy da Aplicação

### 1. Clonar/Transferir Código
```bash
cd /home/tumigestao
git clone SEU_REPOSITORIO_AQUI tumigestao-app
# OU transferir arquivos via SCP/SFTP

cd tumigestao-app
```

### 2. Configurar Variáveis de Ambiente
```bash
# Criar arquivo .env na raiz do projeto
nano .env
```

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tumigestao_db
DB_USER=tumigestao_user
DB_PASSWORD=SUA_SENHA_SEGURA_AQUI

# JWT
JWT_SECRET=sua_chave_jwt_muito_segura_aqui_64_caracteres_minimo
JWT_EXPIRES_IN=24h

# Server
NODE_ENV=production
PORT=3000

# CORS
ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com

# File Upload
UPLOAD_PATH=/home/tumigestao/tumigestao-app/uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Instalar Dependências e Build
```bash
# Instalar dependências
npm install

# Build da aplicação frontend
npm run build

# Instalar dependências do backend
cd server
npm install
npm run build
cd ..
```

### 4. Configurar PM2
```bash
# Criar arquivo de configuração PM2
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'tumigestao-backend',
    script: './server/dist/index.js',
    cwd: '/home/tumigestao/tumigestao-app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_file: './logs/backend-combined.log',
    time: true,
    max_memory_restart: '500M',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads']
  }]
};
```

```bash
# Criar diretório de logs
mkdir logs

# Iniciar aplicação com PM2
pm2 start ecosystem.config.js

# Salvar configuração PM2
pm2 save
pm2 startup
# Seguir instruções exibidas pelo comando startup
```

## 🌐 Configuração do NGINX

### 1. Configurar Site
```bash
sudo nano /etc/nginx/sites-available/tumigestao
```

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;

    # SSL Configuration (será configurado pelo Certbot)
    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend (React App)
    location / {
        root /home/tumigestao/tumigestao-app/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Upload files
    location /uploads {
        alias /home/tumigestao/tumigestao-app/uploads;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
```

### 2. Ativar Site
```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/tumigestao /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar NGINX
sudo systemctl restart nginx
```

## 🔒 Configurar SSL (HTTPS)

### 1. Obter Certificado SSL
```bash
# Obter certificado Let's Encrypt
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Testar renovação automática
sudo certbot renew --dry-run
```

### 2. Configurar Renovação Automática
```bash
# Adicionar ao crontab
sudo crontab -e

# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔥 Configurar Firewall

```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 5432  # PostgreSQL (apenas se acesso remoto necessário)

# Verificar status
sudo ufw status
```

## 📊 Monitoramento e Logs

### 1. Logs da Aplicação
```bash
# Logs PM2
pm2 logs tumigestao-backend

# Logs NGINX
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### 2. Monitoramento PM2
```bash
# Status das aplicações
pm2 status

# Monitoramento em tempo real
pm2 monit

# Restart automático em caso de falha
pm2 resurrect
```

## 🔄 Backup e Manutenção

### 1. Script de Backup do Banco
```bash
# Criar script de backup
nano /home/tumigestao/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/tumigestao/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="tumigestao_db"
DB_USER="tumigestao_user"

mkdir -p $BACKUP_DIR

# Backup do banco
PGPASSWORD="SUA_SENHA_AQUI" pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/tumigestao_$DATE.sql

# Compactar backup
gzip $BACKUP_DIR/tumigestao_$DATE.sql

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "tumigestao_*.sql.gz" -mtime +7 -delete

echo "Backup concluído: tumigestao_$DATE.sql.gz"
```

```bash
# Tornar executável
chmod +x /home/tumigestao/backup-db.sh

# Adicionar ao crontab para backup diário às 2h
crontab -e
# Adicionar:
0 2 * * * /home/tumigestao/backup-db.sh
```

### 2. Atualizações da Aplicação
```bash
# Script de deploy
nano /home/tumigestao/deploy.sh
```

```bash
#!/bin/bash
cd /home/tumigestao/tumigestao-app

# Backup antes da atualização
./backup-db.sh

# Atualizar código
git pull origin main

# Instalar dependências
npm install

# Build frontend
npm run build

# Build backend
cd server
npm install
npm run build
cd ..

# Restart aplicação
pm2 restart tumigestao-backend

echo "Deploy concluído!"
```

## ✅ Checklist Final

### Verificações Pós-Deploy
- [ ] Banco de dados criado e populado com schema
- [ ] Aplicação backend rodando na porta 3000
- [ ] NGINX configurado e funcionando
- [ ] SSL/HTTPS ativo e funcionando
- [ ] DNS apontando para o servidor
- [ ] PM2 gerenciando processos
- [ ] Firewall configurado
- [ ] Backups automatizados
- [ ] Logs sendo gerados corretamente
- [ ] Health check respondendo
- [ ] Upload de arquivos funcionando

### URLs de Teste
- **Frontend**: https://seudominio.com
- **API Health**: https://seudominio.com/health
- **Backend**: https://seudominio.com/api

### Credenciais e Informações
- **Banco**: `tumigestao_db` / `tumigestao_user`
- **Aplicação**: Porta 3000 (proxy via NGINX)
- **SSL**: Let's Encrypt (renovação automática)
- **Process Manager**: PM2
- **Backup**: Diário às 2h AM

## 🆘 Troubleshooting

### Problemas Comuns

**1. Aplicação não inicia**
```bash
# Verificar logs
pm2 logs tumigestao-backend
# Verificar variáveis de ambiente
cat .env
# Testar conexão com banco
sudo -u postgres psql -d tumigestao_db -c "SELECT 1;"
```

**2. NGINX 502 Bad Gateway**
```bash
# Verificar se backend está rodando
pm2 status
# Verificar logs NGINX
sudo tail -f /var/log/nginx/error.log
```

**3. SSL/HTTPS não funciona**
```bash
# Verificar certificado
sudo certbot certificates
# Testar configuração NGINX
sudo nginx -t
```

**4. Banco de dados não conecta**
```bash
# Verificar status PostgreSQL
sudo systemctl status postgresql
# Testar conexão
sudo -u postgres psql -d tumigestao_db
```

Este guia completo garante um deploy manual robusto e seguro do TumiGestão em sua VPS.