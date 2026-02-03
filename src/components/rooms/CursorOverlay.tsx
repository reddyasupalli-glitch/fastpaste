import { motion, AnimatePresence } from 'framer-motion';

interface CursorPosition {
  username: string;
  line: number;
  column: number;
  color: string;
}

interface CursorOverlayProps {
  cursors: CursorPosition[];
  currentUsername: string;
}

// Cyberpunk color palette for cursors
const cursorColors = [
  'hsl(180, 100%, 50%)', // cyan
  'hsl(280, 100%, 70%)', // purple
  'hsl(330, 100%, 60%)', // pink
  'hsl(120, 100%, 50%)', // green
  'hsl(45, 100%, 50%)',  // yellow
  'hsl(200, 100%, 60%)', // blue
];

export const getCursorColor = (username: string): string => {
  // Generate consistent color based on username
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return cursorColors[Math.abs(hash) % cursorColors.length];
};

export const CursorOverlay = ({ cursors, currentUsername }: CursorOverlayProps) => {
  // Filter out current user's cursor
  const otherCursors = cursors.filter(c => c.username !== currentUsername);

  return (
    <div className="pointer-events-none absolute top-0 left-0 z-50">
      <AnimatePresence>
        {otherCursors.map((cursor) => (
          <motion.div
            key={cursor.username}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute flex items-start"
            style={{
              // Position is handled by Monaco decorations, this is for reference
              top: `${(cursor.line - 1) * 19}px`, // Approximate line height
              left: `${(cursor.column - 1) * 7.8}px`, // Approximate char width
            }}
          >
            {/* Cursor line */}
            <div
              className="w-0.5 h-5 animate-pulse"
              style={{ backgroundColor: cursor.color }}
            />
            {/* Username label */}
            <div
              className="px-1.5 py-0.5 text-xs font-mono rounded-r ml-0.5 whitespace-nowrap"
              style={{
                backgroundColor: cursor.color,
                color: 'black',
              }}
            >
              {cursor.username}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CursorOverlay;
