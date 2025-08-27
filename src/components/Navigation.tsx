import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Home,
  BarChart3,
  List,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Visão geral das finanças',
  },
  {
    name: 'Histórico',
    href: '/history',
    icon: BarChart3,
    description: 'Análise e gráficos financeiros',
  },
  {
    name: 'Transações',
    href: '/transactions',
    icon: List,
    description: 'Lista detalhada de lançamentos',
  },
];

interface NavigationProps {
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={cn('hidden md:flex items-center space-x-1', className)}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'flex items-center gap-2 transition-all',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2"
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
          Menu
        </Button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 z-50 bg-card border-b border-border shadow-lg">
            <div className="container mx-auto px-6 py-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-muted',
                          isActive && 'bg-primary/10 border border-primary/20'
                        )}
                      >
                        <Icon className={cn(
                          'h-5 w-5',
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        )} />
                        <div>
                          <p className={cn(
                            'font-medium',
                            isActive ? 'text-primary' : 'text-foreground'
                          )}>
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navigation;