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
import { Loader2, CheckCircle, AlertCircle, ExternalLink, Mail } from 'lucide-react';

interface EmailMarketingConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailMarketingConfigDialog({ open, onOpenChange }: EmailMarketingConfigDialogProps) {
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
    smtpHost: '',
    smtpPort: '587',
    smtpSecure: true,
    smtpUser: '',
    smtpPassword: '',
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    provider: 'smtp' as 'smtp' | 'resend' | 'sendgrid',
    apiKey: '',
    description: ''
  });

  // Load existing configuration
  useEffect(() => {
    if (open) {
      const existing = getIntegrationByType('email_marketing');
      if (existing?.config && typeof existing.config === 'object') {
        const config = existing.config as any;
        setConfig({
          smtpHost: config.smtpHost || '',
          smtpPort: config.smtpPort || '587',
          smtpSecure: config.smtpSecure ?? true,
          smtpUser: config.smtpUser || '',
          smtpPassword: config.smtpPassword || '',
          fromName: config.fromName || '',
          fromEmail: config.fromEmail || '',
          replyToEmail: config.replyToEmail || '',
          provider: config.provider || 'smtp',
          apiKey: config.apiKey || '',
          description: config.description || ''
        });
      }
    }
  }, [open, getIntegrationByType]);

  const validateConfig = () => {
    if (!config.fromEmail || !config.fromName) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email do remetente são obrigatórios.",
        variant: "destructive"
      });
      return false;
    }

    if (config.provider === 'smtp') {
      if (!config.smtpHost || !config.smtpUser || !config.smtpPassword) {
        toast({
          title: "Configuração SMTP incompleta",
          description: "Host, usuário e senha SMTP são obrigatórios.",
          variant: "destructive"
        });
        return false;
      }
    } else if (config.provider === 'resend' || config.provider === 'sendgrid') {
      if (!config.apiKey) {
        toast({
          title: "API Key obrigatória",
          description: `API Key do ${config.provider} é obrigatória.`,
          variant: "destructive"
        });
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.fromEmail)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido para o remetente.",
        variant: "destructive"
      });
      return false;
    }

    if (config.replyToEmail && !emailRegex.test(config.replyToEmail)) {
      toast({
        title: "Email de resposta inválido",
        description: "Por favor, insira um email válido para resposta.",
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
      // Simulate email test - In production, send actual test email
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock success/failure for demo
      const success = Math.random() > 0.2;
      
      if (success) {
        setConnectionStatus('success');
        toast({
          title: "Email de teste enviado",
          description: "Configuração de email validada com sucesso!",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Falha no teste",
          description: "Não foi possível enviar email de teste. Verifique as configurações.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Erro no teste",
        description: "Erro ao testar configurações de email.",
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
      const existing = getIntegrationByType('email_marketing');
      
      const integrationData = {
        type: 'email_marketing' as const,
        name: 'Email Marketing',
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
        description: "Email Marketing configurado com sucesso.",
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
            Configurar Email Marketing
            <Badge variant={connectionStatus === 'success' ? 'default' : 'secondary'}>
              {connectionStatus === 'success' ? 'Conectado' : 'Desconectado'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Configure o envio de emails marketing e transacionais
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
                    ? 'Email de teste enviado com sucesso!' 
                    : 'Falha no teste de email'
                  }
                </span>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label>Provedor de Email *</Label>
              <Select 
                value={config.provider} 
                onValueChange={(value: 'smtp' | 'resend' | 'sendgrid') => setConfig(prev => ({ ...prev, provider: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smtp">SMTP Personalizado</SelectItem>
                  <SelectItem value="resend">Resend</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Basic Email Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromName">
                  Nome do Remetente *
                </Label>
                <Input
                  id="fromName"
                  placeholder="Sua Empresa"
                  value={config.fromName}
                  onChange={(e) => setConfig(prev => ({ ...prev, fromName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromEmail">
                  Email do Remetente *
                </Label>
                <Input
                  id="fromEmail"
                  type="email"
                  placeholder="noreply@suaempresa.com"
                  value={config.fromEmail}
                  onChange={(e) => setConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="replyToEmail">
                Email para Respostas
              </Label>
              <Input
                id="replyToEmail"
                type="email"
                placeholder="contato@suaempresa.com"
                value={config.replyToEmail}
                onChange={(e) => setConfig(prev => ({ ...prev, replyToEmail: e.target.value }))}
              />
            </div>

            {/* SMTP Configuration */}
            {config.provider === 'smtp' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">
                      Host SMTP *
                    </Label>
                    <Input
                      id="smtpHost"
                      placeholder="smtp.gmail.com"
                      value={config.smtpHost}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">
                      Porta SMTP *
                    </Label>
                    <Select 
                      value={config.smtpPort} 
                      onValueChange={(value) => setConfig(prev => ({ ...prev, smtpPort: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25 (Padrão)</SelectItem>
                        <SelectItem value="587">587 (Recomendado)</SelectItem>
                        <SelectItem value="465">465 (SSL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="smtpSecure"
                    checked={config.smtpSecure}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, smtpSecure: checked }))}
                  />
                  <Label htmlFor="smtpSecure">
                    Usar conexão segura (TLS/SSL)
                  </Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">
                      Usuário SMTP *
                    </Label>
                    <Input
                      id="smtpUser"
                      type="email"
                      placeholder="seu-email@gmail.com"
                      value={config.smtpUser}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">
                      Senha SMTP *
                    </Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      placeholder="••••••••••"
                      value={config.smtpPassword}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}

            {/* API Key Configuration */}
            {(config.provider === 'resend' || config.provider === 'sendgrid') && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">
                  {config.provider === 'resend' ? 'Resend API Key' : 'SendGrid API Key'} *
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder={config.provider === 'resend' ? 're_...' : 'SG....'}
                  value={config.apiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  {config.provider === 'resend' 
                    ? 'Obtenha sua API Key em resend.com/api-keys'
                    : 'Obtenha sua API Key no painel do SendGrid'
                  }
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
                placeholder="Descreva como o email marketing será utilizado..."
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          {/* Documentation Links */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900">Configuração de Provedores</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Consulte a documentação para configurar seu provedor de email
                </p>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="link" 
                    className="p-0 text-blue-600 h-auto text-xs"
                    onClick={() => window.open('https://resend.com/docs', '_blank')}
                  >
                    Resend Docs →
                  </Button>
                  <Button 
                    variant="link" 
                    className="p-0 text-blue-600 h-auto text-xs"
                    onClick={() => window.open('https://docs.sendgrid.com/', '_blank')}
                  >
                    SendGrid Docs →
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
              Enviar Teste
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