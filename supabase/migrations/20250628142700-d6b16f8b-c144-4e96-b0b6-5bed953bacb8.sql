
-- Adicionar campos para identidade visual e configurações da empresa
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#3b82f6';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#64748b';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS facebook_url text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_number text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_calendar_integration boolean DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_calendar_token text;

-- Adicionar campo de margem de lucro padrão para produtos
ALTER TABLE products ADD COLUMN IF NOT EXISTS profit_margin_percentage numeric DEFAULT 30;

-- Criar tabela para campanhas de marketing
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'whatsapp', 'social')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'completed', 'paused')),
  subject text,
  content text NOT NULL,
  target_audience jsonb DEFAULT '{}',
  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para leads/contatos do CRM
CREATE TABLE IF NOT EXISTS crm_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  source text DEFAULT 'manual',
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
  notes text,
  last_contact_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para integrações externas
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('google_calendar', 'whatsapp', 'email', 'social')),
  name text NOT NULL,
  settings jsonb DEFAULT '{}',
  active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(company_id, type)
);

-- Atualizar trigger para updated_at nas novas tabelas
CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_leads_updated_at
  BEFORE UPDATE ON crm_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS nas novas tabelas
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para campanhas de marketing
CREATE POLICY "Users can view their company campaigns" ON marketing_campaigns
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create campaigns for their company" ON marketing_campaigns
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company campaigns" ON marketing_campaigns
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their company campaigns" ON marketing_campaigns
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Políticas RLS para leads do CRM
CREATE POLICY "Users can view their company leads" ON crm_leads
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create leads for their company" ON crm_leads
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company leads" ON crm_leads
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their company leads" ON crm_leads
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Políticas RLS para integrações
CREATE POLICY "Users can view their company integrations" ON integrations
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create integrations for their company" ON integrations
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company integrations" ON integrations
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their company integrations" ON integrations
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );
