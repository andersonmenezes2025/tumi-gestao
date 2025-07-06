import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, Calculator, User, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { Tables } from '@/integrations/supabase/types';

type Quote = Tables<'quotes'>;
type Product = Tables<'products'>;
type Customer = Tables<'customers'>;

interface QuoteItem {
  id?: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface QuoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (quote: Omit<Quote, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  quote?: Quote | null;
}

export function QuoteForm({ open, onOpenChange, onSubmit, quote }: QuoteFormProps) {
  const [customerType, setCustomerType] = useState<'existing' | 'new'>('new');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    customer_name: quote?.customer_name || '',
    customer_email: quote?.customer_email || '',
    customer_phone: quote?.customer_phone || '',
    notes: quote?.notes || '',
    valid_until: quote?.valid_until || ''
  });
  
  const [items, setItems] = useState<QuoteItem[]>([
    { product_id: null, product_name: '', quantity: 1, unit_price: 0, total_price: 0 }
  ]);
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { companyId } = useCompany();
  const { products } = useProducts();
  const { customers } = useCustomers();

  // Update form when customer is selected
  useEffect(() => {
    if (customerType === 'existing' && selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer) {
        setFormData(prev => ({
          ...prev,
          customer_name: customer.name,
          customer_email: customer.email || '',
          customer_phone: customer.phone || ''
        }));
      }
    } else if (customerType === 'new') {
      setFormData(prev => ({
        ...prev,
        customer_name: '',
        customer_email: '',
        customer_phone: ''
      }));
    }
  }, [customerType, selectedCustomerId, customers]);

  const addItem = () => {
    setItems([...items, { product_id: null, product_name: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If product is selected, update name and price
    if (field === 'product_id' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].product_name = product.name;
        newItems[index].unit_price = product.price;
      }
    }
    
    // Calculate total price for the item
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setItems(newItems);
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + item.total_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    setLoading(true);
    try {
      const quoteData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone || null,
        notes: formData.notes || null,
        valid_until: formData.valid_until || null,
        total_amount: getTotalAmount(),
        status: 'pending' as const,
        company_id: companyId,
        public_token: null
      };

      await onSubmit(quoteData);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        notes: '',
        valid_until: ''
      });
      setItems([{ product_id: null, product_name: '', quantity: 1, unit_price: 0, total_price: 0 }]);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quote ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Type Selection */}
              <div className="space-y-3">
                <Label>Tipo de Cliente</Label>
                <RadioGroup 
                  value={customerType} 
                  onValueChange={(value: 'existing' | 'new') => setCustomerType(value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existing" id="existing" />
                    <Label htmlFor="existing" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Cliente Existente
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Novo Cliente
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Existing Customer Selection */}
              {customerType === 'existing' && (
                <div className="space-y-2">
                  <Label htmlFor="customer_select">Selecionar Cliente *</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} {customer.email && `(${customer.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Customer Data Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Nome do Cliente *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    disabled={customerType === 'existing'}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer_email">Email *</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                    disabled={customerType === 'existing'}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Telefone</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                    disabled={customerType === 'existing'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Válido até</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Itens do Orçamento</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Produto</Label>
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
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          min="1"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Preço Unit.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Total</Label>
                        <div className="p-2 bg-gray-50 rounded border">
                          R$ {item.total_price.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Geral:</span>
                  <span>R$ {getTotalAmount().toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Adicione observações sobre o orçamento..."
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Orçamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}