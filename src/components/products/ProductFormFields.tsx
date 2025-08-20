import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import { ProductCategory, ProductUnit } from '@/types/database';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  cost_price: number;
  category_id: string;
  unit: string;
  supplier_id?: string;
}

interface ProductFormFieldsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: ProductCategory[];
  errors: Record<string, string>;
}

export function ProductFormFields({ formData, setFormData, categories, errors }: ProductFormFieldsProps) {
  const [supplierType, setSupplierType] = useState<'existing' | 'new'>('existing');
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const { suppliers } = useSuppliers();

  const handleSupplierCreated = (supplier: any) => {
    setFormData(prev => ({ ...prev, supplier_id: supplier.id }));
    setShowSupplierForm(false);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unidade</Label>
        <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="un">Unidade</SelectItem>
            <SelectItem value="kg">Quilograma</SelectItem>
            <SelectItem value="g">Grama</SelectItem>
            <SelectItem value="l">Litro</SelectItem>
            <SelectItem value="ml">Mililitro</SelectItem>
            <SelectItem value="m">Metro</SelectItem>
            <SelectItem value="cm">Centímetro</SelectItem>
            <SelectItem value="mm">Milímetro</SelectItem>
            <SelectItem value="m2">Metro Quadrado</SelectItem>
            <SelectItem value="m3">Metro Cúbico</SelectItem>
            <SelectItem value="cx">Caixa</SelectItem>
            <SelectItem value="pct">Pacote</SelectItem>
            <SelectItem value="dz">Dúzia</SelectItem>
            <SelectItem value="par">Par</SelectItem>
            <SelectItem value="kit">Kit</SelectItem>
            <SelectItem value="sc">Saco</SelectItem>
            <SelectItem value="bd">Bandeja</SelectItem>
            <SelectItem value="gl">Galão</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Supplier Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Fornecedor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup 
            value={supplierType} 
            onValueChange={(value: 'existing' | 'new') => setSupplierType(value)}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing-supplier" />
              <Label htmlFor="existing-supplier">Fornecedor Existente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new-supplier" />
              <Label htmlFor="new-supplier">Novo Fornecedor</Label>
            </div>
          </RadioGroup>

          {supplierType === 'existing' ? (
            <div className="space-y-2">
              <Label htmlFor="supplier-select">Selecionar Fornecedor</Label>
              <Select 
                value={formData.supplier_id || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, supplier_id: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSupplierForm(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Novo Fornecedor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SupplierForm
        open={showSupplierForm}
        onOpenChange={setShowSupplierForm}
        onSuccess={handleSupplierCreated}
      />
    </>
  );
}