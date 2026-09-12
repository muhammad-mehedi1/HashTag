/**
 * RFC 6238 / RFC 4226 Time-based One-Time Password (TOTP) generator
 * Uses Web Crypto API HMAC-SHA1
 */

// Base32 decoding
function base32ToBytes(base32: string): Uint8Array {
  const cleanBase32 = base32.replace(/[\s=-]/g, '').toUpperCase();
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleanBase32.length; i++) {
    const char = cleanBase32[i];
    const val = alphabet.indexOf(char);
    if (val === -1) continue;

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

export async function generateTOTP(secret: string, timeStepSeconds: number = 30): Promise<string> {
  if (!secret || secret.trim() === '') {
    return '------';
  }

  try {
    const keyBytes = base32ToBytes(secret);
    if (keyBytes.length === 0) {
      return '------';
    }

    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / timeStepSeconds);

    // Convert counter to 8-byte big-endian buffer
    const counterBytes = new Uint8Array(8);
    let tempCounter = counter;
    for (let i = 7; i >= 0; i--) {
      counterBytes[i] = tempCounter & 0xff;
      tempCounter = Math.floor(tempCounter / 256);
    }

    const key = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );

    const signature = await window.crypto.subtle.sign('HMAC', key, counterBytes);
    const hmacResult = new Uint8Array(signature);

    // Dynamic truncation
    const offset = hmacResult[hmacResult.length - 1] & 0x0f;
    const binary =
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  } catch (err) {
    console.error('Failed to generate TOTP:', err);
    return '------';
  }
}

export function getRemainingSeconds(timeStepSeconds: number = 30): number {
  const epoch = Math.floor(Date.now() / 1000);
  return timeStepSeconds - (epoch % timeStepSeconds);
}
