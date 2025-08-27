import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp, TrendingDown, BarChart3, Download, ArrowLeft } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { useNavigate } from 'react-router-dom';

// Dados mockados para demonstração
const monthlyData = [
  { month: 'Jan', receitas: 8500, despesas: 4200, saldo: 4300 },
  { month: 'Fev', receitas: 7800, despesas: 4800, saldo: 3000 },
  { month: 'Mar', receitas: 9200, despesas: 5100, saldo: 4100 },
  { month: 'Abr', receitas: 8900, despesas: 4600, saldo: 4300 },
  { month: 'Mai', receitas: 9500, despesas: 4900, saldo: 4600 },
  { month: 'Jun', receitas: 8300, despesas: 4520, saldo: 3780 },
];

const expensesByCategory = [
  { name: 'Alimentação', value: 1200, color: '#22c55e', percentage: 26.5 },
  { name: 'Transporte', value: 800, color: '#3b82f6', percentage: 17.7 },
  { name: 'Casa', value: 1500, color: '#f59e0b', percentage: 33.2 },
  { name: 'Tecnologia', value: 600, color: '#ef4444', percentage: 13.3 },
  { name: 'Outros', value: 420, color: '#8b5cf6', percentage: 9.3 },
];

const FinancialHistory = () => {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const userTransactions = transactions.filter(t => t.userId === user?.id);

  // Componentes de tooltip customizados
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 dark:text-white">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: R$ ${entry.value.toLocaleString('pt-BR')}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 dark:text-white">{data.name}</p>
          <p className="text-sm" style={{ color: data.color }}>
            {`Valor: R$ ${data.value.toLocaleString('pt-BR')}`}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {`${data.percentage}% do total`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Histórico Financeiro
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Análise detalhada das suas finanças
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  try {
                    const dataStr = JSON.stringify(userTransactions, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    const exportFileDefaultName = `transacoes_${new Date().toISOString().split('T')[0]}.json`;
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                  } catch (error) {
                    console.error('Error exporting transactions:', error);
                  }
                }}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar Transações
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Métricas de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Receita Média</p>
                  <p className="text-2xl font-bold text-foreground">R$ 8.700</p>
                  <p className="text-xs text-positive">+8.2% vs período anterior</p>
                </div>
                <TrendingUp className="h-8 w-8 text-positive" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Despesa Média</p>
                  <p className="text-2xl font-bold text-foreground">R$ 4.670</p>
                  <p className="text-xs text-negative">+3.1% vs período anterior</p>
                </div>
                <TrendingDown className="h-8 w-8 text-negative" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Economia Média</p>
                  <p className="text-2xl font-bold text-foreground">R$ 4.030</p>
                  <p className="text-xs text-positive">+15.3% vs período anterior</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Economia</p>
                  <p className="text-2xl font-bold text-foreground">46.3%</p>
                  <p className="text-xs text-positive">+2.1% vs período anterior</p>
                </div>
                <CalendarDays className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico Principal - Evolução Mensal */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Evolução Mensal</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  Linha
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  Barras
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="receitas"
                      stroke="#22c55e"
                      strokeWidth={3}
                      name="Receitas"
                    />
                    <Line
                      type="monotone"
                      dataKey="despesas"
                      stroke="#ef4444"
                      strokeWidth={3}
                      name="Despesas"
                    />
                    <Line
                      type="monotone"
                      dataKey="saldo"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Saldo"
                    />
                  </LineChart>
                ) : (
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="receitas" fill="#22c55e" name="Receitas" />
                    <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                    <Bar dataKey="saldo" fill="#3b82f6" name="Saldo" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição por Categoria */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Distribuição de Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {expensesByCategory.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">R$ {category.value.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights e Recomendações */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Insights e Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Pontos Positivos</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-positive/10 text-positive">
                      ✓
                    </Badge>
                    <span className="text-sm">Taxa de economia aumentou 15.3% no período</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-positive/10 text-positive">
                      ✓
                    </Badge>
                    <span className="text-sm">Receitas mantiveram crescimento consistente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-positive/10 text-positive">
                      ✓
                    </Badge>
                    <span className="text-sm">Gastos com tecnologia reduziram 25% em março</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Áreas de Atenção</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-negative/10 text-negative">
                      !
                    </Badge>
                    <span className="text-sm">Gastos com casa aumentaram 10% no período</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-negative/10 text-negative">
                      !
                    </Badge>
                    <span className="text-sm">Despesas totais cresceram acima da inflação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-negative/10 text-negative">
                      !
                    </Badge>
                    <span className="text-sm">Variação alta nos gastos com tecnologia</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FinancialHistory;