import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Clock, Eye, EyeOff, Flame, Terminal, Lock, Share2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Navbar } from '@/components/layout/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 
  'c', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'html', 
  'css', 'scss', 'json', 'yaml', 'xml', 'markdown', 'sql', 'shell', 'dockerfile'
];

const EXPIRATION_OPTIONS = [
  { label: '10 minutes', value: '10m' },
  { label: '1 hour', value: '1h' },
  { label: '1 day', value: '1d' },
  { label: '1 week', value: '1w' },
  { label: 'Never', value: 'never' },
];

const getExpirationDate = (value: string): string | null => {
  const now = new Date();
  switch (value) {
    case '10m': return new Date(now.getTime() + 10 * 60 * 1000).toISOString();
    case '1h': return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    case '1d': return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case '1w': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    default: return null;
  }
};

const Paste = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('// Start coding here...\n');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [visibility, setVisibility] = useState<'public' | 'unlisted'>('public');
  const [expiration, setExpiration] = useState('never');
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [password, setPassword] = useState('');
  const [generateAccessCode, setGenerateAccessCode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!content.trim()) {
      toast.error('Please enter some code');
      return;
    }

    if (content.length > 1024 * 1024) {
      toast.error('Content exceeds 1MB limit');
      return;
    }

    setIsCreating(true);

    try {
      // Hash password if provided
      let passwordHash = null;
      if (password) {
        const { data: hashData } = await supabase.rpc('hash_paste_password', { password });
        passwordHash = hashData;
      }

      // Generate access code if requested
      let accessCode = null;
      if (generateAccessCode && visibility === 'unlisted') {
        const { data: codeData } = await supabase.rpc('generate_paste_access_code');
        accessCode = codeData;
      }

      const { data, error } = await supabase
        .from('pastes')
        .insert({
          title: title.trim() || null,
          content: content,
          language,
          visibility,
          burn_after_read: burnAfterRead,
          expires_at: getExpirationDate(expiration),
          password_hash: passwordHash,
          access_code: accessCode,
        })
        .select('id, access_code')
        .single();

      if (error) throw error;

      let successMsg = 'Paste created successfully!';
      if (data.access_code) {
        successMsg += ` Access code: ${data.access_code}`;
        await navigator.clipboard.writeText(data.access_code);
      }
      
      toast.success(successMsg);
      navigate(`/paste/${data.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create paste');
    } finally {
      setIsCreating(false);
    }
  }, [content, title, language, visibility, expiration, burnAfterRead, password, generateAccessCode, navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Code2 className="h-8 w-8 text-neon-purple" />
              <h1 className="font-cyber text-3xl font-bold text-foreground">CREATE_PASTE</h1>
            </div>
            <p className="text-muted-foreground font-mono text-sm">
              {'>'} Share code with syntax highlighting and secure links
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            {/* Editor */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel overflow-hidden"
            >
              <div className="h-12 border-b border-border/50 flex items-center px-4 gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm text-muted-foreground">editor.{language}</span>
              </div>
              <Editor
                height="500px"
                language={language}
                value={content}
                onChange={(value) => setContent(value || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  lineNumbers: 'on',
                  renderLineHighlight: 'line',
                  cursorBlinking: 'smooth',
                  automaticLayout: true,
                }}
              />
            </motion.div>

            {/* Settings Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-6 space-y-6 h-fit"
            >
              <div>
                <h3 className="font-cyber text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-neon-purple">CONFIG</span>
                </h3>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label className="font-mono text-sm">Title (optional)</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My awesome code"
                  className="cyber-input"
                  maxLength={100}
                />
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label className="font-mono text-sm">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="cyber-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <Label className="font-mono text-sm">Visibility</Label>
                <Select value={visibility} onValueChange={(v: 'public' | 'unlisted') => setVisibility(v)}>
                  <SelectTrigger className="cyber-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="unlisted">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        Unlisted
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Expiration */}
              <div className="space-y-2">
                <Label className="font-mono text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Expiration
                </Label>
                <Select value={expiration} onValueChange={setExpiration}>
                  <SelectTrigger className="cyber-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Password protection */}
              <div className="space-y-2">
                <Label className="font-mono text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password (optional)
                </Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="cyber-input"
                  maxLength={50}
                />
                {password && (
                  <p className="text-xs text-muted-foreground font-mono">
                    Viewers will need this password to see the content
                  </p>
                )}
              </div>

              {/* Access code for unlisted */}
              {visibility === 'unlisted' && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-primary" />
                    <Label className="font-mono text-sm cursor-pointer">Generate access code</Label>
                  </div>
                  <Switch
                    checked={generateAccessCode}
                    onCheckedChange={setGenerateAccessCode}
                  />
                </div>
              )}

              {generateAccessCode && visibility === 'unlisted' && (
                <p className="text-xs text-primary font-mono">
                  ⚡ A shareable code will be generated for this paste
                </p>
              )}

              {/* Burn after read */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-destructive" />
                  <Label className="font-mono text-sm cursor-pointer">Burn after read</Label>
                </div>
                <Switch
                  checked={burnAfterRead}
                  onCheckedChange={setBurnAfterRead}
                />
              </div>

              {burnAfterRead && (
                <p className="text-xs text-destructive font-mono">
                  ⚠ Paste will be deleted after first view
                </p>
              )}

              {/* Create Button */}
              <Button
                onClick={handleCreate}
                disabled={isCreating || !content.trim()}
                className="w-full cyber-button py-6 text-lg"
              >
                {isCreating ? (
                  <span className="font-cyber">CREATING...</span>
                ) : (
                  <span className="font-cyber">CREATE_PASTE</span>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paste;
