-- Create automation_flows table for custom automation workflows
CREATE TABLE public.automation_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'custom',
  configuration JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  webhook_url TEXT,
  trigger_conditions JSONB DEFAULT '{}'::jsonb,
  actions JSONB DEFAULT '[]'::jsonb,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_insights table for AI-generated insights
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'sales_prediction', 'product_recommendation', 'financial_analysis', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'active', -- 'active', 'dismissed', 'implemented'
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation_logs table for execution tracking
CREATE TABLE public.automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  automation_flow_id UUID,
  execution_id TEXT,
  status TEXT NOT NULL, -- 'started', 'completed', 'failed', 'timeout'
  trigger_type TEXT,
  trigger_data JSONB DEFAULT '{}'::jsonb,
  result_data JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  execution_time_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.automation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for automation_flows
CREATE POLICY "Users can manage their company automation flows" 
ON public.automation_flows 
FOR ALL 
USING (company_id IN (
  SELECT profiles.company_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

-- Create policies for ai_insights
CREATE POLICY "Users can access their company AI insights" 
ON public.ai_insights 
FOR ALL 
USING (company_id IN (
  SELECT profiles.company_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

-- Create policies for automation_logs
CREATE POLICY "Users can access their company automation logs" 
ON public.automation_logs 
FOR ALL 
USING (company_id IN (
  SELECT profiles.company_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

-- Add foreign key constraints
ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_automation_flow_id_fkey 
FOREIGN KEY (id) REFERENCES automation_flows(id) ON DELETE CASCADE;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_automation_flows_updated_at
BEFORE UPDATE ON public.automation_flows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at
BEFORE UPDATE ON public.ai_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_automation_flows_company_id ON automation_flows(company_id);
CREATE INDEX idx_automation_flows_is_active ON automation_flows(is_active);
CREATE INDEX idx_ai_insights_company_id ON ai_insights(company_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(type);
CREATE INDEX idx_ai_insights_status ON ai_insights(status);
CREATE INDEX idx_automation_logs_company_id ON automation_logs(company_id);
CREATE INDEX idx_automation_logs_automation_flow_id ON automation_logs(automation_flow_id);
CREATE INDEX idx_automation_logs_status ON automation_logs(status);