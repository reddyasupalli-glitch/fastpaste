import { useCallback, useRef, useEffect } from 'react';

// Create a simple notification sound using Web Audio API
const createNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  return () => {
    // Resume context if suspended (needed for some browsers)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Pleasant notification tone
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    oscillator.type = 'sine';
    
    // Quick fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  };
};

export function useNotificationSound() {
  const playSound = useRef<(() => void) | null>(null);
  const isEnabledRef = useRef(true);
  const lastPlayedRef = useRef(0);
  const MIN_INTERVAL = 500; // Minimum 500ms between sounds to avoid spam

  useEffect(() => {
    // Initialize the sound player on mount
    try {
      playSound.current = createNotificationSound();
    } catch (err) {
      console.warn('Web Audio API not supported');
    }
  }, []);

  const play = useCallback(() => {
    if (!isEnabledRef.current || !playSound.current) return;
    
    const now = Date.now();
    if (now - lastPlayedRef.current < MIN_INTERVAL) return;
    
    try {
      playSound.current();
      lastPlayedRef.current = now;
    } catch (err) {
      console.warn('Failed to play notification sound');
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  return { play, setEnabled };
}
