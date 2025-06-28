
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useCompany } from '@/hooks/useCompany';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { Loader2, Save, Palette, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const visualFormSchema = z.object({
  primary_color: z.string().min(1, 'Cor primária é obrigatória'),
  secondary_color: z.string().min(1, 'Cor secundária é obrigatória'),
  logo_url: z.string().optional(),
});

type VisualFormData = z.infer<typeof visualFormSchema>;

export function VisualIdentityForm() {
  const { company, loading } = useCompany();
  const { updateCompany } = useCompanySettings();

  const form = useForm<VisualFormData>({
    resolver: zodResolver(visualFormSchema),
    defaultValues: {
      primary_color: company?.primary_color || '#3b82f6',
      secondary_color: company?.secondary_color || '#64748b',
      logo_url: company?.logo_url || '',
    },
  });

  React.useEffect(() => {
    if (company) {
      form.reset({
        primary_color: company.primary_color || '#3b82f6',
        secondary_color: company.secondary_color || '#64748b',
        logo_url: company.logo_url || '',
      });
    }
  }, [company, form]);

  const onSubmit = async (data: VisualFormData) => {
    try {
      await updateCompany(data);
      toast({
        title: 'Sucesso!',
        description: 'Identidade visual atualizada com sucesso.',
      });
    } catch (error) {
      console.error('Error updating visual identity:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao atualizar identidade visual.',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="primary_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor Primária</FormLabel>
                <FormDescription>
                  Cor principal da sua marca (botões, destaques)
                </FormDescription>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      className="w-16 h-10 p-1 border rounded"
                      {...field}
                    />
                    <Input
                      type="text"
                      placeholder="#3b82f6"
                      className="flex-1"
                      {...field}
                    />
                    <div 
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: field.value }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondary_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor Secundária</FormLabel>
                <FormDescription>
                  Cor complementar para textos e elementos secundários
                </FormDescription>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      className="w-16 h-10 p-1 border rounded"
                      {...field}
                    />
                    <Input
                      type="text"
                      placeholder="#64748b"
                      className="flex-1"
                      {...field}
                    />
                    <div 
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: field.value }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do Logotipo</FormLabel>
              <FormDescription>
                URL do seu logotipo (PNG, JPG ou SVG)
              </FormDescription>
              <FormControl>
                <div className="flex items-center gap-3">
                  <Input 
                    placeholder="https://exemplo.com/logo.png" 
                    {...field} 
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </FormControl>
              {field.value && (
                <div className="mt-3">
                  <img 
                    src={field.value} 
                    alt="Logo preview" 
                    className="max-w-32 max-h-32 object-contain border rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="font-medium mb-3 flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            Prévia das Cores
          </h4>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div 
                className="w-16 h-16 rounded-lg shadow-sm border"
                style={{ backgroundColor: form.watch('primary_color') }}
              />
              <span className="text-xs mt-2 text-muted-foreground">Primária</span>
            </div>
            <div className="flex flex-col items-center">
              <div 
                className="w-16 h-16 rounded-lg shadow-sm border"
                style={{ backgroundColor: form.watch('secondary_color') }}
              />
              <span className="text-xs mt-2 text-muted-foreground">Secundária</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
