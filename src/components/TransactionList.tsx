import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, ShoppingBag, Car, Coffee, Home, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTransactions } from "@/contexts/TransactionContext"
import { useAuth } from "@/contexts/AuthContext"

interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  date: string
  type: "income" | "expense"
}

const categoryIcons = {
  "Alimentação": Coffee,
  "Transporte": Car,
  "Compras": ShoppingBag,
  "Casa": Home,
  "Tecnologia": Smartphone,
  "Salário": ArrowDown,
  "Freelance": ArrowDown,
  "Investimentos": ArrowUp,
  "Moradia": Home,
  "Saúde": Home,
  "Lazer": ShoppingBag,
  "Outros": ShoppingBag
}

export function TransactionList() {
  const { user } = useAuth();
  const { getTransactionsByUser, loading } = useTransactions();
  
  const userTransactions = user ? getTransactionsByUser(user.id) : [];
  const recentTransactions = userTransactions.slice(0, 5); // Mostrar apenas as 5 mais recentes

  if (loading) {
    return (
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Carregando transações...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recentTransactions.length === 0) {
    return (
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Nenhuma transação encontrada. Adicione sua primeira transação!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentTransactions.map((transaction) => {
          const Icon = categoryIcons[transaction.category as keyof typeof categoryIcons] || ShoppingBag
          const isPositive = transaction.type === "income"
          
          return (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-background/5 rounded-lg border border-border/30">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  isPositive ? "bg-positive/10" : "bg-muted"
                )}>
                  <Icon className={cn(
                    "h-5 w-5",
                    isPositive ? "text-positive" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-bold",
                  isPositive ? "text-positive" : "text-negative"
                )}>
                  {isPositive ? "+" : "-"}R$ {Math.abs(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {transaction.category}
                </Badge>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}