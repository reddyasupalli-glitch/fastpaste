import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Bot, Code, MessageCircle } from 'lucide-react';
import fastpasteLogo from '@/assets/fastpaste-logo.png';

const WELCOME_SHOWN_KEY = 'fastpaste-welcome-shown-v2';
const CHAT_ROOM_SHOWN_KEY = 'fastpaste-chatroom-welcome-shown';

interface WelcomeDialogProps {
  inChatRoom?: boolean;
}

export function WelcomeDialog({ inChatRoom = false }: WelcomeDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const storageKey = inChatRoom ? CHAT_ROOM_SHOWN_KEY : WELCOME_SHOWN_KEY;
      const hasShown = localStorage.getItem(storageKey);
      if (!hasShown) {
        setOpen(true);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [inChatRoom]);

  const handleClose = () => {
    const storageKey = inChatRoom ? CHAT_ROOM_SHOWN_KEY : WELCOME_SHOWN_KEY;
    localStorage.setItem(storageKey, 'true');
    setOpen(false);
  };

  if (inChatRoom) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Meet Asu - Your AI Assistant</DialogTitle>
            <DialogDescription className="pt-2 text-base">
              This chat room has an AI assistant to help you!
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-3">
              <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">Ask Questions</p>
                <p className="text-sm text-muted-foreground">Type @asu followed by your question to get instant answers</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-3">
              <Code className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">Coding Help</p>
                <p className="text-sm text-muted-foreground">Get help with code snippets, debugging, and explanations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">Smart Assistance</p>
                <p className="text-sm text-muted-foreground">Asu can help explain concepts and answer general questions</p>
              </div>
            </div>
          </div>
          
          <Button onClick={handleClose} className="mt-4 w-full">
            Got it, let's chat!
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

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
          <p className="mt-1 font-semibold text-foreground">TRIONE SOLUTIONS PVT LTD</p>
          <p className="text-sm text-muted-foreground">by ASUREDDY</p>
        </div>
        <Button onClick={handleClose} className="mt-4 w-full">
          Get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
}
