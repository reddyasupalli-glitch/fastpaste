import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Bot, Code, MessageCircle, Instagram } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import fastpasteLogo from '@/assets/fastpaste-logo.png';

const INSTAGRAM_URL = 'https://www.instagram.com/trione.solutions?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';

interface WelcomeDialogProps {
  inChatRoom?: boolean;
  roomCode?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const iconVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
      delay: 0.1,
    },
  },
};

export function WelcomeDialog({ inChatRoom = false, roomCode }: WelcomeDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inChatRoom && roomCode) {
        const shownRooms = JSON.parse(localStorage.getItem('fastpaste-chatroom-shown-rooms') || '[]');
        if (!shownRooms.includes(roomCode)) {
          setOpen(true);
        }
      } else {
        setOpen(true);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [inChatRoom, roomCode]);

  const handleClose = () => {
    if (inChatRoom && roomCode) {
      const shownRooms = JSON.parse(localStorage.getItem('fastpaste-chatroom-shown-rooms') || '[]');
      if (!shownRooms.includes(roomCode)) {
        shownRooms.push(roomCode);
        localStorage.setItem('fastpaste-chatroom-shown-rooms', JSON.stringify(shownRooms));
      }
    }
    setOpen(false);
  };

  const features = [
    {
      icon: MessageCircle,
      title: 'Ask Questions',
      description: 'Type @asu followed by your question to get instant answers',
    },
    {
      icon: Code,
      title: 'Coding Help',
      description: 'Get help with code snippets, debugging, and explanations',
    },
    {
      icon: Sparkles,
      title: 'Smart Assistance',
      description: 'Asu can help explain concepts and answer general questions',
    },
  ];

  if (inChatRoom) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md overflow-hidden">
          <AnimatePresence>
            {open && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <DialogHeader className="text-center">
                  <motion.div 
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
                    variants={iconVariants}
                  >
                    <Bot className="h-8 w-8 text-primary" />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <DialogTitle className="text-2xl">Meet Asu - Your AI Assistant</DialogTitle>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <DialogDescription className="pt-2 text-base">
                      This chat room has an AI assistant to help you!
                    </DialogDescription>
                  </motion.div>
                </DialogHeader>
                
                <div className="mt-4 space-y-3">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        transition: {
                          type: 'spring' as const,
                          stiffness: 300,
                          damping: 24,
                          delay: 0.3 + index * 0.1,
                        }
                      }}
                      className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-3"
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    >
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        transition={{ type: 'spring' as const, stiffness: 400 }}
                      >
                        <feature.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      </motion.div>
                      <div>
                        <p className="font-medium text-foreground">{feature.title}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button onClick={handleClose} className="mt-4 w-full">
                    Got it, let's chat!
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <DialogHeader className="text-center">
                <motion.div 
                  className="mx-auto mb-4"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    transition: {
                      type: 'spring' as const,
                      stiffness: 260,
                      damping: 20,
                    }
                  }}
                >
                  <motion.img 
                    src={fastpasteLogo} 
                    alt="FastPaste Logo" 
                    className="h-24 w-auto"
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <DialogTitle className="text-2xl">Welcome to FastPaste</DialogTitle>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <DialogDescription className="pt-2 text-base">
                    Share code snippets and messages in real-time with your team.
                  </DialogDescription>
                </motion.div>
              </DialogHeader>
              
              <motion.div 
                className="mt-4 rounded-lg border border-border bg-muted/50 p-4 text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <motion.div
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                  </motion.div>
                  <span>Developed by</span>
                </div>
                <motion.p 
                  className="mt-1 font-semibold text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  TRIONE SOLUTIONS PVT LTD
                </motion.p>
                <motion.p 
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  by ASUREDDY
                </motion.p>
                <motion.a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 px-4 py-1.5 text-white"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Instagram className="h-4 w-4" />
                  <span className="text-sm font-medium">Follow us</span>
                </motion.a>
              </motion.div>
              
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button onClick={handleClose} className="mt-4 w-full">
                  Get Started
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}