
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  MessageSquare, 
  Mail, 
  Facebook, 
  Instagram,
  Settings
} from 'lucide-react';

export function IntegrationsSettings() {
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
            <Switch />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Sincronize seus agendamentos com o Google Calendar
            </CardDescription>
            <Button variant="outline" size="sm" disabled>
              Configurar
            </Button>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base">WhatsApp Business</CardTitle>
            </div>
            <Switch />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Integre com WhatsApp para automação de mensagens
            </CardDescription>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">Número do WhatsApp</Label>
              <Input
                id="whatsapp_number"
                placeholder="(11) 99999-9999"
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Marketing */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">Email Marketing</CardTitle>
            </div>
            <Switch />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Configure automações de email marketing
            </CardDescription>
            <Button variant="outline" size="sm" disabled>
              Configurar SMTP
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

      <Card>
        <CardHeader>
          <CardTitle>Configurações Avançadas</CardTitle>
          <CardDescription>
            Integrações personalizadas e configurações avançadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            As integrações avançadas estarão disponíveis em breve. 
            Entre em contato com o suporte para configurações personalizadas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
