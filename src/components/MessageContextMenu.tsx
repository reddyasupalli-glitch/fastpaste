import { Copy, Reply, Smile, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MessageContextMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onCopy: () => void;
  onReply: () => void;
  onReact: () => void;
  onDelete?: () => void;
  isOwn: boolean;
}

const menuItems = [
  { id: 'copy', icon: Copy, label: 'Copy', color: 'text-foreground' },
  { id: 'reply', icon: Reply, label: 'Reply', color: 'text-foreground' },
  { id: 'react', icon: Smile, label: 'React', color: 'text-foreground' },
  { id: 'delete', icon: Trash2, label: 'Delete', color: 'text-destructive', ownOnly: true },
];

export function MessageContextMenu({
  isVisible,
  position,
  onClose,
  onCopy,
  onReply,
  onReact,
  onDelete,
  isOwn,
}: MessageContextMenuProps) {
  const handleAction = (action: string) => {
    switch (action) {
      case 'copy':
        onCopy();
        break;
      case 'reply':
        onReply();
        break;
      case 'react':
        onReact();
        break;
      case 'delete':
        onDelete?.();
        break;
    }
    onClose();
  };

  const visibleItems = menuItems.filter(item => !item.ownOnly || isOwn);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-background/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed z-50 min-w-[160px] bg-card border border-border rounded-xl shadow-xl overflow-hidden"
            style={{
              left: Math.min(position.x, window.innerWidth - 180),
              top: Math.min(position.y, window.innerHeight - (visibleItems.length * 48 + 16)),
            }}
          >
            <div className="py-1">
              {visibleItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleAction(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3",
                    "hover:bg-secondary active:bg-secondary/80 transition-colors",
                    "focus:outline-none focus:bg-secondary",
                    item.color
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
