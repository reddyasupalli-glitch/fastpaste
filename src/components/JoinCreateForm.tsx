import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, ArrowRight } from 'lucide-react';

interface JoinCreateFormProps {
  onJoin: (code: string) => Promise<unknown>;
  onCreate: () => Promise<unknown>;
  loading: boolean;
  error: string | null;
}

export function JoinCreateForm({ onJoin, onCreate, loading, error }: JoinCreateFormProps) {
  const [joinCode, setJoinCode] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim().length === 6) {
      await onJoin(joinCode.trim().toUpperCase());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">CodeSender</CardTitle>
          <CardDescription>
            Share code snippets and messages in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Button
              onClick={onCreate}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Group
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              OR
            </span>
          </div>

          <form onSubmit={handleJoin} className="space-y-3">
            <Input
              type="text"
              placeholder="Enter 6-character code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              className="text-center font-mono text-lg tracking-widest"
              maxLength={6}
            />
            <Button
              type="submit"
              variant="secondary"
              disabled={joinCode.length !== 6 || loading}
              className="w-full"
              size="lg"
            >
              Join Group
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
