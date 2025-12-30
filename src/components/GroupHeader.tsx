import { Copy, LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackgroundSelector } from '@/components/BackgroundSelector';
import { BackgroundOption } from '@/hooks/useChatBackground';

interface GroupHeaderProps {
  code: string;
  onLeave: () => void;
  onlineCount: number;
  username: string;
  backgroundId: string;
  backgroundOptions: BackgroundOption[];
  onBackgroundChange: (id: string) => void;
  onAddCustomBackground: (name: string, imageUrl: string) => string;
  onRemoveCustomBackground: (id: string) => void;
}

export function GroupHeader({ 
  code, 
  onLeave, 
  onlineCount, 
  username,
  backgroundId,
  backgroundOptions,
  onBackgroundChange,
  onAddCustomBackground,
  onRemoveCustomBackground,
}: GroupHeaderProps) {
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Group code copied to clipboard',
    });
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card/90 backdrop-blur-sm px-3 py-2 md:px-4 md:py-3">
      {/* Left section - Group code and online count */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="hidden sm:inline text-sm text-muted-foreground">Group:</span>
          <code className="rounded bg-muted px-2 py-1 md:px-3 md:py-1.5 font-mono text-sm md:text-lg font-semibold text-foreground">
            {code}
          </code>
          <Button variant="ghost" size="icon" onClick={copyCode} className="h-8 w-8 md:h-9 md:w-9">
            <Copy className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1 md:gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 md:px-3 md:py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <Users className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
          <span className="text-xs md:text-sm font-medium text-primary">{onlineCount}</span>
        </div>
      </div>
      
      {/* Right section - Username, settings, and leave */}
      <div className="flex items-center gap-1.5 md:gap-3">
        <span className="hidden md:inline text-sm text-muted-foreground">
          Hi, <span className="font-medium text-foreground">{username}</span>
        </span>
        <BackgroundSelector 
          currentId={backgroundId}
          options={backgroundOptions}
          onSelect={onBackgroundChange}
          onAddCustom={onAddCustomBackground}
          onRemoveCustom={onRemoveCustomBackground}
        />
        <ThemeToggle />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onLeave} 
          className="h-8 px-2 md:px-3 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Leave</span>
        </Button>
      </div>
    </header>
  );
}
