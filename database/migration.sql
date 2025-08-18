-- Script de migração completa para PostgreSQL
-- Sistema de Gestão Tumi Hortifruti
-- Database: tumigestao_db

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função para gerar UUIDs (compatibilidade com gen_random_uuid)
CREATE OR REPLACE FUNCTION gen_random_uuid() RETURNS uuid AS $$
BEGIN
    RETURN uuid_generate_v4();
END;
$$ LANGUAGE plpgsql;

-- Função para simular auth.uid() do Supabase
CREATE OR REPLACE FUNCTION auth_uid() RETURNS uuid AS $$
BEGIN
    -- Retorna o user_id do contexto atual (será definido pela aplicação)
    RETURN CURRENT_SETTING('app.current_user_id', TRUE)::uuid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar tipos enum
CREATE TYPE app_role AS ENUM ('admin', 'user');

-- ===== TABELAS =====

-- Tabela profiles (substitui auth.users)
CREATE TABLE profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    full_name text,
    phone text,
    role text DEFAULT 'user'::text,
    company_id uuid,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT validate_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Tabela companies
CREATE TABLE companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    cnpj text,
    email text,
    phone text,
    address text,
    city text,
    state text,
    zip_code text,
    logo_url text,
    primary_color text DEFAULT '#3b82f6'::text,
    secondary_color text DEFAULT '#64748b'::text,
    website text,
    facebook_url text,
    instagram_url text,
    whatsapp_number text,
    google_calendar_token text,
    google_calendar_integration boolean DEFAULT false,
    creator_id uuid REFERENCES profiles(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Adicionar FK depois da criação da tabela companies
ALTER TABLE profiles ADD CONSTRAINT profiles_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id);

-- Tabela product_categories
CREATE TABLE product_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela product_units
CREATE TABLE product_units (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    name text NOT NULL,
    abbreviation text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabela products
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    category_id uuid REFERENCES product_categories(id),
    name text NOT NULL,
    description text,
    sku text,
    barcode text,
    unit text DEFAULT 'un'::text,
    price numeric DEFAULT 0 NOT NULL,
    cost_price numeric DEFAULT 0,
    stock_quantity integer DEFAULT 0,
    min_stock integer DEFAULT 0,
    max_stock integer,
    profit_margin_percentage numeric DEFAULT 30,
    image_url text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela suppliers
CREATE TABLE suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    name text NOT NULL,
    contact_name text,
    email text,
    phone text,
    address text,
    city text,
    state text,
    zip_code text,
    cnpj text,
    notes text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabela product_purchases
CREATE TABLE product_purchases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    product_id uuid NOT NULL REFERENCES products(id),
    supplier_id uuid REFERENCES suppliers(id),
    supplier_name text,
    quantity numeric DEFAULT 0 NOT NULL,
    unit_cost numeric DEFAULT 0 NOT NULL,
    total_cost numeric DEFAULT 0 NOT NULL,
    purchase_date date DEFAULT CURRENT_DATE NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabela customers
CREATE TABLE customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    name text NOT NULL,
    email text,
    phone text,
    document text,
    document_type text DEFAULT 'cpf'::text,
    address text,
    city text,
    state text,
    zip_code text,
    birth_date date,
    notes text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela sales
CREATE TABLE sales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    customer_id uuid REFERENCES customers(id),
    user_id uuid REFERENCES profiles(id),
    sale_number text NOT NULL,
    total_amount numeric DEFAULT 0 NOT NULL,
    discount_amount numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    status text DEFAULT 'draft'::text,
    payment_method text,
    payment_status text DEFAULT 'pending'::text,
    due_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela sale_items
CREATE TABLE sale_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id uuid NOT NULL REFERENCES sales(id),
    product_id uuid NOT NULL REFERENCES products(id),
    quantity numeric NOT NULL,
    unit_price numeric NOT NULL,
    discount_percentage numeric DEFAULT 0,
    total_price numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Tabela quotes
CREATE TABLE quotes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text,
    total_amount numeric DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text,
    notes text,
    valid_until date,
    public_token text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela quote_items
CREATE TABLE quote_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id uuid NOT NULL REFERENCES quotes(id),
    product_id uuid REFERENCES products(id),
    product_name text NOT NULL,
    quantity numeric NOT NULL,
    unit_price numeric NOT NULL,
    total_price numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Tabela accounts_receivable
CREATE TABLE accounts_receivable (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    customer_id uuid REFERENCES customers(id),
    sale_id uuid REFERENCES sales(id),
    description text NOT NULL,
    amount numeric NOT NULL,
    due_date date NOT NULL,
    payment_date date,
    payment_amount numeric,
    status text DEFAULT 'pending'::text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela accounts_payable
CREATE TABLE accounts_payable (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    description text NOT NULL,
    supplier_name text,
    amount numeric NOT NULL,
    due_date date NOT NULL,
    payment_date date,
    payment_amount numeric,
    status text DEFAULT 'pending'::text,
    category text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela agenda_events
CREATE TABLE agenda_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    title text NOT NULL,
    description text,
    location text,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    type text DEFAULT 'meeting'::text,
    status text DEFAULT 'scheduled'::text,
    created_by uuid REFERENCES profiles(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela integrations
CREATE TABLE integrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    type text NOT NULL,
    name text NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb,
    active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela automation_flows
CREATE TABLE automation_flows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    name text NOT NULL,
    description text,
    type text DEFAULT 'custom'::text NOT NULL,
    configuration jsonb DEFAULT '{}'::jsonb,
    trigger_conditions jsonb DEFAULT '{}'::jsonb,
    actions jsonb DEFAULT '[]'::jsonb,
    webhook_url text,
    is_active boolean DEFAULT true,
    execution_count integer DEFAULT 0,
    success_count integer DEFAULT 0,
    error_count integer DEFAULT 0,
    last_executed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabela automation_logs
CREATE TABLE automation_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    automation_flow_id uuid REFERENCES automation_flows(id),
    execution_id text,
    status text NOT NULL,
    trigger_type text,
    trigger_data jsonb DEFAULT '{}'::jsonb,
    result_data jsonb DEFAULT '{}'::jsonb,
    execution_time_ms integer,
    error_message text,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);

-- Tabela ai_insights
CREATE TABLE ai_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    type text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    priority text DEFAULT 'medium'::text,
    status text DEFAULT 'active'::text,
    confidence_score numeric,
    valid_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabela marketing_campaigns
CREATE TABLE marketing_campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    name text NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    subject text,
    content text NOT NULL,
    target_audience jsonb DEFAULT '{}'::jsonb,
    scheduled_at timestamp with time zone,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela crm_leads
CREATE TABLE crm_leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    name text NOT NULL,
    email text,
    phone text,
    source text DEFAULT 'manual'::text,
    status text DEFAULT 'new'::text,
    notes text,
    last_contact_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela online_quotes
CREATE TABLE online_quotes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text,
    company_name text,
    message text,
    status text DEFAULT 'pending'::text,
    observations text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabela online_quote_items
CREATE TABLE online_quote_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    online_quote_id uuid NOT NULL REFERENCES online_quotes(id),
    product_id uuid REFERENCES products(id),
    product_name text NOT NULL,
    quantity numeric DEFAULT 1 NOT NULL,
    unit_price numeric DEFAULT 0 NOT NULL,
    total_price numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabela audit_logs
CREATE TABLE audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id),
    company_id uuid REFERENCES companies(id),
    table_name text NOT NULL,
    action text NOT NULL,
    record_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

-- Tabela user_sessions
CREATE TABLE user_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id),
    session_token text NOT NULL,
    ip_address inet,
    user_agent text,
    last_activity timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Tabela rate_limits
CREATE TABLE rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address inet NOT NULL,
    endpoint text NOT NULL,
    request_count integer DEFAULT 1,
    window_start timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- ===== FUNÇÕES =====

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar número de venda
CREATE OR REPLACE FUNCTION generate_sale_number(company_uuid uuid)
RETURNS text AS $$
DECLARE
    next_number INTEGER;
    new_sale_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(s.sale_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM sales s
    WHERE s.company_id = company_uuid
    AND s.sale_number ~ '^VD[0-9]+$';
    
    new_sale_number := 'VD' || LPAD(next_number::TEXT, 6, '0');
    RETURN new_sale_number;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar token de orçamento
CREATE OR REPLACE FUNCTION generate_quote_token()
RETURNS text AS $$
BEGIN
    RETURN LOWER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Função para validar email
CREATE OR REPLACE FUNCTION validate_email(email text)
RETURNS boolean AS $$
BEGIN
    RETURN email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para validar telefone
CREATE OR REPLACE FUNCTION validate_phone(phone text)
RETURNS boolean AS $$
BEGIN
    RETURN phone ~ '^\(\d{2}\)\s\d{4,5}-\d{4}$' OR phone IS NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para sanitizar dados de cliente
CREATE OR REPLACE FUNCTION sanitize_customer_data()
RETURNS trigger AS $$
BEGIN
    -- Validar email
    IF NEW.email IS NOT NULL AND NOT validate_email(NEW.email) THEN
        RAISE EXCEPTION 'Invalid email format';
    END IF;
    
    -- Validar telefone
    IF NEW.phone IS NOT NULL AND NOT validate_phone(NEW.phone) THEN
        RAISE EXCEPTION 'Invalid phone format';
    END IF;
    
    -- Sanitizar campos de texto
    IF NEW.name IS NOT NULL THEN
        NEW.name := regexp_replace(NEW.name, '<[^>]*>', '', 'g');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar estoque após compra
CREATE OR REPLACE FUNCTION update_stock_after_purchase()
RETURNS trigger AS $$
BEGIN
    UPDATE products 
    SET 
        stock_quantity = COALESCE(stock_quantity, 0) + NEW.quantity,
        updated_at = now()
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para sanitizar conteúdo HTML
CREATE OR REPLACE FUNCTION sanitize_html_content(content text)
RETURNS text AS $$
BEGIN
    IF content IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Remover tags script e javascript
    content := regexp_replace(content, '<script[^>]*>.*?</script>', '', 'gi');
    content := regexp_replace(content, 'javascript:', '', 'gi');
    content := regexp_replace(content, 'on\w+\s*=', '', 'gi');
    
    -- Permitir apenas tags HTML seguras
    content := regexp_replace(content, '<(?!/?(?:b|i|u|em|strong|p|br|span)\b)[^>]*>', '', 'gi');
    
    RETURN content;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ===== TRIGGERS =====

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_receivable_updated_at BEFORE UPDATE ON accounts_receivable FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_payable_updated_at BEFORE UPDATE ON accounts_payable FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_purchases_updated_at BEFORE UPDATE ON product_purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_units_updated_at BEFORE UPDATE ON product_units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agenda_events_updated_at BEFORE UPDATE ON agenda_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_flows_updated_at BEFORE UPDATE ON automation_flows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON marketing_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_leads_updated_at BEFORE UPDATE ON crm_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_online_quotes_updated_at BEFORE UPDATE ON online_quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para sanitizar dados de cliente
CREATE TRIGGER sanitize_customer_data_trigger BEFORE INSERT OR UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION sanitize_customer_data();

-- Trigger para atualizar estoque após compra
CREATE TRIGGER update_stock_after_purchase_trigger AFTER INSERT ON product_purchases FOR EACH ROW EXECUTE FUNCTION update_stock_after_purchase();

-- ===== ÍNDICES =====

-- Índices para performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_sales_company_id ON sales(company_id);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_quotes_company_id ON quotes(company_id);
CREATE INDEX idx_quotes_public_token ON quotes(public_token);
CREATE INDEX idx_accounts_receivable_company_id ON accounts_receivable(company_id);
CREATE INDEX idx_accounts_payable_company_id ON accounts_payable(company_id);
CREATE INDEX idx_agenda_events_company_id ON agenda_events(company_id);
CREATE INDEX idx_agenda_events_dates ON agenda_events(start_date, end_date);

-- ===== DADOS INICIAIS =====

-- Inserir usuário admin padrão
INSERT INTO profiles (
    id, 
    email, 
    password_hash, 
    full_name, 
    role, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@tumihortifruti.com.br',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8.J7hb9e2QRzL3KuRrm', -- senha: admin123
    'Administrador Sistema',
    'admin',
    now(),
    now()
);

COMMIT;