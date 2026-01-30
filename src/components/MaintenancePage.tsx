import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Gamepad2, Zap, Code2, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SnakeGame from '@/components/games/SnakeGame';
import FlappyBird from '@/components/games/FlappyBird';

type GameType = 'snake' | 'flappy' | null;

// Animated particle component
const Particle = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-primary"
    style={{ left: `${x}%`, bottom: 0 }}
    initial={{ y: 0, opacity: 0 }}
    animate={{
      y: [-10, -100, -200, -300],
      opacity: [0, 1, 1, 0],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

// Floating orb component
const FloatingOrb = ({ color, size, x, y, delay }: { 
  color: 'cyan' | 'purple' | 'pink'; 
  size: number; 
  x: number; 
  y: number;
  delay: number;
}) => {
  const colorClasses = {
    cyan: 'bg-primary shadow-neon',
    purple: 'bg-secondary shadow-neon-purple',
    pink: 'bg-accent shadow-neon-pink',
  };
  
  return (
    <motion.div
      className={`absolute rounded-full blur-xl opacity-30 ${colorClasses[color]}`}
      style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -20, 30, 0],
        scale: [1, 1.2, 0.9, 1],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

const MaintenancePage = () => {
  const [selectedGame, setSelectedGame] = useState<GameType>(null);
  const [typedText, setTypedText] = useState('');
  const fullText = 'FASTPASTE_2077';

  // Typing animation effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Generate particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 4,
  }));

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-animate" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(180 100% 50% / 0.03) 1px, transparent 1px),
              linear-gradient(90deg, hsl(180 100% 50% / 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Floating orbs */}
      <FloatingOrb color="cyan" size={300} x={10} y={20} delay={0} />
      <FloatingOrb color="purple" size={200} x={70} y={60} delay={2} />
      <FloatingOrb color="pink" size={250} x={80} y={10} delay={4} />
      <FloatingOrb color="cyan" size={150} x={20} y={70} delay={1} />

      {/* Particles */}
      {particles.map((p) => (
        <Particle key={p.id} x={p.x} delay={p.delay} />
      ))}

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none scanlines" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Logo and title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          {/* Terminal icon with glow */}
          <motion.div
            className="inline-flex items-center justify-center mb-6"
            animate={{ 
              filter: ['drop-shadow(0 0 10px hsl(180 100% 50%))', 'drop-shadow(0 0 20px hsl(180 100% 50%))', 'drop-shadow(0 0 10px hsl(180 100% 50%))']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Terminal className="h-16 w-16 text-primary" />
          </motion.div>

          {/* Main title with typing effect */}
          <h1 className="font-cyber text-4xl sm:text-6xl font-bold mb-2 tracking-wider">
            <span className="neon-text-cyan">{typedText}</span>
            <span className="cursor-blink" />
          </h1>

          {/* Subtitle with glitch effect */}
          <motion.p
            className="text-xl sm:text-2xl text-muted-foreground font-mono mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {'>'} SYSTEM_UPGRADE_IN_PROGRESS
          </motion.p>
        </motion.div>

        {/* Status panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6 mb-8 w-full max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Zap className="h-5 w-5" />
            <span className="font-mono text-sm uppercase tracking-wider">System Status</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { icon: Code2, label: 'Code Engine', status: 'Upgrading' },
              { icon: Users, label: 'User Sync', status: 'Offline' },
              { icon: Terminal, label: 'Terminal', status: 'Ready' },
              { icon: Clock, label: 'ETA', status: 'Soon™' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="p-3 rounded-lg bg-muted/30"
              >
                <item.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground font-mono">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">{item.status}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Game section */}
        {!selectedGame ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <p className="text-muted-foreground mb-4 font-mono">
              {'>'} KILL_TIME_WHILE_WAITING?
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => setSelectedGame('snake')}
                className="cyber-button gap-2 px-6 py-3"
                size="lg"
              >
                <span className="text-xl">🐍</span>
                <span className="font-cyber">SNAKE.EXE</span>
              </Button>
              <Button
                onClick={() => setSelectedGame('flappy')}
                className="cyber-button gap-2 px-6 py-3 neon-border-purple"
                size="lg"
              >
                <span className="text-xl">🐦</span>
                <span className="font-cyber">FLAPPY.EXE</span>
              </Button>
            </div>
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
                onClick={() => setSelectedGame(null)}
                className="gap-2 text-primary hover:text-primary/80 neon-border"
              >
                <Gamepad2 className="h-4 w-4" />
                <span className="font-mono">{'<'} BACK_TO_MENU</span>
              </Button>
            </div>

            <div className="glass-panel p-4">
              {selectedGame === 'snake' && <SnakeGame />}
              {selectedGame === 'flappy' && <FlappyBird />}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground font-mono">
            {'>'} STAY_TUNED_DEVELOPER
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-mono">NETWORK_CONNECTED</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenancePage;
