interface GroupHistoryItem {
  code: string;
  joinedAt: string;
}

const STORAGE_KEY = 'chat-group-history';
const MAX_HISTORY = 10;

export function getGroupHistory(): GroupHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToGroupHistory(code: string): void {
  const history = getGroupHistory();
  
  // Remove if already exists
  const filtered = history.filter((item) => item.code !== code);
  
  // Add to beginning
  const updated = [
    { code, joinedAt: new Date().toISOString() },
    ...filtered,
  ].slice(0, MAX_HISTORY);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function removeFromGroupHistory(code: string): void {
  const history = getGroupHistory();
  const filtered = history.filter((item) => item.code !== code);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearGroupHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
