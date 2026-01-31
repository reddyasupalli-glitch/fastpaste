import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Plus, History, Trash2, Clock, UserPlus, Crown, Pencil, Check, X, Info, Instagram, Mail, Loader2, Zap, Terminal } from 'lucide-react';
import { getGroupHistory, removeFromGroupHistory, updateGroupName, GroupHistoryItem } from '@/lib/groupHistory';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AsuChat } from '@/components/AsuChat';
import { FeedbackDialog } from '@/components/FeedbackDialog';
import fastpasteLogo from '@/assets/fastpaste-logo.png';
import { cn } from '@/lib/utils';


interface JoinCreateFormProps {
  onJoin: (code: string) => Promise<unknown>;
  onCreate: (options: { isPrivate: boolean; password?: string }, username?: string) => Promise<unknown>;
  loading: boolean;
  error: string | null;
}

export function JoinCreateForm({ 
  onJoin, 
  onCreate, 
  loading, 
  error
}: JoinCreateFormProps) {
  const [joinCode, setJoinCode] = useState('');
  const [history, setHistory] = useState<GroupHistoryItem[]>([]);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Get stored username
  const getStoredUsername = (): string | null => {
    try {
      return localStorage.getItem('chat-username');
    } catch {
      return null;
    }
  };

  const handleCreateRoom = async () => {
    const username = getStoredUsername();
    await onCreate({ isPrivate: false }, username || undefined);
  };

  useEffect(() => {
    setHistory(getGroupHistory());
  }, []);

  // Auto-join when 4 digits are entered
  useEffect(() => {
    if (joinCode.length === 4) {
      onJoin(joinCode.trim().toUpperCase());
    }
  }, [joinCode, onJoin]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setJoinCode(value);
  };

  const handleRejoin = async (code: string) => {
    await onJoin(code);
  };

  const handleRemoveFromHistory = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromGroupHistory(code);
    setHistory(getGroupHistory());
  };

  const startEditing = (code: string, currentName: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCode(code);
    setEditName(currentName || '');
  };

  const saveEdit = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateGroupName(code, editName);
    setHistory(getGroupHistory());
    setEditingCode(null);
    setEditName('');
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCode(null);
    setEditName('');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-3 py-4 sm:p-4 bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--neon-cyan) / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--neon-cyan) / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-neon-pink/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header controls */}
      <div className="absolute right-3 top-3 flex items-center gap-1 sm:right-4 sm:top-4 z-10">
        <FeedbackDialog triggerClassName="h-9 w-9" />
        <a
          href="https://www.instagram.com/trione.solutions?igsh=NjZ1eGZqMnljcGZz"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-neon-cyan/10 hover:text-neon-cyan"
        >
          <Instagram className="h-4 w-4" />
          <span className="sr-only">Instagram</span>
        </a>
        <a
          href="mailto:trionesolutionsprt@gmail.com"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-neon-cyan/10 hover:text-neon-cyan"
        >
          <Mail className="h-4 w-4" />
          <span className="sr-only">Email</span>
        </a>
        <Link to="/about">
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-neon-cyan/10 hover:text-neon-cyan">
            <Info className="h-4 w-4" />
            <span className="sr-only">About</span>
          </Button>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Card - Glassmorphism */}
      <div className="w-full max-w-md glass-panel p-6 sm:p-8 relative z-10">
        {/* Accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink" />
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto mb-3 relative">
            <img src={fastpasteLogo} alt="FastPaste" className="h-12 sm:h-16 w-auto mx-auto" />
            <div className="absolute -inset-2 bg-neon-cyan/20 blur-xl rounded-full -z-10" />
          </div>
          <h1 className="font-cyber text-xl sm:text-2xl font-bold tracking-wider mb-2">
            <span className="text-neon-cyan">FAST</span>
            <span className="text-neon-purple">PASTE</span>
            <span className="text-neon-pink ml-2 text-sm">2077</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Share code snippets and messages in real-time
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Create Button - Cyber style */}
          <div>
            <Button
              onClick={handleCreateRoom}
              disabled={loading}
              className="w-full h-11 sm:h-12 text-sm sm:text-base cyber-button font-cyber tracking-wider"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              )}
              {loading ? 'INITIALIZING...' : 'CREATE ROOM'}
            </Button>
          </div>

          <div className="relative">
            <Separator className="bg-border" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-neon-cyan font-mono">
              // OR
            </span>
          </div>

          {/* Join Form - Auto-join on 4 digits */}
          <div className="space-y-2 sm:space-y-3">
            <div className="relative">
              <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neon-cyan/50" />
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0000"
                value={joinCode}
                onChange={handleCodeChange}
                className="text-center font-mono text-xl sm:text-2xl tracking-[0.5em] h-12 sm:h-14 cyber-input pl-10"
                maxLength={4}
                disabled={loading}
              />
              {loading && joinCode.length === 4 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-neon-cyan" />
                </div>
              )}
            </div>
            <p className="text-center text-xs text-muted-foreground font-mono">
              {loading && joinCode.length === 4 ? '> CONNECTING...' : '> ENTER_ROOM_CODE'}
            </p>
          </div>

          {/* Asu AI Chat Button */}
          <div className="flex justify-center pt-2">
            <AsuChat />
          </div>

          {error && (
            <p className="text-center text-sm text-destructive neon-text-pink">{error}</p>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <>
              <div className="relative">
                <Separator className="bg-border" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground flex items-center gap-1">
                  <History className="h-3 w-3 text-neon-purple" />
                  <span className="font-mono">HISTORY</span>
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.code}
                    className={cn(
                      "group flex items-center justify-between rounded-lg p-2 sm:p-3 transition-all duration-300",
                      "bg-muted/30 border border-border hover:border-neon-cyan/50 hover:bg-muted/50",
                      "hover:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.2)]"
                    )}
                  >
                    <button
                      onClick={() => editingCode !== item.code && handleRejoin(item.code)}
                      disabled={loading || editingCode === item.code}
                      className="flex flex-1 items-center gap-2 sm:gap-3 text-left"
                    >
                      <div className={cn(
                        "flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full",
                        item.type === 'created' 
                          ? 'bg-neon-yellow/20 text-neon-yellow'
                          : 'bg-neon-purple/20 text-neon-purple'
                      )}>
                        {item.type === 'created' ? (
                          <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        ) : (
                          <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        {editingCode === item.code ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Enter nickname..."
                              className="h-7 text-sm cyber-input"
                              maxLength={30}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  saveEdit(item.code, e as unknown as React.MouseEvent);
                                } else if (e.key === 'Escape') {
                                  cancelEdit(e as unknown as React.MouseEvent);
                                }
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => saveEdit(item.code, e)}
                              className="h-7 w-7 shrink-0 hover:bg-neon-green/20"
                            >
                              <Check className="h-3 w-3 text-neon-green" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={cancelEdit}
                              className="h-7 w-7 shrink-0"
                            >
                              <X className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              {item.customName ? (
                                <>
                                  <span className="truncate font-medium text-foreground">
                                    {item.customName}
                                  </span>
                                  <code className="shrink-0 font-mono text-xs text-neon-cyan">
                                    {item.code}
                                  </code>
                                </>
                              ) : (
                                <code className="font-mono text-sm font-semibold text-neon-cyan">
                                  {item.code}
                                </code>
                              )}
                              {item.type === 'created' && (
                                <span className="text-[10px] text-neon-yellow font-medium font-mono">CREATOR</span>
                              )}
                            </div>
                            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              {formatTimeAgo(item.joinedAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                    {editingCode !== item.code && (
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => startEditing(item.code, item.customName, e)}
                          className="h-7 w-7 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 transition-opacity sm:group-hover:opacity-100 hover:bg-neon-cyan/20"
                        >
                          <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground hover:text-neon-cyan" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleRemoveFromHistory(item.code, e)}
                          className="h-7 w-7 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 transition-opacity sm:group-hover:opacity-100 hover:bg-destructive/20"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border/50 text-center">
          <p className="text-[10px] text-muted-foreground font-mono">
            {'>'} SYSTEM_STATUS: <span className="text-neon-green">ONLINE</span>
          </p>
        </div>
      </div>
    </div>
  );
}
