
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Clientes from "./pages/Clientes";
import Financeiro from "./pages/Financeiro";
import Configuracoes from "./pages/Configuracoes";
import Vendas from "./pages/Vendas";
import Relatorios from "./pages/Relatorios";
import Automacao from "./pages/Automacao";
import Agenda from "./pages/Agenda";
import Orcamentos from "./pages/Orcamentos";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/produtos" element={<Produtos />} />
                  <Route path="/vendas" element={<Vendas />} />
                  <Route path="/orcamentos" element={<Orcamentos />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/automacao" element={<Automacao />} />
                  <Route path="/agenda" element={<Agenda />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment-canceled" element={<PaymentCanceled />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
