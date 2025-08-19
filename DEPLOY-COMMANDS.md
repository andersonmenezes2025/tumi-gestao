# 🚀 Comandos de Deploy Automático

## Scripts Disponíveis

### 1. **Deploy Full Automático** (Recomendado)
```bash
./scripts/deploy-full.sh
```
- Sync completo do Lovable → VPS
- Build automático na VPS
- Deploy com backup e rollback
- Verificação de saúde
- **Mais seguro e completo**

### 2. **Deploy Rápido** (Para mudanças menores)
```bash
./scripts/quick-deploy.sh
```
- Apenas build e restart (sem sync)
- Uso: quando já fez sync manual antes
- Mais rápido mas sem sync de arquivos

### 3. **Sync Manual + Deploy**
```bash
# Preparar sync
./scripts/sync-from-lovable.sh

# Deploy automatizado na VPS
./scripts/sync-from-lovable.sh --auto-deploy
```

### 4. **Deploy com Sync Integrado** (Na VPS)
```bash
# Execute na VPS após sync manual
./scripts/deploy-with-sync.sh

# Rollback se necessário
./scripts/deploy-with-sync.sh --rollback
```

## 🎯 Fluxo Recomendado

### Para Deploy Normal:
1. **No Lovable**: `./scripts/deploy-full.sh`
2. **Aguardar**: Deploy automático completo
3. **Verificar**: https://tumihortifruti.com.br/gestao

### Para Correções Rápidas:
1. **Fazer correções no Lovable**
2. **Executar**: `./scripts/deploy-full.sh`
3. **Em caso de problema**: SSH na VPS e executar rollback

### Para Rollback:
```bash
# Conectar na VPS
ssh root@your-vps-ip

# Executar rollback
cd /var/www/tumi/gestao
./scripts/deploy-with-sync.sh --rollback
```

## 📋 Scripts NPM (Futuros)

Quando possível, adicione ao `package.json`:

```json
{
  "scripts": {
    "deploy:full": "./scripts/deploy-full.sh",
    "deploy:quick": "./scripts/quick-deploy.sh", 
    "deploy:sync": "./scripts/sync-from-lovable.sh",
    "deploy:auto": "./scripts/sync-from-lovable.sh --auto-deploy"
  }
}
```

## ⚙️ Configuração Inicial

1. **Dar permissões aos scripts:**
```bash
chmod +x scripts/*.sh
```

2. **Configurar IPs nos scripts:**
   - Editar `VPS_HOST` em `sync-from-lovable.sh`
   - Editar `VPS_HOST` em `deploy-full.sh`

## 🔍 Monitoramento

### Na VPS:
```bash
# Status da aplicação
pm2 status tumi-gestao-api

# Logs em tempo real
pm2 logs tumi-gestao-api

# Restart manual
pm2 restart tumi-gestao-api

# Health check
curl http://localhost:3001/api/health
```

### Arquivos importantes:
- **Logs**: `/var/log/tumi-gestao/`
- **Backups**: `/var/backups/tumi-gestao/`
- **App**: `/var/www/tumi/gestao/`

## 🚨 Solução de Problemas

### Deploy falha:
1. Rollback automático deve executar
2. Se não, executar rollback manual
3. Verificar logs: `pm2 logs tumi-gestao-api`

### Aplicação não inicia:
1. Verificar logs: `pm2 logs tumi-gestao-api`
2. Verificar banco: `curl localhost:3001/api/health`
3. Verificar TypeScript: `npm run build:server`

### Site não acessível:
1. Verificar Nginx: `systemctl status nginx`
2. Testar configuração: `nginx -t`
3. Verificar SSL: `certbot certificates`

## ✨ Recursos dos Scripts

### `deploy-full.sh`:
- ✅ Sync completo do Lovable
- ✅ Build com validação
- ✅ Deploy com backup
- ✅ Rollback automático em falhas
- ✅ Health checks
- ✅ Limpeza automática

### `deploy-with-sync.sh`:
- ✅ Backup antes do deploy
- ✅ Build com validação de erros
- ✅ Rollback em caso de falha
- ✅ Health checks robustos
- ✅ Logs detalhados
- ✅ Limpeza de backups antigos

### `sync-from-lovable.sh`:
- ✅ Validação de arquivos
- ✅ Sync sem build (evita erros)
- ✅ Deploy remoto opcional
- ✅ Compactação eficiente

---

**💡 Dica**: Use sempre `deploy-full.sh` para máxima segurança e automação!