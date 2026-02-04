import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Copy, Check, Terminal, ArrowLeft, Send, 
  MessageSquare, User, Wifi, WifiOff, Trash2, Play,
  Bot
} from 'lucide-react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase, getSessionToken } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getCursorColor } from '@/components/rooms/CursorOverlay';
import { LivePreview } from '@/components/rooms/LivePreview';
import { AICodeHelper } from '@/components/rooms/AICodeHelper';
import type { editor as MonacoEditor, Range as MonacoRange } from 'monaco-editor';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 
  'c', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'html', 
  'css', 'scss', 'json', 'yaml', 'xml', 'markdown', 'sql', 'shell', 'dockerfile'
];

interface RoomData {
  id: string;
  code: string;
  name: string;
  content: string;
  language: string;
  is_private: boolean;
  session_token?: string;
}

interface Participant {
  username: string;
  isTyping?: boolean;
  lastActivity?: string;
  cursorPosition?: { line: number; column: number };
  color?: string;
}

interface ChatMessage {
  id: string;
  username: string;
  content: string;
  created_at: string;
}

const CodingRoom = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [username, setUsername] = useState('');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(true);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastBroadcastContent = useRef('');
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const monacoRef = useRef<{ Range: typeof MonacoRange; editor: typeof MonacoEditor } | null>(null);

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomCode) return;

      try {
        // Use secure function that doesn't expose session_token
        const { data, error } = await supabase.rpc('get_room_by_code', { room_code: roomCode });

        if (error) throw error;
        if (!data || data.length === 0) {
          setError('Room not found');
          return;
        }

        const roomData = data[0];
        setRoom({
          id: roomData.id,
          code: roomData.code,
          name: roomData.name,
          content: roomData.content || '',
          language: roomData.language,
          is_private: roomData.is_private,
        });
        setContent(roomData.content || '');
        setLanguage(roomData.language || 'javascript');
        lastBroadcastContent.current = roomData.content || '';
        setIsOwner(roomData.is_owner);
      } catch (err: any) {
        setError(err.message || 'Failed to load room');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomCode]);

  // Handle editor mount
  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = { Range: monaco.Range, editor: monaco.editor };

    // Track cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      if (channelRef.current && username) {
        channelRef.current.track({
          username,
          isTyping: true,
          lastActivity: new Date().toISOString(),
          cursorPosition: {
            line: e.position.lineNumber,
            column: e.position.column,
          },
          color: getCursorColor(username),
        });
      }
    });
  };

  // Update cursor decorations when participants change
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const { Range, editor: monacoEditor } = monacoRef.current;
    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    const newDecorations: MonacoEditor.IModelDeltaDecoration[] = [];

    participants.forEach((participant) => {
      if (participant.username === username || !participant.cursorPosition) return;

      const { line, column } = participant.cursorPosition;

      // Cursor line decoration
      newDecorations.push({
        range: new Range(line, column, line, column + 1),
        options: {
          className: `cursor-${participant.username.replace(/[^a-zA-Z0-9]/g, '')}`,
          beforeContentClassName: 'remote-cursor',
          hoverMessage: { value: participant.username },
          stickiness: monacoEditor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      });
    });

    // Update decorations
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);

    // Inject CSS for cursor colors
    const styleId = 'remote-cursor-styles';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const css = Array.from(participants.values())
      .filter(p => p.username !== username && p.cursorPosition)
      .map(p => {
        const safeUsername = p.username.replace(/[^a-zA-Z0-9]/g, '');
        const color = p.color || getCursorColor(p.username);
        return `
          .cursor-${safeUsername}::before {
            content: '${p.username}';
            position: absolute;
            top: -18px;
            left: 0;
            background: ${color};
            color: black;
            font-size: 10px;
            padding: 1px 4px;
            border-radius: 2px;
            white-space: nowrap;
            z-index: 100;
          }
          .cursor-${safeUsername} {
            border-left: 2px solid ${color};
            position: relative;
          }
        `;
      }).join('\n');

    styleEl.textContent = css;
  }, [participants, username]);

  // Join room and set up real-time subscriptions
  useEffect(() => {
    if (!room || showUsernamePrompt || !username) return;

    const sessionKey = `${getSessionToken()}-${Date.now()}`;

    const channel = supabase.channel(`room-collab-${room.id}`, {
      config: {
        presence: { key: sessionKey },
        broadcast: { self: true },
      },
    });

    channelRef.current = channel;

    // Handle presence sync
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<Participant>();
      const newParticipants = new Map<string, Participant>();
      
      Object.values(state).forEach((presences) => {
        presences.forEach((presence: any) => {
          if (presence.username) {
            newParticipants.set(presence.username, {
              username: presence.username,
              isTyping: presence.isTyping,
              lastActivity: presence.lastActivity,
              cursorPosition: presence.cursorPosition,
              color: presence.color,
            });
          }
        });
      });
      
      setParticipants(newParticipants);
    });

    // Handle real-time code updates
    channel.on('broadcast', { event: 'code-update' }, ({ payload }) => {
      if (payload.sender !== username && payload.content !== undefined) {
        setContent(payload.content);
        lastBroadcastContent.current = payload.content;
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 500);
      }
    });

    // Handle language changes
    channel.on('broadcast', { event: 'language-change' }, ({ payload }) => {
      if (payload.sender !== username && payload.language) {
        setLanguage(payload.language);
      }
    });

    // Handle chat messages
    channel.on('broadcast', { event: 'chat-message' }, ({ payload }) => {
      const msg: ChatMessage = {
        id: payload.id || crypto.randomUUID(),
        username: payload.username,
        content: payload.content,
        created_at: payload.created_at || new Date().toISOString(),
      };
      
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        
        await channel.track({
          username,
          isTyping: false,
          lastActivity: new Date().toISOString(),
          color: getCursorColor(username),
        });

        try {
          await supabase
            .from('coding_room_participants')
            .insert({
              room_id: room.id,
              username,
              session_token: 'trigger-will-override',
            });
        } catch {
          // May fail if already exists
        }
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setIsConnected(false);
      }
    });

    const heartbeat = setInterval(() => {
      channel.track({
        username,
        isTyping: false,
        lastActivity: new Date().toISOString(),
        color: getCursorColor(username),
      });
    }, 30000);

    return () => {
      clearInterval(heartbeat);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      channel.untrack();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [room, showUsernamePrompt, username]);

  // Handle content changes
  const handleContentChange = useCallback((newContent: string | undefined) => {
    if (!room || newContent === undefined) return;
    
    setContent(newContent);

    if (channelRef.current && newContent !== lastBroadcastContent.current) {
      lastBroadcastContent.current = newContent;
      channelRef.current.send({
        type: 'broadcast',
        event: 'code-update',
        payload: { content: newContent, sender: username },
      });
    }

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(async () => {
      await supabase
        .from('coding_rooms')
        .update({ 
          content: newContent,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', room.id);
    }, 1000);
  }, [room, username]);

  // Handle language change
  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'language-change',
        payload: { language: newLanguage, sender: username },
      });
    }

    if (room) {
      await supabase
        .from('coding_rooms')
        .update({ language: newLanguage })
        .eq('id', room.id);
    }
  };

  // Copy room code
  const handleCopyCode = async () => {
    if (!room) return;
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    toast.success('Room code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle username submit
  const handleUsernameSubmit = () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    setShowUsernamePrompt(false);
  };

  // Send chat message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !channelRef.current) return;
    
    const msgId = crypto.randomUUID();
    const msg: ChatMessage = {
      id: msgId,
      username,
      content: newMessage,
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, msg]);
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'chat-message',
      payload: { id: msgId, username, content: newMessage, created_at: msg.created_at },
    });
    
    setNewMessage('');
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Delete room
  const handleDeleteRoom = async () => {
    if (!room) return;

    try {
      const { error } = await supabase.rpc('delete_coding_room', { room_id: room.id });
      
      if (error) throw error;
      
      toast.success('Room deleted');
      navigate('/rooms');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete room');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-panel p-8 text-center">
          <Terminal className="h-8 w-8 text-primary animate-pulse mx-auto mb-4" />
          <p className="font-mono text-muted-foreground">Connecting to room...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !room) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 gradient-animate" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 text-center max-w-md relative z-10"
        >
          <Users className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="font-cyber text-xl font-bold mb-2">ROOM_NOT_FOUND</h2>
          <p className="text-muted-foreground font-mono text-sm mb-6">
            {error || 'This room may have been deleted.'}
          </p>
          <Link to="/rooms">
            <Button className="cyber-button">
              <span className="font-cyber">BROWSE_ROOMS</span>
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Username prompt
  if (showUsernamePrompt) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 gradient-animate" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--neon-pink) / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--neon-pink) / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 max-w-md w-full mx-4 relative z-10"
        >
          <div className="text-center mb-6">
            <User className="h-12 w-12 text-neon-pink mx-auto mb-4" />
            <h2 className="font-cyber text-xl font-bold">ENTER_IDENTITY</h2>
            <p className="text-muted-foreground font-mono text-sm mt-2">
              Joining room: <span className="text-primary">{room.name}</span>
            </p>
          </div>

          <div className="space-y-4">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="cyber-input text-center"
              maxLength={30}
              onKeyDown={(e) => e.key === 'Enter' && handleUsernameSubmit()}
            />
            <Button onClick={handleUsernameSubmit} className="w-full cyber-button">
              <span className="font-cyber">JOIN_ROOM</span>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const participantList = Array.from(participants.values());

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 glass-panel border-b border-border/50 flex items-center px-4 gap-4 shrink-0">
        <Link to="/rooms">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        
        <div className="flex-1 flex items-center gap-3">
          <h1 className="font-cyber text-lg font-semibold text-foreground">{room.name}</h1>
          <div className={`flex items-center gap-1 text-xs font-mono ${isConnected ? 'text-neon-green' : 'text-destructive'}`}>
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </div>
          {isSyncing && (
            <span className="text-xs font-mono text-primary animate-pulse">syncing...</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang} className="text-xs">
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Participants */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/30">
            <Users className="h-4 w-4 text-neon-green" />
            <span className="font-mono text-sm">{participantList.length}</span>
          </div>

          {/* Room code */}
          <Button variant="ghost" onClick={handleCopyCode} className="gap-2 font-mono text-sm neon-border">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {room.code}
          </Button>

          {/* Preview toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setShowPreview(!showPreview); setShowAI(false); }}
            className={showPreview ? 'text-neon-green' : 'text-muted-foreground'}
            title="Live Preview"
          >
            <Play className="h-5 w-5" />
          </Button>

          {/* AI helper toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setShowAI(!showAI); setShowPreview(false); }}
            className={showAI ? 'text-neon-purple' : 'text-muted-foreground'}
            title="AI Code Helper"
          >
            <Bot className="h-5 w-5" />
          </Button>

          {/* Chat toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className={showChat ? 'text-primary' : 'text-muted-foreground'}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          {/* Delete room (owner only) */}
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Room?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this coding room and all its content. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteRoom} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-10 border-b border-border/50 flex items-center px-4 gap-2 bg-muted/20">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm text-muted-foreground">{language}</span>
            <span className="text-xs text-muted-foreground/70 ml-auto">
              {participantList.length} collaborator{participantList.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language}
              value={content}
              onChange={handleContentChange}
              onMount={handleEditorMount}
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
          </div>
        </div>

        {/* Live Preview */}
        <AnimatePresence>
          {showPreview && (
            <LivePreview
              code={content}
              language={language}
              onClose={() => setShowPreview(false)}
            />
          )}
        </AnimatePresence>

        {/* AI Helper */}
        <AnimatePresence>
          {showAI && (
            <AICodeHelper
              code={content}
              language={language}
              onClose={() => setShowAI(false)}
            />
          )}
        </AnimatePresence>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-80 border-l border-border/50 flex flex-col bg-card/50">
            {/* Participants */}
            <div className="p-3 border-b border-border/50">
              <h3 className="font-mono text-xs text-muted-foreground uppercase mb-2">
                Online ({participantList.length})
              </h3>
              <div className="flex flex-wrap gap-1">
                {participantList.map((p) => (
                  <span
                    key={p.username}
                    className="text-xs font-mono px-2 py-1 rounded flex items-center gap-1"
                    style={{
                      backgroundColor: `${p.color || getCursorColor(p.username)}20`,
                      color: p.color || getCursorColor(p.username),
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: p.color || getCursorColor(p.username) }}
                    />
                    {p.username}
                    {p.username === username && ' (you)'}
                  </span>
                ))}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm font-mono py-8">
                    No messages yet
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <div className="flex items-baseline gap-2">
                        <span 
                          className="font-semibold"
                          style={{ color: getCursorColor(msg.username) }}
                        >
                          {msg.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-foreground mt-1">{msg.content}</p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message input */}
            <div className="p-3 border-t border-border/50">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="cyber-input text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  className="cyber-button shrink-0"
                  disabled={!isConnected}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingRoom;
