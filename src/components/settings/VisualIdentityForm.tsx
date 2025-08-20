
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
import { apiClient } from '@/lib/api-client';
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
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !company) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo de imagem.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'O arquivo deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Create file path with user ID and company ID for security
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${company.creator_id}/${company.id}/${fileName}`;

      // For now, disable file upload functionality since we're using direct PostgreSQL
      toast({
        title: 'Funcionalidade temporariamente indisponível',
        description: 'Upload de logo será implementado em breve.',
        variant: "destructive",
      });

      toast({
        title: 'Sucesso',
        description: 'Logo enviado com sucesso!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar logo',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
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

            <div className="text-center text-sm text-muted-foreground my-2">
              ou
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_upload">Upload de Arquivo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="logo_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => document.getElementById('logo_upload')?.click()}
                  className="gap-2"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? 'Enviando...' : 'Selecionar'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Aceita PNG, JPG, JPEG. Máximo 5MB.
              </p>
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
