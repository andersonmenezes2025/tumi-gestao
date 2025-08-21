
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
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
      const response = await apiClient.post('/auth/signin', {
        email: sanitizeInput(email),
        password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta.",
        });

        // Reload to trigger auth context update
        window.location.reload();
        onSuccess?.();
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao fazer login. Tente novamente.';
      toast({
        title: "Erro no login",
        description: message,
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
      const response = await apiClient.post('/auth/signup', {
        email: sanitizeInput(email),
        password,
        fullName: sanitizeInput(fullName).trim(),
        companyName: sanitizeInput(companyName).trim(),
      });

      if (response.data.success) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Você já pode fazer login.",
        });

        // Clear form and switch to signin tab
        setEmail('');
        setPassword('');
        setFullName('');
        setCompanyName('');
        
        // Switch to signin tab
        const signinTab = document.querySelector('[value="signin"]') as HTMLElement;
        signinTab?.click();
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao criar conta. Tente novamente.';
      toast({
        title: "Erro no cadastro",
        description: message,
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
