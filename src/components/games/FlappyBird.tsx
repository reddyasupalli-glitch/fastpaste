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
      {/* Score and controls */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Score:</span>
          <span className="text-xl font-cyber font-bold neon-text-purple">{score}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetGame} 
          className="gap-1 cyber-button text-xs font-mono neon-border-purple"
        >
          <RotateCcw className="h-3 w-3" />
          RESTART
        </Button>
      </div>

      {/* Game area */}
      <div
        ref={gameRef}
        onClick={handleClick}
        className="relative overflow-hidden rounded-lg cursor-pointer select-none neon-border-purple"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          background: 'linear-gradient(180deg, hsl(240 20% 8%) 0%, hsl(280 30% 10%) 50%, hsl(240 20% 5%) 100%)',
          boxShadow: '0 0 30px hsl(280 100% 60% / 0.2), inset 0 0 20px hsl(280 100% 60% / 0.05)',
        }}
      >
        {/* Stars / particles background */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-primary/50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Grid lines */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(hsl(280 100% 60% / 0.2) 1px, transparent 1px),
              linear-gradient(90deg, hsl(280 100% 60% / 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Bird */}
        <motion.div
          className="absolute rounded-full flex items-center justify-center font-bold text-lg"
          style={{
            width: BIRD_SIZE,
            height: BIRD_SIZE,
            left: 50,
            top: birdY,
            transform: `rotate(${Math.min(birdVelocity * 3, 45)}deg)`,
            background: 'linear-gradient(135deg, hsl(280 100% 60%), hsl(320 100% 60%))',
            boxShadow: '0 0 15px hsl(280 100% 60%), 0 0 30px hsl(280 100% 60% / 0.5)',
          }}
        >
          ▸
        </motion.div>

        {/* Pipes */}
        {pipes.map((pipe, index) => (
          <div key={index}>
            {/* Top pipe */}
            <div
              className="absolute rounded-b-lg"
              style={{
                width: PIPE_WIDTH,
                height: pipe.topHeight,
                left: pipe.x,
                top: 0,
                background: 'linear-gradient(180deg, hsl(180 100% 30%), hsl(180 100% 40%))',
                boxShadow: '0 0 10px hsl(180 100% 50% / 0.5), inset 0 0 10px hsl(180 100% 60% / 0.2)',
                border: '1px solid hsl(180 100% 50% / 0.5)',
              }}
            >
              <div 
                className="absolute bottom-0 left-[-5px] w-[60px] h-[20px] rounded"
                style={{
                  background: 'linear-gradient(180deg, hsl(180 100% 45%), hsl(180 100% 35%))',
                  boxShadow: '0 0 10px hsl(180 100% 50% / 0.5)',
                  border: '1px solid hsl(180 100% 50% / 0.5)',
                }}
              />
            </div>
            {/* Bottom pipe */}
            <div
              className="absolute rounded-t-lg"
              style={{
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - pipe.topHeight - PIPE_GAP,
                left: pipe.x,
                top: pipe.topHeight + PIPE_GAP,
                background: 'linear-gradient(180deg, hsl(180 100% 40%), hsl(180 100% 30%))',
                boxShadow: '0 0 10px hsl(180 100% 50% / 0.5), inset 0 0 10px hsl(180 100% 60% / 0.2)',
                border: '1px solid hsl(180 100% 50% / 0.5)',
              }}
            >
              <div 
                className="absolute top-0 left-[-5px] w-[60px] h-[20px] rounded"
                style={{
                  background: 'linear-gradient(180deg, hsl(180 100% 35%), hsl(180 100% 45%))',
                  boxShadow: '0 0 10px hsl(180 100% 50% / 0.5)',
                  border: '1px solid hsl(180 100% 50% / 0.5)',
                }}
              />
            </div>
          </div>
        ))}

        {/* Ground */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-2"
          style={{
            background: 'linear-gradient(90deg, hsl(320 100% 50%), hsl(280 100% 50%), hsl(180 100% 50%))',
            boxShadow: '0 0 20px hsl(320 100% 50% / 0.5)',
          }}
        />

        {/* Game Over Overlay */}
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: 'hsl(240 15% 3% / 0.9)' }}
          >
            <p className="text-2xl font-cyber font-bold neon-text-pink mb-2">CRASHED</p>
            <p className="text-muted-foreground font-mono mb-4">SCORE: {score}</p>
            <Button onClick={resetGame} className="cyber-button font-mono neon-border-purple">
              {'>'} REBOOT
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
            <p className="text-xl font-cyber font-semibold neon-text-purple mb-2">FLAPPY_2077</p>
            <p className="text-xs text-muted-foreground font-mono mb-4">{'>'} TAP_OR_SPACE_TO_FLY</p>
            <Button onClick={resetGame} className="cyber-button font-mono neon-border-purple">
              {'>'} LAUNCH
            </Button>
          </motion.div>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-4 font-mono">
        {'>'} TAP_OR_PRESS_SPACE
      </p>
    </div>
  );
};

export default FlappyBird;
