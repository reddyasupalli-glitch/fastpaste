import { Code2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur-sm">
      <div className="container flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
        <Code2 className="h-4 w-4" />
        <span>Developed by</span>
        <span className="font-semibold text-foreground">TRION SOLUTION PVT LTD</span>
        <span>by</span>
        <span className="font-medium text-primary">ASUREDDY</span>
      </div>
    </footer>
  );
}
