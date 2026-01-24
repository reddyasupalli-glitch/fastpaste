import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Gamepad2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Simple Snake Game
const GRID_SIZE = 15;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const MaintenancePage = () => {
  const [showGame, setShowGame] = useState(false);
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position>({ x: 10, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 7, y: 7 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isPlaying) return;
    
    switch (e.key) {
      case 'ArrowUp':
        if (direction !== 'DOWN') setDirection('UP');
        break;
      case 'ArrowDown':
        if (direction !== 'UP') setDirection('DOWN');
        break;
      case 'ArrowLeft':
        if (direction !== 'RIGHT') setDirection('LEFT');
        break;
      case 'ArrowRight':
        if (direction !== 'LEFT') setDirection('RIGHT');
        break;
    }
  }, [direction, isPlaying]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };

        switch (direction) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
        }

        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => prev + 10);
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameLoop = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(gameLoop);
  }, [direction, food, gameOver, generateFood, isPlaying]);

  // Mobile controls
  const handleMobileControl = (newDirection: Direction) => {
    if (!isPlaying) return;
    if (
      (newDirection === 'UP' && direction !== 'DOWN') ||
      (newDirection === 'DOWN' && direction !== 'UP') ||
      (newDirection === 'LEFT' && direction !== 'RIGHT') ||
      (newDirection === 'RIGHT' && direction !== 'LEFT')
    ) {
      setDirection(newDirection);
    }
  };

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

      {!showGame ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={() => {
              setShowGame(true);
              resetGame();
            }}
            className="gap-2"
            size="lg"
          >
            <Gamepad2 className="h-5 w-5" />
            Play Snake While You Wait
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="mb-4 flex items-center gap-4">
            <span className="text-xl font-semibold text-foreground">Score: {score}</span>
            <Button variant="outline" size="sm" onClick={resetGame} className="gap-1">
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
          </div>

          <div
            className="relative border-2 border-border rounded-lg bg-card overflow-hidden"
            style={{
              width: GRID_SIZE * CELL_SIZE,
              height: GRID_SIZE * CELL_SIZE,
            }}
          >
            {/* Food */}
            <motion.div
              className="absolute bg-destructive rounded-full"
              style={{
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
                left: food.x * CELL_SIZE + 2,
                top: food.y * CELL_SIZE + 2,
              }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            />

            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute rounded-sm ${index === 0 ? 'bg-primary' : 'bg-primary/70'}`}
                style={{
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2,
                  left: segment.x * CELL_SIZE + 1,
                  top: segment.y * CELL_SIZE + 1,
                }}
              />
            ))}

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-foreground mb-2">Game Over!</p>
                <p className="text-muted-foreground mb-4">Final Score: {score}</p>
                <Button onClick={resetGame}>Play Again</Button>
              </div>
            )}

            {/* Start Overlay */}
            {!isPlaying && !gameOver && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                <p className="text-xl font-semibold text-foreground mb-4">Ready to Play?</p>
                <Button onClick={resetGame}>Start Game</Button>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="mt-6 grid grid-cols-3 gap-2 md:hidden">
            <div />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMobileControl('UP')}
              className="h-12 w-12"
            >
              ↑
            </Button>
            <div />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMobileControl('LEFT')}
              className="h-12 w-12"
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMobileControl('DOWN')}
              className="h-12 w-12"
            >
              ↓
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMobileControl('RIGHT')}
              className="h-12 w-12"
            >
              →
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-4 hidden md:block">
            Use arrow keys to control the snake
          </p>
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
