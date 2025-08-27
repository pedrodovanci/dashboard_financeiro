import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus, CreditCard, Wallet, Building } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'debit_card';
  bank: string;
  brand?: string; // Para cartões: Visa, Mastercard, etc.
  issuer?: string; // Para cartões: Itaú, Nubank, etc.
  balance?: number;
  userId: string;
}

interface AccountManagerProps {
  trigger?: React.ReactNode;
}

const AccountManager: React.FC<AccountManagerProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking' as Account['type'],
    bank: '',
    brand: '',
    issuer: '',
    balance: '0'
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const accountTypes = {
    checking: 'Conta Corrente',
    savings: 'Conta Poupança',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito'
  };

  const cardBrands = ['Visa', 'Mastercard', 'American Express', 'Elo', 'Hipercard'];
  const cardIssuers = ['Itaú', 'Nubank', 'Bradesco', 'Santander', 'Banco do Brasil', 'Caixa', 'Inter', 'C6 Bank', 'BTG Pactual', 'Outros'];
  const banks = ['Itaú', 'Bradesco', 'Santander', 'Banco do Brasil', 'Caixa', 'Nubank', 'Inter', 'C6 Bank', 'BTG Pactual', 'Outros'];

  useEffect(() => {
    loadAccounts();
  }, [user]);

  const loadAccounts = () => {
    if (!user) return;
    const stored = localStorage.getItem(`accounts_${user.id}`);
    if (stored) {
      setAccounts(JSON.parse(stored));
    }
  };

  const saveAccounts = (newAccounts: Account[]) => {
    if (!user) return;
    localStorage.setItem(`accounts_${user.id}`, JSON.stringify(newAccounts));
    setAccounts(newAccounts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.bank) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    const accountData: Account = {
      id: editingAccount?.id || `account_${Date.now()}`,
      name: formData.name,
      type: formData.type,
      bank: formData.bank,
      brand: formData.brand || undefined,
      issuer: formData.issuer || undefined,
      balance: parseFloat(formData.balance) || 0,
      userId: user!.id
    };

    let newAccounts;
    if (editingAccount) {
      newAccounts = accounts.map(acc => acc.id === editingAccount.id ? accountData : acc);
    } else {
      newAccounts = [...accounts, accountData];
    }

    saveAccounts(newAccounts);
    resetForm();
    setOpen(false);
    
    toast({
      title: 'Sucesso!',
      description: `Conta ${editingAccount ? 'atualizada' : 'criada'} com sucesso.`,
    });
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      bank: account.bank,
      brand: account.brand || '',
      issuer: account.issuer || '',
      balance: account.balance?.toString() || '0'
    });
    setOpen(true);
  };

  const handleDelete = (accountId: string) => {
    const newAccounts = accounts.filter(acc => acc.id !== accountId);
    saveAccounts(newAccounts);
    toast({
      title: 'Conta removida',
      description: 'A conta foi removida com sucesso.',
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'checking',
      bank: '',
      brand: '',
      issuer: '',
      balance: '0'
    });
    setEditingAccount(null);
  };

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-5 w-5" />;
      case 'checking':
      case 'savings':
        return <Building className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const isCardType = formData.type === 'credit_card' || formData.type === 'debit_card';

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}>
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? 'Editar Conta' : 'Nova Conta'}
            </DialogTitle>
            <DialogDescription>
              {editingAccount ? 'Edite as informações da conta.' : 'Adicione uma nova conta ou cartão.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Conta *</Label>
              <Input
                id="name"
                placeholder="Ex: Conta Corrente Itaú, Cartão Nubank"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Conta *</Label>
              <Select value={formData.type} onValueChange={(value: Account['type']) => setFormData({ ...formData, type: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(accountTypes).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank">{isCardType ? 'Banco/Instituição' : 'Banco'} *</Label>
              <Select value={formData.bank} onValueChange={(value) => setFormData({ ...formData, bank: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isCardType && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="issuer">Emissor do Cartão</Label>
                  <Select value={formData.issuer} onValueChange={(value) => setFormData({ ...formData, issuer: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o emissor" />
                    </SelectTrigger>
                    <SelectContent>
                      {cardIssuers.map((issuer) => (
                        <SelectItem key={issuer} value={issuer}>
                          {issuer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Bandeira do Cartão</Label>
                  <Select value={formData.brand} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a bandeira" />
                    </SelectTrigger>
                    <SelectContent>
                      {cardBrands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="balance">Saldo Inicial</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingAccount ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lista de Contas */}
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold">Minhas Contas ({accounts.length})</h3>
        {accounts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhuma conta cadastrada. Clique em "Nova Conta" para começar.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAccountIcon(account.type)}
                      <CardTitle className="text-base">{account.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tipo:</span>
                      <Badge variant="secondary">{accountTypes[account.type]}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Banco:</span>
                      <span className="text-sm font-medium">{account.bank}</span>
                    </div>
                    {account.issuer && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Emissor:</span>
                        <span className="text-sm font-medium">{account.issuer}</span>
                      </div>
                    )}
                    {account.brand && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Bandeira:</span>
                        <span className="text-sm font-medium">{account.brand}</span>
                      </div>
                    )}
                    {account.balance !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Saldo:</span>
                        <span className="text-sm font-medium">
                          R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AccountManager;