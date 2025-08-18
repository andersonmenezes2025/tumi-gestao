# Sistema de Gestão Tumi Hortifruti - Deploy Guide

## 📋 Visão Geral
Sistema completo de gestão empresarial adaptado para PostgreSQL puro, pronto para deploy na VPS da Hostinger.

## 🏗️ Arquitetura
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + JWT
- **Database**: PostgreSQL 
- **Servidor Web**: Nginx (proxy reverso)
- **Process Manager**: PM2

## 🎯 Estrutura de URLs
- **Site Principal**: `https://tumihortifruti.com.br/`
- **Sistema de Gestão**: `https://tumihortifruti.com.br/gestao`
- **API**: `https://tumihortifruti.com.br/gestao/api`

## 📂 Estrutura de Arquivos VPS
```
/var/www/tumi/
├── (arquivos do site principal)
└── gestao/                    # Sistema de Gestão
    ├── dist/                  # Frontend build
    ├── server/               # Código do servidor
    ├── database/             # Scripts SQL
    ├── scripts/              # Scripts de deploy
    ├── logs/                 # Logs da aplicação
    └── ecosystem.config.js   # Configuração PM2
```

## 🚀 Processo de Deploy

### Fase 1: Preparação da VPS
1. **Fazer backup do banco atual:**
   ```bash
   sudo -u postgres pg_dump tumi > /tmp/backup_tumi_$(date +%Y%m%d).sql
   ```

2. **Executar script de configuração:**
   ```bash
   chmod +x scripts/setup-vps.sh
   sudo ./scripts/setup-vps.sh
   ```

### Fase 2: Upload e Deploy
1. **Enviar arquivos para VPS:**
   ```bash
   # Via SCP/SFTP para /var/www/tumi/gestao/
   scp -r * user@vps:/var/www/tumi/gestao/
   ```

2. **Executar deploy:**
   ```bash
   cd /var/www/tumi/gestao
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

### Fase 3: Configuração SSL
```bash
sudo certbot --nginx -d tumihortifruti.com.br
```

## 🎛️ Configurações do Banco

### Banco de Dados
- **Nome**: `tumigestao_db`
- **Usuário**: `tumigestao_user`
- **Senha**: `TumiGest@o2024!Secure`
- **Porto**: `5432` (padrão PostgreSQL)

### Login Padrão do Sistema
- **Email**: `admin@tumihortifruti.com.br`
- **Senha**: `admin123`

## 📊 Monitoramento

### Comandos PM2
```bash
pm2 status                    # Status das aplicações
pm2 logs tumi-gestao-api      # Ver logs em tempo real
pm2 restart tumi-gestao-api   # Reiniciar aplicação
pm2 reload tumi-gestao-api    # Reload sem downtime
pm2 monit                     # Monitor em tempo real
```

### Logs
```bash
# Logs da aplicação
tail -f /var/log/tumi-gestao/combined.log

# Logs do Nginx
tail -f /var/log/nginx/tumi_access.log
tail -f /var/log/nginx/tumi_error.log

# Status do sistema
systemctl status nginx
systemctl status postgresql
```

### Backup Automático
- **Frequência**: Diário às 2h da manhã
- **Localização**: `/var/backups/tumi-gestao/`
- **Retenção**: 7 dias
- **Comando manual**: `/usr/local/bin/backup-tumi-gestao`

## 🔒 Segurança

### Firewall (UFW)
- SSH (22): Liberado
- HTTP (80): Liberado → Redirect HTTPS
- HTTPS (443): Liberado
- PostgreSQL (5432): Apenas local

### SSL/TLS
- Certificado Let's Encrypt via Certbot
- Renovação automática configurada
- HTTP → HTTPS redirect

## ⚡ Performance

### PM2 Cluster
- **Instâncias**: 2 (cluster mode)
- **Memory Limit**: 500MB por instância
- **Restart Policy**: Automático em caso de crash

### Nginx Cache
- Assets estáticos: Cache 1 ano
- API: Sem cache
- Gzip compression habilitada

## 🛠️ Manutenção

### Atualizações
```bash
cd /var/www/tumi/gestao
git pull origin main  # se usando Git
./scripts/deploy.sh   # Redeploy
```

### Backup Manual
```bash
/usr/local/bin/backup-tumi-gestao
```

### Restauração
```bash
# Restaurar banco
PGPASSWORD="TumiGest@o2024!Secure" psql -h localhost -U tumigestao_user tumigestao_db < backup_file.sql

# Restaurar aplicação
pm2 stop tumi-gestao-api
cp -r backup_dist/* /var/www/tumi/gestao/dist/
pm2 start tumi-gestao-api
```

## 🔧 Troubleshooting

### Aplicação não inicia
```bash
# Verificar logs
pm2 logs tumi-gestao-api

# Verificar configuração
cat /var/www/tumi/gestao/.env

# Testar conexão do banco
PGPASSWORD="TumiGest@o2024!Secure" psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT now();"
```

### Nginx não carrega
```bash
# Testar configuração
sudo nginx -t

# Verificar logs
tail -f /var/log/nginx/error.log

# Recarregar configuração
sudo systemctl reload nginx
```

### Banco não conecta
```bash
# Status PostgreSQL
sudo systemctl status postgresql

# Verificar conexões
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity WHERE datname='tumigestao_db';"

# Verificar permissões
sudo -u postgres psql -c "\du tumigestao_user"
```

## 📞 Suporte

### Arquivos de Configuração Importantes
- Nginx: `/etc/nginx/sites-available/tumihortifruti.com.br`
- PM2: `/var/www/tumi/gestao/ecosystem.config.js`
- App: `/var/www/tumi/gestao/.env`
- Backup: `/usr/local/bin/backup-tumi-gestao`

### Recursos do Sistema
- **RAM**: Mínimo 2GB recomendado
- **Storage**: ~1GB para aplicação + logs
- **CPU**: 2 cores recomendado para cluster PM2

---

## ✅ Checklist de Deploy

- [ ] Backup do banco atual realizado
- [ ] Script `setup-vps.sh` executado com sucesso
- [ ] Arquivos enviados para `/var/www/tumi/gestao/`
- [ ] Dependencies instaladas (`npm install`)
- [ ] Build realizado (`npm run build`)
- [ ] Arquivo `.env` configurado
- [ ] PM2 configurado e aplicação rodando
- [ ] Nginx configurado e funcionando
- [ ] SSL configurado com Let's Encrypt
- [ ] Backup automático configurado
- [ ] Login no sistema funcionando
- [ ] API respondendo em `/gestao/api/health`
- [ ] Frontend carregando em `/gestao`

Sistema pronto para produção! 🚀