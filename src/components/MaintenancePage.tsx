import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SnakeGame from '@/components/games/SnakeGame';
import FlappyBird from '@/components/games/FlappyBird';

type GameType = 'snake' | 'flappy' | null;

const MaintenancePage = () => {
  const [selectedGame, setSelectedGame] = useState<GameType>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Wrench className="h-12 w-12 text-primary" />
          </motion.div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Under Maintenance</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          We're making some improvements. We'll be back shortly!
        </p>
      </motion.div>

      {!selectedGame ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={() => setSelectedGame('snake')}
            className="gap-2"
            size="lg"
            variant="outline"
          >
            <span className="text-xl">🐍</span>
            Play Snake
          </Button>
          <Button
            onClick={() => setSelectedGame('flappy')}
            className="gap-2"
            size="lg"
            variant="outline"
          >
            <span className="text-xl">🐦</span>
            Play Flappy Bird
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedGame(null)}
              className="gap-2"
            >
              <Gamepad2 className="h-4 w-4" />
              Choose Different Game
            </Button>
          </div>

          {selectedGame === 'snake' && <SnakeGame />}
          {selectedGame === 'flappy' && <FlappyBird />}
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-sm text-muted-foreground"
      >
        Thank you for your patience! 🙏
      </motion.p>
    </div>
  );
};

export default MaintenancePage;
