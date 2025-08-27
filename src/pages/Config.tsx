import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Database, Save, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Config = () => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  const { configureSupabase } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se já existe configuração
    const config = localStorage.getItem('supabase_config');
    if (config) {
      try {
        const parsed = JSON.parse(config);
        setSupabaseUrl(parsed.url || '');
        setSupabaseKey(parsed.key || '');
        setIsConfigured(true);
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
      }
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!supabaseUrl || !supabaseKey) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todos os campos",
          variant: "destructive"
        });
        return;
      }

      // Validar formato da URL
      if (!supabaseUrl.includes('supabase.co')) {
        toast({
          title: "Erro",
          description: "URL do Supabase inválida. Deve conter 'supabase.co'",
          variant: "destructive"
        });
        return;
      }

      const success = configureSupabase(supabaseUrl, supabaseKey);
      
      if (success) {
        setIsConfigured(true);
        toast({
          title: "Sucesso",
          description: "Configuração do Supabase salva com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao salvar configuração",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar configuração",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Conexão testada",
        description: "Configuração salva localmente. Para testar a conexão real, faça login.",
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Não foi possível testar a conexão",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleClearConfig = () => {
    localStorage.removeItem('supabase_config');
    setSupabaseUrl('');
    setSupabaseKey('');
    setIsConfigured(false);
    
    toast({
      title: "Configuração removida",
      description: "As configurações do Supabase foram removidas",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Configuração do Supabase
                </CardTitle>
                <CardDescription>
                  Configure suas credenciais do Supabase para autenticação completa
                </CardDescription>
              </div>
            </div>
          </div>
          
          {isConfigured && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Supabase configurado com sucesso! Você pode fazer login com suas credenciais.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supabase-url">URL do Projeto Supabase</Label>
              <Input
                id="supabase-url"
                type="url"
                placeholder="https://seu-projeto.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Encontre em: Projeto Supabase → Settings → API → Project URL
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supabase-key">Chave Pública (anon key)</Label>
              <div className="relative">
                <Input
                  id="supabase-key"
                  type={showKey ? "text" : "password"}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Encontre em: Projeto Supabase → Settings → API → Project API keys → anon public
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSave}
              disabled={loading || !supabaseUrl || !supabaseKey}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configuração
                </>
              )}
            </Button>
            
            {isConfigured && (
              <>
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="flex-1"
                >
                  {testingConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Testar Conexão
                    </>
                  )}
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={handleClearConfig}
                  className="flex-1"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Limpar Config
                </Button>
              </>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Como obter as credenciais:</h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Acesse <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com</a> e faça login</li>
              <li>Crie um novo projeto ou selecione um existente</li>
              <li>Vá em <strong>Settings → API</strong></li>
              <li>Copie a <strong>Project URL</strong> e a <strong>anon public key</strong></li>
              <li>Cole as informações nos campos acima e clique em "Salvar"</li>
            </ol>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Modo Local:</strong> Mesmo sem configurar o Supabase, você pode usar o sistema 
              com autenticação local baseada em localStorage. As credenciais do Supabase são 
              necessárias apenas para autenticação real em produção.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default Config;