
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCompany } from '@/hooks/useCompany';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const companySchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  cnpj: z.string()
    .optional()
    .refine((val) => !val || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(val), 'CNPJ inválido'),
  email: z.string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .optional()
    .refine((val) => !val || /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(val), 'Formato de telefone inválido'),
  address: z.string().max(200, 'Endereço muito longo').optional(),
  city: z.string().max(50, 'Nome da cidade muito longo').optional(),
  state: z.string().max(50, 'Nome do estado muito longo').optional(),
  zip_code: z.string()
    .optional()
    .refine((val) => !val || /^\d{5}-\d{3}$/.test(val), 'CEP inválido'),
  website: z.string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),
});

type CompanyFormData = z.infer<typeof companySchema>;

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export function CompanySettingsForm() {
  const { company } = useCompany();
  const { updateCompany, isUpdating } = useCompanySettings();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || '',
      cnpj: company?.cnpj || '',
      email: company?.email || '',
      phone: company?.phone || '',
      address: company?.address || '',
      city: company?.city || '',
      state: company?.state || '',
      zip_code: company?.zip_code || '',
      website: company?.website || '',
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      const sanitizedData = {
        name: sanitizeInput(data.name),
        cnpj: data.cnpj ? sanitizeInput(data.cnpj) : null,
        email: data.email ? sanitizeInput(data.email) : null,
        phone: data.phone ? sanitizeInput(data.phone) : null,
        address: data.address ? sanitizeInput(data.address) : null,
        city: data.city ? sanitizeInput(data.city) : null,
        state: data.state ? sanitizeInput(data.state) : null,
        zip_code: data.zip_code ? sanitizeInput(data.zip_code) : null,
        website: data.website ? sanitizeInput(data.website) : null,
      };

      await updateCompany(sanitizedData);
      toast({
        title: 'Sucesso',
        description: 'Informações da empresa atualizadas com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar informações da empresa.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Empresa *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Nome da sua empresa"
            maxLength={100}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            {...register('cnpj')}
            placeholder="00.000.000/0000-00"
            maxLength={18}
          />
          {errors.cnpj && (
            <p className="text-sm text-red-500">{errors.cnpj.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="contato@empresa.com"
            maxLength={254}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Endereço</Label>
          <Textarea
            id="address"
            {...register('address')}
            placeholder="Rua, número, complemento"
            rows={2}
            maxLength={200}
          />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="Cidade"
            maxLength={50}
          />
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            {...register('state')}
            placeholder="Estado"
            maxLength={50}
          />
          {errors.state && (
            <p className="text-sm text-red-500">{errors.state.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip_code">CEP</Label>
          <Input
            id="zip_code"
            {...register('zip_code')}
            placeholder="00000-000"
            maxLength={9}
          />
          {errors.zip_code && (
            <p className="text-sm text-red-500">{errors.zip_code.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            {...register('website')}
            placeholder="https://www.empresa.com"
            maxLength={200}
          />
          {errors.website && (
            <p className="text-sm text-red-500">{errors.website.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isUpdating} className="w-full md:w-auto">
        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Salvar Alterações
      </Button>
    </form>
  );
}
