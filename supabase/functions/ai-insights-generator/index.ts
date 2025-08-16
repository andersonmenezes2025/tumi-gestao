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

    const { companyId } = await req.json();

    if (!companyId) {
      throw new Error('Company ID is required');
    }

    console.log('Generating AI insights for company:', companyId);

    // Buscar dados da empresa para análise
    const [salesData, productsData, customersData, financialData] = await Promise.all([
      supabaseClient.from('sales').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(100),
      supabaseClient.from('products').select('*').eq('company_id', companyId),
      supabaseClient.from('customers').select('*').eq('company_id', companyId),
      supabaseClient.from('accounts_receivable').select('*').eq('company_id', companyId).eq('status', 'pending')
    ]);

    const insights = [];

    // Insight 1: Análise de vendas
    if (salesData.data && salesData.data.length > 0) {
      const totalSales = salesData.data.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
      const avgSale = totalSales / salesData.data.length;
      const recentSales = salesData.data.slice(0, 10);
      const recentTotal = recentSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
      const recentAvg = recentTotal / recentSales.length;
      
      if (recentAvg < avgSale * 0.8) {
        insights.push({
          company_id: companyId,
          type: 'sales',
          title: 'Queda nas Vendas Detectada',
          description: 'As vendas recentes estão 20% abaixo da média histórica. Recomendamos revisar estratégias de marketing e promoções.',
          priority: 'high',
          confidence_score: 0.85,
          data: {
            current_avg: recentAvg,
            historical_avg: avgSale,
            decline_percentage: ((avgSale - recentAvg) / avgSale * 100).toFixed(1)
          }
        });
      }
    }

    // Insight 2: Análise de estoque
    if (productsData.data && productsData.data.length > 0) {
      const lowStockProducts = productsData.data.filter(p => 
        p.stock_quantity !== null && 
        p.min_stock !== null && 
        p.stock_quantity <= p.min_stock
      );
      
      if (lowStockProducts.length > 0) {
        insights.push({
          company_id: companyId,
          type: 'inventory',
          title: 'Produtos com Estoque Baixo',
          description: `${lowStockProducts.length} produtos estão com estoque abaixo do mínimo. Considere reabastecer para evitar perdas de vendas.`,
          priority: lowStockProducts.length > 5 ? 'high' : 'medium',
          confidence_score: 0.95,
          data: {
            low_stock_count: lowStockProducts.length,
            products: lowStockProducts.map(p => ({ name: p.name, current: p.stock_quantity, min: p.min_stock }))
          }
        });
      }
    }

    // Insight 3: Análise financeira
    if (financialData.data && financialData.data.length > 0) {
      const overdueAmount = financialData.data
        .filter(r => new Date(r.due_date) < new Date())
        .reduce((sum, r) => sum + Number(r.amount), 0);
      
      if (overdueAmount > 0) {
        insights.push({
          company_id: companyId,
          type: 'financial',
          title: 'Valores em Atraso',
          description: `R$ ${overdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em recebíveis em atraso. Priorize a cobrança para melhorar o fluxo de caixa.`,
          priority: overdueAmount > 10000 ? 'high' : 'medium',
          confidence_score: 0.90,
          data: {
            overdue_amount: overdueAmount,
            overdue_count: financialData.data.filter(r => new Date(r.due_date) < new Date()).length
          }
        });
      }
    }

    // Insight 4: Análise de clientes
    if (customersData.data && customersData.data.length > 0) {
      const activeCustomers = customersData.data.filter(c => c.active).length;
      const totalCustomers = customersData.data.length;
      const inactiveRate = ((totalCustomers - activeCustomers) / totalCustomers) * 100;
      
      if (inactiveRate > 20) {
        insights.push({
          company_id: companyId,
          type: 'customer',
          title: 'Alta Taxa de Clientes Inativos',
          description: `${inactiveRate.toFixed(1)}% dos clientes estão inativos. Implemente estratégias de reativação para recuperar esses clientes.`,
          priority: 'medium',
          confidence_score: 0.80,
          data: {
            inactive_rate: inactiveRate,
            active_customers: activeCustomers,
            total_customers: totalCustomers
          }
        });
      }
    }

    // Salvar insights no banco
    if (insights.length > 0) {
      const { error } = await supabaseClient
        .from('ai_insights')
        .insert(insights);

      if (error) {
        throw error;
      }
    }

    console.log(`Generated ${insights.length} insights for company ${companyId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights_generated: insights.length,
        insights: insights 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating AI insights:', error);
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