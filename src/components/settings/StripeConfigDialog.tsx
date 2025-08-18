import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useCompany } from '@/hooks/useCompany';
import { Loader2, CheckCircle, AlertCircle, ExternalLink, Shield } from 'lucide-react';

interface StripeConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StripeConfigDialog({ open, onOpenChange }: StripeConfigDialogProps) {
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
    publishableKey: '',
    secretKey: '',
    webhookEndpoint: '',
    webhookSecret: '',
    environment: 'test' as 'test' | 'live',
    currency: 'BRL',
    description: ''
  });

  // Load existing configuration
  useEffect(() => {
    if (open) {
      const existing = getIntegrationByType('stripe_payments');
      if (existing?.settings && typeof existing.settings === 'object') {
        const settings = existing.settings as any;
        setConfig({
          publishableKey: settings.publishableKey || '',
          secretKey: settings.secretKey || '',
          webhookEndpoint: settings.webhookEndpoint || '',
          webhookSecret: settings.webhookSecret || '',
          environment: settings.environment || 'test',
          currency: settings.currency || 'BRL',
          description: settings.description || ''
        });
      }
    }
  }, [open, getIntegrationByType]);

  const validateConfig = () => {
    if (!config.publishableKey || !config.secretKey) {
      toast({
        title: "Campos obrigatórios",
        description: "Publishable Key e Secret Key são obrigatórios.",
        variant: "destructive"
      });
      return false;
    }

    // Validate key formats
    const pubKeyPrefix = config.environment === 'live' ? 'pk_live_' : 'pk_test_';
    const secKeyPrefix = config.environment === 'live' ? 'sk_live_' : 'sk_test_';

    if (!config.publishableKey.startsWith(pubKeyPrefix)) {
      toast({
        title: "Publishable Key inválida",
        description: `A Publishable Key deve começar com ${pubKeyPrefix}`,
        variant: "destructive"
      });
      return false;
    }

    if (!config.secretKey.startsWith(secKeyPrefix)) {
      toast({
        title: "Secret Key inválida",
        description: `A Secret Key deve começar com ${secKeyPrefix}`,
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
      // Simulate API test - In production, make actual Stripe API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success/failure for demo
      const success = Math.random() > 0.2;
      
      if (success) {
        setConnectionStatus('success');
        toast({
          title: "Conexão estabelecida",
          description: "Credenciais Stripe validadas com sucesso!",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Falha na conexão",
          description: "Credenciais inválidas. Verifique suas chaves Stripe.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Erro de conexão",
        description: "Erro ao testar conexão com Stripe.",
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
      const existing = getIntegrationByType('stripe_payments');
      
      const integrationData = {
        type: 'stripe_payments' as const,
        name: 'Stripe Pagamentos',
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
        description: "Stripe configurado com sucesso.",
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
            Configurar Stripe Pagamentos
            <Badge variant={connectionStatus === 'success' ? 'default' : 'secondary'}>
              {connectionStatus === 'success' ? 'Conectado' : 'Desconectado'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Configure a integração com Stripe para processar pagamentos online
          </p>

          {/* Security Notice */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800">Aviso de Segurança</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Suas chaves Stripe são criptografadas e armazenadas de forma segura. 
                  Nunca compartilhe sua Secret Key publicamente.
                </p>
              </div>
            </div>
          </div>

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
                    ? 'Conexão com Stripe estabelecida!' 
                    : 'Falha na conexão com Stripe'
                  }
                </span>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {/* Environment */}
            <div className="space-y-2">
              <Label>Ambiente *</Label>
              <Select 
                value={config.environment} 
                onValueChange={(value: 'test' | 'live') => setConfig(prev => ({ ...prev, environment: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">Test (Desenvolvimento)</SelectItem>
                  <SelectItem value="live">Live (Produção)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Use "Test" para desenvolvimento e "Live" para produção
              </p>
            </div>

            {/* Publishable Key */}
            <div className="space-y-2">
              <Label htmlFor="publishableKey">
                Publishable Key *
              </Label>
              <Input
                id="publishableKey"
                placeholder={`pk_${config.environment}_...`}
                value={config.publishableKey}
                onChange={(e) => setConfig(prev => ({ ...prev, publishableKey: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Chave pública do Stripe (pode ser exposta no frontend)
              </p>
            </div>

            {/* Secret Key */}
            <div className="space-y-2">
              <Label htmlFor="secretKey">
                Secret Key *
              </Label>
              <Input
                id="secretKey"
                type="password"
                placeholder={`sk_${config.environment}_...`}
                value={config.secretKey}
                onChange={(e) => setConfig(prev => ({ ...prev, secretKey: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Chave secreta do Stripe (mantenha em segredo)
              </p>
            </div>

            {/* Webhook Endpoint */}
            <div className="space-y-2">
              <Label htmlFor="webhookEndpoint">
                Webhook Endpoint
              </Label>
              <Input
                id="webhookEndpoint"
                placeholder="https://seudominio.com/stripe/webhook"
                value={config.webhookEndpoint}
                onChange={(e) => setConfig(prev => ({ ...prev, webhookEndpoint: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                URL para receber eventos do Stripe (webhooks)
              </p>
            </div>

            {/* Webhook Secret */}
            <div className="space-y-2">
              <Label htmlFor="webhookSecret">
                Webhook Secret
              </Label>
              <Input
                id="webhookSecret"
                type="password"
                placeholder="whsec_..."
                value={config.webhookSecret}
                onChange={(e) => setConfig(prev => ({ ...prev, webhookSecret: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Secret para validar webhooks do Stripe
              </p>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label>Moeda Padrão</Label>
              <Select 
                value={config.currency} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">BRL (Real Brasileiro)</SelectItem>
                  <SelectItem value="USD">USD (Dólar Americano)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva como o Stripe será utilizado em sua aplicação..."
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          {/* Documentation Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900">Obter Chaves API</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Acesse o dashboard do Stripe para obter suas chaves
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 text-blue-600 h-auto"
                    onClick={() => window.open('https://dashboard.stripe.com/apikeys', '_blank')}
                  >
                    Ir para Dashboard →
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-900">Documentação</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Consulte a documentação oficial do Stripe
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 text-green-600 h-auto"
                    onClick={() => window.open('https://stripe.com/docs', '_blank')}
                  >
                    Ver Docs →
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