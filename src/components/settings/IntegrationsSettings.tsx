import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  MessageCircle, 
  Mail, 
  Instagram, 
  Facebook,
  Settings,
  ExternalLink,
  Check,
  X
} from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { toast } from '@/hooks/use-toast';

const integrations = [
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sincronize compromissos e eventos',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Integração com WhatsApp Business API',
    icon: MessageCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'email',
    name: 'Email Marketing',
    description: 'Campanhas de email automatizadas',
    icon: Mail,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Conecte seu perfil comercial',
    icon: Instagram,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Integração com Facebook Business',
    icon: Facebook,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
];

export function IntegrationsSettings() {
  const { company } = useCompany();
  const { updateCompany } = useCompanySettings();
  const [whatsappNumber, setWhatsappNumber] = React.useState(company?.whatsapp_number || '');
  const [facebookUrl, setFacebookUrl] = React.useState(company?.facebook_url || '');
  const [instagramUrl, setInstagramUrl] = React.useState(company?.instagram_url || '');

  const handleWhatsAppSave = async () => {
    try {
      await updateCompany({ whatsapp_number: whatsappNumber });
      toast({
        title: 'Sucesso!',
        description: 'Número do WhatsApp atualizado.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao atualizar WhatsApp.',
      });
    }
  };

  const handleSocialSave = async () => {
    try {
      await updateCompany({ 
        facebook_url: facebookUrl,
        instagram_url: instagramUrl 
      });
      toast({
        title: 'Sucesso!',
        description: 'Redes sociais atualizadas.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao atualizar redes sociais.',
      });
    }
  };

  const handleGoogleCalendarToggle = async (enabled: boolean) => {
    try {
      await updateCompany({ google_calendar_integration: enabled });
      toast({
        title: enabled ? 'Integração ativada' : 'Integração desativada',
        description: `Google Calendar ${enabled ? 'conectado' : 'desconectado'}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao atualizar integração.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">WhatsApp Business</CardTitle>
              <CardDescription>Configure seu número para contato direto</CardDescription>
            </div>
          </div>
          <Badge variant={whatsappNumber ? 'default' : 'secondary'}>
            {whatsappNumber ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Configurado
              </>
            ) : (
              <>
                <X className="h-3 w-3 mr-1" />
                Não configurado
              </>
            )}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Número do WhatsApp</Label>
            <div className="flex gap-2">
              <Input
                id="whatsapp"
                placeholder="(11) 99999-9999"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleWhatsAppSave} size="sm">
                Salvar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Calendar Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Google Calendar</CardTitle>
              <CardDescription>Sincronize agendamentos com Google Calendar</CardDescription>
            </div>
          </div>
          <Switch
            checked={company?.google_calendar_integration || false}
            onCheckedChange={handleGoogleCalendarToggle}
          />
        </CardHeader>
        {company?.google_calendar_integration && (
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-700">Integração ativa</span>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Social Media Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Redes Sociais</CardTitle>
          <CardDescription>Configure links para suas redes sociais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facebook">URL do Facebook</Label>
            <Input
              id="facebook"
              placeholder="https://facebook.com/suaempresa"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagram">URL do Instagram</Label>
            <Input
              id="instagram"
              placeholder="https://instagram.com/suaempresa"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
            />
          </div>
          
          <Button onClick={handleSocialSave} className="w-full">
            Salvar Redes Sociais
          </Button>
        </CardContent>
      </Card>

      {/* Other Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Outras Integrações</CardTitle>
          <CardDescription>Mais integrações estarão disponíveis em breve</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {integrations.slice(2).map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${integration.bgColor} rounded-lg`}>
                    <integration.icon className={`h-5 w-5 ${integration.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium">{integration.name}</h4>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  Em breve
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
