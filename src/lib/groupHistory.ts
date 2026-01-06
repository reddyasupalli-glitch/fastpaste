export interface GroupHistoryItem {
  code: string;
  joinedAt: string;
  type: 'created' | 'joined';
  customName?: string;
  creatorUsername?: string;
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

export function addToGroupHistory(code: string, type: 'created' | 'joined', creatorUsername?: string): void {
  const history = getGroupHistory();
  
  // Check if already exists and preserve custom name and creator
  const existing = history.find((item) => item.code === code);
  const customName = existing?.customName;
  const existingCreator = existing?.creatorUsername;
  
  // Remove if already exists
  const filtered = history.filter((item) => item.code !== code);
  
  // Add to beginning - preserve creator if already known
  const updated = [
    { code, joinedAt: new Date().toISOString(), type, customName, creatorUsername: creatorUsername || existingCreator },
    ...filtered,
  ].slice(0, MAX_HISTORY);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getCreatorUsername(code: string): string | undefined {
  const history = getGroupHistory();
  const item = history.find((h) => h.code === code);
  return item?.creatorUsername;
}

export function updateGroupName(code: string, customName: string): void {
  const history = getGroupHistory();
  const updated = history.map((item) => 
    item.code === code ? { ...item, customName: customName.trim() || undefined } : item
  );
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
