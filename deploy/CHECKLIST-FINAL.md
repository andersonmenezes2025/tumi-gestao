# ✅ Checklist Final de Deploy - TumiGestão

## Pré-Deploy ✅
- [x] Arquivos .env.production criado
- [x] vite.config.ts configurado com base path `/gestao`
- [x] api-client.ts configurado para produção
- [x] AuthForm.tsx com endpoints corretos (signin/signup)
- [x] Scripts de deploy criados
- [x] Configuração Nginx preparada
- [x] Schema do banco de dados pronto
- [x] Ecosystem.config.js do PM2 configurado

## Comandos de Deploy (Sequência)

### 1. Na VPS - Instalação Base
```bash
# Upload dos scripts
scp -r deploy/ root@tumihortifruti.com.br:/tmp/

# Conectar SSH
ssh root@tumihortifruti.com.br

# Instalar base
cd /tmp && chmod +x deploy/*.sh
./deploy/install-vps.sh
```

### 2. Na VPS - PostgreSQL
```bash
./deploy/setup-postgresql.sh
```

### 3. Local - Upload do Código
```bash
# Excluir node_modules e dist para otimizar upload
rsync -avz --exclude=node_modules --exclude=dist ./ root@tumihortifruti.com.br:/var/www/tumi/gestao/
```

### 4. Na VPS - Deploy Final
```bash
cd /var/www/tumi/gestao
./deploy/deploy-complete.sh
```

## Verificações Pós-Deploy ✅

### Serviços Funcionando
```bash
# PM2 Status
pm2 status
# Deve mostrar: tumigestao-backend | online

# Nginx Status  
systemctl status nginx
# Deve mostrar: active (running)

# PostgreSQL Status
systemctl status postgresql
# Deve mostrar: active (running)
```

### URLs Funcionando
- [ ] **Frontend:** https://tumihortifruti.com.br/gestao
  - Deve carregar a tela de login
  - Console sem erros críticos
  
- [ ] **Backend:** https://tumihortifruti.com.br/gestao/api/health
  - Deve retornar: `{"status": "OK", "timestamp": "..."}`

- [ ] **Database:** Conectividade testada
  ```bash
  PGPASSWORD='TumiGestao2024' psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT version();"
  ```

### Funcionalidades Básicas
- [ ] **Cadastro de Usuário**
  - Criar nova conta funciona
  - Login com credenciais funciona
  
- [ ] **Cadastro de Empresa**
  - Formulário de empresa aparece após login
  - Salvamento da empresa funciona
  
- [ ] **Dashboard**
  - Dashboard carrega após configurar empresa
  - Sem erros 500 nas requisições

## Logs para Monitoramento

### Backend
```bash
pm2 logs tumigestao-backend
pm2 logs tumigestao-backend --lines 100
```

### Nginx
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Sistema
```bash
# Espaço em disco
df -h

# Uso de memória
free -h

# Processos
top
```

## Manutenção Configurada ✅

### Backups Automáticos
- [x] Script de backup: `/var/www/tumi/gestao/deploy/backup-database.sh`
- [x] Crontab configurado: Diário às 2h da manhã
- [x] Localização backups: `/var/backups/tumigestao/`

### Monitoramento PM2
- [x] PM2 configurado para restart automático
- [x] Logs centralizados em `/var/log/pm2/`
- [x] Startup automático configurado

## Troubleshooting Rápido

### Se Backend não iniciar
```bash
cd /var/www/tumi/gestao
npm run build:server
pm2 restart tumigestao-backend
pm2 logs tumigestao-backend
```

### Se Frontend não carregar
```bash
cd /var/www/tumi/gestao
npm run build
sudo systemctl reload nginx
```

### Se Banco não conectar
```bash
systemctl restart postgresql
sudo -u postgres psql -c "ALTER USER tumigestao_user WITH PASSWORD 'TumiGestao2024';"
```

## Comandos de Manutenção Futura

### Atualização Rápida
```bash
cd /var/www/tumi/gestao
./deploy/quick-update.sh
```

### Backup Manual
```bash
./deploy/backup-database.sh
```

### Restart Completo
```bash
pm2 restart tumigestao-backend
sudo systemctl reload nginx
```

---

## 🎉 Deploy Finalizado!

**URLs Principais:**
- **Sistema:** https://tumihortifruti.com.br/gestao
- **API Health:** https://tumihortifruti.com.br/gestao/api/health

**Credenciais do Banco:**
- Host: localhost
- Database: tumigestao_db  
- User: tumigestao_user
- Password: TumiGestao2024

**Status Check:**
```bash
pm2 status && systemctl status nginx --no-pager
```