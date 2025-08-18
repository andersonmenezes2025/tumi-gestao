# 🚀 Plano de Implantação Automatizada - Tumi Hortifruti Gestão

## 📋 Pré-requisitos
- VPS Hostinger com Ubuntu/Debian
- Acesso SSH à VPS
- PostgreSQL já instalado (conforme mencionado)
- Node.js v18+ já instalado
- Site principal já funcionando em `/var/www/tumi`

## 🎯 Estrutura Final
```
/var/www/tumi/
├── (site principal existente)
└── gestao/                    # Sistema de Gestão
    ├── dist/                  # Frontend compilado
    ├── server/                # Backend Node.js
    ├── database/              # Scripts SQL
    ├── scripts/               # Scripts de deploy
    └── ecosystem.config.js    # Configuração PM2
```

---

## 🔧 **FASE 1: PREPARAÇÃO LOCAL**

### 1.1 - Build do Sistema (Execute no Lovable)
```bash
# No terminal do Lovable ou localmente
npm run build
npm run build:server
```

### 1.2 - Download dos Arquivos
1. Baixe todos os arquivos do projeto Lovable
2. Certifique-se de ter os arquivos essenciais:
   - `dist/` (frontend compilado)
   - `server/` (código do backend)
   - `database/migration.sql`
   - `scripts/setup-vps.sh`
   - `scripts/deploy.sh`
   - `package.json`
   - `tsconfig.server.json`

---

## 🌐 **FASE 2: UPLOAD PARA VPS**

### 2.1 - Conectar via SSH
```bash
# Substitua por seus dados de acesso
ssh seu_usuario@seu_servidor_ip
```

### 2.2 - Criar Estrutura de Diretórios
```bash
sudo mkdir -p /var/www/tumi/gestao
sudo chown -R $USER:$USER /var/www/tumi/gestao
```

### 2.3 - Upload dos Arquivos
**Opção A - Via SCP (do seu computador local):**
```bash
# Substitua pelos seus dados
scp -r caminho/para/projeto/* usuario@ip_servidor:/var/www/tumi/gestao/
```

**Opção B - Via SFTP:**
1. Use FileZilla ou WinSCP
2. Conecte no servidor
3. Navegue para `/var/www/tumi/gestao/`
4. Faça upload de todos os arquivos

**Opção C - Via Git (se estiver usando repositório):**
```bash
cd /var/www/tumi/gestao
git clone seu_repositorio .
```

---

## ⚙️ **FASE 3: CONFIGURAÇÃO AUTOMATIZADA**

### 3.1 - Executar Script de Setup (APENAS UMA VEZ)
```bash
cd /var/www/tumi/gestao
chmod +x scripts/setup-vps.sh
sudo ./scripts/setup-vps.sh
```

**Este script automaticamente:**
- ✅ Cria banco `tumigestao_db`
- ✅ Cria usuário `tumigestao_user` com senha `TumiGest@o2024!Secure`
- ✅ Executa migração completa (25 tabelas)
- ✅ Configura Nginx com proxy reverso
- ✅ Configura PM2
- ✅ Configura backup automático
- ✅ Configura logs e monitoramento

### 3.2 - Verificar Se o Setup Foi Bem-Sucedido
```bash
# Verificar se o banco foi criado
sudo -u postgres psql -l | grep tumigestao_db

# Verificar se o usuário foi criado
sudo -u postgres psql -c "\du" | grep tumigestao_user

# Verificar configuração do Nginx
sudo nginx -t
```

---

## 🚀 **FASE 4: DEPLOY DA APLICAÇÃO**

### 4.1 - Executar Deploy Automatizado
```bash
cd /var/www/tumi/gestao
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Este script automaticamente:**
- ✅ Faz backup da versão atual (se existir)
- ✅ Instala dependências Node.js
- ✅ Compila TypeScript para produção
- ✅ Configura variáveis de ambiente
- ✅ Inicia aplicação com PM2
- ✅ Testa se API está respondendo
- ✅ Recarrega Nginx

### 4.2 - Verificar Status da Aplicação
```bash
# Status do PM2
pm2 status

# Logs da aplicação
pm2 logs tumi-gestao-api --lines 10

# Testar API
curl http://localhost:3001/api/health
```

---

## 🔒 **FASE 5: CONFIGURAÇÃO SSL**

### 5.1 - Instalar Certbot (se não estiver instalado)
```bash
sudo apt update
sudo apt install snapd
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 5.2 - Configurar SSL Automaticamente
```bash
sudo certbot --nginx -d tumihortifruti.com.br
```

**Siga as instruções do Certbot:**
1. Digite seu email
2. Aceite os termos
3. Escolha redirecionar HTTP → HTTPS

---

## ✅ **FASE 6: VERIFICAÇÃO FINAL**

### 6.1 - Testar URLs
```bash
# Teste se o site principal ainda funciona
curl -I https://tumihortifruti.com.br

# Teste se o sistema de gestão carrega
curl -I https://tumihortifruti.com.br/gestao

# Teste se a API responde
curl https://tumihortifruti.com.br/gestao/api/health
```

### 6.2 - Teste de Login
1. Acesse: `https://tumihortifruti.com.br/gestao`
2. Faça login com:
   - **Email:** `admin@tumihortifruti.com.br`
   - **Senha:** `admin123`

---

## 📊 **COMANDOS DE MONITORAMENTO**

### Logs e Status
```bash
# Ver logs em tempo real
pm2 logs tumi-gestao-api

# Status detalhado
pm2 monit

# Logs do Nginx
tail -f /var/log/nginx/tumi_access.log
tail -f /var/log/nginx/tumi_error.log

# Logs da aplicação
tail -f /var/log/tumi-gestao/combined.log
```

### Comandos de Manutenção
```bash
# Reiniciar aplicação
pm2 restart tumi-gestao-api

# Reload sem downtime
pm2 reload tumi-gestao-api

# Parar aplicação
pm2 stop tumi-gestao-api

# Ver configuração PM2
pm2 show tumi-gestao-api
```

### Backup Manual
```bash
# Executar backup
/usr/local/bin/backup-tumi-gestao

# Ver backups existentes
ls -la /var/backups/tumi-gestao/
```

---

## 🛠️ **REDEPLOY (Atualizações Futuras)**

Para futuras atualizações, apenas execute:
```bash
cd /var/www/tumi/gestao
./scripts/deploy.sh
```

---

## 🆘 **TROUBLESHOOTING**

### Se a aplicação não iniciar:
```bash
# Ver logs de erro
pm2 logs tumi-gestao-api --err

# Verificar se a porta está livre
sudo netstat -tlnp | grep 3001

# Verificar conexão com banco
PGPASSWORD="TumiGest@o2024!Secure" psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT now();"
```

### Se o Nginx não funcionar:
```bash
# Testar configuração
sudo nginx -t

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log

# Recarregar configuração
sudo systemctl reload nginx
```

### Se SSL não funcionar:
```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew --dry-run
```

---

## 📈 **INFORMAÇÕES IMPORTANTES**

### Credenciais do Banco:
- **Host:** localhost
- **Banco:** tumigestao_db
- **Usuário:** tumigestao_user  
- **Senha:** TumiGest@o2024!Secure
- **Porta:** 5432

### Login Padrão do Sistema:
- **URL:** https://tumihortifruti.com.br/gestao
- **Email:** admin@tumihortifruti.com.br
- **Senha:** admin123

### Arquivos de Configuração:
- **Nginx:** `/etc/nginx/sites-available/tumihortifruti.com.br`
- **PM2:** `/var/www/tumi/gestao/ecosystem.config.js`
- **Env:** `/var/www/tumi/gestao/.env`
- **Logs:** `/var/log/tumi-gestao/`

---

## ⚡ **EXECUÇÃO RÁPIDA (Resumo)**

```bash
# 1. Upload dos arquivos para /var/www/tumi/gestao/

# 2. Setup inicial (apenas uma vez)
cd /var/www/tumi/gestao
sudo ./scripts/setup-vps.sh

# 3. Deploy da aplicação
./scripts/deploy.sh

# 4. Configurar SSL
sudo certbot --nginx -d tumihortifruti.com.br

# 5. Testar
curl https://tumihortifruti.com.br/gestao/api/health
```

**🎉 Sistema pronto em produção!**

---

## 📞 **Suporte**

Se houver algum problema durante o deploy:
1. Verifique os logs: `pm2 logs tumi-gestao-api`
2. Teste a conectividade: `curl http://localhost:3001/api/health`
3. Verifique o banco: `sudo -u postgres psql tumigestao_db -c "SELECT count(*) FROM profiles;"`

**Tempo estimado total: 15-30 minutos** (dependendo da velocidade de upload)