import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Copy, Check, Clock, Eye, Flame, ArrowLeft, ExternalLink, Terminal, Lock, GitFork, Trash2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/layout/Navbar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase, getSessionToken } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';

interface Paste {
  id: string;
  title: string | null;
  content: string;
  language: string;
  visibility: string;
  burn_after_read: boolean;
  views: number;
  expires_at: string | null;
  created_at: string;
  requires_password?: boolean;
}

const PasteView = () => {
  const { pasteId } = useParams<{ pasteId: string }>();
  const navigate = useNavigate();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const fetchPaste = async (pwd?: string) => {
    if (!pasteId) return;

    try {
      setCheckingPassword(true);
      
      const { data, error } = await supabase
        .rpc('view_paste', { paste_id: pasteId, password: pwd || null });

      if (error) throw error;

      if (!data || data.length === 0) {
        setError('Paste not found or has expired');
        return;
      }

      const pasteData = data[0] as Paste;
      
      if (pasteData.requires_password && !pwd) {
        setPasswordRequired(true);
        setPaste({ ...pasteData, content: '' });
        return;
      }

      if (pasteData.requires_password && pasteData.content === '') {
        toast.error('Incorrect password');
        return;
      }

      setPasswordRequired(false);
      setPaste(pasteData);
      
      // Check ownership
      const sessionToken = getSessionToken();
      // We can't directly check session_token from RPC, so we'll try delete
      setIsOwner(false); // Default to false, real ownership checked on delete attempt
    } catch (err: any) {
      setError(err.message || 'Failed to load paste');
    } finally {
      setLoading(false);
      setCheckingPassword(false);
    }
  };

  useEffect(() => {
    fetchPaste();
  }, [pasteId]);

  // Update expiration countdown
  useEffect(() => {
    if (!paste?.expires_at) return;

    const updateTimeLeft = () => {
      const expiresAt = new Date(paste.expires_at!);
      const now = new Date();
      const secondsLeft = differenceInSeconds(expiresAt, now);

      if (secondsLeft <= 0) {
        setTimeLeft('Expired');
        return;
      }

      if (secondsLeft < 60) {
        setTimeLeft(`${secondsLeft}s`);
      } else if (secondsLeft < 3600) {
        setTimeLeft(`${Math.floor(secondsLeft / 60)}m ${secondsLeft % 60}s`);
      } else {
        setTimeLeft(formatDistanceToNow(expiresAt, { addSuffix: true }));
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [paste?.expires_at]);

  const handleCopy = async () => {
    if (!paste) return;
    await navigator.clipboard.writeText(paste.content);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  const handlePasswordSubmit = () => {
    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }
    fetchPaste(password);
  };

  const handleFork = async () => {
    if (!paste) return;

    try {
      const { data, error } = await supabase.rpc('fork_paste', { source_paste_id: paste.id });
      
      if (error) throw error;
      
      toast.success('Paste forked!');
      navigate(`/paste/${data}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fork paste');
    }
  };

  const handleDelete = async () => {
    if (!paste) return;

    try {
      const { data, error } = await supabase.rpc('delete_paste', { paste_id: paste.id });
      
      if (error) throw error;
      
      if (!data) {
        toast.error('You can only delete your own pastes');
        return;
      }
      
      toast.success('Paste deleted');
      navigate('/explore');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete paste');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-panel p-8 text-center">
          <Terminal className="h-8 w-8 text-primary animate-pulse mx-auto mb-4" />
          <p className="font-mono text-muted-foreground">Loading paste...</p>
        </div>
      </div>
    );
  }

  if (error || !paste) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 gradient-animate" />
        <Navbar />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 text-center max-w-md"
          >
            <Code2 className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="font-cyber text-xl font-bold mb-2 text-foreground">PASTE_NOT_FOUND</h2>
            <p className="text-muted-foreground font-mono text-sm mb-6">
              {error || 'This paste may have expired or been deleted.'}
            </p>
            <Link to="/paste">
              <Button className="cyber-button">
                <span className="font-cyber">CREATE_NEW_PASTE</span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Password prompt
  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 gradient-animate" />
        <Navbar />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="font-cyber text-xl font-bold">PASSWORD_REQUIRED</h2>
              <p className="text-muted-foreground font-mono text-sm mt-2">
                {paste.title || 'This paste'} is protected
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="cyber-input text-center"
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
              <Button 
                onClick={handlePasswordSubmit} 
                className="w-full cyber-button"
                disabled={checkingPassword}
              >
                <span className="font-cyber">
                  {checkingPassword ? 'CHECKING...' : 'UNLOCK'}
                </span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-animate" />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(hsl(var(--neon-purple) / 0.03) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--neon-purple) / 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }} />

      <Navbar />

      <div className="relative z-10 pt-20 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <Link to="/explore">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="font-cyber text-2xl font-bold text-foreground">
                  {paste.title || 'Untitled Paste'}
                </h1>
                <p className="text-muted-foreground font-mono text-sm">
                  {paste.language} • {formatDistanceToNow(new Date(paste.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Stats bar */}
            <div className="glass-panel p-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span className="font-mono">{paste.views} views</span>
              </div>
              
              {paste.burn_after_read && (
                <div className="flex items-center gap-2 text-destructive">
                  <Flame className="h-4 w-4" />
                  <span className="font-mono">Burn after read</span>
                </div>
              )}
              
              {timeLeft && (
                <div className="flex items-center gap-2 text-neon-yellow">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">Expires {timeLeft}</span>
                </div>
              )}

              <div className="flex-1" />

              {/* Fork button */}
              {paste.visibility === 'public' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFork}
                  className="gap-2 text-muted-foreground hover:text-neon-cyan"
                >
                  <GitFork className="h-4 w-4" />
                  Fork
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2 text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
                Share
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="gap-2 text-muted-foreground hover:text-primary"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>

              {/* Delete button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Paste?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this paste. This action cannot be undone.
                      Note: You can only delete pastes you created.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>

          {/* Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel overflow-hidden"
          >
            <div className="h-12 border-b border-border/50 flex items-center px-4 gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm text-muted-foreground">
                {paste.id}.{paste.language}
              </span>
            </div>
            <Editor
              height="500px"
              language={paste.language}
              value={paste.content}
              theme="vs-dark"
              options={{
                readOnly: true,
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'none',
              }}
            />
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex justify-center gap-4"
          >
            <Link to="/paste">
              <Button className="cyber-button gap-2">
                <Code2 className="h-4 w-4" />
                <span className="font-cyber">NEW_PASTE</span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PasteView;
