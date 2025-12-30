import { Copy, LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

interface GroupHeaderProps {
  code: string;
  onLeave: () => void;
  onlineCount: number;
  username: string;
}

export function GroupHeader({ code, onLeave, onlineCount, username }: GroupHeaderProps) {
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Group code copied to clipboard',
    });
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Group:</span>
        <code className="rounded bg-muted px-3 py-1.5 font-mono text-lg font-semibold text-foreground">
          {code}
        </code>
        <Button variant="ghost" size="icon" onClick={copyCode}>
          <Copy className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <Users className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-medium text-primary">{onlineCount}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Hi, <span className="font-medium text-foreground">{username}</span>
        </span>
        <ThemeToggle />
        <Button variant="ghost" size="sm" onClick={onLeave} className="text-muted-foreground hover:text-foreground">
          <LogOut className="mr-2 h-4 w-4" />
          Leave
        </Button>
      </div>
    </header>
  );
}
