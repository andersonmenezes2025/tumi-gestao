
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';
import { apiClient } from '@/lib/api-client';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Database,
  Users,
  Building,
  Settings,
  Shield
} from 'lucide-react';

interface HealthCheck {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  icon: React.ReactNode;
}

type TableName = 'companies' | 'profiles' | 'products' | 'customers';

export function SystemHealthCheck() {
  const { user, profile, company } = useAuth();
  const { hasCompany } = useCompany();
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runHealthChecks = async () => {
    setIsRunning(true);
    const healthChecks: HealthCheck[] = [];

    // 1. Verificar autenticação
    healthChecks.push({
      name: 'Autenticação',
      status: user ? 'success' : 'error',
      message: user ? 'Usuário autenticado com sucesso' : 'Usuário não autenticado',
      icon: <Shield className="h-4 w-4" />
    });

    // 2. Verificar perfil do usuário
    healthChecks.push({
      name: 'Perfil do Usuário',
      status: profile ? 'success' : 'error',
      message: profile ? `Perfil carregado: ${profile.full_name || 'Sem nome'}` : 'Perfil não encontrado',
      icon: <Users className="h-4 w-4" />
    });

    // 3. Verificar empresa
    healthChecks.push({
      name: 'Empresa',
      status: hasCompany ? 'success' : 'warning',
      message: hasCompany ? `Empresa: ${company?.name}` : 'Empresa não configurada',
      icon: <Building className="h-4 w-4" />
    });

    // 4. Testar conexão com banco de dados
    try {
      const response = await apiClient.get('/auth/health');
      healthChecks.push({
        name: 'Conexão com Banco',
        status: response.data ? 'success' : 'error',
        message: response.data ? 'API funcionando' : 'Erro na API',
        icon: <Database className="h-4 w-4" />
      });
    } catch (error) {
      healthChecks.push({
        name: 'Conexão com Banco',
        status: 'error',
        message: 'Erro na conexão com banco de dados',
        icon: <Database className="h-4 w-4" />
      });
    }

    // 5. Verificar tabelas principais
    const tables: TableName[] = ['companies', 'profiles', 'products', 'customers'];
    for (const table of tables) {
      try {
        const response = await apiClient.get(`/data/${table}?limit=1`);
        healthChecks.push({
          name: `Tabela: ${table}`,
          status: response ? 'success' : 'error',
          message: response ? `Tabela ${table} acessível` : `Erro ao acessar ${table}`,
          icon: <Database className="h-4 w-4" />
        });
      } catch (error) {
        healthChecks.push({
          name: `Tabela: ${table}`,
          status: 'error',
          message: `Erro ao verificar tabela ${table}`,
          icon: <Database className="h-4 w-4" />
        });
      }
    }

    setChecks(healthChecks);
    setIsRunning(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, [user, profile, company]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">OK</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">ERRO</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">ATENÇÃO</Badge>;
      case 'loading':
        return <Badge className="bg-blue-100 text-blue-800">CARREGANDO</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">DESCONHECIDO</Badge>;
    }
  };

  const successCount = checks.filter(c => c.status === 'success').length;
  const errorCount = checks.filter(c => c.status === 'error').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Verificação de Saúde do Sistema
        </CardTitle>
        <CardDescription>
          Status dos componentes principais do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">{successCount} OK</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">{warningCount} Atenções</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">{errorCount} Erros</span>
            </div>
          </div>
          <Button 
            onClick={runHealthChecks} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Atualizar
          </Button>
        </div>

        <div className="space-y-2">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {check.icon}
                <div>
                  <div className="font-medium text-sm">{check.name}</div>
                  <div className="text-xs text-muted-foreground">{check.message}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(check.status)}
                {getStatusIcon(check.status)}
              </div>
            </div>
          ))}
        </div>

        {checks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            Executando verificações...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
