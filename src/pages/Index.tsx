import { Wallet, TrendingUp, TrendingDown, PieChart } from "lucide-react"
import { SummaryCard } from "@/components/SummaryCard"
import { TransactionList } from "@/components/TransactionList"
import { ExpenseChart } from "@/components/ExpenseChart"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                FinanceDash
              </h1>
              <p className="text-sm text-muted-foreground">
                Sua visão completa das finanças
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Bem-vindo de volta!</p>
              <p className="font-medium text-foreground">João Silva</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard
            title="Saldo Total"
            value="R$ 12.450"
            change="+5.2% este mês"
            changeType="positive"
            icon={Wallet}
          />
          <SummaryCard
            title="Receitas"
            value="R$ 8.300"
            change="+12% este mês"
            changeType="positive"
            icon={TrendingUp}
          />
          <SummaryCard
            title="Despesas"
            value="R$ 4.520"
            change="-3% este mês"
            changeType="positive"
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