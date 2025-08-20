import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { apiClient } from '@/lib/api-client';
import { ProductUnit } from '@/types/database';

interface UnitManagementProps {
  onRefresh?: () => void;
}

export function UnitManagement({ onRefresh }: UnitManagementProps) {
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ProductUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();
  const { companyId } = useCompany();

  useEffect(() => {
    if (companyId) {
      fetchUnits();
    }
  }, [companyId]);

  const fetchUnits = async () => {
    if (!companyId) return;
    
    try {
      const response = await apiClient.get(`/data/product_units?company_id=${companyId}&order=name:asc`);
      setUnits(response.data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar unidades",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    setSaving(true);
    try {
      const unitData = {
        name: formData.name.trim(),
        abbreviation: formData.abbreviation.trim(),
        description: formData.description.trim() || null,
        company_id: companyId
      };

      if (editingUnit) {
        // Update existing unit
        await apiClient.put(`/data/product_units/${editingUnit.id}`, unitData);
        toast({
          title: "Unidade atualizada com sucesso!",
        });
      } else {
        // Create new unit
        await apiClient.post('/data/product_units', unitData);
        toast({
          title: "Unidade criada com sucesso!",
        });
      }

      fetchUnits();
      setShowUnitForm(false);
      setEditingUnit(null);
      setFormData({ name: '', abbreviation: '', description: '' });
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar unidade",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (unit: ProductUnit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      abbreviation: unit.abbreviation,
      description: unit.description || ''
    });
    setShowUnitForm(true);
  };

  const handleDelete = async (unit: ProductUnit) => {
    if (window.confirm(`Tem certeza que deseja excluir a unidade "${unit.name}"?`)) {
      try {
        await apiClient.delete(`/data/product_units/${unit.id}`);
        
        toast({
          title: "Unidade excluída com sucesso!",
        });
        
        fetchUnits();
        if (onRefresh) onRefresh();
      } catch (error: any) {
        toast({
          title: "Erro ao excluir unidade",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleNewUnit = () => {
    setEditingUnit(null);
    setFormData({ name: '', abbreviation: '', description: '' });
    setShowUnitForm(true);
  };

  if (loading) {
    return <div className="flex justify-center p-4">Carregando unidades...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Unidades de Medida</h3>
        <Button onClick={handleNewUnit} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Unidade
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit) => (
          <Card key={unit.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{unit.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {unit.abbreviation}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(unit)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(unit)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {unit.description && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{unit.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {units.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma unidade cadastrada
        </div>
      )}

      {/* Unit Form Dialog */}
      <Dialog open={showUnitForm} onOpenChange={setShowUnitForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Quilograma"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abbreviation">Abreviação *</Label>
              <Input
                id="abbreviation"
                value={formData.abbreviation}
                onChange={(e) => setFormData(prev => ({ ...prev, abbreviation: e.target.value }))}
                placeholder="Ex: kg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional da unidade"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowUnitForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}