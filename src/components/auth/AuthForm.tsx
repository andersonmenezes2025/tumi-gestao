
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building, User } from 'lucide-react';

interface AuthFormProps {
  onSuccess?: () => void;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, informe um email válido",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(password)) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizeInput(email),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos');
        }
        throw new Error('Erro ao fazer login. Tente novamente.');
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sanitizeInput(fullName).trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome completo",
        variant: "destructive",
      });
      return;
    }

    if (!sanitizeInput(companyName).trim()) {
      toast({
        title: "Nome da empresa obrigatório",
        description: "Por favor, informe o nome da sua empresa",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, informe um email válido",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(password)) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sanitizeInput(email),
        password,
        options: {
          data: {
            full_name: sanitizeInput(fullName),
            company_name: sanitizeInput(companyName),
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          throw new Error('Este email já está cadastrado. Tente fazer login.');
        }
        throw new Error('Erro ao criar conta. Tente novamente.');
      }

      if (authData.user) {
        // Create company
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert([{ 
            name: sanitizeInput(companyName).trim()
          }])
          .select()
          .single();

        if (companyError) {
          throw new Error('Erro ao criar empresa');
        }

        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            company_id: company.id,
            full_name: sanitizeInput(fullName).trim(),
            email: sanitizeInput(email),
            role: 'admin'
          }]);

        if (profileError) {
          throw new Error('Erro ao criar perfil do usuário');
        }

        toast({
          title: "Conta criada com sucesso!",
          description: authData.user.email_confirmed_at 
            ? "Você já pode usar o sistema."
            : "Verifique seu email para confirmar a conta.",
        });

        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <Building className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">GestãoPro</CardTitle>
          <CardDescription>
            Sistema completo de gestão comercial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    maxLength={254}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    maxLength={128}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <User className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa *</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Nome da sua empresa"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    disabled={isLoading}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email *</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    maxLength={254}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Senha *</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={128}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Building className="mr-2 h-4 w-4" />
                  Criar Conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
