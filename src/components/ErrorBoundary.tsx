import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary capturou um erro:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private copyErrorToClipboard = () => {
    const errorText = `Erro: ${this.state.error?.message}\n\nStack: ${this.state.error?.stack}\n\nComponent Stack: ${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(errorText);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl font-bold">Ops! Algo deu errado</CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado. Este erro foi capturado para evitar que a aplicação trave completamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-semibold text-foreground mb-2">Mensagem do erro:</p>
                    <p className="text-sm font-mono text-muted-foreground">
                      {this.state.error.message}
                    </p>
                  </div>
                  
                  {this.state.error.stack && (
                    <details className="p-3 bg-muted rounded-md">
                      <summary className="text-sm font-semibold text-foreground cursor-pointer">Stack trace (clique para expandir)</summary>
                      <pre className="text-xs font-mono text-muted-foreground mt-2 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              <div className="flex gap-2 flex-wrap">
                <Button onClick={this.handleReset} variant="outline" className="flex-1">
                  Tentar Novamente
                </Button>
                <Button onClick={this.handleReload} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar Página
                </Button>
                <Button onClick={this.copyErrorToClipboard} variant="secondary" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Erro
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground text-center">
                Se o problema persistir, tente limpar o cache do navegador ou entre em contato com o suporte.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;