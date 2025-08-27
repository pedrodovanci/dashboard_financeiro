import React from 'react';

interface SimpleLoaderProps {
  message?: string;
}

const SimpleLoader: React.FC<SimpleLoaderProps> = ({ message = "Carregando..." }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default SimpleLoader;