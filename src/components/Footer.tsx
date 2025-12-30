import fastpasteLogo from '@/assets/fastpaste-logo.png';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur-sm">
      <div className="container flex items-center justify-center gap-3 py-3 text-sm text-muted-foreground">
        <img src={fastpasteLogo} alt="FastPaste" className="h-6 w-auto" />
        <span>Developed by</span>
        <span className="font-semibold text-foreground">TRIONE SOLUTIONS PVT LTD</span>
        <span>by</span>
        <span className="font-medium text-primary">ASUREDDY</span>
      </div>
    </footer>
  );
}
