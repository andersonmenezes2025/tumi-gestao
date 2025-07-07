import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, User, DollarSign } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Quote = Tables<'quotes'>;

interface OrcamentosStatsProps {
  quotes: Quote[];
}

export function OrcamentosStats({ quotes }: OrcamentosStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quotes.length}</div>
          <p className="text-xs text-muted-foreground">orçamentos criados</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quotes.filter(q => q.status === 'pending').length}</div>
          <p className="text-xs text-muted-foreground">aguardando resposta</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quotes.filter(q => q.status === 'approved').length}</div>
          <p className="text-xs text-muted-foreground">orçamentos aceitos</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {quotes.reduce((total, quote) => total + quote.total_amount, 0).toFixed(2).replace('.', ',')}
          </div>
          <p className="text-xs text-muted-foreground">valor total dos orçamentos</p>
        </CardContent>
      </Card>
    </div>
  );
}