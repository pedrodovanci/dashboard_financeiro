import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'debit_card';
  bank: string;
  brand?: string;
  issuer?: string;
  balance?: number;
  userId: string;
}

interface Transaction {
  id?: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  accountId?: string;
  accountName?: string;
}

interface TransactionModalProps {
  type: 'income' | 'expense';
  trigger: React.ReactNode;
  onSubmit: (transaction: Transaction) => void;
  transaction?: Transaction;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  type,
  trigger,
  onSubmit,
  transaction
}) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [category, setCategory] = useState(transaction?.category || '');
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(transaction?.accountId || '');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const categories = {
    income: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
    expense: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Outros']
  };

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`accounts_${user.id}`);
      if (stored) {
        setAccounts(JSON.parse(stored));
      }
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    const selectedAccount = accounts.find(acc => acc.id === accountId);
    
    const transactionData: Transaction = {
      id: transaction?.id || `${type}_${Date.now()}`,
      type,
      amount: parseFloat(amount),
      description,
      category,
      date,
      accountId: accountId || undefined,
      accountName: selectedAccount?.name || undefined
    };

    onSubmit(transactionData);
    
    // Reset form
    if (!transaction) {
      setAmount('');
      setDescription('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setAccountId('');
    }
    
    setOpen(false);
    
    toast({
      title: 'Sucesso!',
      description: `${type === 'income' ? 'Receita' : 'Despesa'} ${transaction ? 'atualizada' : 'criada'} com sucesso.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar' : 'Nova'} {type === 'income' ? 'Receita' : 'Despesa'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da {type === 'income' ? 'receita' : 'despesa'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Descreva a transação"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories[type].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Conta</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.length > 0 ? (
                  accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-accounts" disabled>
                    Nenhuma conta cadastrada
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {accounts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Cadastre uma conta nas configurações para continuar
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full"
              placeholder="dd/mm/aaaa"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {transaction ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;