export function generateGroupCode(): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}

// Simple password hashing for client-side (not cryptographically secure, but sufficient for room access)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}