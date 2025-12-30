import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BackgroundOption } from '@/hooks/useChatBackground';
import { cn } from '@/lib/utils';

interface BackgroundSelectorProps {
  currentId: string;
  options: BackgroundOption[];
  onSelect: (id: string) => void;
}

export function BackgroundSelector({ currentId, options, onSelect }: BackgroundSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Change background">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover">
        {options.map((option) => (
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
  );
}
