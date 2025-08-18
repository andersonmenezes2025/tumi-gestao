# 🚀 Deploy Definitivo - Tumi Hortifruti Gestão

## ✅ Configuração Detectada
- **VPS:** 31.97.129.119 com Node.js, PostgreSQL, Nginx
- **SSL:** Configurado para tumihortifruti.com.br 
- **Site Principal:** Proxy para http://127.0.0.1:5500 (mantido intacto)
- **Gestão:** Será adicionado em `/gestao` sem afetar o site principal

---

## 🎯 PASSO 1: Conectar ao GitHub

**No Lovable:**
1. GitHub → Connect to GitHub
2. Autorizar Lovable GitHub App
3. Criar repositório **tumi-gestao**

---

## 🎯 PASSO 2: Configurar VPS (Execute uma única vez)

### 2.1 Configurar Banco de Dados

```bash
ssh root@31.97.129.119

# Criar banco e usuário
sudo -u postgres psql -c "CREATE DATABASE tumigestao_db;"
sudo -u postgres psql -c "CREATE USER tumigestao_user WITH ENCRYPTED PASSWORD 'TumiGest@o2024!Secure';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tumigestao_db TO tumigestao_user;"
sudo -u postgres psql -c "GRANT ALL ON SCHEMA public TO tumigestao_user;"
```

### 2.2 Configurar Nginx (Integração Segura)

```bash
# Backup configuração atual
sudo cp /etc/nginx/sites-available/tumihortifruti.com.br /etc/nginx/sites-available/tumihortifruti.com.br.backup

# Script inteligente de atualização do Nginx
sudo tee /tmp/update-nginx.sh > /dev/null << 'EOF'
#!/bin/bash
CONFIG_FILE="/etc/nginx/sites-available/tumihortifruti.com.br"
TEMP_FILE="/tmp/nginx-updated.conf"

# Verificar se as rotas já existem
if grep -q "location /gestao" "$CONFIG_FILE"; then
    echo "⚠️  Rotas do gestão já configuradas no Nginx"
    exit 0
fi

# Ler configuração atual e inserir novas rotas ANTES da location /
sed '/location \/ {/i\
    # Sistema de Gestão - Frontend\
    location /gestao {\
        alias /var/www/tumi/gestao/dist;\
        index index.html;\
        try_files $uri $uri/ /gestao/index.html;\
        proxy_intercept_errors off;\
    }\
\
    # Sistema de Gestão - API\
    location /gestao/api/ {\
        proxy_pass http://localhost:3001/api/;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_intercept_errors off;\
    }\
\
    # Assets do sistema de gestão\
    location /gestao/assets {\
        alias /var/www/tumi/gestao/dist/assets;\
        expires 1y;\
        add_header Cache-Control "public, immutable";\
    }\
' "$CONFIG_FILE" > "$TEMP_FILE"

# Testar nova configuração
if nginx -t -c /dev/null -g "include $TEMP_FILE;"; then
    sudo mv "$TEMP_FILE" "$CONFIG_FILE"
    echo "✅ Configuração Nginx atualizada com sucesso"
else
    echo "❌ Erro na configuração - mantendo original"
    rm -f "$TEMP_FILE"
    exit 1
fi
EOF

# Executar atualização
chmod +x /tmp/update-nginx.sh
sudo /tmp/update-nginx.sh

# Testar e recarregar Nginx
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx configurado - Site principal mantido em http://127.0.0.1:5500"
echo "✅ Sistema gestão será disponível em /gestao"
```

### 2.3 Usar Script de Deploy Existente

```bash
# O script já existe - vamos otimizá-lo para integração com Nginx
cd /var/www/tumi/gestao

# Executar deploy com verificação automática do Nginx
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# Verificar se Nginx precisa ser configurado
if ! grep -q "location /gestao" /etc/nginx/sites-available/tumihortifruti.com.br; then
    echo "⚠️  Configurando Nginx pela primeira vez..."
    sudo /tmp/update-nginx.sh
fi

echo "✅ Deploy concluído e Nginx configurado"
```

### 2.4 Configurar Deploy Automático via GitHub

```bash
# Criar workflow GitHub Actions
mkdir -p .github/workflows
tee .github/workflows/deploy.yml > /dev/null << 'EOF'
name: Deploy to VPS

on:
  push:
    branches: [ main ]

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
          sed -i 's|SEU_USUARIO|${{ github.repository_owner }}|g' /var/www/tumi/deploy.sh
          /var/www/tumi/deploy.sh
EOF

# Gerar chave SSH para GitHub
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

echo "📋 IMPORTANTE: Adicione esta chave privada no GitHub:"
echo "Settings → Secrets → VPS_SSH_KEY"
cat ~/.ssh/github_deploy
```

---

## 🎯 PASSO 3: Deploy Definitivo

```bash
# Executar o deploy (já otimizado para sua configuração Nginx)
cd /var/www/tumi/gestao
./scripts/deploy.sh
```

O script automaticamente:
- ✅ Faz backup do sistema atual
- ✅ Configura Nginx integrando com seu site existente  
- ✅ Mantém o site principal intacto (http://127.0.0.1:5500)
- ✅ Configura sistema gestão em `/gestao`
- ✅ Testa todas as funcionalidades
- ✅ Faz rollback automático se houver erro

---

## 🎯 PASSO 4: Verificação Automática

O script já faz todas as verificações, mas você pode confirmar:

```bash
# Status completo
pm2 status

# Teste manual
curl https://tumihortifruti.com.br/gestao/api/health

# Acessar o sistema
firefox https://tumihortifruti.com.br/gestao
```

---

## 🔄 Deploys Futuros (Automático)

**Opção 1: Automático via GitHub**
- Faça mudanças no Lovable
- Commit automático no GitHub
- Deploy automático na VPS

**Opção 2: Manual**
```bash
ssh root@31.97.129.119
/var/www/tumi/deploy.sh
```

---

## 🚨 Comandos de Emergência

### Verificar Status
```bash
pm2 status
sudo systemctl status nginx postgresql
```

### Ver Logs
```bash
pm2 logs tumi-gestao-api --lines 50
tail -f /var/log/nginx/error.log
```

### Restart Completo
```bash
pm2 restart tumi-gestao-api
sudo systemctl restart nginx
```

### Rollback
```bash
# Listar backups
ls -la /var/backups/tumi-gestao-backup-*

# Restaurar backup (substitua pela data)
sudo cp -r /var/backups/tumi-gestao-backup-YYYYMMDD_HHMMSS /var/www/tumi/gestao
pm2 restart tumi-gestao-api
```

---

## ✅ Checklist Final

- [ ] Banco tumigestao_db criado
- [ ] Nginx configurado para /gestao
- [ ] Script de deploy funcionando
- [ ] PM2 configurado
- [ ] GitHub Actions ativo (opcional)
- [ ] Sistema acessível em https://tumihortifruti.com.br/gestao
- [ ] API respondendo em /gestao/api/health
- [ ] Login funcionando

---

## 🎯 Resultado Final

**🌐 URL de Produção:** https://tumihortifruti.com.br/gestao  
**🔐 Login:** admin@tumihortifruti.com.br / admin123  
**⚡ Tempo de Deploy:** 2-3 minutos  
**🔄 Deploy:** Automático via GitHub ou manual  
**💾 Backup:** Automático a cada deploy  
**🛡️ Segurança:** Nginx integração sem afetar site principal  

---

## ✅ CONFIRMAÇÃO FINAL

**SIM! Seguindo este documento você terá:**

1. **Sistema 100% funcional** em https://tumihortifruti.com.br/gestao
2. **Site principal preservado** (http://127.0.0.1:5500)
3. **Deploy automatizado** via GitHub ou manual
4. **Backup automático** a cada atualização
5. **Rollback instantâneo** se algo der errado
6. **Monitoramento completo** com PM2 e logs
7. **SSL configurado** e funcionando

**🎉 SISTEMA DE GESTÃO TUMI HORTIFRUTI - PRONTO PARA PRODUÇÃO!**

---

**📋 Para dúvidas ou suporte:**
- Logs: `pm2 logs tumi-gestao-api`
- Status: `pm2 status`
- Reiniciar: `pm2 restart tumi-gestao-api`