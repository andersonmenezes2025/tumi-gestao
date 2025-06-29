
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useTestCompany() {
  const { user, refreshProfile } = useAuth();

  const createTestCompany = async () => {
    if (!user) return;

    try {
      console.log('Creating test company for user:', user.id);

      // Criar a empresa com creator_id
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: 'Empresa de Teste',
          email: 'teste@empresa.com',
          phone: '(11) 99999-9999',
          cnpj: '00.000.000/0001-00',
          address: 'Rua de Teste, 123',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01000-000',
          creator_id: user.id, // Importante: definir o creator_id
        })
        .select()
        .single();

      if (companyError) {
        console.error('Error creating company:', companyError);
        throw companyError;
      }

      console.log('Test company created:', company);

      // Atualizar o perfil do usuário com a empresa e role admin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          company_id: company.id,
          role: 'admin', // Definir como admin já que criou a empresa
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      console.log('Profile updated with company');

      // Refresh the profile to get the updated data
      await refreshProfile();

      console.log('Test company setup completed');
      return company;
    } catch (error) {
      console.error('Error in createTestCompany:', error);
      throw error;
    }
  };

  return { createTestCompany };
}
