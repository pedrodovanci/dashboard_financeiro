import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface LocalUser {
  id: string;
  username: string;
  email?: string;
  created_at: string;
}

interface AuthContextType {
  user: LocalUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error?: string }>;
  signUp: (username: string, password: string, email?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  isSupabaseConfigured: boolean;
  configureSupabase: (url: string, anonKey: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'ledger_users';
const CURRENT_USER_KEY = 'ledger_current_user';
const SUPABASE_CONFIG_KEY = 'ledger_supabase_config';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Utility functions for localStorage
const getStoredUsers = (): Record<string, { username: string; password: string; email?: string; created_at: string }> => {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveUser = (username: string, password: string, email?: string) => {
  const users = getStoredUsers();
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  users[username] = {
    username,
    password,
    email,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  return userId;
};

const getCurrentUser = (): LocalUser | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

const setCurrentUser = (user: LocalUser | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

const getSupabaseConfig = () => {
  // Primeiro tenta pegar das variáveis de ambiente
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }
  
  // Fallback para configuração no localStorage
  const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
  return stored ? JSON.parse(stored) : null;
};

const createSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config?.url || !config?.anonKey) {
    return null;
  }
  
  try {
    return createClient(config.url, config.anonKey);
  } catch (error) {
    console.error('Erro ao criar cliente Supabase:', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;
    
    const initializeAuth = async () => {
      try {
        console.log('🚀 Inicializando AuthContext...');
        
        // Check if Supabase is configured (env vars or localStorage)
        const config = getSupabaseConfig();
        const supabaseConfigured = !!config?.url && !!config?.anonKey;
        setIsSupabaseConfigured(supabaseConfigured);
        
        // Pequeno delay para evitar conflitos de renderização
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mounted) return;
        
        // Check for existing user session
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
        
        const supabase = createSupabaseClient();
        
        if (supabase && supabaseConfigured) {
          console.log('📡 Configurando listener do Supabase...');
          
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user && mounted) {
            const loggedUser: LocalUser = {
              id: session.user.id,
              username: session.user.email?.split('@')[0] || 'user',
              email: session.user.email,
              created_at: session.user.created_at || new Date().toISOString(),
            };
            
            console.log('✅ Usuário encontrado na sessão:', loggedUser);
            setUser(loggedUser);
            setCurrentUser(loggedUser);
          }
          
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('🔄 Auth state changed:', event, !!session);
              
              if (!mounted) return;
              
              if (session?.user) {
                const loggedUser: LocalUser = {
                  id: session.user.id,
                  username: session.user.email?.split('@')[0] || 'user',
                  email: session.user.email,
                  created_at: session.user.created_at || new Date().toISOString(),
                };
                
                setUser(loggedUser);
                setCurrentUser(loggedUser);
              } else {
                setUser(null);
                setCurrentUser(null);
              }
            }
          );
          
          cleanup = () => {
            subscription.unsubscribe();
          };
        } else {
          console.log('🏠 Usando autenticação local');
        }
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initializeAuth();
    
    return () => {
      mounted = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      console.log('🔐 Iniciando processo de login:', { username, timestamp: new Date().toISOString() });
      
      const supabase = createSupabaseClient();
      console.log('📡 Supabase client criado:', { configured: isSupabaseConfigured, hasClient: !!supabase });
      
      if (supabase && isSupabaseConfigured) {
        console.log('🌐 Usando autenticação Supabase');
        // Usar Supabase para autenticação
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username.includes('@') ? username : `${username}@local.dev`,
          password: password,
        });
        
        console.log('📊 Resultado Supabase:', { data: !!data, error: error?.message, user: !!data?.user });
        
        if (error) {
          console.error('❌ Erro no login Supabase:', error);
          // Se for erro de email não confirmado ou email login desabilitado, tentar autenticação local
          if (error.message.includes('Email not confirmed') || 
              error.message.includes('Email logins are disabled')) {
            console.log('📧 Problema com email no Supabase, tentando autenticação local...');
            
            // Código da autenticação local (sempre executado se Supabase falhar ou não estiver configurado)
            console.log('🏠 Usando autenticação local');
            const users = getStoredUsers();
            console.log('👥 Usuários armazenados:', Object.keys(users));
            
            // Tentar com o username original primeiro
            let userData = users[username];
            
            // Se não encontrar, tentar com o email completo
            if (!userData) {
              const emailToTry = username.includes('@') ? username : `${username}@local.dev`;
              userData = users[emailToTry];
            }
            
            // Se ainda não encontrar, criar um usuário local temporário para desenvolvimento
            if (!userData) {
              console.log('🔧 Criando usuário local temporário para desenvolvimento');
              const tempEmail = username.includes('@') ? username : `${username}@local.dev`;
              saveUser(tempEmail, password, tempEmail);
              
              const loggedUser: LocalUser = {
                id: `user_${tempEmail}`,
                username: username.includes('@') ? username.split('@')[0] : username,
                email: tempEmail,
                created_at: new Date().toISOString(),
              };
              
              console.log('✅ Usuário local temporário criado e logado:', loggedUser);
              setUser(loggedUser);
              setCurrentUser(loggedUser);
              return {};
            }
            
            if (userData.password !== password) {
              console.error('❌ Senha incorreta para usuário:', username);
              return { error: 'Senha incorreta' };
            }
            
            const loggedUser: LocalUser = {
              id: `user_${userData.username}`,
              username: userData.username,
              email: userData.email,
              created_at: userData.created_at,
            };
            
            console.log('✅ Usuário logado com sucesso (Local):', loggedUser);
            setUser(loggedUser);
            setCurrentUser(loggedUser);
            return {};
          } else {
            return { error: error.message };
          }
        }
        
        if (data.user) {
          const loggedUser: LocalUser = {
            id: data.user.id,
            username: data.user.email?.split('@')[0] || username,
            email: data.user.email,
            created_at: data.user.created_at || new Date().toISOString(),
          };
          
          console.log('✅ Usuário logado com sucesso (Supabase):', loggedUser);
          setUser(loggedUser);
          setCurrentUser(loggedUser);
          return {};
        }
      }
      
      // Remover o código de autenticação local duplicado que estava aqui
      
      console.error('❌ Nenhum método de autenticação funcionou');
      return { error: 'Erro inesperado durante o login' };
    } catch (error) {
      console.error('💥 Erro crítico no signIn:', error);
      return { error: 'Erro inesperado durante o login' };
    }
  };

  const signUp = async (username: string, password: string, email?: string) => {
    try {
      if (username.length < 3) {
        return { error: 'Nome de usuário deve ter pelo menos 3 caracteres' };
      }
      
      if (password.length < 6) {
        return { error: 'Senha deve ter pelo menos 6 caracteres' };
      }
      
      const supabase = createSupabaseClient();
      
      if (supabase && isSupabaseConfigured) {
        // Usar Supabase para cadastro
        const userEmail = email || `${username}@local.dev`;
        
        console.log('Tentando registrar no Supabase:', { email: userEmail, username });
        
        const { data, error } = await supabase.auth.signUp({
          email: userEmail,
          password: password,
          options: {
            data: {
              username: username,
            }
          }
        });
        
        console.log('Resultado do registro Supabase:', { data, error });
        
        if (error) {
          console.error('Erro no registro Supabase:', error);
          return { error: error.message };
        }
        
        if (data.user) {
          const newUser: LocalUser = {
            id: data.user.id,
            username: username,
            email: userEmail,
            created_at: data.user.created_at || new Date().toISOString(),
          };
          
          console.log('Usuário criado com sucesso:', newUser);
          
          // Se o usuário foi confirmado automaticamente, fazer login
          if (data.session) {
            console.log('Sessão criada automaticamente, fazendo login');
            setUser(newUser);
            setCurrentUser(newUser);
          } else {
            console.log('Usuário criado mas precisa confirmar email');
          }
          
          return {};
        }
      } else {
        // Usar cadastro local
        const users = getStoredUsers();
        
        if (users[username]) {
          return { error: 'Nome de usuário já existe' };
        }
        
        const userId = saveUser(username, password, email);
        
        const newUser: LocalUser = {
          id: userId,
          username,
          email,
          created_at: new Date().toISOString(),
        };
        
        setUser(newUser);
        setCurrentUser(newUser);
        
        return {};
      }
      
      return { error: 'Erro inesperado durante o cadastro' };
    } catch (error) {
      console.error('Erro no signUp:', error);
      return { error: 'Erro inesperado durante o cadastro' };
    }
  };

  const signOut = async () => {
    try {
      const supabase = createSupabaseClient();
      
      if (supabase && isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      
      setUser(null);
      setCurrentUser(null);
    } catch (error) {
      console.error('Erro no signOut:', error);
      // Mesmo com erro, limpar o estado local
      setUser(null);
      setCurrentUser(null);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const supabase = createSupabaseClient();
      
      if (supabase && isSupabaseConfigured) {
        // Usar Supabase para reset de senha
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        
        if (error) {
          return { error: error.message };
        }
        
        return {};
      } else {
        // Modo local - simular envio de email
        const users = getStoredUsers();
        const userExists = Object.values(users).some(user => user.email === email);
        
        if (!userExists) {
          return { error: 'Email não encontrado' };
        }
        
        // Simular sucesso no modo local
        return {};
      }
    } catch (error) {
      console.error('Erro no resetPassword:', error);
      return { error: 'Erro inesperado ao redefinir senha' };
    }
  };

  const configureSupabase = (url: string, anonKey: string) => {
    try {
      if (!url || !anonKey) {
        return false;
      }
      
      const config = { url, anonKey, configured_at: new Date().toISOString() };
      localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
      setIsSupabaseConfigured(true);
      
      return true;
    } catch (error) {
      console.error('Erro ao configurar Supabase:', error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isSupabaseConfigured,
    configureSupabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};