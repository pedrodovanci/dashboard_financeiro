import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, ShoppingBag, Car, Coffee, Home, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"

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
  "Freelance": ArrowDown
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    description: "Salário Empresa XYZ",
    amount: 5500,
    category: "Salário",
    date: "2024-01-15",
    type: "income"
  },
  {
    id: "2",
    description: "Supermercado",
    amount: -320,
    category: "Alimentação",
    date: "2024-01-14",
    type: "expense"
  },
  {
    id: "3",
    description: "Uber",
    amount: -25,
    category: "Transporte",
    date: "2024-01-14",
    type: "expense"
  },
  {
    id: "4",
    description: "Freelance Design",
    amount: 800,
    category: "Freelance",
    date: "2024-01-13",
    type: "income"
  },
  {
    id: "5",
    description: "iPhone 15",
    amount: -4500,
    category: "Tecnologia",
    date: "2024-01-12",
    type: "expense"
  }
]

export function TransactionList() {
  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockTransactions.map((transaction) => {
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
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-bold",
                  isPositive ? "text-positive" : "text-negative"
                )}>
                  {isPositive ? "+" : ""}R$ {Math.abs(transaction.amount).toLocaleString("pt-BR")}
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