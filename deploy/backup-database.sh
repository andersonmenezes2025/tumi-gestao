#!/bin/bash

# Script de Backup Automático - TumiGestão Database

BACKUP_DIR="/var/backups/tumigestao"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="tumigestao_db"
DB_USER="tumigestao_user"
DB_PASSWORD="TumiGestao2024"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Fazer backup do banco de dados
echo "📋 Iniciando backup do banco de dados..."

PGPASSWORD=$DB_PASSWORD pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/tumigestao_backup_$DATE.sql

if [ $? -eq 0 ]; then
    echo "✅ Backup criado: $BACKUP_DIR/tumigestao_backup_$DATE.sql"
    
    # Comprimir o backup
    gzip $BACKUP_DIR/tumigestao_backup_$DATE.sql
    echo "🗜️  Backup comprimido: tumigestao_backup_$DATE.sql.gz"
    
    # Manter apenas os últimos 7 backups
    find $BACKUP_DIR -name "tumigestao_backup_*.sql.gz" -mtime +7 -delete
    echo "🧹 Backups antigos removidos (mantidos últimos 7 dias)"
    
    # Mostrar tamanho do backup
    ls -lh $BACKUP_DIR/tumigestao_backup_$DATE.sql.gz
    
else
    echo "❌ Erro ao criar backup do banco de dados"
    exit 1
fi

# Backup dos arquivos de configuração
echo "📂 Fazendo backup dos arquivos de configuração..."
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz -C /var/www/tumi/gestao .env ecosystem.config.js 2>/dev/null

echo "✅ Backup completo finalizado em $BACKUP_DIR/"