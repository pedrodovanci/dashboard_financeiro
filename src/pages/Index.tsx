import { Wallet, TrendingUp, TrendingDown, LogOut, Plus, Minus, ArrowLeft } from "lucide-react"
import { SummaryCard } from "@/components/SummaryCard"
import { TransactionList } from "@/components/TransactionList"
import { ExpenseChart } from "@/components/ExpenseChart"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import TransactionModal from "@/components/TransactionModal"
import Navigation from "@/components/Navigation"
import { useTransactions } from '@/contexts/TransactionContext';

const Index = () => {
  const { user, signOut } = useAuth();
  const { addTransaction, getTransactionsByUser } = useTransactions();

  const userTransactions = user ? getTransactionsByUser(user.id) : [];
  
  // Calcular totais reais
  const totalReceitas = userTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalDespesas = userTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const saldoTotal = totalReceitas - totalDespesas;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Dashboard Financeiro
                </h1>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo de volta, {user?.username}
                </p>
              </div>
              <Navigation />
            </div>
            <div className="flex items-center gap-3">
              {/* Botão Voltar */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              
              {/* Botões de Ação */}
              <TransactionModal
                type="income"
                trigger={
                  <Button className="bg-positive hover:bg-positive/90 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Receita
                  </Button>
                }
                onSubmit={(transaction) => {
                  addTransaction({
                    ...transaction,
                    userId: user?.id,
                  });
                }}
              />
              <TransactionModal
                type="expense"
                trigger={
                  <Button className="bg-negative hover:bg-negative/90 text-white">
                    <Minus className="h-4 w-4 mr-2" />
                    Nova Despesa
                  </Button>
                }
                onSubmit={(transaction) => {
                  addTransaction({
                    ...transaction,
                    userId: user?.id,
                  });
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Summary Cards com dados reais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard
            title="Saldo Total"
            value={`R$ ${saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change={saldoTotal >= 0 ? "+" : "-"}
            changeType={saldoTotal >= 0 ? "positive" : "negative"}
            icon={Wallet}
          />
          <SummaryCard
            title="Receitas"
            value={`R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change={`${userTransactions.filter(t => t.type === 'income').length} transações`}
            changeType="positive"
            icon={TrendingUp}
          />
          <SummaryCard
            title="Despesas"
            value={`R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change={`${userTransactions.filter(t => t.type === 'expense').length} transações`}
            changeType="negative"
            icon={TrendingDown}
          />
        </div>

        {/* Charts and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExpenseChart />
          <TransactionList />
        </div>
      </main>
    </div>
  )
}

export default Index