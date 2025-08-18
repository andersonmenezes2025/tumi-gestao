import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useCompany } from '@/hooks/useCompany';
import { N8NConfigDialog } from './N8NConfigDialog';
import { StripeConfigDialog } from './StripeConfigDialog';
import { EmailMarketingConfigDialog } from './EmailMarketingConfigDialog';
import { WhatsAppConfigDialog } from './WhatsAppConfigDialog';
import { 
  Calendar, 
  MessageSquare, 
  Mail, 
  Facebook, 
  Instagram,
  Settings,
  Zap,
  CreditCard,
  Loader2
} from 'lucide-react';

export function IntegrationsSettings() {
  const { toast } = useToast();
  const { companyId } = useCompany();
  const { 
    integrations, 
    isLoading, 
    createIntegration, 
    updateIntegration,
    getIntegrationByType,
    isIntegrationActive 
  } = useIntegrations();

  const [showGoogleDialog, setShowGoogleDialog] = useState(false);
  const [showN8NDialog, setShowN8NDialog] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [showStripeDialog, setShowStripeDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [n8nDialogType, setN8nDialogType] = useState<'n8n_automation' | 'whatsapp_n8n'>('n8n_automation');
  const [socialSettings, setSocialSettings] = useState({
    facebookUrl: '',
    instagramUrl: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Load existing social media settings
  useEffect(() => {
    const socialIntegration = getIntegrationByType('social_media');
    if (socialIntegration?.settings && typeof socialIntegration.settings === 'object') {
      const settings = socialIntegration.settings as { facebookUrl?: string; instagramUrl?: string };
      setSocialSettings({
        facebookUrl: settings.facebookUrl || '',
        instagramUrl: settings.instagramUrl || ''
      });
    }
  }, [integrations, getIntegrationByType]);

  const handleToggleIntegration = async (type: string, enabled: boolean) => {
    setIsUpdating(true);
    try {
      const existingIntegration = getIntegrationByType(type);
      
      if (existingIntegration) {
        await updateIntegration({
          id: existingIntegration.id,
          active: enabled
        });
      } else if (enabled) {
        // Open specific configuration dialog for integrations
        if (type === 'google_calendar') {
          setShowGoogleDialog(true);
          setIsUpdating(false);
          return;
        }
        
        if (type === 'n8n_automation') {
          setN8nDialogType('n8n_automation');
          setShowN8NDialog(true);
          setIsUpdating(false);
          return;
        }
        
        if (type === 'whatsapp_n8n') {
          setShowWhatsAppDialog(true);
          setIsUpdating(false);
          return;
        }
        
        if (type === 'stripe_payments') {
          setShowStripeDialog(true);
          setIsUpdating(false);
          return;
        }
        
        if (type === 'email_marketing') {
          setShowEmailDialog(true);
          setIsUpdating(false);
          return;
        }
        
        // For others, create a basic integration
        await createIntegration({
          type,
          name: getIntegrationName(type),
          active: enabled,
          settings: {},
          company_id: companyId!
        });
      }

      toast({
        title: enabled ? "Integração Ativada" : "Integração Desativada",
        description: `${getIntegrationName(type)} ${enabled ? 'ativada' : 'desativada'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar integração.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSocialMediaUpdate = async () => {
    setIsUpdating(true);
    try {
      const existingIntegration = getIntegrationByType('social_media');
      
      const integrationData = {
        type: 'social_media',
        name: 'Redes Sociais',
        active: !!(socialSettings.facebookUrl || socialSettings.instagramUrl),
        settings: socialSettings,
        company_id: companyId!
      };

      if (existingIntegration) {
        await updateIntegration({
          id: existingIntegration.id,
          ...integrationData
        });
      } else {
        await createIntegration(integrationData);
      }

      toast({
        title: "Redes Sociais Atualizadas",
        description: "Configurações de redes sociais salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar redes sociais.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGoogleCalendarSetup = async () => {
    try {
      await createIntegration({
        type: 'google_calendar',
        name: 'Google Calendar',
        active: true,
        settings: {
          configured_at: new Date().toISOString()
        },
        company_id: companyId!
      });
      
      setShowGoogleDialog(false);
      toast({
        title: "Google Calendar Integrado",
        description: "Sincronização com Google Calendar ativada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao configurar Google Calendar.",
        variant: "destructive"
      });
    }
  };

  const getIntegrationName = (type: string) => {
    const names: { [key: string]: string } = {
      'google_calendar': 'Google Calendar',
      'whatsapp_n8n': 'WhatsApp (N8N)',
      'n8n_automation': 'N8N Automações',
      'stripe_payments': 'Stripe Pagamentos',
      'email_marketing': 'Email Marketing',
      'social_media': 'Redes Sociais'
    };
    return names[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

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
              checked={isIntegrationActive('google_calendar')}
              onCheckedChange={(checked) => handleToggleIntegration('google_calendar', checked)}
              disabled={isUpdating}
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
              disabled={isIntegrationActive('google_calendar') || isUpdating}
            >
              {isIntegrationActive('google_calendar') ? 'Configurado' : 'Configurar'}
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
              checked={isIntegrationActive('whatsapp_n8n')}
              onCheckedChange={(checked) => handleToggleIntegration('whatsapp_n8n', checked)}
              disabled={isUpdating}
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
              disabled={isUpdating}
            >
              {isIntegrationActive('whatsapp_n8n') ? 'Configurado' : 'Configurar'}
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
              checked={isIntegrationActive('n8n_automation')}
              onCheckedChange={(checked) => handleToggleIntegration('n8n_automation', checked)}
              disabled={isUpdating}
            />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Conecte com N8N para automações avançadas
            </CardDescription>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setN8nDialogType('n8n_automation');
                setShowN8NDialog(true);
              }}
              disabled={isUpdating}
            >
              {isIntegrationActive('n8n_automation') ? 'Configurado' : 'Configurar'}
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
              checked={isIntegrationActive('stripe_payments')}
              onCheckedChange={(checked) => handleToggleIntegration('stripe_payments', checked)}
              disabled={isUpdating}
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
              disabled={isUpdating}
            >
              {isIntegrationActive('stripe_payments') ? 'Configurado' : 'Configurar'}
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
              checked={isIntegrationActive('email_marketing')}
              onCheckedChange={(checked) => handleToggleIntegration('email_marketing', checked)}
              disabled={isUpdating}
            />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Configure automações de email marketing
            </CardDescription>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowEmailDialog(true)}
              disabled={isUpdating}
            >
              {isIntegrationActive('email_marketing') ? 'Configurado' : 'Configurar'}
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
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  URL do Facebook
                </Label>
                <Input 
                  placeholder="https://facebook.com/suapagina"
                  value={socialSettings.facebookUrl}
                  onChange={(e) => setSocialSettings(prev => ({ 
                    ...prev, 
                    facebookUrl: e.target.value 
                  }))}
                  disabled={isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  URL do Instagram
                </Label>
                <Input 
                  placeholder="https://instagram.com/seuperfil"
                  value={socialSettings.instagramUrl}
                  onChange={(e) => setSocialSettings(prev => ({ 
                    ...prev, 
                    instagramUrl: e.target.value 
                  }))}
                  disabled={isUpdating}
                />
              </div>
              <Button 
                onClick={handleSocialMediaUpdate} 
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* N8N Configuration Dialog */}
      <N8NConfigDialog
        open={showN8NDialog}
        onOpenChange={setShowN8NDialog}
        type={n8nDialogType}
      />

      {/* WhatsApp Configuration Dialog */}
      <WhatsAppConfigDialog
        open={showWhatsAppDialog}
        onOpenChange={setShowWhatsAppDialog}
      />

      {/* Stripe Configuration Dialog */}
      <StripeConfigDialog
        open={showStripeDialog}
        onOpenChange={setShowStripeDialog}
      />

      {/* Email Marketing Configuration Dialog */}
      <EmailMarketingConfigDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
      />

      {/* Status das Integrações */}
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
              <span className={isIntegrationActive('google_calendar') ? "text-green-600" : "text-gray-500"}>
                {isIntegrationActive('google_calendar') ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>WhatsApp:</span>
              <span className={isIntegrationActive('whatsapp_n8n') ? "text-green-600" : "text-gray-500"}>
                {isIntegrationActive('whatsapp_n8n') ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>N8N:</span>
              <span className={isIntegrationActive('n8n_automation') ? "text-green-600" : "text-gray-500"}>
                {isIntegrationActive('n8n_automation') ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Stripe:</span>
              <span className={isIntegrationActive('stripe_payments') ? "text-green-600" : "text-gray-500"}>
                {isIntegrationActive('stripe_payments') ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Email:</span>
              <span className={isIntegrationActive('email_marketing') ? "text-green-600" : "text-gray-500"}>
                {isIntegrationActive('email_marketing') ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Redes Sociais:</span>
              <span className={isIntegrationActive('social_media') ? "text-green-600" : "text-gray-500"}>
                {isIntegrationActive('social_media') ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}