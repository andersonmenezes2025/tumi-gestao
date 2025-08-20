import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useCompany } from '@/hooks/useCompany';
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface N8NConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'n8n_automation' | 'whatsapp_n8n';
}

export function N8NConfigDialog({ open, onOpenChange, type }: N8NConfigDialogProps) {
  const { toast } = useToast();
  const { companyId } = useCompany();
  const { 
    createIntegration, 
    updateIntegration, 
    getIntegrationByType 
  } = useIntegrations();

  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [config, setConfig] = useState({
    instanceUrl: '',
    apiKey: '',
    webhookUrl: '',
    workflowId: '',
    description: '',
    phoneNumber: type === 'whatsapp_n8n' ? '' : undefined
  });

  const isWhatsApp = type === 'whatsapp_n8n';
  const title = isWhatsApp ? 'Configurar WhatsApp N8N' : 'Configurar N8N Automação';
  const description = isWhatsApp 
    ? 'Configure a integração do WhatsApp através do N8N'
    : 'Configure automações avançadas com N8N';

  // Load existing configuration
  useEffect(() => {
    if (open) {
      const existing = getIntegrationByType(type);
      if (existing?.config && typeof existing.config === 'object') {
        const config = existing.config as any;
        setConfig({
          instanceUrl: config.instanceUrl || '',
          apiKey: config.apiKey || '',
          webhookUrl: config.webhookUrl || '',
          workflowId: config.workflowId || '',
          description: config.description || '',
          phoneNumber: config.phoneNumber || ''
        });
      }
    }
  }, [open, type, getIntegrationByType]);

  const validateConfig = () => {
    if (!config.instanceUrl || !config.apiKey) {
      toast({
        title: "Campos obrigatórios",
        description: "URL da instância e API Key são obrigatórios.",
        variant: "destructive"
      });
      return false;
    }

    // Validate URL format
    try {
      new URL(config.instanceUrl);
    } catch {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida da instância N8N.",
        variant: "destructive"
      });
      return false;
    }

    // WhatsApp specific validation
    if (isWhatsApp && !config.phoneNumber) {
      toast({
        title: "Campo obrigatório",
        description: "Número do WhatsApp é obrigatório.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const testConnection = async () => {
    if (!validateConfig()) return;

    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Simulate connection test - In production, make actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success/failure for demo
      const success = Math.random() > 0.3;
      
      if (success) {
        setConnectionStatus('success');
        toast({
          title: "Conexão estabelecida",
          description: "Conexão com N8N configurada com sucesso!",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Falha na conexão",
          description: "Não foi possível conectar com a instância N8N. Verifique as credenciais.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Erro de conexão",
        description: "Erro ao testar a conexão.",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = async () => {
    if (!validateConfig()) return;

    setIsLoading(true);
    try {
      const existing = getIntegrationByType(type);
      const integrationName = isWhatsApp ? 'WhatsApp (N8N)' : 'N8N Automações';
      
      const integrationData = {
        type,
        name: integrationName,
        active: true,
        config: config,
        company_id: companyId!
      };

      if (existing) {
        await updateIntegration({
          id: existing.id,
          ...integrationData
        });
      } else {
        await createIntegration(integrationData);
      }

      toast({
        title: "Configuração salva",
        description: `${integrationName} configurado com sucesso.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            <Badge variant={connectionStatus === 'success' ? 'default' : 'secondary'}>
              {connectionStatus === 'success' ? 'Conectado' : 'Desconectado'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {description}
          </p>

          {/* Connection Status */}
          {connectionStatus !== 'idle' && (
            <div className={`p-4 rounded-lg border ${
              connectionStatus === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {connectionStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  connectionStatus === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {connectionStatus === 'success' 
                    ? 'Conexão estabelecida com sucesso!' 
                    : 'Falha na conexão'
                  }
                </span>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {/* Instance URL */}
            <div className="space-y-2">
              <Label htmlFor="instanceUrl">
                URL da Instância N8N *
              </Label>
              <Input
                id="instanceUrl"
                placeholder="https://sua-instancia.n8n.io"
                value={config.instanceUrl}
                onChange={(e) => setConfig(prev => ({ ...prev, instanceUrl: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                URL completa da sua instância N8N (incluindo https://)
              </p>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">
                API Key *
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="n8n_api_key_..."
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                API Key gerada nas configurações da sua instância N8N
              </p>
            </div>

            {/* Webhook URL */}
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">
                URL do Webhook
              </Label>
              <Input
                id="webhookUrl"
                placeholder="https://sua-instancia.n8n.io/webhook/..."
                value={config.webhookUrl}
                onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                URL do webhook para receber dados do sistema
              </p>
            </div>

            {/* Workflow ID */}
            <div className="space-y-2">
              <Label htmlFor="workflowId">
                ID do Workflow
              </Label>
              <Input
                id="workflowId"
                placeholder="123"
                value={config.workflowId}
                onChange={(e) => setConfig(prev => ({ ...prev, workflowId: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                ID do workflow principal para automação
              </p>
            </div>

            {/* WhatsApp specific field */}
            {isWhatsApp && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  Número do WhatsApp *
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="+5511999999999"
                  value={config.phoneNumber || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Número do WhatsApp conectado ao N8N (com código do país)
                </p>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva como esta integração será utilizada..."
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          {/* Documentation Link */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900">Precisa de ajuda?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Consulte nossa documentação para configurar sua instância N8N
                </p>
                <Button 
                  variant="link" 
                  className="p-0 text-blue-600 h-auto"
                  onClick={() => window.open('https://docs.n8n.io/api/', '_blank')}
                >
                  Ver Documentação →
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={isTestingConnection || isLoading}
              className="flex-1"
            >
              {isTestingConnection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Testar Conexão
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || isTestingConnection}
              className="min-w-[100px]"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}