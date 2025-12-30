import { useState, useEffect } from 'react';

const STORAGE_KEY = 'chat-username';

export function useUsername() {
  const [username, setUsernameState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });

  const setUsername = (name: string) => {
    const trimmed = name.trim().slice(0, 50);
    localStorage.setItem(STORAGE_KEY, trimmed);
    setUsernameState(trimmed);
  };

  const clearUsername = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsernameState(null);
  };

  return {
    username,
    setUsername,
    clearUsername,
    hasUsername: !!username,
  };
}
