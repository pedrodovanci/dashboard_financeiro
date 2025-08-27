import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp, TrendingDown, Filter, BarChart3 } from 'lucide-react';
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

// Dados mockados para demonstração
const monthlyData = [
  { month: 'Jan', receitas: 8500, despesas: 4200, saldo: 4300 },
  { month: 'Fev', receitas: 7800, despesas: 4800, saldo: 3000 },
  { month: 'Mar', receitas: 9200, despesas: 5100, saldo: 4100 },
  { month: 'Abr', receitas: 8900, despesas: 4600, saldo: 4300 },
  { month: 'Mai', receitas: 9500, despesas: 4900, saldo: 4600 },
  { month: 'Jun', receitas: 8300, despesas: 4520, saldo: 3780 },
];

const categoryEvolution = [
  { category: 'Alimentação', jan: 1200, fev: 1100, mar: 1300, abr: 1250, mai: 1400, jun: 1200 },
  { category: 'Transporte', jan: 800, fev: 900, mar: 750, abr: 850, mai: 800, jun: 800 },
  { category: 'Casa', jan: 1500, fev: 1600, mar: 1550, abr: 1500, mai: 1650, jun: 1500 },
  { category: 'Tecnologia', jan: 600, fev: 1200, mar: 400, abr: 500, mai: 800, jun: 600 },
];

const expensesByCategory = [
  { name: 'Alimentação', value: 1200, color: '#22c55e', percentage: 26.5 },
  { name: 'Transporte', value: 800, color: '#3b82f6', percentage: 17.7 },
  { name: 'Casa', value: 1500, color: '#f59e0b', percentage: 33.2 },
  { name: 'Tecnologia', value: 600, color: '#ef4444', percentage: 13.3 },
  { name: 'Outros', value: 420, color: '#8b5cf6', percentage: 9.3 },
];

const FinancialHistory = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [chartType, setChartType] = useState('line');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: R$ {entry.value.toLocaleString('pt-BR')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{payload[0].name}</p>
          <p className="text-primary font-bold">
            R$ {payload[0].value.toLocaleString('pt-BR')} ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Histórico Financeiro
              </h1>
              <p className="text-sm text-muted-foreground">
                Análise comparativa da evolução das suas finanças
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">3 meses</SelectItem>
                  <SelectItem value="6m">6 meses</SelectItem>
                  <SelectItem value="12m">12 meses</SelectItem>
                  <SelectItem value="24m">24 meses</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
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

        {/* Gráficos Secundários */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Distribuição por Categoria */}
          <Card>
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

          {/* Evolução por Categoria */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Evolução por Categoria</CardTitle>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="alimentacao">Alimentação</SelectItem>
                    <SelectItem value="transporte">Transporte</SelectItem>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { month: 'Jan', Alimentação: 1200, Transporte: 800, Casa: 1500, Tecnologia: 600 },
                    { month: 'Fev', Alimentação: 1100, Transporte: 900, Casa: 1600, Tecnologia: 1200 },
                    { month: 'Mar', Alimentação: 1300, Transporte: 750, Casa: 1550, Tecnologia: 400 },
                    { month: 'Abr', Alimentação: 1250, Transporte: 850, Casa: 1500, Tecnologia: 500 },
                    { month: 'Mai', Alimentação: 1400, Transporte: 800, Casa: 1650, Tecnologia: 800 },
                    { month: 'Jun', Alimentação: 1200, Transporte: 800, Casa: 1500, Tecnologia: 600 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="Alimentação" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="Transporte" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Casa" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="Tecnologia" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

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