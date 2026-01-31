import { useState } from 'react';
import { Copy, LogOut, Users, Pencil, Check, X, Crown, Terminal, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackgroundSelector } from '@/components/BackgroundSelector';
import { BackgroundOption } from '@/hooks/useChatBackground';
import { FeedbackDialog } from '@/components/FeedbackDialog';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OnlineUser {
  username: string;
  isCreator?: boolean;
}

interface GroupHeaderProps {
  code: string;
  roomType: 'public' | 'private';
  onLeave: () => void;
  onlineCount: number;
  onlineUsers: OnlineUser[];
  username: string;
  onUsernameChange: (name: string) => void;
  backgroundId: string;
  backgroundOptions: BackgroundOption[];
  onBackgroundChange: (id: string) => void;
  onAddCustomBackground: (name: string, imageUrl: string) => string;
  onRemoveCustomBackground: (id: string) => void;
  creatorUsername?: string;
  onKickUser?: (username: string) => void;
}

export function GroupHeader({ 
  code, 
  roomType,
  onLeave, 
  onlineCount, 
  onlineUsers,
  username,
  onUsernameChange,
  backgroundId,
  backgroundOptions,
  onBackgroundChange,
  onAddCustomBackground,
  onRemoveCustomBackground,
  creatorUsername,
  onKickUser,
}: GroupHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(username);
  const [kickDialogOpen, setKickDialogOpen] = useState(false);
  const [userToKick, setUserToKick] = useState<string | null>(null);

  const isCreator = username === creatorUsername;

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Room code copied to clipboard',
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

  const handleKickClick = (targetUsername: string) => {
    setUserToKick(targetUsername);
    setKickDialogOpen(true);
  };

  const confirmKick = () => {
    if (userToKick && onKickUser) {
      onKickUser(userToKick);
    }
    setKickDialogOpen(false);
    setUserToKick(null);
  };

  return (
    <>
      <header className="flex items-center justify-between gap-2 border-b border-neon-cyan/20 bg-card/80 backdrop-blur-md px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3">
        {/* Left section - Room code and online count */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-shrink">
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 min-w-0">
            <Terminal className="hidden sm:block h-4 w-4 text-neon-cyan" />
            <code className={cn(
              "rounded px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5",
              "font-mono text-xs sm:text-sm md:text-lg font-bold",
              "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30",
              "truncate max-w-[80px] sm:max-w-none"
            )}>
              {code}
            </code>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={copyCode} 
              className="h-6 w-6 sm:h-8 sm:w-8 md:h-9 md:w-9 flex-shrink-0 hover:bg-neon-cyan/10 hover:text-neon-cyan"
            >
              <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            </Button>
            {roomType === 'private' && (
              <span className="text-[10px] sm:text-xs bg-neon-purple/20 text-neon-purple px-1.5 py-0.5 rounded font-mono border border-neon-purple/30">
                PRIVATE
              </span>
            )}
          </div>
          
          {/* Online users dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-0.5 sm:gap-1 md:gap-1.5 rounded-full px-1.5 py-0.5 sm:px-2 md:px-3 md:py-1 flex-shrink-0",
                "bg-neon-green/10 border border-neon-green/30",
                "hover:bg-neon-green/20 transition-colors cursor-pointer"
              )}>
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-neon-green"></span>
                </span>
                <Wifi className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 text-neon-green" />
                <span className="text-[10px] sm:text-xs md:text-sm font-mono font-medium text-neon-green">{onlineCount}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 max-h-64 overflow-y-auto glass-panel border-neon-cyan/30">
              <div className="px-2 py-1.5 text-sm font-cyber font-semibold text-neon-cyan">
                ONLINE_USERS ({onlineCount})
              </div>
              <DropdownMenuSeparator className="bg-neon-cyan/20" />
              {onlineUsers.map((user) => (
                <DropdownMenuItem 
                  key={user.username} 
                  className="flex items-center justify-between gap-2 focus:bg-neon-cyan/10"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-green"></span>
                    </span>
                    <span className={cn(
                      "font-mono text-sm",
                      user.username === username && 'text-neon-cyan font-semibold'
                    )}>
                      {user.username}
                      {user.username === username && ' (YOU)'}
                    </span>
                    {user.username === creatorUsername && (
                      <Crown className="h-3.5 w-3.5 text-neon-yellow" />
                    )}
                  </div>
                  {isCreator && user.username !== username && onKickUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 font-mono"
                      onClick={(e) => {
                        e.preventDefault();
                        handleKickClick(user.username);
                      }}
                    >
                      KICK
                    </Button>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Right section - Feedback, Username, settings, and leave */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-3 flex-shrink-0">
          {/* Feedback with Rating */}
          <FeedbackDialog roomCode={code} showLabel />
          
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="h-7 w-24 sm:w-32 text-sm cyber-input"
                maxLength={50}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <Button variant="ghost" size="icon" onClick={handleSaveName} className="h-6 w-6 hover:bg-neon-green/20">
                <Check className="h-3.5 w-3.5 text-neon-green" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="h-6 w-6 hover:bg-destructive/20">
                <X className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditingName(true)}
              className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-neon-cyan transition-colors font-mono"
            >
              <span className="text-neon-cyan/50">{'>'}</span>
              <span className="font-medium text-foreground">{username}</span>
              {isCreator && <Crown className="h-3 w-3 text-neon-yellow" />}
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
            className="h-6 w-6 sm:h-8 sm:w-auto px-1 sm:px-2 md:px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:mr-2" />
            <span className="hidden md:inline font-mono">EXIT</span>
          </Button>
        </div>
      </header>

      {/* Kick confirmation dialog */}
      <AlertDialog open={kickDialogOpen} onOpenChange={setKickDialogOpen}>
        <AlertDialogContent className="glass-panel border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-cyber text-destructive">KICK_USER: {userToKick}?</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-sm">
              {'>'} This action will remove {userToKick} from the room.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono">CANCEL</AlertDialogCancel>
            <AlertDialogAction onClick={confirmKick} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono">
              CONFIRM_KICK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
