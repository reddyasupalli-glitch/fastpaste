import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Users, 
  Globe, 
  Terminal, 
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';

// Floating orb component
const FloatingOrb = ({ color, size, x, y, delay }: { 
  color: 'cyan' | 'purple' | 'pink'; 
  size: number; 
  x: number; 
  y: number;
  delay: number;
}) => {
  const colorClasses = {
    cyan: 'bg-neon-cyan',
    purple: 'bg-neon-purple',
    pink: 'bg-neon-pink',
  };
  
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 ${colorClasses[color]}`}
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

// Feature card component
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  href, 
  color,
  delay 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  href: string;
  color: 'cyan' | 'purple' | 'pink' | 'green';
  delay: number;
}) => {
  const colorStyles = {
    cyan: 'border-neon-cyan/30 hover:border-neon-cyan hover:shadow-neon',
    purple: 'border-neon-purple/30 hover:border-neon-purple hover:shadow-neon-purple',
    pink: 'border-neon-pink/30 hover:border-neon-pink hover:shadow-neon-pink',
    green: 'border-neon-green/30 hover:border-neon-green',
  };

  const iconColors = {
    cyan: 'text-neon-cyan',
    purple: 'text-neon-purple',
    pink: 'text-neon-pink',
    green: 'text-neon-green',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
    >
      <Link to={href}>
        <div className={`glass-panel p-6 h-full transition-all duration-300 ${colorStyles[color]} hover:-translate-y-2`}>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-muted/50 ${iconColors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="font-cyber text-lg font-semibold mb-2 text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
          <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${iconColors[color]}`}>
            <span>Enter</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Landing = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = 'FASTPASTE_2077';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-animate" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `
          linear-gradient(hsl(var(--neon-cyan) / 0.03) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--neon-cyan) / 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }} />

      {/* Floating orbs */}
      <FloatingOrb color="cyan" size={400} x={5} y={10} delay={0} />
      <FloatingOrb color="purple" size={300} x={70} y={50} delay={2} />
      <FloatingOrb color="pink" size={350} x={85} y={5} delay={4} />
      <FloatingOrb color="cyan" size={200} x={15} y={70} delay={1} />

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none scanlines" />

      {/* Navigation */}
      <Navbar />

      {/* Main content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center px-4 pt-20">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            {/* Terminal icon */}
            <motion.div
              className="inline-flex items-center justify-center mb-6"
              animate={{ 
                filter: ['drop-shadow(0 0 10px hsl(180 100% 50%))', 'drop-shadow(0 0 25px hsl(180 100% 50%))', 'drop-shadow(0 0 10px hsl(180 100% 50%))']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Terminal className="h-16 w-16 text-primary" />
            </motion.div>

            {/* Main title */}
            <h1 className="font-cyber text-4xl sm:text-6xl lg:text-7xl font-bold mb-4 tracking-wider">
              <span className="neon-text-cyan">{typedText}</span>
              <span className="cursor-blink" />
            </h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg sm:text-xl text-muted-foreground font-mono mt-4 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {'>'} THE_FUTURE_OF_CODE_SHARING
            </motion.p>

            <motion.p
              className="text-sm sm:text-base text-muted-foreground/70 mt-2 max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              Instant code pastes • Live collaborative coding • AI-powered assistance
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mt-8 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              <Link to="/paste">
                <Button className="cyber-button px-8 py-6 text-lg gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-cyber">CREATE_PASTE</span>
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="outline" className="neon-border px-8 py-6 text-lg gap-2 bg-transparent hover:bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                  <span className="font-cyber text-primary">EXPLORE</span>
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-neon-yellow" />
                <span className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                  PLATFORM_FEATURES
                </span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={Code2}
                title="CODE_PASTE"
                description="Monaco-powered editor with syntax highlighting, password protection, expiration & burn-after-read."
                href="/paste"
                color="purple"
                delay={2.1}
              />
              <FeatureCard
                icon={Users}
                title="LIVE_ROOMS"
                description="Real-time collaborative coding with cursor presence, live preview, and AI assistance."
                href="/rooms"
                color="pink"
                delay={2.2}
              />
              <FeatureCard
                icon={Globe}
                title="EXPLORE"
                description="Discover trending pastes, active rooms, and connect with developers."
                href="/explore"
                color="green"
                delay={2.3}
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <motion.section 
          className="py-16 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="glass-panel p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { label: 'LATENCY', value: '<50ms' },
                  { label: 'UPTIME', value: '99.9%' },
                  { label: 'ENCRYPTION', value: 'AES-256' },
                  { label: 'STATUS', value: 'ONLINE' },
                ].map((stat, i) => (
                  <div key={stat.label}>
                    <p className="text-2xl sm:text-3xl font-cyber font-bold text-primary mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border/50">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground font-mono">
              © 2077 FASTPASTE // ALL_RIGHTS_RESERVED
            </p>
            <div className="flex items-center gap-6">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
