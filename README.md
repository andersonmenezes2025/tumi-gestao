# TumiGestão - Sistema de Gestão Comercial

Sistema de gestão comercial completo desenvolvido com React, TypeScript e PostgreSQL.

## 🏗️ Arquitetura

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript + JWT Authentication  
- **Database**: PostgreSQL com connection pooling
- **Infrastructure**: NGINX + PM2 + SSL

Veja [ARQUITETURA-SISTEMA.md](./ARQUITETURA-SISTEMA.md) para detalhes completos da arquitetura.

## 🚀 Funcionalidades

### 📊 Core Business
- **Dashboard Analítico**: Visão geral das vendas, receitas e métricas
- **Gestão de Produtos**: Cadastro, categorias, controle de estoque, fornecedores
- **Vendas**: Sistema completo de PDV com múltiplas formas de pagamento
- **Clientes**: Cadastro e gestão completa de clientes
- **Orçamentos**: Criação, compartilhamento e conversão em vendas

### 💰 Financeiro
- **Contas a Pagar/Receber**: Gestão completa do fluxo financeiro
- **Relatórios**: Relatórios detalhados de vendas e financeiro
- **Fluxo de Caixa**: Controle de entrada e saída

### 🔧 Automação & Integrações
- **Agenda**: Gerenciamento de eventos e compromissos
- **Automação**: Fluxos automatizados com N8N
- **Integrações**: WhatsApp Business, Email Marketing, Stripe
- **CRM**: Gestão de leads e campanhas de marketing

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** - Interface de usuário
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Styling framework
- **Shadcn/ui** - Componentes de UI
- **Tanstack Query** - State management e cache
- **React Router v6** - Roteamento
- **React Hook Form + Zod** - Formulários e validação

### Backend
- **Express.js** - Framework web
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Multer** - Upload de arquivos
- **CORS** - Controle de acesso

## 📦 Instalação Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Clone e Instale
```bash
git clone <repo-url>
cd tumigestao
npm install
```

### 2. Configure o Banco de Dados
```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib

# Criar banco e usuário
sudo -u postgres psql
CREATE DATABASE tumigestao_db;
CREATE USER tumigestao_user WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE tumigestao_db TO tumigestao_user;
\q

# Executar schema (usar script do DEPLOY-MANUAL-VPS.md)
psql -h localhost -U tumigestao_user -d tumigestao_db -f database_schema.sql
```

### 3. Configure Variáveis de Ambiente
```bash
# Copiar exemplo
cp .env.example .env

# Editar .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tumigestao_db
DB_USER=tumigestao_user
DB_PASSWORD=sua_senha
JWT_SECRET=sua_chave_jwt_muito_segura
NODE_ENV=development
PORT=3000
```

### 4. Execute o Projeto
```bash
# Frontend (terminal 1)
npm run dev

# Backend (terminal 2)
cd server
npm install
npm run dev
```

Acesse: http://localhost:5173

## 🚀 Deploy em Produção

Para deploy manual em VPS, consulte o guia completo:
**[DEPLOY-MANUAL-VPS.md](./DEPLOY-MANUAL-VPS.md)**

O guia inclui:
- Configuração completa do servidor
- Script de criação do banco de dados
- Configuração NGINX + SSL
- PM2 para gerenciamento de processos
- Scripts de backup e monitoramento

## 🔒 Autenticação

Sistema de autenticação JWT completo:
- Login/Registro de usuários
- Hash seguro de senhas (bcrypt)
- Tokens JWT com expiração
- Middleware de autenticação
- Controle de acesso por empresa
- Sessões de usuário

## 📊 Estrutura do Banco

PostgreSQL com 25+ tabelas organizadas em módulos:

### Core
- `companies` - Empresas
- `profiles` - Perfis de usuário  
- `products` - Produtos e categorias
- `customers` - Clientes
- `suppliers` - Fornecedores

### Vendas & Financeiro
- `sales` + `sale_items` - Vendas
- `quotes` + `quote_items` - Orçamentos
- `accounts_receivable/payable` - Financeiro

### Automação & CRM
- `automation_flows` - Automações
- `integrations` - Integrações externas
- `crm_leads` - Leads do CRM
- `marketing_campaigns` - Campanhas

### Sistema
- `audit_logs` - Auditoria
- `user_sessions` - Sessões
- `rate_limits` - Rate limiting

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
# Frontend
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # ESLint

# Backend
cd server
npm run dev          # Servidor backend dev
npm run build        # Build TypeScript
npm start           # Servidor produção
```

### Estrutura de Pastas
```
├── src/
│   ├── components/     # Componentes React
│   ├── pages/         # Páginas da aplicação
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilitários
│   ├── types/         # Tipos TypeScript
│   └── contexts/      # Context providers
├── server/
│   ├── routes/        # Rotas da API
│   ├── middleware/    # Middlewares
│   ├── config/        # Configurações
│   └── types/         # Tipos do backend
└── public/            # Assets estáticos
```

## 🔌 Integrações Suportadas

- **N8N**: Automação de workflows
- **WhatsApp Business**: Mensagens automáticas
- **Email Marketing**: SMTP, SendGrid, Resend  
- **Stripe**: Processamento de pagamentos
- **Google Calendar**: Sincronização de agenda

## 📱 Funcionalidades Detalhadas

### Dashboard
- Métricas em tempo real
- Gráficos de receita e vendas
- Top produtos e clientes
- Atividades recentes

### Produtos
- Cadastro completo com categorias
- Controle de estoque automático
- Gestão de fornecedores e compras
- Upload de imagens
- SKU e códigos de barras

### Vendas (PDV)
- Interface intuitiva de ponto de venda
- Múltiplas formas de pagamento
- Desconto por item ou total
- Geração automática de contas a receber
- Controle de estoque automático

### Orçamentos
- Criação rápida de orçamentos
- Compartilhamento via link público
- Conversão em vendas
- Controle de validade e status

### Financeiro
- Contas a pagar e receber
- Fluxo de caixa detalhado
- Relatórios financeiros
- Controle de vencimentos

## 🛡️ Segurança

- **Autenticação JWT** com refresh tokens
- **Bcrypt** para hash de senhas  
- **CORS** configurado
- **Rate limiting** por IP
- **SQL injection** prevention
- **File upload** validation
- **Audit logs** completos

## 📊 Performance

- **Connection pooling** PostgreSQL
- **Query optimization** com índices
- **Frontend code splitting**
- **Static assets caching**
- **Gzip compression**
- **CDN ready**

## 🔍 Monitoramento

- Health check endpoint
- Application logs
- Database connection monitoring
- PM2 process monitoring
- NGINX access/error logs

## 📝 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas sobre deploy ou configuração, consulte:
- [ARQUITETURA-SISTEMA.md](./ARQUITETURA-SISTEMA.md)
- [DEPLOY-MANUAL-VPS.md](./DEPLOY-MANUAL-VPS.md)