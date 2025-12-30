import { useState, useEffect } from 'react';

export type BackgroundOption = {
  id: string;
  name: string;
  style: string;
  isCustom?: boolean;
  imageUrl?: string;
};

export const defaultBackgroundOptions: BackgroundOption[] = [
  { id: 'default', name: 'Default', style: 'bg-background' },
  // Gradients
  { id: 'gradient-blue', name: 'Ocean Wave', style: 'bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950' },
  { id: 'gradient-purple', name: 'Purple Mist', style: 'bg-gradient-to-br from-purple-950 via-slate-900 to-pink-950' },
  { id: 'gradient-green', name: 'Forest', style: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950' },
  { id: 'gradient-sunset', name: 'Sunset', style: 'bg-gradient-to-br from-orange-950 via-rose-950 to-purple-950' },
  { id: 'gradient-dark', name: 'Midnight', style: 'bg-gradient-to-br from-gray-950 via-slate-950 to-zinc-950' },
  { id: 'gradient-rose', name: 'Rose Gold', style: 'bg-gradient-to-br from-rose-950 via-pink-900 to-amber-950' },
  { id: 'gradient-arctic', name: 'Arctic', style: 'bg-gradient-to-br from-sky-950 via-blue-900 to-indigo-950' },
  { id: 'gradient-aurora', name: 'Aurora', style: 'bg-gradient-to-br from-green-950 via-cyan-900 to-purple-950' },
  { id: 'gradient-volcanic', name: 'Volcanic', style: 'bg-gradient-to-br from-red-950 via-orange-900 to-yellow-950' },
  // Patterns
  { id: 'pattern-dots', name: 'Dots', style: 'bg-slate-900 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]' },
  { id: 'pattern-grid', name: 'Grid', style: 'bg-slate-900 bg-[linear-gradient(rgba(51,65,85,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.3)_1px,transparent_1px)] [background-size:20px_20px]' },
  { id: 'pattern-diagonal', name: 'Diagonal', style: 'bg-slate-900 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(51,65,85,0.3)_10px,rgba(51,65,85,0.3)_20px)]' },
  { id: 'pattern-waves', name: 'Waves', style: 'bg-slate-900 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),transparent)]' },
];

const STORAGE_KEY = 'fastpaste-chat-background';
const CUSTOM_BG_KEY = 'fastpaste-custom-backgrounds';

export function useChatBackground() {
  const [backgroundId, setBackgroundId] = useState<string>('default');
  const [customBackgrounds, setCustomBackgrounds] = useState<BackgroundOption[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setBackgroundId(saved);
    }
    
    const savedCustom = localStorage.getItem(CUSTOM_BG_KEY);
    if (savedCustom) {
      try {
        setCustomBackgrounds(JSON.parse(savedCustom));
      } catch (e) {
        console.error('Failed to parse custom backgrounds:', e);
      }
    }
  }, []);

  const setBackground = (id: string) => {
    setBackgroundId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const addCustomBackground = (name: string, imageUrl: string) => {
    const newBg: BackgroundOption = {
      id: `custom-${Date.now()}`,
      name,
      style: '',
      isCustom: true,
      imageUrl,
    };
    const updated = [...customBackgrounds, newBg];
    setCustomBackgrounds(updated);
    localStorage.setItem(CUSTOM_BG_KEY, JSON.stringify(updated));
    setBackground(newBg.id);
    return newBg.id;
  };

  const removeCustomBackground = (id: string) => {
    const updated = customBackgrounds.filter(bg => bg.id !== id);
    setCustomBackgrounds(updated);
    localStorage.setItem(CUSTOM_BG_KEY, JSON.stringify(updated));
    if (backgroundId === id) {
      setBackground('default');
    }
  };

  const backgroundOptions = [...defaultBackgroundOptions, ...customBackgrounds];
  const currentBackground = backgroundOptions.find(bg => bg.id === backgroundId) || defaultBackgroundOptions[0];

  return {
    backgroundId,
    setBackground,
    currentBackground,
    backgroundOptions,
    customBackgrounds,
    addCustomBackground,
    removeCustomBackground,
  };
}
