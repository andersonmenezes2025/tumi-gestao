# 🚀 Deploy Completo TumiGestão - Pronto para Produção

## ✅ Arquivos Criados e Configurados

### 📁 Configurações de Produção
- ✅ `.env.production` - Variáveis de ambiente para produção
- ✅ `vite.config.ts` - Configurado com base path `/gestao`
- ✅ `ecosystem.config.js` - Configuração PM2 para gerenciamento do backend
- ✅ `src/lib/api-client.ts` - URLs ajustadas para produção
- ✅ `src/components/auth/AuthForm.tsx` - Endpoints de autenticação corrigidos

### 📁 Scripts de Deploy (`/deploy/`)
- ✅ `install-vps.sh` - Instalação completa da VPS (Node, PostgreSQL, Nginx, PM2)
- ✅ `setup-postgresql.sh` - Configuração do PostgreSQL com usuário e banco
- ✅ `database-schema.sql` - Schema completo do banco de dados
- ✅ `nginx-config` - Configuração do Nginx para servir em `/gestao`
- ✅ `setup-nginx.sh` - Script de configuração automática do Nginx
- ✅ `build-and-deploy.sh` - Build do frontend/backend e deploy
- ✅ `backup-database.sh` - Script de backup automático
- ✅ `deploy-complete.sh` - **SCRIPT PRINCIPAL** - Deploy completo
- ✅ `quick-update.sh` - Para atualizações futuras rápidas
- ✅ `crontab-backup` - Configuração de backups automáticos

### 📁 Documentação
- ✅ `DEPLOY-GUIDE.md` - Guia completo passo-a-passo
- ✅ `CHECKLIST-FINAL.md` - Checklist de verificação pós-deploy

---

## 🎯 COMO EXECUTAR O DEPLOY

### 1️⃣ **Preparar na Máquina Local**
```bash
# Já está tudo pronto! Apenas faça upload para a VPS
rsync -avz --exclude=node_modules --exclude=dist ./ root@tumihortifruti.com.br:/var/www/tumi/gestao/
```

### 2️⃣ **Executar na VPS** (Comando Único)
```bash
# Conectar via SSH
ssh root@tumihortifruti.com.br

# Navegar para o diretório do projeto
cd /var/www/tumi/gestao

# Executar deploy completo
chmod +x deploy/deploy-complete.sh
./deploy/deploy-complete.sh
```

### 3️⃣ **Acessar Sistema**
- 🌐 **Frontend:** https://tumihortifruti.com.br/gestao
- 🔌 **API Health:** https://tumihortifruti.com.br/gestao/api/health

---

## 🔍 Verificações Finais

### ✅ Serviços Rodando
```bash
pm2 status                    # Backend deve estar 'online'
systemctl status nginx        # Nginx deve estar 'active'
systemctl status postgresql   # PostgreSQL deve estar 'active'
```

### ✅ URLs Funcionando
- Frontend carrega sem erros
- API Health retorna `{"status": "OK"}`
- Cadastro de usuário funciona
- Login funciona

---

## 🛠️ Informações Técnicas

### **Configurações da VPS:**
- **Domínio:** tumihortifruti.com.br
- **Subdiretório:** /gestao
- **Backend:** Porta 3001 (proxied pelo Nginx)
- **Usuário:** root
- **SSH:** Porta 22

### **Banco de Dados:**
- **Host:** localhost
- **Database:** tumigestao_db
- **User:** tumigestao_user  
- **Password:** TumiGestao2024

### **JWT Secret:**
- **Token:** dd9777d2d5bc3e64b6c5fcb02442393b25c322dc55dfb746fc0079a4460eec83

---

## 📊 Monitoramento e Manutenção

### **Logs em Tempo Real:**
```bash
pm2 logs tumigestao-backend          # Logs do backend
tail -f /var/log/nginx/access.log    # Logs do Nginx
tail -f /var/log/nginx/error.log     # Erros do Nginx
```

### **Backups Automáticos:**
- ⏰ **Frequência:** Diário às 2h da manhã
- 📁 **Localização:** `/var/backups/tumigestao/`
- 🔄 **Retenção:** 7 dias

### **Atualizações Futuras:**
```bash
cd /var/www/tumi/gestao
./deploy/quick-update.sh
```

---

## 🆘 Troubleshooting Rápido

### Backend não inicia:
```bash
cd /var/www/tumi/gestao
npm run build:server
pm2 restart tumigestao-backend
```

### Frontend não carrega:
```bash
npm run build
sudo systemctl reload nginx
```

### Erro de banco:
```bash
systemctl restart postgresql
```

---

## 🎉 **RESULTADO FINAL**

Após executar o deploy completo, você terá:

✅ **Sistema TumiGestão** rodando em https://tumihortifruti.com.br/gestao  
✅ **Backend API** funcionando e proxied pelo Nginx  
✅ **Banco PostgreSQL** configurado e populado com schema  
✅ **PM2** gerenciando o backend com restart automático  
✅ **Backups automáticos** configurados via crontab  
✅ **SSL/HTTPS** funcionando (se já configurado no domínio)  
✅ **Monitoramento** via PM2 e logs centralizados  

**O sistema está pronto para uso em produção! 🚀**