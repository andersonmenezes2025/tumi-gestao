
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCompany } from '@/hooks/useCompany';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';

const visualIdentitySchema = z.object({
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida'),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida'),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

type VisualIdentityFormData = z.infer<typeof visualIdentitySchema>;

export function VisualIdentityForm() {
  const { company } = useCompany();
  const { updateCompany, isUpdating } = useCompanySettings();
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(company?.logo_url || null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VisualIdentityFormData>({
    resolver: zodResolver(visualIdentitySchema),
    defaultValues: {
      primary_color: company?.primary_color || '#3b82f6',
      secondary_color: company?.secondary_color || '#64748b',
      logo_url: company?.logo_url || '',
    },
  });

  const primaryColor = watch('primary_color');
  const secondaryColor = watch('secondary_color');

  const onSubmit = async (data: VisualIdentityFormData) => {
    try {
      await updateCompany(data);
      toast({
        title: 'Sucesso',
        description: 'Identidade visual atualizada com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao atualizar identidade visual:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar identidade visual.',
        variant: 'destructive',
      });
    }
  };

  const handleLogoUrlChange = (url: string) => {
    setValue('logo_url', url);
    setLogoPreview(url);
  };

  const clearLogo = () => {
    setValue('logo_url', '');
    setLogoPreview(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Logotipo</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Adicione o logotipo da sua empresa
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo_url">URL do Logotipo</Label>
              <div className="flex gap-2">
                <Input
                  id="logo_url"
                  {...register('logo_url')}
                  placeholder="https://exemplo.com/logo.png"
                  onChange={(e) => handleLogoUrlChange(e.target.value)}
                />
                {logoPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={clearLogo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {errors.logo_url && (
                <p className="text-sm text-red-500">{errors.logo_url.message}</p>
              )}
            </div>

            {logoPreview && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <Label className="text-sm font-medium">Preview:</Label>
                <div className="mt-2">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-h-32 max-w-full object-contain"
                    onError={() => {
                      setLogoPreview(null);
                      toast({
                        title: 'Erro',
                        description: 'Não foi possível carregar a imagem.',
                        variant: 'destructive',
                      });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary_color">Cor Primária</Label>
            <div className="flex gap-2">
              <Input
                id="primary_color"
                type="color"
                {...register('primary_color')}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                {...register('primary_color')}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
            {errors.primary_color && (
              <p className="text-sm text-red-500">{errors.primary_color.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_color">Cor Secundária</Label>
            <div className="flex gap-2">
              <Input
                id="secondary_color"
                type="color"
                {...register('secondary_color')}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                {...register('secondary_color')}
                placeholder="#64748b"
                className="flex-1"
              />
            </div>
            {errors.secondary_color && (
              <p className="text-sm text-red-500">{errors.secondary_color.message}</p>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <Label className="text-sm font-medium">Preview das Cores:</Label>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-sm">Primária</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: secondaryColor }}
              />
              <span className="text-sm">Secundária</span>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isUpdating} className="w-full md:w-auto">
        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Salvar Alterações
      </Button>
    </form>
  );
}
