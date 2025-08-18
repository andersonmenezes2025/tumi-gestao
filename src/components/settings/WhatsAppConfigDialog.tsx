import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useCompany } from '@/hooks/useCompany';
import { Loader2, CheckCircle, AlertCircle, ExternalLink, MessageCircle, QrCode } from 'lucide-react';

interface WhatsAppConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhatsAppConfigDialog({ open, onOpenChange }: WhatsAppConfigDialogProps) {
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
    phoneNumber: '',
    provider: 'whatsapp_business' as 'whatsapp_business' | 'twilio' | 'baileys',
    accessToken: '',
    appSecret: '',
    webhookUrl: '',
    verifyToken: '',
    businessAccountId: '',
    phoneNumberId: '',
    autoReply: true,
    autoReplyMessage: 'Olá! Recebemos sua mensagem e retornaremos em breve.',
    description: ''
  });

  // Load existing configuration
  useEffect(() => {
    if (open) {
      const existing = getIntegrationByType('whatsapp_n8n');
      if (existing?.settings && typeof existing.settings === 'object') {
        const settings = existing.settings as any;
        setConfig({
          phoneNumber: settings.phoneNumber || '',
          provider: settings.provider || 'whatsapp_business',
          accessToken: settings.accessToken || '',
          appSecret: settings.appSecret || '',
          webhookUrl: settings.webhookUrl || '',
          verifyToken: settings.verifyToken || '',
          businessAccountId: settings.businessAccountId || '',
          phoneNumberId: settings.phoneNumberId || '',
          autoReply: settings.autoReply ?? true,
          autoReplyMessage: settings.autoReplyMessage || 'Olá! Recebemos sua mensagem e retornaremos em breve.',
          description: settings.description || ''
        });
      }
    }
  }, [open, getIntegrationByType]);

  const validateConfig = () => {
    if (!config.phoneNumber) {
      toast({
        title: "Campo obrigatório",
        description: "Número do WhatsApp é obrigatório.",
        variant: "destructive"
      });
      return false;
    }

    if (config.provider === 'whatsapp_business') {
      if (!config.accessToken || !config.phoneNumberId) {
        toast({
          title: "Configuração incompleta",
          description: "Access Token e Phone Number ID são obrigatórios para WhatsApp Business API.",
          variant: "destructive"
        });
        return false;
      }
    } else if (config.provider === 'twilio') {
      if (!config.accessToken || !config.appSecret) {
        toast({
          title: "Configuração incompleta",
          description: "Auth Token e Account SID são obrigatórios para Twilio.",
          variant: "destructive"
        });
        return false;
      }
    }

    // Validate phone number format (basic)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(config.phoneNumber.replace(/\s+/g, ''))) {
      toast({
        title: "Número inválido",
        description: "Por favor, insira um número de WhatsApp válido com código do país.",
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
      // Simulate connection test - In production, make actual WhatsApp API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock success/failure for demo
      const success = Math.random() > 0.3;
      
      if (success) {
        setConnectionStatus('success');
        toast({
          title: "Conexão estabelecida",
          description: "WhatsApp conectado com sucesso!",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Falha na conexão",
          description: "Não foi possível conectar ao WhatsApp. Verifique as configurações.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Erro de conexão",
        description: "Erro ao testar conexão com WhatsApp.",
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
      const existing = getIntegrationByType('whatsapp_n8n');
      
      const integrationData = {
        type: 'whatsapp_n8n' as const,
        name: 'WhatsApp (N8N)',
        active: true,
        settings: config,
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
        description: "WhatsApp configurado com sucesso.",
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
            Configurar WhatsApp
            <Badge variant={connectionStatus === 'success' ? 'default' : 'secondary'}>
              {connectionStatus === 'success' ? 'Conectado' : 'Desconectado'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Configure a integração com WhatsApp para automações e atendimento
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
                    ? 'WhatsApp conectado com sucesso!' 
                    : 'Falha na conexão com WhatsApp'
                  }
                </span>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {/* Basic Configuration */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Número do WhatsApp *
              </Label>
              <Input
                id="phoneNumber"
                placeholder="+5511999999999"
                value={config.phoneNumber}
                onChange={(e) => setConfig(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Número do WhatsApp com código do país (ex: +5511999999999)
              </p>
            </div>

            {/* Provider Selection */}
            <div className="space-y-2">
              <Label>Provedor de API *</Label>
              <Select 
                value={config.provider} 
                onValueChange={(value: 'whatsapp_business' | 'twilio' | 'baileys') => setConfig(prev => ({ ...prev, provider: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp_business">WhatsApp Business API</SelectItem>
                  <SelectItem value="twilio">Twilio WhatsApp</SelectItem>
                  <SelectItem value="baileys">Baileys (Não Oficial)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* WhatsApp Business API Configuration */}
            {config.provider === 'whatsapp_business' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="accessToken">
                    Access Token *
                  </Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="EAAGm7r..."
                    value={config.accessToken}
                    onChange={(e) => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Token de acesso da Meta Business API
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumberId">
                      Phone Number ID *
                    </Label>
                    <Input
                      id="phoneNumberId"
                      placeholder="123456789012345"
                      value={config.phoneNumberId}
                      onChange={(e) => setConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessAccountId">
                      Business Account ID
                    </Label>
                    <Input
                      id="businessAccountId"
                      placeholder="123456789012345"
                      value={config.businessAccountId}
                      onChange={(e) => setConfig(prev => ({ ...prev, businessAccountId: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appSecret">
                    App Secret
                  </Label>
                  <Input
                    id="appSecret"
                    type="password"
                    placeholder="••••••••••"
                    value={config.appSecret}
                    onChange={(e) => setConfig(prev => ({ ...prev, appSecret: e.target.value }))}
                  />
                </div>
              </>
            )}

            {/* Twilio Configuration */}
            {config.provider === 'twilio' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessToken">
                      Account SID *
                    </Label>
                    <Input
                      id="accessToken"
                      placeholder="AC..."
                      value={config.accessToken}
                      onChange={(e) => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appSecret">
                      Auth Token *
                    </Label>
                    <Input
                      id="appSecret"
                      type="password"
                      placeholder="••••••••••"
                      value={config.appSecret}
                      onChange={(e) => setConfig(prev => ({ ...prev, appSecret: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Webhook Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">
                  Webhook URL
                </Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://seudominio.com/webhook/whatsapp"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verifyToken">
                  Verify Token
                </Label>
                <Input
                  id="verifyToken"
                  placeholder="token_verificacao"
                  value={config.verifyToken}
                  onChange={(e) => setConfig(prev => ({ ...prev, verifyToken: e.target.value }))}
                />
              </div>
            </div>

            {/* Auto Reply Configuration */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoReply"
                  checked={config.autoReply}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoReply: checked }))}
                />
                <Label htmlFor="autoReply">
                  Resposta automática
                </Label>
              </div>

              {config.autoReply && (
                <div className="space-y-2">
                  <Label htmlFor="autoReplyMessage">
                    Mensagem de resposta automática
                  </Label>
                  <Textarea
                    id="autoReplyMessage"
                    placeholder="Olá! Recebemos sua mensagem e retornaremos em breve."
                    value={config.autoReplyMessage}
                    onChange={(e) => setConfig(prev => ({ ...prev, autoReplyMessage: e.target.value }))}
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva como o WhatsApp será utilizado..."
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          {/* Documentation Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-900">WhatsApp Business</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Configure sua conta WhatsApp Business
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 text-green-600 h-auto"
                    onClick={() => window.open('https://developers.facebook.com/docs/whatsapp', '_blank')}
                  >
                    Ver Documentação →
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <QrCode className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900">Twilio WhatsApp</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Configure WhatsApp via Twilio
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 text-blue-600 h-auto"
                    onClick={() => window.open('https://www.twilio.com/docs/whatsapp', '_blank')}
                  >
                    Ver Documentação →
                  </Button>
                </div>
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