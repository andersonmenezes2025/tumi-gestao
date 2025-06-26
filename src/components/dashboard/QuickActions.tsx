
import React from 'react';
import { Plus, ShoppingCart, Users, Package, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const actions = [
  {
    icon: ShoppingCart,
    label: 'Nova Venda',
    description: 'Iniciar um novo pedido',
    color: 'bg-green-500 hover:bg-green-600',
    href: '/vendas/nova'
  },
  {
    icon: Package,
    label: 'Cadastrar Produto',
    description: 'Adicionar item ao estoque',
    color: 'bg-blue-500 hover:bg-blue-600',
    href: '/produtos/novo'
  },
  {
    icon: Users,
    label: 'Novo Cliente',
    description: 'Cadastrar cliente',
    color: 'bg-purple-500 hover:bg-purple-600',
    href: '/clientes/novo'
  },
  {
    icon: FileText,
    label: 'Gerar Orçamento',
    description: 'Criar proposta',
    color: 'bg-orange-500 hover:bg-orange-600',
    href: '/orcamentos/novo'
  }
];

export const QuickActions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.href}
              variant="ghost"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
              onClick={() => console.log(`Navigate to ${action.href}`)}
            >
              <div className={`p-3 rounded-full text-white ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
