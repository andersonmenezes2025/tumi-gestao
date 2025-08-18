# 📦 Scripts Recomendados para package.json

## Scripts de Deploy Contínuo

Adicione estes scripts ao seu `package.json` para facilitar o workflow de desenvolvimento:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:server": "concurrently \"vite\" \"npm run server:dev\"",
    "build": "vite build",
    "build:server": "tsc --project tsconfig.server.json",
    "server:dev": "tsx watch server/index.ts",
    "start:server": "node server/dist/index.js",
    
    // ===== SCRIPTS DE DEPLOY =====
    "deploy:prepare": "npm run build && npm run build:server",
    "deploy:validate": "npm run build && npm run build:server && echo '✅ Build OK'",
    "deploy:sync": "./scripts/sync-from-lovable.sh",
    "deploy:auto": "./scripts/sync-from-lovable.sh --auto-deploy",
    "deploy:quick": "./scripts/quick-deploy.sh",
    
    // ===== SCRIPTS DE MONITORAMENTO =====
    "monitor": "./scripts/monitor.sh",
    "monitor:detailed": "./scripts/monitor.sh detailed",
    "monitor:logs": "./scripts/monitor.sh logs",
    "monitor:test": "./scripts/monitor.sh test",
    
    // ===== SCRIPTS ORIGINAIS =====
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

## Como Usar os Scripts

### Desenvolvimento
```bash
# Rodar apenas frontend
npm run dev

# Rodar frontend + backend
npm run dev:server

# Validar build local
npm run deploy:validate
```

### Deploy
```bash
# Preparar para deploy (build completo)
npm run deploy:prepare

# Sync manual do Lovable
npm run deploy:sync

# Deploy automatizado
npm run deploy:auto

# Deploy rápido (apenas reload)
npm run deploy:quick
```

### Monitoramento
```bash
# Status rápido
npm run monitor

# Monitoramento detalhado
npm run monitor:detailed  

# Logs em tempo real
npm run monitor:logs

# Teste de carga
npm run monitor:test
```

## Dependências Necessárias

Para que todos os scripts funcionem corretamente, certifique-se de ter:

```bash
# Se não tiver concurrently
npm install --save-dev concurrently

# Na VPS
sudo npm install -g pm2
sudo apt install jq  # para melhor visualização de JSON
```

## Permissões dos Scripts

Execute uma vez para dar permissões:

```bash
chmod +x scripts/*.sh
```

---

**💡 Dica**: Copie os scripts do JSON acima e adicione ao seu package.json no Lovable!