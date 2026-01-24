import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const GAME_WIDTH = 320;
const GAME_HEIGHT = 480;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_SPEED = 3;

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

const FlappyBird = () => {
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);

  const resetGame = () => {
    setBirdY(GAME_HEIGHT / 2);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const jump = useCallback(() => {
    if (!isPlaying || gameOver) return;
    setBirdVelocity(JUMP_FORCE);
  }, [isPlaying, gameOver]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      if (!isPlaying && !gameOver) {
        resetGame();
      } else {
        jump();
      }
    }
  }, [jump, isPlaying, gameOver]);

  const handleClick = () => {
    if (!isPlaying && !gameOver) {
      resetGame();
    } else {
      jump();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      // Update bird position
      setBirdVelocity(v => v + GRAVITY);
      setBirdY(y => {
        const newY = y + birdVelocity;
        
        // Check floor/ceiling collision
        if (newY <= 0 || newY >= GAME_HEIGHT - BIRD_SIZE) {
          setGameOver(true);
          setIsPlaying(false);
          return y;
        }
        return newY;
      });

      // Update pipes
      setPipes(currentPipes => {
        let newPipes = currentPipes
          .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          .filter(pipe => pipe.x > -PIPE_WIDTH);

        // Add new pipe
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - 200) {
          newPipes.push({
            x: GAME_WIDTH,
            topHeight: Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50,
            passed: false,
          });
        }

        // Check collisions and scoring
        newPipes = newPipes.map(pipe => {
          const birdLeft = 50;
          const birdRight = 50 + BIRD_SIZE;
          const birdTop = birdY;
          const birdBottom = birdY + BIRD_SIZE;

          const pipeLeft = pipe.x;
          const pipeRight = pipe.x + PIPE_WIDTH;

          // Check collision
          if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
              setGameOver(true);
              setIsPlaying(false);
            }
          }

          // Check if passed
          if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
            setScore(s => s + 1);
            return { ...pipe, passed: true };
          }

          return pipe;
        });

        return newPipes;
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, birdVelocity, birdY]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center gap-4">
        <span className="text-xl font-semibold text-foreground">Score: {score}</span>
        <Button variant="outline" size="sm" onClick={resetGame} className="gap-1">
          <RotateCcw className="h-4 w-4" />
          Restart
        </Button>
      </div>

      <div
        ref={gameRef}
        onClick={handleClick}
        className="relative overflow-hidden rounded-lg border-2 border-border cursor-pointer select-none"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          background: 'linear-gradient(to bottom, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.05))',
        }}
      >
        {/* Bird */}
        <motion.div
          className="absolute bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground font-bold"
          style={{
            width: BIRD_SIZE,
            height: BIRD_SIZE,
            left: 50,
            top: birdY,
            transform: `rotate(${Math.min(birdVelocity * 3, 45)}deg)`,
          }}
        >
          🐦
        </motion.div>

        {/* Pipes */}
        {pipes.map((pipe, index) => (
          <div key={index}>
            {/* Top pipe */}
            <div
              className="absolute bg-green-500 dark:bg-green-600 rounded-b-lg"
              style={{
                width: PIPE_WIDTH,
                height: pipe.topHeight,
                left: pipe.x,
                top: 0,
              }}
            >
              <div 
                className="absolute bottom-0 left-[-5px] w-[60px] h-[20px] bg-green-600 dark:bg-green-700 rounded"
              />
            </div>
            {/* Bottom pipe */}
            <div
              className="absolute bg-green-500 dark:bg-green-600 rounded-t-lg"
              style={{
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - pipe.topHeight - PIPE_GAP,
                left: pipe.x,
                top: pipe.topHeight + PIPE_GAP,
              }}
            >
              <div 
                className="absolute top-0 left-[-5px] w-[60px] h-[20px] bg-green-600 dark:bg-green-700 rounded"
              />
            </div>
          </div>
        ))}

        {/* Ground */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-2 bg-amber-700"
        />

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
            <p className="text-xl font-semibold text-foreground mb-2">Flappy Bird</p>
            <p className="text-sm text-muted-foreground mb-4">Tap or press Space to fly!</p>
            <Button onClick={resetGame}>Start Game</Button>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        Tap or press Space to fly
      </p>
    </div>
  );
};

export default FlappyBird;
