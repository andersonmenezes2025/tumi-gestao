
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, User } from 'lucide-react';

const userSchema = z.object({
  full_name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  phone: z.string()
    .optional()
    .refine((val) => !val || /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(val), 'Formato de telefone inválido'),
});

type UserFormData = z.infer<typeof userSchema>;

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export function UserSettings() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
    },
  });

  const onSubmit = async (data: UserFormData) => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      const sanitizedData = {
        full_name: sanitizeInput(data.full_name),
        phone: data.phone ? sanitizeInput(data.phone) : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(sanitizedData)
        .eq('id', user.id);

      if (error) {
        throw new Error('Erro ao atualizar perfil');
      }

      await refreshProfile();
      
      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar perfil.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-muted-foreground">
                O email não pode ser alterado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                {...register('full_name')}
                placeholder="Seu nome completo"
                maxLength={100}
              />
              {errors.full_name && (
                <p className="text-sm text-red-500">{errors.full_name.message}</p>
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

            <div className="space-y-2">
              <Label>Função</Label>
              <Input
                value={profile?.role === 'admin' ? 'Administrador' : 'Usuário'}
                disabled
                className="bg-gray-50"
              />
            </div>

            <Button type="submit" disabled={isUpdating} className="w-full md:w-auto">
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
          <CardDescription>
            Configurações de segurança da conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alterar Senha</p>
                <p className="text-sm text-muted-foreground">
                  Mantenha sua conta segura com uma senha forte
                </p>
              </div>
              <Button variant="outline" disabled>
                Em Breve
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
