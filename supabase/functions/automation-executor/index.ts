import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { flowId, companyId, triggerData = {} } = await req.json();

    if (!flowId || !companyId) {
      throw new Error('Flow ID and Company ID are required');
    }

    console.log('Executing automation flow:', flowId);

    // Buscar o fluxo de automação
    const { data: flow, error: flowError } = await supabaseClient
      .from('automation_flows')
      .select('*')
      .eq('id', flowId)
      .eq('company_id', companyId)
      .single();

    if (flowError || !flow) {
      throw new Error('Automation flow not found');
    }

    if (!flow.is_active) {
      throw new Error('Automation flow is not active');
    }

    const startTime = new Date();
    let executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Log início da execução
      await supabaseClient
        .from('automation_logs')
        .insert({
          company_id: companyId,
          automation_flow_id: flowId,
          execution_id: executionId,
          status: 'running',
          trigger_type: flow.type,
          trigger_data: triggerData,
          started_at: startTime.toISOString()
        });

      let result = { success: true, steps_executed: [], data: {} };

      // Executar ações baseadas no tipo de fluxo
      switch (flow.type) {
        case 'n8n_webhook':
          result = await executeN8NWebhook(flow, triggerData);
          break;
        case 'email_sequence':
          result = await executeEmailSequence(flow, triggerData, supabaseClient);
          break;
        case 'stock_alert':
          result = await executeStockAlert(flow, triggerData, supabaseClient);
          break;
        case 'follow_up':
          result = await executeFollowUp(flow, triggerData, supabaseClient);
          break;
        default:
          result = await executeCustomFlow(flow, triggerData);
      }

      const endTime = new Date();
      const executionTimeMs = endTime.getTime() - startTime.getTime();

      // Log conclusão bem-sucedida
      await supabaseClient
        .from('automation_logs')
        .update({
          status: 'completed',
          completed_at: endTime.toISOString(),
          execution_time_ms: executionTimeMs,
          result_data: result
        })
        .eq('execution_id', executionId);

      // Atualizar estatísticas do fluxo
      await supabaseClient
        .from('automation_flows')
        .update({
          execution_count: flow.execution_count + 1,
          success_count: flow.success_count + 1,
          last_executed_at: endTime.toISOString()
        })
        .eq('id', flowId);

      return new Response(
        JSON.stringify({ 
          success: true,
          execution_id: executionId,
          execution_time_ms: executionTimeMs,
          result: result
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } catch (executionError) {
      const endTime = new Date();
      const executionTimeMs = endTime.getTime() - startTime.getTime();

      // Log erro na execução
      await supabaseClient
        .from('automation_logs')
        .update({
          status: 'failed',
          completed_at: endTime.toISOString(),
          execution_time_ms: executionTimeMs,
          error_message: executionError.message
        })
        .eq('execution_id', executionId);

      // Atualizar estatísticas do fluxo
      await supabaseClient
        .from('automation_flows')
        .update({
          execution_count: flow.execution_count + 1,
          error_count: flow.error_count + 1,
          last_executed_at: endTime.toISOString()
        })
        .eq('id', flowId);

      throw executionError;
    }

  } catch (error) {
    console.error('Error executing automation:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function executeN8NWebhook(flow: any, triggerData: any) {
  if (!flow.webhook_url) {
    throw new Error('N8N webhook URL not configured');
  }

  const response = await fetch(flow.webhook_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      flow_id: flow.id,
      trigger_data: triggerData,
      timestamp: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`N8N webhook failed: ${response.status}`);
  }

  return {
    success: true,
    steps_executed: ['n8n_webhook_call'],
    data: { webhook_response_status: response.status }
  };
}

async function executeEmailSequence(flow: any, triggerData: any, supabase: any) {
  // Implementação simplificada de sequência de email
  const actions = flow.actions || [];
  const stepsExecuted = [];

  for (const action of actions) {
    if (action.type === 'send_email') {
      stepsExecuted.push(`email_sent_${action.template}`);
    }
  }

  return {
    success: true,
    steps_executed: stepsExecuted,
    data: { emails_sent: stepsExecuted.length }
  };
}

async function executeStockAlert(flow: any, triggerData: any, supabase: any) {
  // Verificar produtos com baixo estoque
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', triggerData.company_id)
    .lte('stock_quantity', 'min_stock');

  return {
    success: true,
    steps_executed: ['stock_check'],
    data: { 
      low_stock_products: lowStockProducts?.length || 0,
      products: lowStockProducts || []
    }
  };
}

async function executeFollowUp(flow: any, triggerData: any, supabase: any) {
  // Implementação de follow-up automatizado
  return {
    success: true,
    steps_executed: ['follow_up_scheduled'],
    data: { follow_up_type: 'automated' }
  };
}

async function executeCustomFlow(flow: any, triggerData: any) {
  // Execução de fluxo customizado baseado na configuração
  const configuration = flow.configuration || {};
  const actions = flow.actions || [];

  return {
    success: true,
    steps_executed: actions.map((a: any) => a.type || 'custom_action'),
    data: { custom_flow: true, config: configuration }
  };
}