# ✅ CHECKLIST DE DEPLOY - TUMI GESTÃO

## 🎯 EXECUÇÃO RÁPIDA (3 comandos apenas!)

### **Opção A - Script Automatizado Completo**
```bash
# 1. Upload dos arquivos para /var/www/tumi/gestao/
# 2. Executar script único:
cd /var/www/tumi/gestao
chmod +x scripts/deploy-automatizado.sh
./scripts/deploy-automatizado.sh
# 3. Configurar SSL:
sudo certbot --nginx -d tumihortifruti.com.br
```

### **Opção B - Scripts Separados (mais controle)**
```bash
# 1. Setup inicial (apenas uma vez):
sudo ./scripts/setup-vps.sh
# 2. Deploy da aplicação:
./scripts/deploy.sh
# 3. SSL:
sudo certbot --nginx -d tumihortifruti.com.br
```

---

## 📋 CHECKLIST PASSO A PASSO

### **ANTES DO DEPLOY**
- [ ] VPS Hostinger configurada
- [ ] Acesso SSH funcionando
- [ ] PostgreSQL instalado
- [ ] Node.js v18+ instalado  
- [ ] Site principal funcionando em `/var/www/tumi`
- [ ] Arquivos do projeto baixados

### **UPLOAD DOS ARQUIVOS**
- [ ] Conectar na VPS: `ssh usuario@ip`
- [ ] Criar diretório: `sudo mkdir -p /var/www/tumi/gestao`
- [ ] Ajustar permissões: `sudo chown -R $USER:$USER /var/www/tumi/gestao`
- [ ] Upload via SCP/SFTP/Git para `/var/www/tumi/gestao/`
- [ ] Verificar arquivos: `ls -la /var/www/tumi/gestao/`

### **EXECUTAR DEPLOY**
- [ ] Navegar para diretório: `cd /var/www/tumi/gestao`
- [ ] Tornar scripts executáveis: `chmod +x scripts/*.sh`
- [ ] **ESCOLHER UMA OPÇÃO:**
  - [ ] **Opção A:** `./scripts/deploy-automatizado.sh` (tudo em um)
  - [ ] **Opção B:** `sudo ./scripts/setup-vps.sh` depois `./scripts/deploy.sh`

### **CONFIGURAR SSL**
- [ ] Instalar Certbot: `sudo snap install --classic certbot`
- [ ] Criar link: `sudo ln -s /snap/bin/certbot /usr/bin/certbot`
- [ ] Configurar SSL: `sudo certbot --nginx -d tumihortifruti.com.br`
- [ ] Escolher redirecionamento HTTP → HTTPS

### **VERIFICAR FUNCIONAMENTO**
- [ ] Status PM2: `pm2 status`
- [ ] Logs: `pm2 logs tumi-gestao-api --lines 10`
- [ ] API local: `curl http://localhost:3001/api/health`
- [ ] Site: `curl https://tumihortifruti.com.br/gestao`
- [ ] Login no navegador: `https://tumihortifruti.com.br/gestao`

### **TESTE DE LOGIN**
- [ ] URL: `https://tumihortifruti.com.br/gestao`
- [ ] Email: `admin@tumihortifruti.com.br`  
- [ ] Senha: `admin123`
- [ ] Dashboard carregando corretamente

---

## 🚨 RESOLUÇÃO DE PROBLEMAS

### **Se o script falhar:**
```bash
# Ver logs detalhados
pm2 logs tumi-gestao-api

# Verificar banco
PGPASSWORD="TumiGest@o2024!Secure" psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT now();"

# Verificar porta
sudo netstat -tlnp | grep 3001

# Reiniciar serviços
sudo systemctl restart nginx
pm2 restart tumi-gestao-api
```

### **Se Nginx não funcionar:**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
sudo systemctl status nginx
```

### **Se SSL falhar:**
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

---

## ⚡ COMANDOS DE EMERGÊNCIA

### **Parar tudo:**
```bash
pm2 stop tumi-gestao-api
sudo systemctl stop nginx
```

### **Reiniciar tudo:**
```bash
pm2 restart tumi-gestao-api
sudo systemctl restart nginx
```

### **Ver logs em tempo real:**
```bash
pm2 logs tumi-gestao-api
tail -f /var/log/nginx/error.log
tail -f /var/log/tumi-gestao/combined.log
```

---

## 🎯 RESUMO - APENAS 3 COMANDOS!

```bash
# 1. Na VPS, depois do upload dos arquivos:
cd /var/www/tumi/gestao && ./scripts/deploy-automatizado.sh

# 2. Configurar SSL:
sudo certbot --nginx -d tumihortifruti.com.br

# 3. Testar:
curl https://tumihortifruti.com.br/gestao/api/health
```

**🎉 Sistema funcionando em < 15 minutos!**

---

## 📞 INFORMAÇÕES FINAIS

**URLs:**
- Sistema: `https://tumihortifruti.com.br/gestao`
- API: `https://tumihortifruti.com.br/gestao/api`

**Login:**
- Email: `admin@tumihortifruti.com.br`
- Senha: `admin123`

**Banco:**
- Host: `localhost`
- Database: `tumigestao_db`
- User: `tumigestao_user`
- Password: `TumiGest@o2024!Secure`

**Tempo estimado: 10-20 minutos** ⚡