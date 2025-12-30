import { useState, useEffect } from 'react';

export type BackgroundOption = {
  id: string;
  name: string;
  style: string;
};

export const backgroundOptions: BackgroundOption[] = [
  { id: 'default', name: 'Default', style: 'bg-background' },
  { id: 'gradient-blue', name: 'Ocean Wave', style: 'bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950' },
  { id: 'gradient-purple', name: 'Purple Mist', style: 'bg-gradient-to-br from-purple-950 via-slate-900 to-pink-950' },
  { id: 'gradient-green', name: 'Forest', style: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950' },
  { id: 'gradient-sunset', name: 'Sunset', style: 'bg-gradient-to-br from-orange-950 via-rose-950 to-purple-950' },
  { id: 'gradient-dark', name: 'Midnight', style: 'bg-gradient-to-br from-gray-950 via-slate-950 to-zinc-950' },
  { id: 'pattern-dots', name: 'Dots', style: 'bg-slate-900 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]' },
  { id: 'pattern-grid', name: 'Grid', style: 'bg-slate-900 bg-[linear-gradient(rgba(51,65,85,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.3)_1px,transparent_1px)] [background-size:20px_20px]' },
];

const STORAGE_KEY = 'fastpaste-chat-background';

export function useChatBackground() {
  const [backgroundId, setBackgroundId] = useState<string>('default');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setBackgroundId(saved);
    }
  }, []);

  const setBackground = (id: string) => {
    setBackgroundId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const currentBackground = backgroundOptions.find(bg => bg.id === backgroundId) || backgroundOptions[0];

  return {
    backgroundId,
    setBackground,
    currentBackground,
    backgroundOptions,
  };
}
