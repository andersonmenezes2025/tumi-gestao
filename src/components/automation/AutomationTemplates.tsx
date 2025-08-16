import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  MessageSquare, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Zap, 
  FileText as Template,
  Play,
  Download,
  Star,
  Search,
  Filter,
  Clock,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'customer' | 'marketing' | 'finance' | 'inventory';
  complexity: 'simple' | 'intermediate' | 'advanced';
  estimatedTime: string;
  popularity: number;
  tags: string[];
  trigger: string;
  actions: string[];
  benefits: string[];
  icon: React.ReactNode;
  preview: {
    nodes: number;
    connections: number;
    estimatedExecutions: string;
  };
}

const templates: AutomationTemplate[] = [
  {
    id: 'welcome-sequence',
    name: 'Sequência de Boas-vindas',
    description: 'Envie uma série de emails e WhatsApp para novos clientes cadastrados',
    category: 'customer',
    complexity: 'simple',
    estimatedTime: '10 min',
    popularity: 95,
    tags: ['email', 'whatsapp', 'onboarding', 'clientes'],
    trigger: 'Novo cliente cadastrado',
    actions: [
      'Email de boas-vindas imediato',
      'WhatsApp após 2 horas',
      'Email com guia de produtos após 1 dia',
      'Pesquisa de satisfação após 3 dias'
    ],
    benefits: [
      'Melhora engajamento inicial',
      'Reduz churn de novos clientes',
      'Automatiza onboarding'
    ],
    icon: <Users className="h-5 w-5" />,
    preview: {
      nodes: 6,
      connections: 5,
      estimatedExecutions: '20-50/mês'
    }
  },
  {
    id: 'abandoned-cart',
    name: 'Carrinho Abandonado',
    description: 'Recupere vendas perdidas enviando lembretes para clientes que abandonaram carrinho',
    category: 'sales',
    complexity: 'intermediate',
    estimatedTime: '15 min',
    popularity: 88,
    tags: ['vendas', 'email', 'whatsapp', 'recuperação'],
    trigger: 'Carrinho abandonado por 2 horas',
    actions: [
      'Email lembrete após 2 horas',
      'WhatsApp com desconto após 24 horas',
      'Email final com urgência após 3 dias'
    ],
    benefits: [
      'Recupera até 30% dos carrinhos abandonados',
      'Aumenta conversão de vendas',
      'ROI alto com baixo investimento'
    ],
    icon: <ShoppingCart className="h-5 w-5" />,
    preview: {
      nodes: 8,
      connections: 7,
      estimatedExecutions: '100-300/mês'
    }
  },
  {
    id: 'payment-reminder',
    name: 'Cobrança Automática',
    description: 'Automatize lembretes de pagamento e cobrança de inadimplentes',
    category: 'finance',
    complexity: 'intermediate',
    estimatedTime: '20 min',
    popularity: 92,
    tags: ['cobrança', 'financeiro', 'email', 'whatsapp'],
    trigger: 'Fatura próxima ao vencimento',
    actions: [
      'Email lembrete 3 dias antes',
      'WhatsApp no dia do vencimento',
      'Email de cobrança 3 dias após',
      'WhatsApp com proposta de parcelamento após 7 dias'
    ],
    benefits: [
      'Reduz inadimplência em 40%',
      'Melhora fluxo de caixa',
      'Automatiza processo de cobrança'
    ],
    icon: <DollarSign className="h-5 w-5" />,
    preview: {
      nodes: 10,
      connections: 9,
      estimatedExecutions: '50-150/mês'
    }
  },
  {
    id: 'low-stock-alert',
    name: 'Alerta de Estoque Baixo',
    description: 'Monitore estoque e automatize reposição e comunicação com fornecedores',
    category: 'inventory',
    complexity: 'simple',
    estimatedTime: '12 min',
    popularity: 78,
    tags: ['estoque', 'fornecedores', 'email', 'alertas'],
    trigger: 'Produto com estoque baixo',
    actions: [
      'Email para equipe de compras',
      'WhatsApp para fornecedor principal',
      'Criar tarefa de reposição',
      'Pausar promoções do produto'
    ],
    benefits: [
      'Evita ruptura de estoque',
      'Automatiza processo de reposição',
      'Otimiza gestão de inventário'
    ],
    icon: <BarChart3 className="h-5 w-5" />,
    preview: {
      nodes: 7,
      connections: 6,
      estimatedExecutions: '10-30/mês'
    }
  },
  {
    id: 'customer-birthday',
    name: 'Aniversário de Clientes',
    description: 'Envie mensagens personalizadas e ofertas especiais no aniversário dos clientes',
    category: 'marketing',
    complexity: 'simple',
    estimatedTime: '8 min',
    popularity: 85,
    tags: ['marketing', 'aniversário', 'personalização', 'ofertas'],
    trigger: 'Aniversário do cliente',
    actions: [
      'Email personalizado de parabéns',
      'WhatsApp com cupom de desconto',
      'Oferta especial válida por 7 dias'
    ],
    benefits: [
      'Aumenta lealdade do cliente',
      'Gera vendas adicionais',
      'Melhora relacionamento'
    ],
    icon: <Star className="h-5 w-5" />,
    preview: {
      nodes: 5,
      connections: 4,
      estimatedExecutions: '30-80/mês'
    }
  },
  {
    id: 'sales-followup',
    name: 'Follow-up de Vendas',
    description: 'Acompanhe clientes após venda para garantir satisfação e gerar novas oportunidades',
    category: 'sales',
    complexity: 'advanced',
    estimatedTime: '25 min',
    popularity: 90,
    tags: ['vendas', 'follow-up', 'satisfação', 'upsell'],
    trigger: 'Venda finalizada',
    actions: [
      'Email de agradecimento imediato',
      'WhatsApp de acompanhamento após 3 dias',
      'Pesquisa de satisfação após 1 semana',
      'Oferta complementar após 30 dias'
    ],
    benefits: [
      'Aumenta satisfação do cliente',
      'Gera vendas complementares',
      'Melhora reputação da empresa'
    ],
    icon: <Mail className="h-5 w-5" />,
    preview: {
      nodes: 12,
      connections: 11,
      estimatedExecutions: '100-400/mês'
    }
  }
];

interface AutomationTemplatesProps {
  trigger?: React.ReactNode;
  onSelectTemplate?: (template: AutomationTemplate) => void;
}

export function AutomationTemplates({ trigger, onSelectTemplate }: AutomationTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);
  
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: 'Todos', icon: <Template className="h-4 w-4" /> },
    { value: 'sales', label: 'Vendas', icon: <ShoppingCart className="h-4 w-4" /> },
    { value: 'customer', label: 'Clientes', icon: <Users className="h-4 w-4" /> },
    { value: 'marketing', label: 'Marketing', icon: <Star className="h-4 w-4" /> },
    { value: 'finance', label: 'Financeiro', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'inventory', label: 'Estoque', icon: <BarChart3 className="h-4 w-4" /> },
  ];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'Simples';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return complexity;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const useTemplate = (template: AutomationTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
    
    toast({
      title: 'Template Selecionado',
      description: `Template "${template.name}" será usado como base para sua automação.`,
    });
    setIsOpen(false);
  };

  const DefaultTrigger = (
    <Button className="gap-2" variant="outline">
      <Template className="h-4 w-4" />
      Templates
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || DefaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Template className="h-5 w-5" />
            Templates de Automação
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-4 h-[70vh]">
          {/* Sidebar - Categories & Search */}
          <div className="col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Buscar templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Categoria</h4>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.value)}
                        className="w-full justify-start gap-2"
                      >
                        {category.icon}
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  {filteredTemplates.length} template(s) encontrado(s)
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-3">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                {filteredTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {template.icon}
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{template.popularity}%</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge className={getComplexityColor(template.complexity)}>
                            {getComplexityLabel(template.complexity)}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {template.estimatedTime}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{template.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div className="text-center">
                            <div className="font-semibold text-foreground">{template.preview.nodes}</div>
                            <div>Nós</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-foreground">{template.preview.connections}</div>
                            <div>Conexões</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-foreground text-xs">{template.preview.estimatedExecutions}</div>
                            <div>Execuções</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              useTemplate(template);
                            }}
                            className="flex-1 gap-2"
                          >
                            <Download className="h-3 w-3" />
                            Usar Template
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTemplate(template);
                            }}
                            className="gap-2"
                          >
                            <Play className="h-3 w-3" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Template Detail Modal */}
        {selectedTemplate && (
          <Dialog 
            open={!!selectedTemplate} 
            onOpenChange={() => setSelectedTemplate(null)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTemplate.icon}
                  {selectedTemplate.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p>{selectedTemplate.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Trigger</h4>
                    <Badge variant="outline">{selectedTemplate.trigger}</Badge>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Ações</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {selectedTemplate.actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Benefícios</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 text-green-700">
                      {selectedTemplate.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => useTemplate(selectedTemplate)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Usar Este Template
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}