import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type StyleTheme = 'glass' | 'classic';

interface StyleThemeContextType {
  styleTheme: StyleTheme;
  setStyleTheme: (theme: StyleTheme) => void;
  toggleStyleTheme: () => void;
}

const StyleThemeContext = createContext<StyleThemeContextType | undefined>(undefined);

export function StyleThemeProvider({ children }: { children: ReactNode }) {
  const [styleTheme, setStyleTheme] = useState<StyleTheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('style-theme') as StyleTheme) || 'glass';
    }
    return 'glass';
  });

  useEffect(() => {
    localStorage.setItem('style-theme', styleTheme);
    document.documentElement.classList.remove('theme-glass', 'theme-classic');
    document.documentElement.classList.add(`theme-${styleTheme}`);
  }, [styleTheme]);

  const toggleStyleTheme = () => {
    setStyleTheme(prev => prev === 'glass' ? 'classic' : 'glass');
  };

  return (
    <StyleThemeContext.Provider value={{ styleTheme, setStyleTheme, toggleStyleTheme }}>
      {children}
    </StyleThemeContext.Provider>
  );
}

export function useStyleTheme() {
  const context = useContext(StyleThemeContext);
  if (!context) {
    throw new Error('useStyleTheme must be used within a StyleThemeProvider');
  }
  return context;
}
