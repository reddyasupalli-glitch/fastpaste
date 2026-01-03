import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PasswordPromptDialogProps {
  open: boolean;
  roomCode: string;
  onSubmit: (password: string) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
}

export function PasswordPromptDialog({ 
  open, 
  roomCode, 
  onSubmit, 
  onCancel, 
  loading,
  error 
}: PasswordPromptDialogProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (password.trim()) {
      await onSubmit(password);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setShowPassword(false);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Lock className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">Private Room</DialogTitle>
          <DialogDescription className="text-center">
            Room <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold">{roomCode}</code> is password protected.
          </DialogDescription>
        </DialogHeader>

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
                  if (e.key === 'Enter') handleSubmit();
                  if (e.key === 'Escape') handleCancel();
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
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !password.trim()}
              className="flex-1"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}