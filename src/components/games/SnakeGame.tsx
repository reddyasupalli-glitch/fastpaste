import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const GRID_SIZE = 15;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const SnakeGame = () => {
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
    <div className="flex flex-col items-center">
      {/* Score and controls */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Score:</span>
          <span className="text-xl font-cyber font-bold neon-text-cyan">{score}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetGame} 
          className="gap-1 cyber-button text-xs font-mono"
        >
          <RotateCcw className="h-3 w-3" />
          RESTART
        </Button>
      </div>

      {/* Game board */}
      <div
        className="relative rounded-lg overflow-hidden neon-border"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          background: 'linear-gradient(135deg, hsl(240 20% 5%), hsl(240 15% 8%))',
          boxShadow: '0 0 30px hsl(180 100% 50% / 0.2), inset 0 0 20px hsl(180 100% 50% / 0.05)',
        }}
      >
        {/* Grid lines */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(hsl(180 100% 50% / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsl(180 100% 50% / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          }}
        />

        {/* Food */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            left: food.x * CELL_SIZE + 2,
            top: food.y * CELL_SIZE + 2,
            background: 'hsl(320 100% 60%)',
            boxShadow: '0 0 10px hsl(320 100% 60%), 0 0 20px hsl(320 100% 60% / 0.5)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />

        {/* Snake */}
        {snake.map((segment, index) => (
          <motion.div
            key={index}
            className="absolute rounded-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE + 1,
              top: segment.y * CELL_SIZE + 1,
              background: index === 0 
                ? 'linear-gradient(135deg, hsl(180 100% 50%), hsl(180 100% 40%))'
                : `linear-gradient(135deg, hsl(180 100% ${50 - index * 2}%), hsl(180 100% ${40 - index * 2}%))`,
              boxShadow: index === 0 
                ? '0 0 10px hsl(180 100% 50%), 0 0 20px hsl(180 100% 50% / 0.3)'
                : '0 0 5px hsl(180 100% 50% / 0.3)',
            }}
          />
        ))}

        {/* Game Over Overlay */}
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: 'hsl(240 15% 3% / 0.9)' }}
          >
            <p className="text-2xl font-cyber font-bold neon-text-pink mb-2">GAME_OVER</p>
            <p className="text-muted-foreground font-mono mb-4">SCORE: {score}</p>
            <Button onClick={resetGame} className="cyber-button font-mono">
              {'>'} RETRY
            </Button>
          </motion.div>
        )}

        {/* Start Overlay */}
        {!isPlaying && !gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: 'hsl(240 15% 3% / 0.9)' }}
          >
            <p className="text-xl font-cyber font-semibold neon-text-cyan mb-4">SNAKE_2077</p>
            <Button onClick={resetGame} className="cyber-button font-mono">
              {'>'} INITIALIZE
            </Button>
          </motion.div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="mt-6 grid grid-cols-3 gap-2 md:hidden">
        <div />
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleMobileControl('UP')}
          className="h-12 w-12 cyber-button font-bold"
        >
          ↑
        </Button>
        <div />
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleMobileControl('LEFT')}
          className="h-12 w-12 cyber-button font-bold"
        >
          ←
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleMobileControl('DOWN')}
          className="h-12 w-12 cyber-button font-bold"
        >
          ↓
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleMobileControl('RIGHT')}
          className="h-12 w-12 cyber-button font-bold"
        >
          →
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-4 hidden md:block font-mono">
        {'>'} USE_ARROW_KEYS_TO_NAVIGATE
      </p>
    </div>
  );
};

export default SnakeGame;
