import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Copy, Check, Terminal, ArrowLeft, Send, 
  MessageSquare, User, Wifi, WifiOff
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase, getSessionToken } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface RoomData {
  id: string;
  code: string;
  name: string;
  content: string;
  language: string;
  is_private: boolean;
}

interface Participant {
  username: string;
  isTyping?: boolean;
  lastActivity?: string;
}

interface ChatMessage {
  id: string;
  username: string;
  content: string;
  created_at: string;
}

const CodingRoom = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(true);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastBroadcastContent = useRef('');

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
        lastBroadcastContent.current = data.content || '';
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
    if (!room || showUsernamePrompt || !username) return;

    const sessionKey = `${getSessionToken()}-${Date.now()}`;

    // Create a unique channel for this room
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
            });
          }
        });
      });
      
      setParticipants(newParticipants);
    });

    // Handle real-time code updates via broadcast (instant, no database latency)
    channel.on('broadcast', { event: 'code-update' }, ({ payload }) => {
      if (payload.sender !== username && payload.content !== undefined) {
        // Only update if it's from another user
        setContent(payload.content);
        lastBroadcastContent.current = payload.content;
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 500);
      }
    });

    // Handle chat messages via broadcast
    channel.on('broadcast', { event: 'chat-message' }, ({ payload }) => {
      const msg: ChatMessage = {
        id: payload.id || crypto.randomUUID(),
        username: payload.username,
        content: payload.content,
        created_at: payload.created_at || new Date().toISOString(),
      };
      
      setMessages(prev => {
        // Avoid duplicates
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
        
        // Track presence
        await channel.track({
          username,
          isTyping: false,
          lastActivity: new Date().toISOString(),
        });

        // Register as participant in database (session_token set by trigger)
        try {
          await supabase
            .from('coding_room_participants')
            .insert({
              room_id: room.id,
              username,
              session_token: 'trigger-will-override', // Overwritten by trigger
            });
        } catch {
          // May fail if already exists, that's ok
        }
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setIsConnected(false);
      }
    });

    // Heartbeat for presence
    const heartbeat = setInterval(() => {
      channel.track({
        username,
        isTyping: false,
        lastActivity: new Date().toISOString(),
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

  // Handle content changes with broadcast for real-time sync
  const handleContentChange = useCallback((newContent: string | undefined) => {
    if (!room || newContent === undefined) return;
    
    setContent(newContent);

    // Broadcast to other users immediately
    if (channelRef.current && newContent !== lastBroadcastContent.current) {
      lastBroadcastContent.current = newContent;
      channelRef.current.send({
        type: 'broadcast',
        event: 'code-update',
        payload: {
          content: newContent,
          sender: username,
        },
      });
    }

    // Debounce the database update (for persistence)
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

  // Send chat message via broadcast
  const handleSendMessage = () => {
    if (!newMessage.trim() || !channelRef.current) return;
    
    const msgId = crypto.randomUUID();
    const msg: ChatMessage = {
      id: msgId,
      username,
      content: newMessage,
      created_at: new Date().toISOString(),
    };
    
    // Add locally first
    setMessages(prev => [...prev, msg]);
    
    // Broadcast to others
    channelRef.current.send({
      type: 'broadcast',
      event: 'chat-message',
      payload: {
        id: msgId,
        username,
        content: newMessage,
        created_at: msg.created_at,
      },
    });
    
    setNewMessage('');
    
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
          {/* Connection status */}
          <div className={`flex items-center gap-1 text-xs font-mono ${isConnected ? 'text-neon-green' : 'text-destructive'}`}>
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </div>
          {isSyncing && (
            <span className="text-xs font-mono text-primary animate-pulse">syncing...</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Participants count */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/30">
            <Users className="h-4 w-4 text-neon-green" />
            <span className="font-mono text-sm">{participantList.length}</span>
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
            <span className="text-xs text-muted-foreground/70 ml-auto">
              {participantList.length} collaborator{participantList.length !== 1 ? 's' : ''}
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
                Online ({participantList.length})
              </h3>
              <div className="flex flex-wrap gap-1">
                {participantList.map((p) => (
                  <span
                    key={p.username}
                    className={`text-xs font-mono px-2 py-1 rounded ${
                      p.username === username 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-neon-green/10 text-neon-green'
                    }`}
                  >
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
                        <span className={`font-semibold ${msg.username === username ? 'text-primary' : 'text-neon-cyan'}`}>
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
