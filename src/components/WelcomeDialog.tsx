import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import fastpasteLogo from '@/assets/fastpaste-logo.png';

const SHOWN_KEY = 'fastpaste-welcome-shown-v2';

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Small delay to ensure the component is mounted
    const timer = setTimeout(() => {
      const hasShown = localStorage.getItem(SHOWN_KEY);
      if (!hasShown) {
        setOpen(true);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    localStorage.setItem(SHOWN_KEY, 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <img 
              src={fastpasteLogo} 
              alt="FastPaste Logo" 
              className="h-24 w-auto"
            />
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
        <Button onClick={handleClose} className="mt-4 w-full">
          Get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
}
