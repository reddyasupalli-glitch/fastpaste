import { Link, useLocation } from 'react-router-dom';
import { Terminal, MessageSquare, Code2, Users, Globe, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/paste', label: 'Paste', icon: Code2 },
  { href: '/rooms', label: 'Rooms', icon: Users },
  { href: '/explore', label: 'Explore', icon: Globe },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Terminal className="h-6 w-6 text-primary group-hover:animate-pulse" />
          <span className="font-cyber text-lg font-bold text-primary hidden sm:inline">
            FASTPASTE
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2 font-mono text-sm",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden glass-panel border-t border-border/50">
          <div className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 font-mono",
                      isActive 
                        ? "text-primary bg-primary/10" 
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
