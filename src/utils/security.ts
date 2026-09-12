/**
 * Cryptographic hashing utility using native browser SubtleCrypto (SHA-256)
 * This ensures that even if anyone inspects the JavaScript bundle or DevTools,
 * they only ever see a 1-way SHA-256 cryptographic hash digest, NOT your plaintext password.
 */

export async function hashPassword(plainText: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(plainText.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Pre-computed cryptographic SHA-256 hash
 * Plaintext password is NEVER written or stored anywhere in the client code!
 */
export const DEFAULT_ADMIN_HASH = '6bbbe260e9e6db658f2adb8bd5266fab6e65ed7663bfa159e3fe106435ce9b97';
