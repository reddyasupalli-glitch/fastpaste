import { Copy, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface GroupHeaderProps {
  code: string;
  onLeave: () => void;
}

export function GroupHeader({ code, onLeave }: GroupHeaderProps) {
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
      </div>
      <Button variant="ghost" size="sm" onClick={onLeave} className="text-muted-foreground hover:text-foreground">
        <LogOut className="mr-2 h-4 w-4" />
        Leave
      </Button>
    </header>
  );
}
