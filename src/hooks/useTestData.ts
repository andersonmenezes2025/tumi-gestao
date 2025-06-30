
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useTestData() {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const createTestCompany = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return null;
    }

    try {
      console.log('Criando empresa de teste para usuário:', user.id);

      // Criar a empresa
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: 'Empresa de Teste GestãoPro',
          email: 'contato@gestaopro.com.br',
          phone: '(11) 99999-9999',
          cnpj: '12.345.678/0001-90',
          address: 'Av. Paulista, 1000',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01310-100',
          creator_id: user.id,
        })
        .select()
        .single();

      if (companyError) {
        console.error('Erro ao criar empresa:', companyError);
        toast({
          title: "Erro ao criar empresa",
          description: companyError.message,
          variant: "destructive",
        });
        return null;
      }

      console.log('Empresa criada:', company);

      // Atualizar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          company_id: company.id,
          role: 'admin',
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        toast({
          title: "Erro ao atualizar perfil",
          description: profileError.message,
          variant: "destructive",
        });
        return null;
      }

      console.log('Perfil atualizado com sucesso');

      // Refresh do perfil
      await refreshProfile();

      toast({
        title: "Empresa criada com sucesso!",
        description: `${company.name} foi criada e você foi definido como administrador.`,
      });

      return company;
    } catch (error) {
      console.error('Erro geral:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao criar a empresa de teste",
        variant: "destructive",
      });
      return null;
    }
  };

  const createTestCustomer = async (companyId: string) => {
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .insert({
          company_id: companyId,
          name: 'João Silva Santos',
          email: 'joao.silva@email.com',
          phone: '(11) 98765-4321',
          document_type: 'cpf',
          document: '123.456.789-00',
          address: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01234-567',
          notes: 'Cliente de teste criado automaticamente',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Cliente criado!",
        description: `${customer.name} foi adicionado como cliente de teste.`,
      });

      return customer;
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const createTestProduct = async (companyId: string) => {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          company_id: companyId,
          name: 'Produto de Teste Premium',
          description: 'Produto criado automaticamente para testes',
          sku: 'TEST-001',
          barcode: '7891234567890',
          price: 99.90,
          cost_price: 50.00,
          stock_quantity: 100,
          min_stock: 10,
          max_stock: 500,
          unit: 'un',
          active: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Produto criado!",
        description: `${product.name} foi adicionado ao catálogo de teste.`,
      });

      return product;
    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const createCompleteTestData = async () => {
    const company = await createTestCompany();
    if (!company) return;

    // Aguardar um pouco para garantir que a empresa foi criada
    setTimeout(async () => {
      await createTestCustomer(company.id);
      setTimeout(async () => {
        await createTestProduct(company.id);
      }, 1000);
    }, 1000);
  };

  return {
    createTestCompany,
    createTestCustomer,
    createTestProduct,
    createCompleteTestData,
  };
}
