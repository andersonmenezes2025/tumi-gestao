# 🚀 Workflow de Desenvolvimento Contínuo - Lovable → VPS

## 📋 Visão Geral

Este documento descreve o fluxo de trabalho para desenvolver no **Lovable** e fazer deploy automatizado na **VPS Hostinger**.

### 🔄 Fluxo Resumido
```
Lovable (Dev) → Build Local → Sync → VPS (Production)
```

## 🛠️ Comandos Rápidos

### Desenvolvimento Local
```bash
# Rodar em modo desenvolvimento
npm run dev

# Rodar com backend
npm run dev:server

# Build completo
npm run deploy:prepare
```

### Deploy para VPS
```bash
# Opção 1: Sync manual
./scripts/sync-from-lovable.sh

# Opção 2: Deploy automatizado
./scripts/sync-from-lovable.sh --auto-deploy

# Opção 3: Deploy direto na VPS
./scripts/deploy.sh
```

## 📝 Processo Detalhado

### 1. 💻 Desenvolvimento no Lovable

1. **Trabalhe normalmente no Lovable**
   - Use o preview em tempo real
   - Teste todas as funcionalidades
   - Garanta que não há erros no console

2. **Faça download do projeto**
   - Clique em "Download" no Lovable
   - Extraia os arquivos na sua máquina local

### 2. 🔨 Preparação para Deploy

1. **Validação local** (automático no sync)
   ```bash
   cd seu-projeto-lovable
   npm ci
   npm run build
   npm run build:server
   ```

2. **Executar sincronização**
   ```bash
   ./scripts/sync-from-lovable.sh
   ```

### 3. 🚀 Deploy na VPS

#### Opção A: Deploy Automatizado (Recomendado)
```bash
# Configure uma vez as variáveis no script
./scripts/sync-from-lovable.sh --auto-deploy
```

#### Opção B: Deploy Manual
```bash
# 1. Upload para VPS
scp /tmp/tumi-gestao-deploy.tar.gz root@sua-vps-ip:/tmp/

# 2. Deploy na VPS
ssh root@sua-vps-ip
cd /tmp
tar -xzf tumi-gestao-deploy.tar.gz
cp -r tumi-gestao-sync/* /var/www/tumi/gestao/
cd /var/www/tumi/gestao
./scripts/deploy.sh
```

### 4. ✅ Verificação

1. **Verificar aplicação**
   ```bash
   # Na VPS
   pm2 status
   pm2 logs tumi-gestao-api
   ```

2. **Testar no navegador**
   - Frontend: `https://tumihortifruti.com.br/gestao`
   - API: `https://tumihortifruti.com.br/api/health`

## 🔧 Scripts Disponíveis

### package.json
```json
{
  "scripts": {
    "dev": "vite",
    "dev:server": "concurrently \"vite\" \"npm run server:dev\"",
    "server:dev": "tsx watch server/index.ts",
    "build": "vite build",
    "build:server": "tsc --project tsconfig.server.json",
    "deploy:prepare": "npm run build && npm run build:server",
    "deploy:validate": "npm run build && npm run build:server && echo '✅ Build OK'"
  }
}
```

### Scripts de Deploy
- `scripts/sync-from-lovable.sh` - Sincronização do Lovable
- `scripts/deploy.sh` - Deploy direto na VPS
- `scripts/deploy-automatizado.sh` - Setup completo da VPS
- `scripts/setup-vps.sh` - Configuração inicial da VPS

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de Build Local
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Erro de Conexão com VPS
```bash
# Testar conexão
ssh root@sua-vps-ip
ping sua-vps-ip
```

#### 3. Aplicação não inicia na VPS
```bash
# Na VPS
pm2 logs tumi-gestao-api
pm2 restart tumi-gestao-api
systemctl status nginx
```

#### 4. Banco de dados não conecta
```bash
# Na VPS
sudo -u postgres psql
\l  # listar databases
\q  # sair

# Verificar logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Rollback Rápido
```bash
# Na VPS - voltar para backup anterior
cd /var/backups/tumi-gestao
ls -la  # ver backups disponíveis
cp -r deploy-YYYYMMDD_HHMMSS/dist /var/www/tumi/gestao/
pm2 restart tumi-gestao-api
```

## 📊 Monitoramento

### Logs Importantes
```bash
# Logs da aplicação
pm2 logs tumi-gestao-api

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do sistema
sudo tail -f /var/log/tumi-gestao/combined.log
```

### Health Checks
```bash
# API Health
curl https://tumihortifruti.com.br/api/health

# Status do banco
curl https://tumihortifruti.com.br/api/health/db

# Status da aplicação
pm2 status tumi-gestao-api
```

## 🔄 Fluxo de Trabalho Diário

1. **Manhã**: Baixar projeto do Lovable se houve mudanças
2. **Desenvolvimento**: Trabalhar no Lovable normalmente
3. **Deploy**: Quando concluir uma feature/fix, executar sync
4. **Teste**: Verificar funcionamento na VPS
5. **Repetir**: Voltar ao desenvolvimento

## 📈 Otimizações Futuras

- [ ] CI/CD com GitHub Actions
- [ ] Testes automatizados antes do deploy
- [ ] Deploy por webhook do Lovable
- [ ] Monitoramento com alertas
- [ ] Backup automatizado do banco
- [ ] Ambiente de staging

## 🆘 Contatos de Emergência

- **VPS**: Hostinger Support
- **Domain**: Registrar do domínio
- **Database**: Backup em `/var/backups/tumi-gestao/`

---

**💡 Dica**: Mantenha sempre um backup antes de fazer deploy e teste localmente antes de enviar para produção!