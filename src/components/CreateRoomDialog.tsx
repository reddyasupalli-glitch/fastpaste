import { useState } from 'react';
import { Globe, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (options: { isPrivate: boolean; password?: string }) => Promise<unknown>;
  loading: boolean;
}

export function CreateRoomDialog({ open, onOpenChange, onCreate, loading }: CreateRoomDialogProps) {
  const [step, setStep] = useState<'choose' | 'password'>('choose');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePublic = async () => {
    await onCreate({ isPrivate: false });
    resetAndClose();
  };

  const handleCreatePrivate = () => {
    setStep('password');
  };

  const handleSubmitPassword = async () => {
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    setError(null);
    await onCreate({ isPrivate: true, password });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep('choose');
    setPassword('');
    setShowPassword(false);
    setError(null);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetAndClose();
    } else {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'choose' ? 'Create a Room' : 'Set Room Password'}
          </DialogTitle>
          <DialogDescription>
            {step === 'choose' 
              ? 'Choose whether your room should be public or private.'
              : 'Set a password to protect your private room.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'choose' ? (
          <div className="grid gap-3 py-4">
            <button
              onClick={handleCreatePublic}
              disabled={loading}
              className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-accent disabled:opacity-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Public Room</h3>
                <p className="text-sm text-muted-foreground">
                  Anyone with the 4-digit code can join instantly
                </p>
              </div>
            </button>

            <button
              onClick={handleCreatePrivate}
              disabled={loading}
              className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-accent disabled:opacity-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Private Room</h3>
                <p className="text-sm text-muted-foreground">
                  Requires a password to join the room
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter room password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  maxLength={50}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmitPassword();
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <p className="text-xs text-muted-foreground">
                Minimum 4 characters. Share this password with people you want to join.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('choose')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmitPassword}
                disabled={loading || password.length < 4}
                className="flex-1"
              >
                Create Room
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}