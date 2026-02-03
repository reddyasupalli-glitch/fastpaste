import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LivePreviewProps {
  code: string;
  language: string;
  onClose: () => void;
}

const generateHTMLPreview = (code: string, language: string): string => {
  // If it's already HTML, just use it
  if (language === 'html') {
    return code;
  }

  // If it's CSS, wrap in style tags
  if (language === 'css' || language === 'scss') {
    return `<!DOCTYPE html>
<html>
<head>
  <style>${code}</style>
</head>
<body>
  <div class="preview-container">
    <h1>CSS Preview</h1>
    <p>Add HTML elements to see your styles applied.</p>
    <button class="btn">Sample Button</button>
    <div class="box">Sample Box</div>
  </div>
</body>
</html>`;
  }

  // If it's JavaScript/TypeScript, wrap in script tags
  if (language === 'javascript' || language === 'typescript') {
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: #0a0a0f;
      color: #00fff0;
      font-family: 'JetBrains Mono', monospace;
      padding: 20px;
    }
    #output {
      background: #111;
      border: 1px solid #333;
      padding: 16px;
      border-radius: 8px;
      min-height: 100px;
      white-space: pre-wrap;
      font-size: 14px;
    }
    .error { color: #ff4757; }
    .log { color: #00fff0; }
    .warn { color: #ffa502; }
  </style>
</head>
<body>
  <h3 style="margin-bottom: 16px;">Console Output:</h3>
  <div id="output"></div>
  <script>
    const output = document.getElementById('output');
    const originalConsole = { ...console };
    
    function appendOutput(type, ...args) {
      const text = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      const line = document.createElement('div');
      line.className = type;
      line.textContent = text;
      output.appendChild(line);
    }
    
    console.log = (...args) => appendOutput('log', ...args);
    console.error = (...args) => appendOutput('error', 'Error:', ...args);
    console.warn = (...args) => appendOutput('warn', 'Warning:', ...args);
    
    try {
      ${code}
    } catch (e) {
      console.error(e.message);
    }
  </script>
</body>
</html>`;
  }

  // Default: show raw code
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: #0a0a0f;
      color: #888;
      font-family: 'JetBrains Mono', monospace;
      padding: 20px;
    }
  </style>
</head>
<body>
  <p>Live preview not available for ${language}.</p>
</body>
</html>`;
};

export const LivePreview = ({ code, language, onClose }: LivePreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);

  const refreshPreview = useCallback(() => {
    setKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!iframeRef.current) return;

    const html = generateHTMLPreview(code, language);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;

    return () => URL.revokeObjectURL(url);
  }, [code, language, key]);

  const isPreviewSupported = ['html', 'css', 'scss', 'javascript', 'typescript'].includes(language);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex flex-col bg-card/90 border-l border-border/50 ${
        isFullscreen ? 'fixed inset-0 z-50' : 'w-96'
      }`}
    >
      {/* Header */}
      <div className="h-10 border-b border-border/50 flex items-center justify-between px-3 bg-muted/30">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-neon-green" />
          <span className="font-mono text-xs text-muted-foreground uppercase">
            Live Preview
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={refreshPreview}
            title="Refresh"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={onClose}
            title="Close preview"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Preview content */}
      <div className="flex-1 bg-background/80">
        {isPreviewSupported ? (
          <iframe
            ref={iframeRef}
            key={key}
            className="w-full h-full border-0"
            title="Live Preview"
            sandbox="allow-scripts"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
            <p>Preview not available for {language}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LivePreview;
