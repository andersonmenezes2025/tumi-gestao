
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Activity {
  id: string;
  type: 'sale' | 'stock' | 'customer' | 'payment';
  title: string;
  description: string;
  time: string;
  status?: string;
  avatar?: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'sale',
    title: 'Nova venda realizada',
    description: 'Pedido #1234 - R$ 245,80',
    time: '2 min atrás',
    status: 'Concluída'
  },
  {
    id: '2', 
    type: 'stock',
    title: 'Estoque baixo',
    description: 'Produto: Maçã Gala - 5 unidades restantes',
    time: '15 min atrás',
    status: 'Alerta'
  },
  {
    id: '3',
    type: 'customer',
    title: 'Novo cliente cadastrado',
    description: 'Maria Silva - maria@email.com',
    time: '1 hora atrás',
    status: 'Ativo'
  },
  {
    id: '4',
    type: 'payment',
    title: 'Pagamento recebido',
    description: 'Fatura #5678 - R$ 1.250,00',
    time: '2 horas atrás',
    status: 'Confirmado'
  }
];

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'sale': return 'bg-green-100 text-green-700';
    case 'stock': return 'bg-yellow-100 text-yellow-700';
    case 'customer': return 'bg-blue-100 text-blue-700';
    case 'payment': return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export const RecentActivity: React.FC = () => {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarFallback className={getActivityColor(activity.type)}>
                {activity.type === 'sale' ? '💰' : 
                 activity.type === 'stock' ? '📦' :
                 activity.type === 'customer' ? '👤' : '💳'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{activity.time}</span>
                {activity.status && (
                  <Badge variant="secondary" className="text-xs">
                    {activity.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
