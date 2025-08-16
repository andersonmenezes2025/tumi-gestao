import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, Search, User, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { Tables } from '@/integrations/supabase/types';

type Customer = Tables<'customers'>;
type Product = Tables<'products'>;
type Sale = Tables<'sales'>;

interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  total_price: number;
}

interface SaleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  sale?: Sale | null;
}

export function SaleForm({ open, onOpenChange, onSuccess, sale }: SaleFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [customerType, setCustomerType] = useState<'existing' | 'new' | 'none'>('none');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    document: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<string>('money');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  
  const { toast } = useToast();
  const { companyId } = useCompany();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
    product.active && (product.stock_quantity || 0) > 0
  );

  useEffect(() => {
    if (open && companyId) {
      fetchCustomers();
      fetchProducts();
    }
  }, [open, companyId]);

  useEffect(() => {
    if (open && sale) {
      loadSaleData();
    } else if (open && !sale) {
      resetForm();
    }
  }, [open, sale]);

  const fetchCustomers = async () => {
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('company_id', companyId)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
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
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addProduct = (product: Product) => {
    const existingItem = saleItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setSaleItems(items => items.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * item.unit_price * (1 - item.discount_percentage / 100) }
          : item
      ));
    } else {
      const newItem: SaleItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price,
        discount_percentage: 0,
        total_price: product.price
      };
      setSaleItems(items => [...items, newItem]);
    }
    setSearchProduct('');
  };

  const updateSaleItem = (index: number, field: keyof SaleItem, value: number) => {
    setSaleItems(items => items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price' || field === 'discount_percentage') {
          updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price * (1 - updatedItem.discount_percentage / 100);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeSaleItem = (index: number) => {
    setSaleItems(items => items.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return saleItems.reduce((total, item) => total + item.total_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || saleItems.length === 0) return;

    setLoading(true);
    try {
      let customerId = selectedCustomer;
      
      // Create new customer if needed
      if (customerType === 'new' && newCustomer.name) {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .insert([{
            company_id: companyId,
            name: newCustomer.name,
            email: newCustomer.email || null,
            phone: newCustomer.phone || null,
            document: newCustomer.document || null,
            active: true
          }])
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = customerData.id;
      }

      if (sale) {
        // Update existing sale
        const { error: saleError } = await supabase
          .from('sales')
          .update({
            customer_id: customerId || null,
            total_amount: getTotalAmount(),
            payment_method: paymentMethod,
            notes: notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', sale.id);

        if (saleError) throw saleError;

        // Delete existing sale items
        const { error: deleteItemsError } = await supabase
          .from('sale_items')
          .delete()
          .eq('sale_id', sale.id);

        if (deleteItemsError) throw deleteItemsError;

        // Insert updated sale items
        for (const item of saleItems) {
          const { error: itemError } = await supabase
            .from('sale_items')
            .insert({
              sale_id: sale.id,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              discount_percentage: item.discount_percentage,
              total_price: item.total_price
            });

          if (itemError) throw itemError;
        }

        toast({
          title: "Venda atualizada com sucesso!",
          description: `Venda ${sale.sale_number} foi atualizada.`,
        });

      } else {
        // Create new sale
        // Generate sale number
        const { data: saleNumber, error: numberError } = await supabase
          .rpc('generate_sale_number', { company_uuid: companyId });

        if (numberError) throw numberError;

        // Create sale
        const { data: saleData, error: saleError } = await supabase
          .from('sales')
          .insert([{
            company_id: companyId,
            customer_id: customerId || null,
            sale_number: saleNumber,
            total_amount: getTotalAmount(),
            payment_method: paymentMethod,
            payment_status: 'completed',
            status: 'completed',
            notes: notes || null
          }])
          .select()
          .single();

        if (saleError) throw saleError;

        // Create sale items and update stock
        for (const item of saleItems) {
          const { error: itemError } = await supabase
            .from('sale_items')
            .insert({
              sale_id: saleData.id,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              discount_percentage: item.discount_percentage,
              total_price: item.total_price
            });

          if (itemError) throw itemError;

          // Update product stock
          const product = products.find(p => p.id === item.product_id);
          if (product && product.stock_quantity !== null) {
            const newStock = Math.max(0, product.stock_quantity - item.quantity);
            
            const { error: stockError } = await supabase
              .from('products')
              .update({ stock_quantity: newStock })
              .eq('id', item.product_id);

            if (stockError) throw stockError;
          }
        }

        // Create accounts receivable if payment method is not cash/debit/pix
        if (paymentMethod && !['cash', 'debit', 'pix'].includes(paymentMethod.toLowerCase())) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

          const { error: receivableError } = await supabase
            .from('accounts_receivable')
            .insert({
              company_id: companyId,
              customer_id: customerId || null,
              sale_id: saleData.id,
              amount: getTotalAmount(),
              due_date: dueDate.toISOString().split('T')[0],
              description: `Venda ${saleNumber} - ${customerType === 'existing' && selectedCustomer ? customers.find(c => c.id === selectedCustomer)?.name : customerType === 'new' ? newCustomer.name : 'Cliente não informado'}`,
              status: 'pending'
            });

          if (receivableError) {
            console.error('Error creating receivable:', receivableError);
            // Don't throw error - sale was successful even if receivable creation failed
          }
        }

        toast({
          title: "Venda realizada com sucesso!",
          description: `Venda ${saleNumber} foi registrada.`,
        });
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: sale ? "Erro ao atualizar venda" : "Erro ao realizar venda",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSaleData = async () => {
    if (!sale) return;
    
    try {
      // Load sale items
      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          *,
          products (
            name,
            unit
          )
        `)
        .eq('sale_id', sale.id);

      if (itemsError) throw itemsError;

      // Set sale items
      const formattedItems: SaleItem[] = itemsData.map(item => ({
        product_id: item.product_id,
        product_name: (item as any).products?.name || 'Produto não encontrado',
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percentage: item.discount_percentage || 0,
        total_price: item.total_price
      }));
      
      setSaleItems(formattedItems);
      
      // Set customer info
      if (sale.customer_id) {
        setCustomerType('existing');
        setSelectedCustomer(sale.customer_id);
      } else {
        setCustomerType('none');
      }
      
      // Set other sale data
      setPaymentMethod(sale.payment_method || 'money');
      setNotes(sale.notes || '');
      
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados da venda",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSaleItems([]);
    setCustomerType('none');
    setSelectedCustomer('');
    setNewCustomer({ name: '', email: '', phone: '', document: '' });
    setPaymentMethod('money');
    setNotes('');
    setSearchProduct('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sale ? `Editar Venda #${sale.sale_number}` : 'Nova Venda'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={customerType} 
                onValueChange={(value: 'existing' | 'new' | 'none') => setCustomerType(value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="no-customer" />
                  <Label htmlFor="no-customer">Sem Cliente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="existing-customer" />
                  <Label htmlFor="existing-customer" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Cliente Existente
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new-customer" />
                  <Label htmlFor="new-customer" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Novo Cliente
                  </Label>
                </div>
              </RadioGroup>

              {customerType === 'existing' && (
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {customerType === 'new' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-customer-name">Nome *</Label>
                    <Input
                      id="new-customer-name"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-customer-email">Email</Label>
                    <Input
                      id="new-customer-email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-customer-phone">Telefone</Label>
                    <Input
                      id="new-customer-phone"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-customer-document">CPF/CNPJ</Label>
                    <Input
                      id="new-customer-document"
                      value={newCustomer.document}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, document: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment">Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="money">Dinheiro</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Buscar Produto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Digite o nome do produto..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {searchProduct && filteredProducts.length > 0 && (
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    {filteredProducts.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="p-3 hover:bg-muted cursor-pointer flex justify-between items-center"
                        onClick={() => addProduct(product)}
                      >
                        <span>{product.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">R$ {product.price.toFixed(2).replace('.', ',')}</Badge>
                          <Badge variant="outline">{product.stock_quantity || 0} un</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {saleItems.length > 0 && (
                <div className="space-y-2">
                  <Label>Itens da Venda</Label>
                  {saleItems.map((item, index) => (
                    <div key={index} className="border rounded-md p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.product_name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSaleItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <Label className="text-xs">Quantidade</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Preço Unit.</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => updateSaleItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Desconto (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount_percentage}
                            onChange={(e) => updateSaleItem(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Total</Label>
                          <Input
                            value={`R$ ${item.total_price.toFixed(2).replace('.', ',')}`}
                            readOnly
                            className="bg-muted"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        Total da Venda: R$ {getTotalAmount().toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre a venda..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || saleItems.length === 0}
            >
              {loading 
                ? 'Salvando...' 
                : sale 
                  ? 'Atualizar Venda' 
                  : 'Finalizar Venda'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}