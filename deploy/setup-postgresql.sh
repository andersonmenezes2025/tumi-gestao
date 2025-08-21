#!/bin/bash

# Script de Configuração do PostgreSQL - TumiGestão

echo "🗄️  Configurando PostgreSQL para TumiGestão..."

# Iniciar e habilitar PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Criar usuário e banco de dados
echo "👤 Criando usuário e banco de dados..."
sudo -u postgres psql << EOF
-- Criar usuário
CREATE USER tumigestao_user WITH PASSWORD 'TumiGestao2024';

-- Criar banco de dados
CREATE DATABASE tumigestao_db OWNER tumigestao_user;

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE tumigestao_db TO tumigestao_user;
GRANT ALL ON SCHEMA public TO tumigestao_user;

-- Configurar permissões adicionais
ALTER USER tumigestao_user CREATEDB;

\q
EOF

# Configurar PostgreSQL para aceitar conexões locais
echo "🔧 Configurando acesso local ao PostgreSQL..."

# Backup do arquivo de configuração
cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup

# Adicionar linha para autenticação md5 local
echo "local   tumigestao_db   tumigestao_user                 md5" >> /etc/postgresql/*/main/pg_hba.conf

# Reiniciar PostgreSQL
systemctl restart postgresql

# Testar conexão
echo "🧪 Testando conexão com o banco..."
PGPASSWORD='TumiGestao2024' psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT version();"

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL configurado com sucesso!"
    echo "📊 Banco: tumigestao_db"
    echo "👤 Usuário: tumigestao_user"
    echo "🔑 Senha: TumiGestao2024"
else
    echo "❌ Erro na configuração do PostgreSQL"
    exit 1
fi