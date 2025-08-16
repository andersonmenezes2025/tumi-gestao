import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompany } from '@/hooks/useCompany';
import { FinancialDashboard } from '@/components/financial/FinancialDashboard';
import { ReceivableForm } from '@/components/financial/ReceivableForm';
import { PayableForm } from '@/components/financial/PayableForm';
import { Loader2 } from 'lucide-react';

export default function Financeiro() {
  const { hasCompany, company, loading } = useCompany();
  const [showNewReceivable, setShowNewReceivable] = useState(false);
  const [showNewPayable, setShowNewPayable] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasCompany) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você precisa estar associado a uma empresa para acessar o módulo financeiro.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">
            Gerencie suas finanças e fluxo de caixa - {company?.name || 'Sua Empresa'}
          </p>
        </div>
      </div>

      <FinancialDashboard 
        onNewReceivable={() => setShowNewReceivable(true)}
        onNewPayable={() => setShowNewPayable(true)}
      />

      <ReceivableForm 
        open={showNewReceivable} 
        onOpenChange={setShowNewReceivable} 
      />
      
      <PayableForm 
        open={showNewPayable} 
        onOpenChange={setShowNewPayable} 
      />
    </div>
  );
}