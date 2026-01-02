import { Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStyleTheme } from "@/contexts/StyleThemeContext";

export function StyleThemeToggle() {
  const { styleTheme, toggleStyleTheme } = useStyleTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleStyleTheme}
      className="h-9 gap-2 px-3"
    >
      {styleTheme === 'glass' ? (
        <>
          <Sparkles className="h-4 w-4" />
          <span className="text-xs">Glass</span>
        </>
      ) : (
        <>
          <Square className="h-4 w-4" />
          <span className="text-xs">Classic</span>
        </>
      )}
    </Button>
  );
}
