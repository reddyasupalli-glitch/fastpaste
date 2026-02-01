import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Globe, Code2, Users, Search, TrendingUp, Clock, 
  Eye, Terminal, ArrowRight, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Paste {
  id: string;
  title: string | null;
  language: string;
  views: number;
  created_at: string;
  burn_after_read: boolean;
}

interface Room {
  id: string;
  code: string;
  name: string;
  language: string;
  last_activity_at: string;
}

const Explore = () => {
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [recentPastes, setRecentPastes] = useState<Paste[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trending pastes (most views)
        const { data: trendingData } = await supabase
          .from('pastes')
          .select('id, title, language, views, created_at, burn_after_read')
          .eq('visibility', 'public')
          .order('views', { ascending: false })
          .limit(10);

        // Fetch recent pastes
        const { data: recentData } = await supabase
          .from('pastes')
          .select('id, title, language, views, created_at, burn_after_read')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch active rooms
        const { data: roomsData } = await supabase
          .from('coding_rooms')
          .select('id, code, name, language, last_activity_at')
          .eq('is_private', false)
          .order('last_activity_at', { ascending: false })
          .limit(10);

        setPastes(trendingData || []);
        setRecentPastes(recentData || []);
        setRooms(roomsData || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter pastes by search query
  const filteredPastes = pastes.filter(p => 
    !searchQuery || 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecentPastes = recentPastes.filter(p => 
    !searchQuery || 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRooms = rooms.filter(r => 
    !searchQuery || 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-animate" />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(hsl(var(--neon-green) / 0.03) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--neon-green) / 0.03) 1px, transparent 1px)
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
              <Globe className="h-8 w-8 text-neon-green" />
              <h1 className="font-cyber text-3xl font-bold text-foreground">EXPLORE</h1>
            </div>
            <p className="text-muted-foreground font-mono text-sm">
              {'>'} Discover trending pastes and active coding rooms
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or language..."
                className="cyber-input pl-12 h-12 text-lg"
              />
            </div>
          </motion.div>

          {loading ? (
            <div className="glass-panel p-8 text-center">
              <Terminal className="h-8 w-8 text-primary animate-pulse mx-auto mb-4" />
              <p className="font-mono text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <Tabs defaultValue="trending" className="space-y-6">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 glass-panel">
                <TabsTrigger value="trending" className="font-mono gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="recent" className="font-mono gap-2">
                  <Clock className="h-4 w-4" />
                  Recent
                </TabsTrigger>
                <TabsTrigger value="rooms" className="font-mono gap-2">
                  <Users className="h-4 w-4" />
                  Rooms
                </TabsTrigger>
              </TabsList>

              {/* Trending Pastes */}
              <TabsContent value="trending">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {filteredPastes.length === 0 ? (
                    <div className="glass-panel p-8 text-center">
                      <Code2 className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                      <p className="font-mono text-muted-foreground">No pastes found</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredPastes.map((paste, i) => (
                        <PasteCard key={paste.id} paste={paste} index={i} />
                      ))}
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* Recent Pastes */}
              <TabsContent value="recent">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {filteredRecentPastes.length === 0 ? (
                    <div className="glass-panel p-8 text-center">
                      <Code2 className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                      <p className="font-mono text-muted-foreground">No recent pastes</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredRecentPastes.map((paste, i) => (
                        <PasteCard key={paste.id} paste={paste} index={i} />
                      ))}
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* Active Rooms */}
              <TabsContent value="rooms">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {filteredRooms.length === 0 ? (
                    <div className="glass-panel p-8 text-center">
                      <Users className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                      <p className="font-mono text-muted-foreground mb-2">No active rooms</p>
                      <Link to="/rooms">
                        <Button className="cyber-button">
                          <span className="font-cyber">CREATE_ROOM</span>
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {filteredRooms.map((room, i) => (
                        <RoomCard key={room.id} room={room} index={i} />
                      ))}
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

// Paste card component
const PasteCard = ({ paste, index }: { paste: Paste; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <Link to={`/paste/${paste.id}`}>
      <div className="glass-panel p-4 hover:border-neon-purple/50 transition-all group">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-neon-purple" />
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {paste.title || 'Untitled'}
            </h3>
          </div>
          {paste.burn_after_read && (
            <Flame className="h-4 w-4 text-destructive" />
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted">
            {paste.language}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {paste.views}
          </span>
          <span>
            {formatDistanceToNow(new Date(paste.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

// Room card component
const RoomCard = ({ room, index }: { room: Room; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <Link to={`/room/${room.code}`}>
      <div className="glass-panel p-4 hover:border-neon-pink/50 transition-all group">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-neon-pink" />
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {room.name}
            </h3>
          </div>
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
            {room.code}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted">
            {room.language}
          </span>
          <span>
            Active {formatDistanceToNow(new Date(room.last_activity_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default Explore;
