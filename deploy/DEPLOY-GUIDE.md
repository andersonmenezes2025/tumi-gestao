# Guia de Deploy - TumiGestão

## Informações da VPS
- **Domínio:** tumihortifruti.com.br
- **Subdiretório:** /gestao
- **Usuário SSH:** root
- **Porta SSH:** 22
- **URL Final:** https://tumihortifruti.com.br/gestao

## Credenciais do Banco
- **Banco:** tumigestao_db
- **Usuário:** tumigestao_user
- **Senha:** TumiGestao2024

## Sequência de Deploy

### 1. Preparação da VPS
```bash
# Fazer upload dos scripts para a VPS
scp -r deploy/ root@tumihortifruti.com.br:/tmp/

# Conectar via SSH
ssh root@tumihortifruti.com.br

# Executar instalação base
cd /tmp
chmod +x deploy/*.sh
./deploy/install-vps.sh
```

### 2. Configuração do PostgreSQL
```bash
./deploy/setup-postgresql.sh
```

### 3. Upload do Código
```bash
# Na sua máquina local, fazer upload do projeto
rsync -avz --exclude=node_modules --exclude=dist ./ root@tumihortifruti.com.br:/var/www/tumi/gestao/

# Ou usando SCP
scp -r . root@tumihortifruti.com.br:/var/www/tumi/gestao/
```

### 4. Build e Deploy
```bash
# Na VPS, executar build
cd /var/www/tumi/gestao
./deploy/build-and-deploy.sh --first-deploy
```

### 5. Configuração do Nginx
```bash
./deploy/setup-nginx.sh
```

### 6. Configuração do SSL (se necessário)
```bash
certbot --nginx -d tumihortifruti.com.br -d www.tumihortifruti.com.br
```

## Verificações Pós-Deploy

### 1. Status dos Serviços
```bash
# Verificar PM2
pm2 status

# Verificar Nginx
systemctl status nginx

# Verificar PostgreSQL
systemctl status postgresql
```

### 2. Testes de Conectividade
- **Frontend:** https://tumihortifruti.com.br/gestao
- **API Health:** https://tumihortifruti.com.br/gestao/api/health
- **Login:** Testar cadastro de usuário e empresa

### 3. Logs de Monitoramento
```bash
# Logs do backend
pm2 logs tumigestao-backend

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs do PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log
```

## Manutenção

### Backup Automático
```bash
# Configurar backup diário
crontab -e

# Adicionar linha:
0 2 * * * /var/www/tumi/gestao/deploy/backup-database.sh
```

### Atualização da Aplicação
```bash
# Para atualizações futuras
cd /var/www/tumi/gestao
git pull  # Se usando Git
./deploy/build-and-deploy.sh
```

### Monitoramento
```bash
# Status geral
pm2 monit

# Restart se necessário
pm2 restart tumigestao-backend

# Reload sem downtime
pm2 reload tumigestao-backend
```

## Troubleshooting

### Problemas Comuns

1. **Erro 502 Bad Gateway**
   - Verificar se o backend está rodando: `pm2 status`
   - Verificar logs: `pm2 logs tumigestao-backend`
   - Restart: `pm2 restart tumigestao-backend`

2. **Erro de Conexão com Banco**
   - Verificar PostgreSQL: `systemctl status postgresql`
   - Testar conexão: `PGPASSWORD='TumiGestao2024' psql -h localhost -U tumigestao_user -d tumigestao_db`

3. **Problemas de CORS**
   - Verificar se a URL está correta no `.env`
   - Verificar configuração do backend em `server/index.ts`

4. **Assets não carregam**
   - Verificar permissões: `ls -la /var/www/tumi/gestao/dist/public/`
   - Verificar configuração do Nginx para `/gestao/assets`

### Comandos Úteis
```bash
# Reiniciar todos os serviços
systemctl restart nginx
pm2 restart all
systemctl restart postgresql

# Verificar portas em uso
netstat -tlnp | grep :3001
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# Verificar espaço em disco
df -h

# Verificar uso de memória
free -h
```

## Estrutura de Arquivos Final
```
/var/www/tumi/gestao/
├── dist/public/           # Frontend compilado
├── server/dist/           # Backend compilado
├── deploy/               # Scripts de deploy
├── .env                  # Configurações de produção
├── ecosystem.config.js   # Configuração PM2
└── ...                   # Outros arquivos do projeto
```

## URLs Importantes
- **Aplicação:** https://tumihortifruti.com.br/gestao
- **API Health:** https://tumihortifruti.com.br/gestao/api/health
- **Logs PM2:** `pm2 logs tumigestao-backend`
- **Nginx Config:** `/etc/nginx/sites-available/tumi`

---

**Deploy realizado com sucesso! 🎉**