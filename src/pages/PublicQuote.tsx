import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { Building2, Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react';

export default function PublicQuote() {
  const { companyId } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    company_name: '',
    message: ''
  });

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  const fetchCompany = async () => {
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      setCompany(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar empresa",
        description: "Empresa não encontrada.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('online_quotes')
        .insert([{
          company_id: companyId,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone || null,
          company_name: formData.company_name || null,
          message: formData.message || null,
          status: 'pending'
        }]);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Solicitação enviada com sucesso!",
        description: "Entraremos em contato em breve.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar solicitação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Empresa não encontrada</h2>
            <p className="text-gray-600">A empresa solicitada não foi encontrada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-3xl font-bold text-gray-900">Solicitação Enviada!</h2>
            <p className="text-gray-600 text-lg">
              Obrigado por seu interesse, <strong>{formData.customer_name}</strong>!
            </p>
            <p className="text-gray-600">
              Recebemos sua solicitação de orçamento e entraremos em contato em breve através do 
              email <strong>{formData.customer_email}</strong>
              {formData.customer_phone && (
                <> ou telefone <strong>{formData.customer_phone}</strong></>
              )}.
            </p>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                Powered by <strong>{company.name}</strong> - GestãoPro
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Company Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {company.logo_url && (
                <img 
                  src={company.logo_url} 
                  alt={company.name} 
                  className="h-16 w-auto mx-auto"
                />
              )}
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-xl text-gray-600 mt-2">Solicite seu orçamento</p>
              </div>
              <div className="flex justify-center gap-6 text-sm text-gray-600">
                {company.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {company.email}
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {company.phone}
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {company.website}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Preencha seus dados</CardTitle>
            <p className="text-center text-gray-600">
              Preencha o formulário abaixo e nossa equipe entrará em contato com você
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Nome Completo *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    required
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer_email">Email *</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                    required
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Telefone</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nome da Empresa</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Nome da sua empresa (opcional)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Descreva o que você precisa</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Descreva detalhadamente o produto ou serviço que você precisa..."
                  rows={6}
                />
              </div>

              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full text-lg py-6"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Solicitar Orçamento
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by GestãoPro - Sistema de Gestão Comercial</p>
        </div>
      </div>
    </div>
  );
}