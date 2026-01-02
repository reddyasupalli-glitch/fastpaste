import { useState } from 'react';
import { Copy, LogOut, Users, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackgroundSelector } from '@/components/BackgroundSelector';
import { BackgroundOption } from '@/hooks/useChatBackground';

interface GroupHeaderProps {
  code: string;
  onLeave: () => void;
  onlineCount: number;
  username: string;
  onUsernameChange: (name: string) => void;
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
  onUsernameChange,
  backgroundId,
  backgroundOptions,
  onBackgroundChange,
  onAddCustomBackground,
  onRemoveCustomBackground,
}: GroupHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(username);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Group code copied to clipboard',
    });
  };

  const handleSaveName = () => {
    const trimmed = editedName.trim();
    if (trimmed && trimmed !== username) {
      onUsernameChange(trimmed);
      toast({
        title: 'Name updated',
        description: `Your name is now "${trimmed}"`,
      });
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditedName(username);
    setIsEditingName(false);
  };

  return (
    <header className="flex items-center justify-between gap-2 border-b border-border bg-card/90 backdrop-blur-sm px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3">
      {/* Left section - Group code and online count */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-shrink">
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 min-w-0">
          <span className="hidden sm:inline text-sm text-muted-foreground">Group:</span>
          <code className="rounded bg-muted px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 font-mono text-xs sm:text-sm md:text-lg font-semibold text-foreground truncate max-w-[80px] sm:max-w-none">
            {code}
          </code>
          <Button variant="ghost" size="icon" onClick={copyCode} className="h-6 w-6 sm:h-8 sm:w-8 md:h-9 md:w-9 flex-shrink-0">
            <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 sm:px-2 md:px-3 md:py-1 flex-shrink-0">
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500"></span>
          </span>
          <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 text-primary" />
          <span className="text-[10px] sm:text-xs md:text-sm font-medium text-primary">{onlineCount}</span>
        </div>
      </div>
      
      {/* Right section - Username, settings, and leave */}
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-3 flex-shrink-0">
        {isEditingName ? (
          <div className="flex items-center gap-1">
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="h-7 w-24 sm:w-32 text-sm"
              maxLength={50}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') handleCancelEdit();
              }}
            />
            <Button variant="ghost" size="icon" onClick={handleSaveName} className="h-6 w-6">
              <Check className="h-3.5 w-3.5 text-green-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="h-6 w-6">
              <X className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditingName(true)}
            className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Hi, <span className="font-medium text-foreground">{username}</span>
            <Pencil className="h-3 w-3 opacity-50" />
          </button>
        )}
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
          className="h-6 w-6 sm:h-8 sm:w-auto px-1 sm:px-2 md:px-3 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:mr-2" />
          <span className="hidden md:inline">Leave</span>
        </Button>
      </div>
    </header>
  );
}
