import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { apiClient } from '@/lib/api-client';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export function useReports() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { companyId, company } = useCompany();

  const generateSalesReport = async (format: 'pdf' | 'excel' = 'pdf') => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      // Buscar dados de vendas
      const response = await apiClient.get(`/data/sales?company_id=${companyId}&order=created_at:desc`);
      const sales = response.data || [];

      const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
      const totalQuantity = sales.reduce((sum, sale) => 
        sum + sale.sale_items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
      );

      if (format === 'pdf') {
        const doc = new jsPDF();
        
        // Cabeçalho
        doc.setFontSize(20);
        doc.text(company?.name || 'Empresa', 20, 20);
        doc.setFontSize(16);
        doc.text('Relatório de Vendas', 20, 35);
        doc.setFontSize(12);
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
        
        // Resumo
        doc.setFontSize(14);
        doc.text('Resumo:', 20, 65);
        doc.setFontSize(12);
        doc.text(`Total de Vendas: ${sales.length}`, 20, 75);
        doc.text(`Valor Total: R$ ${totalSales.toFixed(2).replace('.', ',')}`, 20, 85);
        doc.text(`Produtos Vendidos: ${totalQuantity}`, 20, 95);
        doc.text(`Ticket Médio: R$ ${(totalSales / sales.length || 0).toFixed(2).replace('.', ',')}`, 20, 105);
        
        // Lista de vendas
        doc.setFontSize(14);
        doc.text('Vendas:', 20, 125);
        doc.setFontSize(10);
        
        let yPos = 135;
        sales.slice(0, 20).forEach((sale) => {
          const customerName = sale.customers?.name || 'Sem cliente';
          const date = new Date(sale.created_at || '').toLocaleDateString('pt-BR');
          const text = `${sale.sale_number} - ${customerName} - R$ ${sale.total_amount.toFixed(2).replace('.', ',')} - ${date}`;
          doc.text(text, 20, yPos);
          yPos += 10;
        });
        
        doc.save(`relatorio-vendas-${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        // Excel
        const ws = XLSX.utils.json_to_sheet(
          sales.map(sale => ({
            'Número': sale.sale_number,
            'Cliente': sale.customers?.name || 'Sem cliente',
            'Valor': sale.total_amount,
            'Status': sale.status,
            'Forma Pagamento': sale.payment_method,
            'Data': new Date(sale.created_at || '').toLocaleDateString('pt-BR')
          }))
        );
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Vendas');
        XLSX.writeFile(wb, `relatorio-vendas-${new Date().toISOString().split('T')[0]}.xlsx`);
      }

      toast({
        title: 'Relatório gerado!',
        description: `Relatório de vendas em ${format.toUpperCase()} foi baixado.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateFinancialReport = async (format: 'pdf' | 'excel' = 'pdf') => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const [salesRes, receivablesRes, payablesRes] = await Promise.all([
        apiClient.get(`/data/sales?company_id=${companyId}`),
        apiClient.get(`/data/accounts_receivable?company_id=${companyId}`),
        apiClient.get(`/data/accounts_payable?company_id=${companyId}`)
      ]);

      const sales = salesRes.data || [];
      const receivables = receivablesRes.data || [];
      const payables = payablesRes.data || [];

      const totalReceivables = receivables.reduce((sum, item) => sum + item.amount, 0);
      const totalPayables = payables.reduce((sum, item) => sum + item.amount, 0);
      const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);

      if (format === 'pdf') {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text(company?.name || 'Empresa', 20, 20);
        doc.setFontSize(16);
        doc.text('Relatório Financeiro', 20, 35);
        doc.setFontSize(12);
        doc.text(`Período: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
        
        doc.setFontSize(14);
        doc.text('Resumo Financeiro:', 20, 65);
        doc.setFontSize(12);
        doc.text(`Receitas: R$ ${totalSales.toFixed(2).replace('.', ',')}`, 20, 75);
        doc.text(`Contas a Receber: R$ ${totalReceivables.toFixed(2).replace('.', ',')}`, 20, 85);
        doc.text(`Contas a Pagar: R$ ${totalPayables.toFixed(2).replace('.', ',')}`, 20, 95);
        doc.text(`Saldo: R$ ${(totalSales - totalPayables).toFixed(2).replace('.', ',')}`, 20, 105);
        
        doc.save(`relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        const ws = XLSX.utils.json_to_sheet([
          { 'Indicador': 'Receitas', 'Valor': totalSales },
          { 'Indicador': 'Contas a Receber', 'Valor': totalReceivables },
          { 'Indicador': 'Contas a Pagar', 'Valor': totalPayables },
          { 'Indicador': 'Saldo', 'Valor': totalSales - totalPayables }
        ]);
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Financeiro');
        XLSX.writeFile(wb, `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.xlsx`);
      }

      toast({
        title: 'Relatório gerado!',
        description: `Relatório financeiro em ${format.toUpperCase()} foi baixado.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCustomersReport = async (format: 'pdf' | 'excel' = 'pdf') => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get(`/data/customers?company_id=${companyId}&order=created_at:desc`);
      const customers = response.data || [];

      if (format === 'pdf') {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text(company?.name || 'Empresa', 20, 20);
        doc.setFontSize(16);
        doc.text('Relatório de Clientes', 20, 35);
        doc.setFontSize(12);
        doc.text(`Total de Clientes: ${customers.length}`, 20, 45);
        doc.text(`Clientes Ativos: ${customers.filter(c => c.active).length}`, 20, 55);
        
        let yPos = 75;
        customers.slice(0, 25).forEach((customer) => {
          doc.setFontSize(10);
          doc.text(`${customer.name} - ${customer.email || 'Sem email'} - ${customer.phone || 'Sem telefone'}`, 20, yPos);
          yPos += 8;
        });
        
        doc.save(`relatorio-clientes-${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        const ws = XLSX.utils.json_to_sheet(
          customers.map(customer => ({
            'Nome': customer.name,
            'Email': customer.email || '',
            'Telefone': customer.phone || '',
            'Documento': customer.document || '',
            'Cidade': customer.city || '',
            'Status': customer.active ? 'Ativo' : 'Inativo',
            'Data Cadastro': new Date(customer.created_at || '').toLocaleDateString('pt-BR')
          }))
        );
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
        XLSX.writeFile(wb, `relatorio-clientes-${new Date().toISOString().split('T')[0]}.xlsx`);
      }

      toast({
        title: 'Relatório gerado!',
        description: `Relatório de clientes em ${format.toUpperCase()} foi baixado.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateProductsReport = async (format: 'pdf' | 'excel' = 'pdf') => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get(`/data/products?company_id=${companyId}&order=name:asc`);
      const products = response.data || [];

      const totalValue = products.reduce((sum, product) => 
        sum + (product.stock_quantity || 0) * (product.cost_price || 0), 0
      );

      if (format === 'pdf') {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text(company?.name || 'Empresa', 20, 20);
        doc.setFontSize(16);
        doc.text('Relatório de Produtos', 20, 35);
        doc.setFontSize(12);
        doc.text(`Total de Produtos: ${products.length}`, 20, 45);
        doc.text(`Valor do Estoque: R$ ${totalValue.toFixed(2).replace('.', ',')}`, 20, 55);
        doc.text(`Produtos Ativos: ${products.filter(p => p.active).length}`, 20, 65);
        
        let yPos = 85;
        products.slice(0, 20).forEach((product) => {
          doc.setFontSize(10);
          doc.text(`${product.name} - Estoque: ${product.stock_quantity || 0} - R$ ${product.price.toFixed(2).replace('.', ',')}`, 20, yPos);
          yPos += 8;
        });
        
        doc.save(`relatorio-produtos-${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        const ws = XLSX.utils.json_to_sheet(
          products.map(product => ({
            'Nome': product.name,
            'SKU': product.sku || '',
            'Preço': product.price,
            'Custo': product.cost_price || 0,
            'Estoque': product.stock_quantity || 0,
            'Estoque Mínimo': product.min_stock || 0,
            'Status': product.active ? 'Ativo' : 'Inativo'
          }))
        );
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
        XLSX.writeFile(wb, `relatorio-produtos-${new Date().toISOString().split('T')[0]}.xlsx`);
      }

      toast({
        title: 'Relatório gerado!',
        description: `Relatório de produtos em ${format.toUpperCase()} foi baixado.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateSalesReport,
    generateFinancialReport,
    generateCustomersReport,
    generateProductsReport
  };
}