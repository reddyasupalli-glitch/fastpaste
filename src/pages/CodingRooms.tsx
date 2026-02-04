import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Plus, Code2, Lock, Globe, Terminal, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Navbar } from '@/components/layout/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface CodingRoom {
  id: string;
  code: string;
  name: string;
  is_private: boolean;
  language: string;
  created_at: string;
  last_activity_at: string;
}

// Generate a random 6-character room code (numbers only)
const generateRoomCode = () => {
  const chars = '0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const CodingRooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<CodingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  
  // Create form state
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  // Fetch public rooms using secure function
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data, error } = await supabase.rpc('list_public_rooms', { limit_count: 20 });

        if (error) throw error;
        setRooms((data || []).map((r: any) => ({
          ...r,
          is_private: false,
        })));
      } catch (err: any) {
        console.error('Failed to fetch rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleCreate = async () => {
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    setCreating(true);

    try {
      const code = generateRoomCode();

      // Session token is automatically set by database trigger
      const { data, error } = await supabase
        .from('coding_rooms')
        .insert({
          code,
          name: roomName.trim(),
          is_private: isPrivate,
          language: selectedLanguage,
        })
        .select('code')
        .single();

      if (error) throw error;

      toast.success('Room created!');
      navigate(`/room/${data.code}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }
    navigate(`/room/${joinCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-animate" />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(hsl(var(--neon-pink) / 0.03) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--neon-pink) / 0.03) 1px, transparent 1px)
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
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Users className="h-8 w-8 text-neon-pink" />
              <h1 className="font-cyber text-3xl font-bold text-foreground">LIVE_ROOMS</h1>
            </div>
            <p className="text-muted-foreground font-mono text-sm">
              {'>'} Real-time collaborative coding with integrated chat
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {/* Join Room */}
            <div className="glass-panel p-6">
              <h3 className="font-cyber text-lg font-semibold mb-4 flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                JOIN_ROOM
              </h3>
              <div className="flex gap-2">
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  className="cyber-input font-mono uppercase"
                  maxLength={6}
                />
                <Button onClick={handleJoin} className="cyber-button px-6">
                  <span className="font-cyber">JOIN</span>
                </Button>
              </div>
            </div>

            {/* Create Room */}
            <div className="glass-panel p-6">
              <h3 className="font-cyber text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-neon-pink" />
                CREATE_ROOM
              </h3>
              {!showCreateForm ? (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full cyber-button neon-border-pink"
                >
                  <span className="font-cyber">NEW_ROOM</span>
                </Button>
              ) : (
                <div className="space-y-4">
                  <Input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Room name"
                    className="cyber-input"
                    maxLength={50}
                  />
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      {isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                      <Label className="font-mono text-sm">Private room</Label>
                    </div>
                    <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={creating}
                      className="flex-1 cyber-button"
                    >
                      <span className="font-cyber">{creating ? 'CREATING...' : 'CREATE'}</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Public Rooms */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-cyber text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-neon-green" />
              PUBLIC_ROOMS
            </h3>

            {loading ? (
              <div className="glass-panel p-8 text-center">
                <Terminal className="h-8 w-8 text-primary animate-pulse mx-auto mb-4" />
                <p className="font-mono text-muted-foreground">Loading rooms...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="glass-panel p-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <p className="font-mono text-muted-foreground mb-2">No active public rooms</p>
                <p className="text-sm text-muted-foreground/70">Create one to get started!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {rooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="glass-panel p-4 hover:border-neon-pink/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/room/${room.code}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{room.name}</h4>
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                        {room.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Code2 className="h-3 w-3" />
                        {room.language}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(room.last_activity_at), { addSuffix: true })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CodingRooms;
