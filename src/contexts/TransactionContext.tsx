import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  userId?: string;
  accountId?: string;
  accountName?: string;
  status?: 'confirmado' | 'pendente' | 'cancelado';
  account?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByUser: (userId: string) => Transaction[];
  loading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const TRANSACTIONS_STORAGE_KEY = 'simple-ledger-transactions';

const getStoredTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao carregar transações do localStorage:', error);
    return [];
  }
};

const saveTransactions = (transactions: Transaction[]) => {
  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Erro ao salvar transações no localStorage:', error);
  }
};

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar transações do localStorage na inicialização
  useEffect(() => {
    const loadTransactions = () => {
      const storedTransactions = getStoredTransactions();
      setTransactions(storedTransactions);
      setLoading(false);
    };

    loadTransactions();
  }, []);

  // Salvar transações no localStorage sempre que houver mudanças
  useEffect(() => {
    if (!loading) {
      saveTransactions(transactions);
    }
  }, [transactions, loading]);

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: transactionData.status || 'confirmado',
    };

    setTransactions(prev => [newTransaction, ...prev]);
    console.log('✅ Transação adicionada:', newTransaction);
  };

  const updateTransaction = (id: string, updatedData: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id 
          ? { ...transaction, ...updatedData }
          : transaction
      )
    );
    console.log('✅ Transação atualizada:', id);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    console.log('✅ Transação removida:', id);
  };

  const getTransactionsByUser = (userId: string) => {
    return transactions.filter(transaction => transaction.userId === userId);
  };

  const value: TransactionContextType = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByUser,
    loading,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions deve ser usado dentro de um TransactionProvider');
  }
  return context;
};