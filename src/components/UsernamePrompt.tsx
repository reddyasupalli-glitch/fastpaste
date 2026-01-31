import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Zap, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsernamePromptProps {
  onSubmit: (username: string) => void;
}

export function UsernamePrompt({ onSubmit }: UsernamePromptProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/95 backdrop-blur-md relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--neon-cyan) / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--neon-cyan) / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-neon-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-sm glass-panel p-6 sm:p-8 relative z-10">
        {/* Accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink" />
        
        <div className="text-center mb-6">
          <div className={cn(
            "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
            "bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20",
            "border border-neon-cyan/30",
            "shadow-[0_0_30px_hsl(var(--neon-cyan)/0.3)]"
          )}>
            <User className="h-8 w-8 text-neon-cyan" />
          </div>
          <h2 className="font-cyber text-xl font-bold text-foreground tracking-wider">
            <span className="text-neon-cyan">IDENTITY</span>
            <span className="text-neon-purple">_SETUP</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-mono">
            {'>'} Enter your handle to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neon-cyan/50" />
            <Input
              type="text"
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="cyber-input pl-10 h-12 font-mono text-base"
              maxLength={50}
              autoFocus
            />
          </div>
          <Button 
            type="submit" 
            disabled={!username.trim()}
            className="w-full h-11 cyber-button font-cyber tracking-wider"
          >
            <Zap className="mr-2 h-4 w-4" />
            INITIALIZE
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground font-mono">
          {'>'} This name will be visible to other users
        </p>
      </div>
    </div>
  );
}
