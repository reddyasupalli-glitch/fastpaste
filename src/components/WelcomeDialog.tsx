import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Code2, Sparkles } from 'lucide-react';

const SHOWN_KEY = 'welcome-dialog-shown';

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasShown = sessionStorage.getItem(SHOWN_KEY);
    if (!hasShown) {
      setOpen(true);
      sessionStorage.setItem(SHOWN_KEY, 'true');
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Code2 className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Welcome to FastPaste</DialogTitle>
          <DialogDescription className="pt-2 text-base">
            Share code snippets and messages in real-time with your team.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Developed by</span>
          </div>
          <p className="mt-1 font-semibold text-foreground">TRION SOLUTION PVT LTD</p>
          <p className="text-sm text-muted-foreground">by ASUREDDY</p>
        </div>
        <Button onClick={() => setOpen(false)} className="mt-4 w-full">
          Get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
}
