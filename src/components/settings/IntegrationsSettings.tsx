
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  MessageSquare, 
  Mail, 
  Facebook, 
  Instagram,
  Settings,
  Zap,
  CreditCard
} from 'lucide-react';

export function IntegrationsSettings() {
  const { toast } = useToast();
  const [showGoogleDialog, setShowGoogleDialog] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [showN8NDialog, setShowN8NDialog] = useState(false);
  const [showStripeDialog, setShowStripeDialog] = useState(false);
  
  const [integrations, setIntegrations] = useState({
    googleCalendar: false,
    whatsapp: false,
    email: false,
    n8n: false,
    stripe: false,
  });

  const [settings, setSettings] = useState({
    whatsappNumber: '',
    webhookUrl: '',
    stripeKey: '',
    smtpServer: '',
    emailFrom: '',
  });

  const handleToggleIntegration = (integration: string, enabled: boolean) => {
    if (enabled) {
      // Abrir dialog de configuração específico
      switch (integration) {
        case 'googleCalendar':
          setShowGoogleDialog(true);
          break;
        case 'whatsapp':
          setShowWhatsAppDialog(true);
          break;
        case 'n8n':
          setShowN8NDialog(true);
          break;
        case 'stripe':
          setShowStripeDialog(true);
          break;
        default:
          setIntegrations(prev => ({ ...prev, [integration]: enabled }));
      }
    } else {
      setIntegrations(prev => ({ ...prev, [integration]: enabled }));
      toast({
        title: "Integração Desativada",
        description: "Integração desativada com sucesso.",
      });
    }
  };

  const handleGoogleCalendarSetup = () => {
    setIntegrations(prev => ({ ...prev, googleCalendar: true }));
    setShowGoogleDialog(false);
    toast({
      title: "Google Calendar Integrado",
      description: "Sincronização com Google Calendar ativada com sucesso.",
    });
  };

  const handleWhatsAppSetup = () => {
    if (!settings.whatsappNumber) {
      toast({
        title: "Erro",
        description: "Preencha o número do WhatsApp.",
        variant: "destructive",
      });
      return;
    }
    setIntegrations(prev => ({ ...prev, whatsapp: true }));
    setShowWhatsAppDialog(false);
    toast({
      title: "WhatsApp Integrado",
      description: "WhatsApp configurado via N8N com sucesso.",
    });
  };

  const handleN8NSetup = () => {
    if (!settings.webhookUrl) {
      toast({
        title: "Erro",
        description: "Configure a URL do webhook N8N.",
        variant: "destructive",
      });
      return;
    }
    setIntegrations(prev => ({ ...prev, n8n: true }));
    setShowN8NDialog(false);
    toast({
      title: "N8N Integrado",
      description: "Automações N8N configuradas com sucesso.",
    });
  };

  const handleStripeSetup = () => {
    setIntegrations(prev => ({ ...prev, stripe: true }));
    setShowStripeDialog(false);
    toast({
      title: "Stripe Integrado",
      description: "Integração de pagamentos configurada com sucesso.",
    });
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Calendar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-base">Google Calendar</CardTitle>
            </div>
            <Switch 
              checked={integrations.googleCalendar}
              onCheckedChange={(checked) => handleToggleIntegration('googleCalendar', checked)}
            />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Sincronize seus agendamentos com o Google Calendar
            </CardDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowGoogleDialog(true)}
              disabled={integrations.googleCalendar}
            >
              {integrations.googleCalendar ? 'Configurado' : 'Configurar'}
            </Button>
          </CardContent>
        </Card>

        {/* WhatsApp via N8N */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base">WhatsApp (N8N)</CardTitle>
            </div>
            <Switch 
              checked={integrations.whatsapp}
              onCheckedChange={(checked) => handleToggleIntegration('whatsapp', checked)}
            />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Integração com WhatsApp através do N8N para automação
            </CardDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowWhatsAppDialog(true)}
              disabled={integrations.whatsapp}
            >
              {integrations.whatsapp ? 'Configurado' : 'Configurar'}
            </Button>
          </CardContent>
        </Card>

        {/* N8N Automações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-base">N8N Automações</CardTitle>
            </div>
            <Switch 
              checked={integrations.n8n}
              onCheckedChange={(checked) => handleToggleIntegration('n8n', checked)}
            />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Conecte com N8N para automações avançadas
            </CardDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowN8NDialog(true)}
              disabled={integrations.n8n}
            >
              {integrations.n8n ? 'Configurado' : 'Configurar'}
            </Button>
          </CardContent>
        </Card>

        {/* Stripe Pagamentos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">Stripe Pagamentos</CardTitle>
            </div>
            <Switch 
              checked={integrations.stripe}
              onCheckedChange={(checked) => handleToggleIntegration('stripe', checked)}
            />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Integração com Stripe para processar pagamentos
            </CardDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowStripeDialog(true)}
              disabled={integrations.stripe}
            >
              {integrations.stripe ? 'Configurado' : 'Configurar'}
            </Button>
          </CardContent>
        </Card>

        {/* Email Marketing */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">Email Marketing</CardTitle>
            </div>
            <Switch 
              checked={integrations.email}
              onCheckedChange={(checked) => handleToggleIntegration('email', checked)}
            />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Configure automações de email marketing
            </CardDescription>
            <Button variant="outline" size="sm" disabled>
              Em Breve
            </Button>
          </CardContent>
        </Card>

        {/* Redes Sociais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Redes Sociais</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Configure suas redes sociais para integração
            </CardDescription>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                <Input placeholder="URL do Facebook" disabled />
              </div>
              <div className="flex items-center space-x-2">
                <Instagram className="h-4 w-4 text-pink-500" />
                <Input placeholder="URL do Instagram" disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs de Configuração */}
      
      {/* Google Calendar Dialog */}
      <Dialog open={showGoogleDialog} onOpenChange={setShowGoogleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Google Calendar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Para integrar com Google Calendar, você precisa:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Ter uma conta Google ativa</li>
                <li>Autorizar o acesso ao seu calendário</li>
                <li>Configurar as permissões de sincronização</li>
              </ol>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowGoogleDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGoogleCalendarSetup}>
                Autorizar & Configurar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Dialog */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar WhatsApp via N8N</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="whatsapp_number">Número do WhatsApp</Label>
              <Input
                id="whatsapp_number"
                placeholder="(11) 99999-9999"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Esta integração utiliza N8N para conectar com WhatsApp Business API. Certifique-se de ter:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Conta WhatsApp Business</li>
                <li>N8N configurado com workflow do WhatsApp</li>
                <li>Tokens de API válidos</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowWhatsAppDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleWhatsAppSetup}>
                Configurar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* N8N Dialog */}
      <Dialog open={showN8NDialog} onOpenChange={setShowN8NDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar N8N Automações</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook_url">URL do Webhook N8N</Label>
              <Input
                id="webhook_url"
                placeholder="https://your-n8n-instance.com/webhook/..."
                value={settings.webhookUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="n8n_description">Descrição da Automação</Label>
              <Textarea
                id="n8n_description"
                placeholder="Descreva que tipo de automações serão executadas..."
                rows={3}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>N8N permite criar workflows avançados para:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Automação de emails e mensagens</li>
                <li>Integração com múltiplos serviços</li>
                <li>Processamento de dados</li>
                <li>Notificações personalizadas</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowN8NDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleN8NSetup}>
                Conectar N8N
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stripe Dialog */}
      <Dialog open={showStripeDialog} onOpenChange={setShowStripeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Stripe Pagamentos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="stripe_key">Chave Pública Stripe</Label>
              <Input
                id="stripe_key"
                placeholder="pk_test_..."
                value={settings.stripeKey}
                onChange={(e) => setSettings(prev => ({ ...prev, stripeKey: e.target.value }))}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Configure o Stripe para processar pagamentos:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Pagamentos únicos e recorrentes</li>
                <li>Múltiplos métodos de pagamento</li>
                <li>Webhook para confirmações</li>
                <li>Dashboard de transações</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowStripeDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleStripeSetup}>
                Configurar Stripe
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Status das Integrações</CardTitle>
          <CardDescription>
            Visão geral de todas as integrações configuradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Google Calendar:</span>
              <span className={integrations.googleCalendar ? "text-green-600" : "text-gray-500"}>
                {integrations.googleCalendar ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>WhatsApp:</span>
              <span className={integrations.whatsapp ? "text-green-600" : "text-gray-500"}>
                {integrations.whatsapp ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>N8N:</span>
              <span className={integrations.n8n ? "text-green-600" : "text-gray-500"}>
                {integrations.n8n ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Stripe:</span>
              <span className={integrations.stripe ? "text-green-600" : "text-gray-500"}>
                {integrations.stripe ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Email:</span>
              <span className={integrations.email ? "text-green-600" : "text-gray-500"}>
                {integrations.email ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
