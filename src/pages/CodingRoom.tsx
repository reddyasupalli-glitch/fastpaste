import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Copy, Check, Terminal, ArrowLeft, Send, 
  MessageSquare, Code2, Settings, User
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface RoomData {
  id: string;
  code: string;
  name: string;
  content: string;
  language: string;
  is_private: boolean;
}

interface Participant {
  id: string;
  username: string;
  last_seen_at: string;
}

interface ChatMessage {
  id: string;
  username: string;
  content: string;
  created_at: string;
}

// Get session token
const getSessionToken = (): string => {
  let token = localStorage.getItem('fp-session-token');
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('fp-session-token', token);
  }
  return token;
};

const CodingRoom = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomCode) return;

      try {
        const { data, error } = await supabase
          .from('coding_rooms')
          .select('*')
          .eq('code', roomCode.toUpperCase())
          .single();

        if (error) throw error;
        if (!data) {
          setError('Room not found');
          return;
        }

        setRoom(data);
        setContent(data.content || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load room');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomCode]);

  // Join room and set up real-time subscriptions
  useEffect(() => {
    if (!room || showUsernamePrompt) return;

    const sessionToken = getSessionToken();

    // Join as participant
    const joinRoom = async () => {
      await supabase
        .from('coding_room_participants')
        .upsert({
          room_id: room.id,
          session_token: sessionToken,
          username,
          last_seen_at: new Date().toISOString(),
        }, {
          onConflict: 'room_id,session_token',
        });
    };

    joinRoom();

    // Heartbeat to keep participant active
    const heartbeat = setInterval(async () => {
      await supabase
        .from('coding_room_participants')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('room_id', room.id)
        .eq('session_token', sessionToken);
    }, 30000);

    // Subscribe to room content changes
    const roomChannel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'coding_rooms', filter: `id=eq.${room.id}` },
        (payload) => {
          const newContent = (payload.new as RoomData).content;
          if (newContent !== content) {
            setContent(newContent);
          }
        }
      )
      .subscribe();

    // Subscribe to participant changes
    const participantsChannel = supabase
      .channel(`participants-${room.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coding_room_participants', filter: `room_id=eq.${room.id}` },
        async () => {
          // Refetch participants
          const { data } = await supabase
            .from('coding_room_participants')
            .select('id, username, last_seen_at')
            .eq('room_id', room.id)
            .gte('last_seen_at', new Date(Date.now() - 2 * 60 * 1000).toISOString());
          
          if (data) setParticipants(data);
        }
      )
      .subscribe();

    // Initial fetch of participants
    const fetchParticipants = async () => {
      const { data } = await supabase
        .from('coding_room_participants')
        .select('id, username, last_seen_at')
        .eq('room_id', room.id)
        .gte('last_seen_at', new Date(Date.now() - 2 * 60 * 1000).toISOString());
      
      if (data) setParticipants(data);
    };
    fetchParticipants();

    // Cleanup
    return () => {
      clearInterval(heartbeat);
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [room, showUsernamePrompt, username]);

  // Handle content changes with debounce
  const handleContentChange = useCallback((newContent: string | undefined) => {
    if (!room || !newContent) return;
    
    setContent(newContent);

    // Debounce the update
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
    }, 500);
  }, [room]);

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

  // Send chat message (placeholder - would need messages table)
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      username,
      content: newMessage,
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 glass-panel border-b border-border/50 flex items-center px-4 gap-4 shrink-0">
        <Link to="/rooms">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        
        <div className="flex-1">
          <h1 className="font-cyber text-lg font-semibold text-foreground">{room.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Participants count */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/30">
            <Users className="h-4 w-4 text-neon-green" />
            <span className="font-mono text-sm">{participants.length}</span>
          </div>

          {/* Room code */}
          <Button
            variant="ghost"
            onClick={handleCopyCode}
            className="gap-2 font-mono text-sm neon-border"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {room.code}
          </Button>

          {/* Toggle chat */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className={showChat ? 'text-primary' : 'text-muted-foreground'}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-10 border-b border-border/50 flex items-center px-4 gap-2 bg-muted/20">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm text-muted-foreground">
              {room.language}
            </span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={room.language}
              value={content}
              onChange={handleContentChange}
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

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-80 border-l border-border/50 flex flex-col bg-card/50">
            {/* Participants */}
            <div className="p-3 border-b border-border/50">
              <h3 className="font-mono text-xs text-muted-foreground uppercase mb-2">
                Online ({participants.length})
              </h3>
              <div className="flex flex-wrap gap-1">
                {participants.map((p) => (
                  <span
                    key={p.id}
                    className="text-xs font-mono px-2 py-1 rounded bg-neon-green/10 text-neon-green"
                  >
                    {p.username}
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
                        <span className="font-semibold text-primary">{msg.username}</span>
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
