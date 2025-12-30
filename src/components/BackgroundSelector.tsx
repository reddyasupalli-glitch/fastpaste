import { useState } from 'react';
import { Palette, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { BackgroundOption } from '@/hooks/useChatBackground';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BackgroundSelectorProps {
  currentId: string;
  options: BackgroundOption[];
  onSelect: (id: string) => void;
  onAddCustom: (name: string, imageUrl: string) => string;
  onRemoveCustom: (id: string) => void;
}

export function BackgroundSelector({ 
  currentId, 
  options, 
  onSelect, 
  onAddCustom,
  onRemoveCustom 
}: BackgroundSelectorProps) {
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateBackground = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Please enter a prompt',
        description: 'Describe the background you want to generate',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-background', {
        body: { prompt: prompt.trim() },
      });

      if (error) throw error;
      
      if (data?.imageUrl) {
        onAddCustom(prompt.trim().slice(0, 20) + '...', data.imageUrl);
        toast({
          title: 'Background generated!',
          description: 'Your custom background has been applied',
        });
        setShowAiDialog(false);
        setPrompt('');
      } else {
        throw new Error('No image received');
      }
    } catch (error) {
      console.error('Error generating background:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Failed to generate background',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const presetOptions = options.filter(o => !o.isCustom);
  const customOptions = options.filter(o => o.isCustom);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="Change background">
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto bg-popover">
          <DropdownMenuItem
            onClick={() => setShowAiDialog(true)}
            className="flex items-center gap-3 cursor-pointer text-primary"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate with AI</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {customOptions.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Custom Backgrounds
              </div>
              {customOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => onSelect(option.id)}
                  className={cn(
                    'flex items-center gap-3 cursor-pointer',
                    currentId === option.id && 'bg-accent'
                  )}
                >
                  <div 
                    className="h-6 w-6 rounded-md border border-border flex-shrink-0 bg-cover bg-center"
                    style={option.imageUrl ? { backgroundImage: `url(${option.imageUrl})` } : undefined}
                  />
                  <span className="flex-1 truncate">{option.name}</span>
                  {currentId === option.id && (
                    <span className="text-primary">✓</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCustom(option.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Presets
          </div>
          {presetOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                'flex items-center gap-3 cursor-pointer',
                currentId === option.id && 'bg-accent'
              )}
            >
              <div 
                className={cn(
                  'h-6 w-6 rounded-md border border-border flex-shrink-0',
                  option.style
                )} 
              />
              <span>{option.name}</span>
              {currentId === option.id && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate AI Background
            </DialogTitle>
            <DialogDescription>
              Describe the background you want. AI will create a unique abstract background for your chat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="e.g., cosmic nebula with purple and blue hues"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerateBackground()}
            />
            <div className="flex flex-wrap gap-2">
              {['Starry night sky', 'Ocean waves', 'Northern lights', 'Geometric patterns'].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(suggestion)}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
            <Button 
              onClick={handleGenerateBackground} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Background
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
