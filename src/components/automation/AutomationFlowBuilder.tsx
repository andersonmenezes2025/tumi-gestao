import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Save, 
  Plus, 
  Zap, 
  Mail, 
  MessageSquare, 
  Database, 
  Webhook,
  Filter,
  Send,
  Clock,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAutomationFlows } from '@/hooks/useAutomationFlows';

// Custom Node Components
const TriggerNode = ({ data }: { data: any }) => (
  <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg min-w-[200px]">
    <div className="flex items-center gap-2 mb-2">
      <Zap className="h-4 w-4" />
      <span className="font-semibold">Trigger</span>
    </div>
    <div className="text-sm">{data.label}</div>
  </div>
);

const ActionNode = ({ data }: { data: any }) => (
  <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg min-w-[200px]">
    <div className="flex items-center gap-2 mb-2">
      {data.icon}
      <span className="font-semibold">Action</span>
    </div>
    <div className="text-sm">{data.label}</div>
  </div>
);

const ConditionNode = ({ data }: { data: any }) => (
  <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-lg min-w-[200px]">
    <div className="flex items-center gap-2 mb-2">
      <Filter className="h-4 w-4" />
      <span className="font-semibold">Condition</span>
    </div>
    <div className="text-sm">{data.label}</div>
  </div>
);

const DelayNode = ({ data }: { data: any }) => (
  <div className="bg-purple-500 text-white p-4 rounded-lg shadow-lg min-w-[200px]">
    <div className="flex items-center gap-2 mb-2">
      <Clock className="h-4 w-4" />
      <span className="font-semibold">Delay</span>
    </div>
    <div className="text-sm">{data.label}</div>
  </div>
);

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Nova Venda Criada',
      triggerType: 'new_sale'
    },
  },
];

const initialEdges: Edge[] = [];

interface AutomationFlowBuilderProps {
  trigger?: React.ReactNode;
  onSave?: (flowData: any) => Promise<void> | void;
}

export function AutomationFlowBuilder({ trigger, onSave }: AutomationFlowBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [flowName, setFlowName] = useState('');
  const [nodeCounter, setNodeCounter] = useState(2);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const { createFlow, isCreating } = useAutomationFlows();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: string, label: string, icon?: React.ReactNode, config?: any) => {
    const newNode: Node = {
      id: `${type}-${nodeCounter}`,
      type,
      position: { x: 100 + nodeCounter * 50, y: 100 + nodeCounter * 100 },
      data: { 
        label,
        icon,
        config,
        nodeType: type
      },
    };
    
    setNodes((nds) => nds.concat(newNode));
    setNodeCounter((c) => c + 1);
  };

  const nodeTemplates = [
    {
      category: 'Triggers',
      items: [
        { type: 'trigger', label: 'Nova Venda', icon: <BarChart3 className="h-4 w-4" /> },
        { type: 'trigger', label: 'Novo Cliente', icon: <Database className="h-4 w-4" /> },
        { type: 'trigger', label: 'Estoque Baixo', icon: <Database className="h-4 w-4" /> },
        { type: 'trigger', label: 'Webhook Recebido', icon: <Webhook className="h-4 w-4" /> },
      ]
    },
    {
      category: 'Actions',
      items: [
        { type: 'action', label: 'Enviar Email', icon: <Mail className="h-4 w-4" /> },
        { type: 'action', label: 'Enviar WhatsApp', icon: <MessageSquare className="h-4 w-4" /> },
        { type: 'action', label: 'Criar Tarefa', icon: <Plus className="h-4 w-4" /> },
        { type: 'action', label: 'Webhook HTTP', icon: <Send className="h-4 w-4" /> },
      ]
    },
    {
      category: 'Logic',
      items: [
        { type: 'condition', label: 'Se/Então/Senão', icon: <Filter className="h-4 w-4" /> },
        { type: 'delay', label: 'Aguardar Tempo', icon: <Clock className="h-4 w-4" /> },
      ]
    }
  ];

  const testFlow = async () => {
    if (nodes.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um nó ao fluxo',
        variant: 'destructive',
      });
      return;
    }

    setIsTestMode(true);
    toast({
      title: 'Testando Fluxo',
      description: 'Simulando execução do fluxo de automação...',
    });

    // Simular teste
    setTimeout(() => {
      setIsTestMode(false);
      toast({
        title: 'Teste Concluído',
        description: 'Fluxo executado com sucesso!',
      });
    }, 3000);
  };

  const saveFlow = async () => {
    if (!flowName.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite um nome para o fluxo',
        variant: 'destructive',
      });
      return;
    }

    if (nodes.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um nó ao fluxo',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const flowData = {
        name: flowName,
        description: `Fluxo criado com ${nodes.length} nós`,
        type: 'custom' as const,
        configuration: {
          nodes: nodes,
          edges: edges
        },
        actions: nodes.filter(n => n.type !== 'trigger').map(n => ({
          id: n.id,
          type: n.type,
          data: n.data
        })),
        trigger_conditions: nodes
          .filter(n => n.type === 'trigger')
          .reduce((acc, n) => ({ ...acc, ...n.data }), {}),
        is_active: true,
        webhook_url: null,
        execution_count: 0,
        success_count: 0,
        error_count: 0,
        last_executed_at: null
      };

      if (onSave) {
        await onSave(flowData);
      } else {
        await createFlow(flowData);
      }

      toast({
        title: 'Fluxo Salvo',
        description: `O fluxo "${flowName}" foi salvo com sucesso!`,
      });

      setIsOpen(false);
      setFlowName('');
      setNodes(initialNodes);
      setEdges(initialEdges);
      setNodeCounter(2);
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o fluxo. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const DefaultTrigger = (
    <Button className="gap-2">
      <Plus className="h-4 w-4" />
      Novo Fluxo
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || DefaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Construtor de Fluxos de Automação
            {isTestMode && <Badge variant="outline" className="animate-pulse">Testando...</Badge>}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-4 h-[70vh]">
          {/* Sidebar - Node Palette */}
          <div className="col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Componentes</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="nodes" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="nodes">Nós</TabsTrigger>
                    <TabsTrigger value="settings">Config</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="nodes" className="space-y-4">
                    <ScrollArea className="h-[400px]">
                      {nodeTemplates.map((category) => (
                        <div key={category.category} className="space-y-2 mb-4">
                          <h4 className="font-medium text-sm text-muted-foreground">
                            {category.category}
                          </h4>
                          <div className="space-y-1">
                            {category.items.map((item, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => addNode(item.type, item.label, item.icon)}
                                className="w-full justify-start gap-2 text-xs"
                              >
                                {item.icon}
                                {item.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="flow-name">Nome do Fluxo</Label>
                      <Input
                        id="flow-name"
                        placeholder="Ex: Follow-up de Vendas"
                        value={flowName}
                        onChange={(e) => setFlowName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Estatísticas</Label>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Nós: {nodes.length}</div>
                        <div>Conexões: {edges.length}</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Main Canvas */}
          <div className="col-span-3">
            <div className="h-full border rounded-lg overflow-hidden">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                style={{ backgroundColor: '#f8f9fa' }}
              >
                <Controls />
                <MiniMap />
                <Background />
              </ReactFlow>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Arraste e conecte os componentes para criar seu fluxo de automação
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="outline" 
              onClick={testFlow} 
              disabled={isTestMode}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {isTestMode ? 'Testando...' : 'Testar'}
            </Button>
            <Button 
              onClick={saveFlow} 
              disabled={isSaving || isCreating}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {(isSaving || isCreating) ? 'Salvando...' : 'Salvar Fluxo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}