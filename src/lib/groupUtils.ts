export function generateGroupCode(): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}

// Password hashing is now done server-side via edge function using bcrypt
// This function is kept for backward compatibility but should not be used for new rooms
// New rooms should call the create-room edge function which handles hashing securely
export async function hashPasswordLegacy(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}