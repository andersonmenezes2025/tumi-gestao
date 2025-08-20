import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Webhook, TestTube, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useCompany } from '@/hooks/useCompany';

interface N8NWebhookConfigProps {
  trigger?: React.ReactNode;
}

export function N8NWebhookConfig({ trigger }: N8NWebhookConfigProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [testMessage, setTestMessage] = useState('Olá, este é um teste de conexão com N8N!');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [authToken, setAuthToken] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState('message');
  
  const { toast } = useToast();
  const { companyId } = useCompany();
  const { 
    getIntegrationByType, 
    createIntegration, 
    updateIntegration, 
    isCreating, 
    isUpdating 
  } = useIntegrations();

  const n8nIntegration = getIntegrationByType('n8n');

  useEffect(() => {
    if (n8nIntegration) {
      const config = n8nIntegration.config as any;
      setWebhookUrl(config.webhook_url || '');
      setAuthToken(config.auth_token || '');
      setIsActive(n8nIntegration.active || false);
      setSelectedTrigger(config.trigger_type || 'message');
    }
  }, [n8nIntegration]);

  const handleSave = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: 'Erro',
        description: 'URL do webhook é obrigatória',
        variant: 'destructive',
      });
      return;
    }

    try {
      const integrationData = {
        company_id: companyId,
        type: 'n8n',
        name: 'N8N Webhook Integration',
        active: isActive,
        config: {
          webhook_url: webhookUrl,
          auth_token: authToken,
          trigger_type: selectedTrigger,
          created_at: new Date().toISOString(),
        },
      };

      if (n8nIntegration) {
        await updateIntegration({
          id: n8nIntegration.id,
          ...integrationData,
        });
      } else {
        await createIntegration(integrationData);
      }

      toast({
        title: 'Sucesso',
        description: 'Configuração do N8N salva com sucesso!',
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração do N8N',
        variant: 'destructive',
      });
    }
  };

  const handleTest = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: 'Erro',
        description: 'Configurar URL do webhook primeiro',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'test',
          message: testMessage,
          timestamp: new Date().toISOString(),
          source: 'lovable_ai_automation',
          company_id: companyId,
        }),
      });

      if (response.ok) {
        setTestResult('success');
        toast({
          title: 'Teste bem-sucedido!',
          description: 'Conexão com N8N funcionando corretamente',
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setTestResult('error');
      toast({
        title: 'Teste falhou',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyExamplePayload = () => {
    const examplePayload = JSON.stringify({
      type: 'user_message',
      message: 'Como estão as vendas hoje?',
      user_id: 'user_123',
      company_id: companyId,
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'digital_assistant',
        session_id: 'session_456'
      }
    }, null, 2);

    navigator.clipboard.writeText(examplePayload);
    toast({
      title: 'Copiado!',
      description: 'Exemplo de payload copiado para a área de transferência',
    });
  };

  const DefaultTrigger = (
    <Button className="gap-2" variant="outline">
      <Settings className="h-4 w-4" />
      Configurar N8N
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || DefaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Configuração N8N Webhook
            {n8nIntegration && (
              <Badge variant={n8nIntegration.active ? "default" : "secondary"}>
                {n8nIntegration.active ? 'Ativo' : 'Inativo'}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="test">Teste</TabsTrigger>
            <TabsTrigger value="docs">Documentação</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="active">Integração ativa</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL do Webhook N8N *</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://seu-n8n.com/webhook/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Cole aqui a URL do webhook gerada no seu fluxo N8N
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-token">Token de Autenticação (Opcional)</Label>
                <Input
                  id="auth-token"
                  type="password"
                  placeholder="Bearer token ou API key"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Token para autenticar as requisições (se necessário)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger-type">Tipo de Trigger</Label>
                <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">Mensagem do Usuário</SelectItem>
                    <SelectItem value="sale">Nova Venda</SelectItem>
                    <SelectItem value="customer">Novo Cliente</SelectItem>
                    <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                    <SelectItem value="all">Todos os Eventos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-message">Mensagem de Teste</Label>
                <Textarea
                  id="test-message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleTest}
                  disabled={isTesting || !webhookUrl}
                  className="gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {isTesting ? 'Testando...' : 'Testar Conexão'}
                </Button>

                {testResult && (
                  <div className="flex items-center gap-2">
                    {testResult === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className={testResult === 'success' ? 'text-green-600' : 'text-red-600'}>
                      {testResult === 'success' ? 'Teste bem-sucedido!' : 'Teste falhou'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como Configurar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">1. Configurar N8N</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Criar um novo workflow no N8N</li>
                    <li>Adicionar um node "Webhook"</li>
                    <li>Configurar o método como POST</li>
                    <li>Copiar a URL gerada</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">2. Exemplo de Payload</h4>
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyExamplePayload}
                      className="absolute top-2 right-2 z-10 gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copiar
                    </Button>
                    <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
{`{
  "type": "user_message",
  "message": "Como estão as vendas hoje?",
  "user_id": "user_123",
  "company_id": "${companyId}",
  "timestamp": "2024-01-16T10:30:00Z",
  "metadata": {
    "source": "digital_assistant",
    "session_id": "session_456"
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">3. Eventos Disponíveis</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li><strong>user_message:</strong> Mensagens do assistente digital</li>
                    <li><strong>new_sale:</strong> Nova venda criada</li>
                    <li><strong>new_customer:</strong> Novo cliente cadastrado</li>
                    <li><strong>low_stock:</strong> Produto com estoque baixo</li>
                    <li><strong>payment_overdue:</strong> Pagamento em atraso</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isCreating || isUpdating}
            className="gap-2"
          >
            {isCreating || isUpdating ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}