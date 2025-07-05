
import React from 'react';
import { Plus, ShoppingCart, Users, Package, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const actions = [
  {
    icon: ShoppingCart,
    label: 'Nova Venda',
    description: 'Iniciar um novo pedido',
    color: 'bg-green-500 hover:bg-green-600',
    route: '/vendas'
  },
  {
    icon: Package,
    label: 'Cadastrar Produto',
    description: 'Adicionar item ao estoque',
    color: 'bg-blue-500 hover:bg-blue-600',
    route: '/produtos'
  },
  {
    icon: Users,
    label: 'Novo Cliente',
    description: 'Cadastrar cliente',
    color: 'bg-purple-500 hover:bg-purple-600',
    route: '/clientes'
  },
  {
    icon: FileText,
    label: 'Gerar Relatório',
    description: 'Visualizar relatórios',
    color: 'bg-orange-500 hover:bg-orange-600',
    route: '/relatorios'
  }
];

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleActionClick = (action: typeof actions[0]) => {
    navigate(action.route);
    toast({
      title: "Navegando...",
      description: `Redirecionando para ${action.label}`,
    });
  };
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
              key={action.route}
              variant="ghost"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
              onClick={() => handleActionClick(action)}
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
