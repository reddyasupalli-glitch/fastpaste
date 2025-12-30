import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, LogIn, History, Trash2, Clock, UserPlus, Crown, Pencil, Check, X } from 'lucide-react';
import { getGroupHistory, removeFromGroupHistory, updateGroupName, GroupHistoryItem } from '@/lib/groupHistory';
import { ThemeToggle } from '@/components/ThemeToggle';
import fastpasteLogo from '@/assets/fastpaste-logo.png';

interface JoinCreateFormProps {
  onJoin: (code: string) => Promise<unknown>;
  onCreate: () => Promise<unknown>;
  loading: boolean;
  error: string | null;
}

export function JoinCreateForm({ onJoin, onCreate, loading, error }: JoinCreateFormProps) {
  const [joinCode, setJoinCode] = useState('');
  const [history, setHistory] = useState<GroupHistoryItem[]>([]);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    setHistory(getGroupHistory());
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim().length === 6) {
      await onJoin(joinCode.trim().toUpperCase());
    }
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
    <div className="flex min-h-screen items-center justify-center bg-background px-3 py-4 sm:p-4">
      <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center px-4 sm:px-6">
          <div className="mx-auto mb-2">
            <img src={fastpasteLogo} alt="FastPaste" className="h-12 sm:h-16 w-auto" />
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Share code snippets and messages in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div>
            <Button
              onClick={onCreate}
              disabled={loading}
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
            >
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Create New Group
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              OR
            </span>
          </div>

          <form onSubmit={handleJoin} className="space-y-2 sm:space-y-3">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter 6-digit code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center font-mono text-base sm:text-lg tracking-widest h-10 sm:h-11"
              maxLength={6}
            />
            <Button
              type="submit"
              variant="secondary"
              disabled={joinCode.length !== 6 || loading}
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
            >
              <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Join Group
            </Button>
          </form>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          {history.length > 0 && (
            <>
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  <History className="inline h-3 w-3 mr-1" />
                  Recent Groups
                </span>
              </div>

              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.code}
                    className="group flex items-center justify-between rounded-lg border border-border bg-muted/50 p-2 sm:p-3 transition-colors hover:bg-muted"
                  >
                    <button
                      onClick={() => editingCode !== item.code && handleRejoin(item.code)}
                      disabled={loading || editingCode === item.code}
                      className="flex flex-1 items-center gap-2 sm:gap-3 text-left"
                    >
                      <div className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full ${
                        item.type === 'created' 
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary text-muted-foreground'
                      }`}>
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
                              className="h-7 text-sm"
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
                              className="h-7 w-7 shrink-0"
                            >
                              <Check className="h-3 w-3 text-green-500" />
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
                                  <code className="shrink-0 font-mono text-xs text-muted-foreground">
                                    {item.code}
                                  </code>
                                </>
                              ) : (
                                <code className="font-mono text-sm font-semibold">
                                  {item.code}
                                </code>
                              )}
                            </div>
                              <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              {formatTimeAgo(item.joinedAt)}
                              <span className="mx-0.5 sm:mx-1">•</span>
                              {item.type === 'created' ? 'Created' : 'Joined'}
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
                          className="h-7 w-7 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 transition-opacity sm:group-hover:opacity-100"
                        >
                          <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleRemoveFromHistory(item.code, e)}
                          className="h-7 w-7 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 transition-opacity sm:group-hover:opacity-100"
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
        </CardContent>
      </Card>
    </div>
  );
}
