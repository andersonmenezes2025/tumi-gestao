import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { Building2, Mail, Phone, MessageSquare, CheckCircle, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

interface QuoteItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export default function PublicQuote() {
  const { companyId } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    company_name: '',
    message: '',
    observations: ''
  });

  const [items, setItems] = useState<QuoteItem[]>([
    { product_id: null, product_name: '', quantity: 1, unit_price: 0, total_price: 0 }
  ]);

  useEffect(() => {
    if (companyId) {
      fetchCompany();
      fetchProducts();
    }
  }, [companyId]);

  const fetchCompany = async () => {
    if (!companyId) {
      console.log('PublicQuote: companyId não fornecido');
      return;
    }
    
    console.log('PublicQuote: Buscando empresa com ID:', companyId);
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      console.log('PublicQuote: Resultado da busca:', { data, error });

      if (error) {
        console.error('PublicQuote: Erro ao buscar empresa:', error);
        throw error;
      }
      
      if (!data) {
        console.error('PublicQuote: Empresa não encontrada para ID:', companyId);
        throw new Error('Empresa não encontrada');
      }
      
      console.log('PublicQuote: Empresa encontrada:', data);
      setCompany(data);
    } catch (error: any) {
      console.error('PublicQuote: Erro na fetchCompany:', error);
      toast({
        title: "Erro ao carregar empresa",
        description: `Empresa não encontrada. ID: ${companyId}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', companyId)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const addItem = () => {
    setItems(prev => [...prev, { product_id: null, product_name: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      
      if (field === 'product_id' && value) {
        const product = products.find(p => p.id === value);
        if (product) {
          newItems[index].product_name = product.name;
          newItems[index].unit_price = product.price;
        }
      }
      
      // Calculate total price for the item (always recalculate when quantity, unit_price, or product changes)
      if (field === 'quantity' || field === 'unit_price' || field === 'product_id') {
        newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
      }
      
      return newItems;
    });
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    // Validar se há pelo menos um item com produto selecionado
    const validItems = items.filter(item => item.product_id && item.quantity > 0);
    if (validItems.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um produto para solicitar o orçamento.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Inserir o orçamento online
      const { data: quoteData, error: quoteError } = await supabase
        .from('online_quotes')
        .insert([{
          company_id: companyId,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone || null,
          company_name: formData.company_name || null,
          message: formData.message || null,
          observations: formData.observations || null,
          status: 'pending'
        }])
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Inserir os itens do orçamento
      if (quoteData && validItems.length > 0) {
        const itemsToInsert = validItems.map(item => ({
          online_quote_id: quoteData.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));

        const { error: itemsError } = await supabase
          .from('online_quote_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

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

              {/* Seção de Produtos */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShoppingCart className="h-5 w-5" />
                    Selecione os Produtos
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Escolha os produtos para seu orçamento
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`product_${index}`}>Produto *</Label>
                          <Select
                            value={item.product_id || ''}
                            onValueChange={(value) => updateItem(index, 'product_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - R$ {product.price.toFixed(2)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`quantity_${index}`}>Quantidade *</Label>
                          <Input
                            id={`quantity_${index}`}
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                            placeholder="1"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Total</Label>
                          <div className="px-3 py-2 bg-gray-100 rounded-md text-sm font-medium">
                            R$ {item.total_price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addItem}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Produto
                    </Button>
                    
                    <div className="text-lg font-semibold">
                      Total: R$ {getTotalAmount().toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="message">Descreva o que você precisa</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Descreva detalhadamente o produto ou serviço que você precisa..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                  placeholder="Informações adicionais, prazos, condições especiais..."
                  rows={3}
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