import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function OrcamentosConfig() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quote-validity">Validade padrão dos orçamentos (dias)</Label>
            <Input
              id="quote-validity"
              type="number"
              placeholder="30"
              className="w-32"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quote-notes">Observações padrão</Label>
            <Textarea
              id="quote-notes"
              placeholder="Observações que aparecerão em todos os orçamentos..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Templates de Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-subject">Assunto do email</Label>
            <Input
              id="email-subject"
              placeholder="Orçamento - {empresa}"
              defaultValue="Orçamento - {empresa}"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-body">Corpo do email</Label>
            <Textarea
              id="email-body"
              placeholder="Prezado(a) {cliente},&#10;&#10;Segue em anexo o orçamento solicitado.&#10;&#10;Atenciosamente,&#10;{empresa}"
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="show-logo" className="rounded" />
            <Label htmlFor="show-logo">Exibir logo da empresa nos orçamentos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="show-contact" className="rounded" />
            <Label htmlFor="show-contact">Exibir informações de contato</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="auto-numbering" className="rounded" defaultChecked />
            <Label htmlFor="auto-numbering">Numeração automática de orçamentos</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}