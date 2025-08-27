import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Calendar,
  DollarSign,
  Tag,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
} from 'lucide-react';
import { useTransactions } from '@/contexts/TransactionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type SortField = 'date' | 'amount' | 'category' | 'description';
type SortDirection = 'asc' | 'desc';

const DetailedTransactions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTransactionsByUser, deleteTransaction, loading } = useTransactions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  const userTransactions = user ? getTransactionsByUser(user.id) : [];

  // Filtrar e ordenar transações
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = userTransactions.filter((transaction) => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
      const matchesType = selectedType === 'all' || 
                         (selectedType === 'receita' && transaction.type === 'income') ||
                         (selectedType === 'despesa' && transaction.type === 'expense');
      const matchesAccount = selectedAccount === 'all' || (transaction.accountName && transaction.accountName === selectedAccount);
      const matchesStatus = selectedStatus === 'all' || (transaction.status && transaction.status === selectedStatus);

      return matchesSearch && matchesCategory && matchesType && matchesAccount && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'amount') {
        aValue = Math.abs(aValue);
        bValue = Math.abs(bValue);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [userTransactions, searchTerm, selectedCategory, selectedType, selectedAccount, selectedStatus, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const handleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === filteredAndSortedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredAndSortedTransactions.map(t => t.id));
    }
  };

  const handleDeleteSelected = () => {
    selectedTransactions.forEach(id => deleteTransaction(id));
    setSelectedTransactions([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmado: 'default',
      pendente: 'secondary',
      cancelado: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Alimentação': '🍽️',
      'Transporte': '🚗',
      'Moradia': '🏠',
      'Saúde': '🏥',
      'Lazer': '🎮',
      'Tecnologia': '💻',
      'Salário': '💰',
      'Freelance': '💼',
      'Investimentos': '📈',
      'Outros': '📦'
    };
    return icons[category] || '📦';
  };

  // Calcular totais
  const totalReceitas = filteredAndSortedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = filteredAndSortedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando transações...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Lançamentos Detalhados
              </h1>
              <p className="text-sm text-muted-foreground">
                Visualização completa de todas as suas transações
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Botão Voltar */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              {selectedTransactions.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir ({selectedTransactions.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Receitas</p>
                  <p className="text-2xl font-bold text-positive">
                    {formatCurrency(totalReceitas)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {filteredAndSortedTransactions.filter(t => t.type === 'income').length} transações
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-positive" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Despesas</p>
                  <p className="text-2xl font-bold text-negative">
                    {formatCurrency(totalDespesas)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {filteredAndSortedTransactions.filter(t => t.type === 'expense').length} transações
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-negative" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Saldo Líquido</p>
                  <p className={`text-2xl font-bold ${
                    totalReceitas - totalDespesas >= 0 ? 'text-positive' : 'text-negative'
                  }`}>
                    {formatCurrency(totalReceitas - totalDespesas)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {filteredAndSortedTransactions.length} transações totais
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por descrição ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="Alimentação">Alimentação</SelectItem>
                  <SelectItem value="Transporte">Transporte</SelectItem>
                  <SelectItem value="Moradia">Moradia</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                  <SelectItem value="Lazer">Lazer</SelectItem>
                  <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="Salário">Salário</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Investimentos">Investimentos</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as contas</SelectItem>
                  <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
                  <SelectItem value="Conta Poupança">Conta Poupança</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Transações */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transações ({filteredAndSortedTransactions.length})</CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedTransactions.length === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">Selecionar todos</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAndSortedTransactions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Data
                        {getSortIcon('date')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center gap-2">
                        Descrição
                        {getSortIcon('description')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Categoria
                        {getSortIcon('category')}
                      </div>
                    </TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 text-right"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <DollarSign className="h-4 w-4" />
                        Valor
                        {getSortIcon('amount')}
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedTransactions.includes(transaction.id)}
                          onCheckedChange={() => handleSelectTransaction(transaction.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCategoryIcon(transaction.category)}</span>
                          <span>{transaction.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {transaction.accountName || 'Não especificada'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={transaction.type === 'income' ? 'text-positive' : 'text-negative'}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status || 'confirmado')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => deleteTransaction(transaction.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default DetailedTransactions;