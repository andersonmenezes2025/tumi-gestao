# 📁 Guia Completo de Deploy via FileZilla
## Sistema de Gestão Tumi Hortifruti

> **⚠️ IMPORTANTE**: Este guia assume que você já configurou a VPS seguindo o `CHECKLIST-DEPLOY.md`

---

## 📋 PRÉ-REQUISITOS

### No Lovable:
- ✅ Projeto funcionando corretamente
- ✅ Todos os testes passando
- ✅ Build local validado

### Na VPS:
- ✅ PostgreSQL configurado
- ✅ PM2 instalado globalmente
- ✅ Nginx instalado
- ✅ Usuário com acesso SSH
- ✅ Estrutura de diretórios criada

### Ferramentas:
- ✅ FileZilla instalado
- ✅ Acesso SSH (PuTTY ou terminal)

---

## 🚀 PROCESSO DE DEPLOY

### **ETAPA 1: PREPARAÇÃO DOS ARQUIVOS**

#### 1.1 Download do Projeto do Lovable
```bash
# No Lovable, clique em "Download ZIP"
# Extraia em uma pasta local, ex: C:\tumi-gestao\
```

#### 1.2 Validação Local (OBRIGATÓRIO)
```bash
# Abra terminal na pasta do projeto
cd C:\tumi-gestao\

# Instalar dependências
npm install

# Validar build do frontend
npm run build
# ✅ Deve gerar pasta 'dist' sem erros

# Validar build do backend
npm run build:server
# ✅ Deve gerar 'server/dist' sem erros
```

#### 1.3 Preparar Arquivos para Upload
**✅ INCLUIR ESTES ARQUIVOS/PASTAS:**
- `src/` (código fonte frontend)
- `server/` (código fonte backend)
- `database/` (migrações SQL)
- `scripts/` (scripts de deploy)
- `public/` (arquivos públicos)
- `supabase/` (funções edge)
- `package.json` e `package-lock.json`
- `tsconfig*.json`
- `vite.config.ts`
- `tailwind.config.ts`
- `index.html`
- `README.md` e arquivos de documentação
- `.env.example`

**❌ NÃO INCLUIR:**
- `node_modules/` (será instalado na VPS)
- `dist/` (será gerado na VPS)
- `server/dist/` (será gerado na VPS)
- `.git/` (controle de versão)
- `.env` (com dados sensíveis)
- `tmp/` ou arquivos temporários
- Logs (`*.log`)

---

### **ETAPA 2: CONFIGURAÇÃO SEGURA DO FILEZILLA**

#### 2.1 Configurar Conexão SFTP
1. **Abra o FileZilla**
2. **Vá em: Arquivo → Gerenciador de Sites**
3. **Clique em "Novo Site"**
4. **Configure:**

```
Nome do Site: Tumi Gestão - VPS
Protocolo: SFTP - SSH File Transfer Protocol
Host: [SEU_IP_DA_VPS]
Porta: 22 (padrão SSH)
Tipo de Logon: Normal
Usuário: [SEU_USUARIO_VPS]
Senha: [SUA_SENHA_VPS]
```

#### 2.2 Configurações Avançadas
**Vá em Arquivo → Configurações → Transferências:**
- ✅ **Número máximo de transferências simultâneas: 3**
- ✅ **Limite de conexões por servidor: 2**
- ✅ **Timeout: 60 segundos**

**Na aba "Tipos de arquivo":**
- ✅ **Transferir arquivos .js, .ts, .json como ASCII**
- ✅ **Transferir imagens como Binary**

---

### **ETAPA 3: UPLOAD ESTRUTURADO**

#### 3.1 Conectar à VPS
1. **No FileZilla, conecte ao site configurado**
2. **Navegue até:** `/var/www/tumi/gestao/`
3. **Verifique se o diretório existe** (deve ter sido criado no setup)

#### 3.2 Fazer Backup da Versão Atual (se existir)
**Via SSH (PuTTY ou terminal):**
```bash
ssh usuario@seu_ip_vps
cd /var/www/tumi/gestao

# Backup automático (se já existe aplicação)
if [ -d "src" ]; then
    sudo mkdir -p /var/backups/tumi-gestao
    sudo cp -r . /var/backups/tumi-gestao/backup-$(date +%Y%m%d_%H%M%S)/
    echo "✅ Backup criado com sucesso"
fi
```

#### 3.3 Upload dos Arquivos
**ORDEM RECOMENDADA DE UPLOAD:**

**1º - Arquivos de Configuração:**
```
package.json
package-lock.json
tsconfig*.json
vite.config.ts
tailwind.config.ts
index.html
.env.example
```

**2º - Código Fonte:**
```
src/ (pasta completa)
server/ (pasta completa)
database/ (pasta completa)
scripts/ (pasta completa)
```

**3º - Assets e Documentação:**
```
public/ (pasta completa)
supabase/ (pasta completa)
*.md (arquivos de documentação)
```

#### 3.4 Verificação do Upload
**No painel direito do FileZilla (VPS), verifique:**
- ✅ Todas as pastas foram transferidas
- ✅ Tamanhos dos arquivos estão corretos
- ✅ Não há arquivos corrompidos (ícone de erro)

---

### **ETAPA 4: EXECUÇÃO DO DEPLOY**

#### 4.1 Conectar via SSH
```bash
ssh usuario@seu_ip_vps
cd /var/www/tumi/gestao
```

#### 4.2 Verificar Integridade dos Arquivos
```bash
# Verificar estrutura de arquivos
ls -la
# Deve mostrar: src/, server/, database/, scripts/, package.json, etc.

# Verificar permissões dos scripts
chmod +x scripts/*.sh

# Verificar se arquivos principais existem
test -f package.json && echo "✅ package.json OK" || echo "❌ package.json MISSING"
test -d src && echo "✅ src/ OK" || echo "❌ src/ MISSING"
test -d server && echo "✅ server/ OK" || echo "❌ server/ MISSING"
test -d database && echo "✅ database/ OK" || echo "❌ database/ MISSING"
```

#### 4.3 Executar Deploy Automatizado
```bash
# OPÇÃO 1: Deploy Completo (primeira vez ou grandes mudanças)
sudo ./scripts/deploy.sh

# OPÇÃO 2: Deploy Automatizado (mais seguro - recomendado)
sudo ./scripts/deploy-automatizado.sh
```

#### 4.4 Monitorar Processo
**O script vai executar automaticamente:**
1. ✅ Verificação de dependências
2. ✅ Setup do banco PostgreSQL
3. ✅ Instalação das dependências (`npm ci`)
4. ✅ Build do frontend e backend
5. ✅ Configuração do environment
6. ✅ Configuração do PM2
7. ✅ Configuração do Nginx
8. ✅ Inicialização da aplicação
9. ✅ Verificações de health check

---

### **ETAPA 5: VERIFICAÇÃO E VALIDAÇÃO**

#### 5.1 Verificar Status da Aplicação
```bash
# Status do PM2
pm2 status

# Verificar se aplicação está online
pm2 describe tumi-gestao-api

# Logs em tempo real
pm2 logs tumi-gestao-api --lines 50
```

#### 5.2 Testes de Conectividade
```bash
# Teste da API local
curl http://localhost:3001/api/health
# Deve retornar: {"status":"OK","timestamp":"..."}

# Teste da conexão com banco
curl http://localhost:3001/api/health/db
# Deve retornar dados de status do banco

# Teste do Nginx
sudo nginx -t
# Deve retornar: "test is successful"
```

#### 5.3 Teste no Navegador
1. **Acesse:** `http://SEU_IP_VPS/gestao`
2. **Deve carregar a aplicação**
3. **Teste login:** 
   - Email: `admin@tumihortifruti.com.br`
   - Senha: `admin123`

#### 5.4 Configurar SSL (Opcional mas Recomendado)
```bash
# Se o domínio estiver apontado para a VPS
sudo certbot --nginx -d tumihortifruti.com.br

# Depois acesse: https://tumihortifruti.com.br/gestao
```

---

### **ETAPA 6: MONITORAMENTO PÓS-DEPLOY**

#### 6.1 Comandos de Monitoramento
```bash
# Status geral
./scripts/monitor.sh

# Monitoramento detalhado
./scripts/monitor.sh detailed

# Logs em tempo real
./scripts/monitor.sh logs

# Teste de carga
./scripts/monitor.sh test
```

#### 6.2 Arquivos de Log Importantes
```bash
# Logs da aplicação
tail -f /var/log/tumi-gestao/combined.log
tail -f /var/log/tumi-gestao/error.log

# Logs do PM2
pm2 logs tumi-gestao-api

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do sistema
sudo journalctl -u nginx -f
sudo journalctl -u postgresql -f
```

---

## 🔧 TROUBLESHOOTING

### ❌ Problemas Comuns e Soluções

#### **Erro: "Application failed to start"**
```bash
# Verificar logs detalhados
pm2 logs tumi-gestao-api --lines 100

# Verificar configuração do banco
psql -h localhost -U tumigestao_user -d tumigestao_db -c "SELECT version();"

# Verificar variáveis de ambiente
cat .env
```

#### **Erro: "Cannot connect to database"**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar se banco existe
sudo -u postgres psql -l | grep tumigestao_db

# Recriar banco se necessário
sudo -u postgres psql -c "CREATE DATABASE tumigestao_db;"
sudo -u postgres psql -c "CREATE USER tumigestao_user WITH PASSWORD 'TumiGest@o2024!Secure';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tumigestao_db TO tumigestao_user;"
```

#### **Erro: "502 Bad Gateway" (Nginx)**
```bash
# Verificar se aplicação está rodando
pm2 status tumi-gestao-api

# Verificar configuração do Nginx
sudo nginx -t

# Reiniciar serviços
pm2 restart tumi-gestao-api
sudo systemctl restart nginx
```

#### **Erro: "Build failed"**
```bash
# Limpar cache e reconstruir
rm -rf node_modules package-lock.json
npm install
npm run build
npm run build:server
```

### 🔄 **ROLLBACK DE EMERGÊNCIA**

#### Se algo der errado durante o deploy:
```bash
# 1. Parar aplicação atual
pm2 stop tumi-gestao-api

# 2. Restaurar backup
sudo cp -r /var/backups/tumi-gestao/backup-YYYYMMDD_HHMMSS/* /var/www/tumi/gestao/

# 3. Instalar dependências do backup
cd /var/www/tumi/gestao
npm ci --production

# 4. Reiniciar aplicação
pm2 start ecosystem.config.js
```

---

## ✅ CHECKLIST FINAL

### Antes de Considerar o Deploy Concluído:
- [ ] ✅ **Upload completo realizado via FileZilla**
- [ ] ✅ **Build executado sem erros**
- [ ] ✅ **Banco de dados conectado e migrações aplicadas**
- [ ] ✅ **PM2 mostra aplicação como 'online'**
- [ ] ✅ **API respondendo em `localhost:3001/api/health`**
- [ ] ✅ **Nginx configurado e teste bem-sucedido**
- [ ] ✅ **Aplicação carregando no navegador**
- [ ] ✅ **Login funcionando com credenciais padrão**
- [ ] ✅ **SSL configurado (opcional)**
- [ ] ✅ **Monitoramento ativo**
- [ ] ✅ **Backup da versão anterior preservado**

---

## 📞 INFORMAÇÕES PÓS-DEPLOY

### **🌐 Acesso à Aplicação:**
- **URL Local:** `http://SEU_IP_VPS/gestao`
- **URL com Domínio:** `https://tumihortifruti.com.br/gestao`

### **👤 Credenciais Padrão:**
- **Email:** `admin@tumihortifruti.com.br`
- **Senha:** `admin123`

### **⚠️ TAREFAS PÓS-DEPLOY IMPORTANTES:**
1. **Alterar senha padrão do admin**
2. **Configurar backup automático**
3. **Configurar SSL se não foi feito**
4. **Configurar monitoramento automático**
5. **Testar todas as funcionalidades principais**

### **🛠️ Comandos Úteis para Manutenção:**
```bash
# Reiniciar aplicação
pm2 restart tumi-gestao-api

# Ver logs em tempo real
pm2 logs tumi-gestao-api

# Status da aplicação
pm2 status

# Monitoramento completo
./scripts/monitor.sh detailed

# Deploy rápido (apenas reload)
./scripts/quick-deploy.sh
```

---

## 🎯 PRÓXIMOS PASSOS

### **Para Atualizações Futuras:**
1. **Download da nova versão do Lovable**
2. **Upload via FileZilla (mesma estrutura)**
3. **Execute:** `./scripts/quick-deploy.sh` (para mudanças menores)
4. **Ou:** `./scripts/deploy.sh` (para mudanças maiores)

### **Para Desenvolvimento Contínuo:**
- Consulte `WORKFLOW-DESENVOLVIMENTO.md`
- Use os scripts do `SCRIPTS-PACKAGE.md`

---

**✅ DEPLOY CONCLUÍDO COM SUCESSO!**

*Este guia garante um deploy seguro, eficiente e facilmente repetível usando FileZilla + SSH.*