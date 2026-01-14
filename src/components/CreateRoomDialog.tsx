import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  onCreate: (options: { isPrivate: boolean; password?: string }, username?: string) => Promise<unknown>;
  loading: boolean;
}

export function CreateRoomDialog({ open, onOpenChange, onCreate, loading }: CreateRoomDialogProps) {
  // Get stored username - must match the key used in useUsername hook
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Room</DialogTitle>
          <DialogDescription>
            Create a public room that anyone with the 4-digit code can join.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Globe className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Public Room</h3>
              <p className="text-sm text-muted-foreground">
                Anyone with the 4-digit code can join instantly
              </p>
            </div>
          </div>

          <Button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
