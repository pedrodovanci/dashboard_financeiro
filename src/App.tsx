import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FinancialHistory from "./pages/FinancialHistory";
import DetailedTransactions from "./pages/DetailedTransactions";
import Config from "./pages/Config";
import NotFound from "./pages/NotFound";
import { TransactionProvider } from '@/contexts/TransactionContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <TransactionProvider>
            <ErrorBoundary>
              <Router>
                <div className="min-h-screen bg-background text-foreground">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><FinancialHistory /></ProtectedRoute>} />
                    <Route path="/transactions" element={<ProtectedRoute><DetailedTransactions /></ProtectedRoute>} />
                    <Route path="/config" element={<ProtectedRoute><Config /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                  <Sonner />
                </div>
              </Router>
            </ErrorBoundary>
          </TransactionProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
