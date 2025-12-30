import { Instagram } from 'lucide-react';
import fastpasteLogo from '@/assets/fastpaste-logo.png';

const INSTAGRAM_URL = 'https://www.instagram.com/trione.solutions?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur-sm">
      <div className="container flex items-center justify-center gap-3 py-3 text-sm text-muted-foreground">
        <img src={fastpasteLogo} alt="FastPaste" className="h-6 w-auto" />
        <span>Developed by</span>
        <span className="font-semibold text-foreground">TRIONE SOLUTIONS PVT LTD</span>
        <span>by</span>
        <span className="font-medium text-primary">ASUREDDY</span>
        <a 
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 flex items-center gap-1.5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 px-3 py-1 text-white transition-transform hover:scale-105"
        >
          <Instagram className="h-4 w-4" />
          <span className="text-xs font-medium">Follow</span>
        </a>
      </div>
    </footer>
  );
}
