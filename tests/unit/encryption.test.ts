import { describe, it, expect } from 'vitest';
import { encryptNote, decryptNote } from '@/lib/security/encryption';

describe('lib/security/encryption', () => {
  it('round-trips a plaintext note', async () => {
    const plain = 'Aujourd\'hui je me sens bien.';
    const enc = await encryptNote(plain);
    const dec = await decryptNote(enc);
    expect(dec).toBe(plain);
  });

  it('returns empty string for empty input', async () => {
    expect(await encryptNote('')).toBe('');
    expect(await decryptNote('')).toBe('');
  });

  it('produces different ciphertexts for the same plaintext (random IV)', async () => {
    const plain = 'Secret note';
    const a = await encryptNote(plain);
    const b = await encryptNote(plain);
    expect(a).not.toBe(b);
  });

  it('encrypted format is iv:authTag:cipher (hex)', async () => {
    const enc = await encryptNote('hello');
    const parts = enc.split(':');
    expect(parts).toHaveLength(3);
    parts.forEach((p) => expect(p).toMatch(/^[0-9a-f]+$/));
    expect(parts[0]).toHaveLength(32); // 16-byte IV
    expect(parts[1]).toHaveLength(32); // 16-byte auth tag
  });

  it('throws on tampered ciphertext', async () => {
    const enc = await encryptNote('hello world');
    const [iv, tag, cipher] = enc.split(':');
    const tampered = `${iv}:${tag}:${cipher.replace(/.$/, (c) =>
      c === '0' ? '1' : '0'
    )}`;
    await expect(decryptNote(tampered)).rejects.toThrow();
  });

  it('throws on invalid format', async () => {
    await expect(decryptNote('not-valid-format')).rejects.toThrow(
      /Invalid encrypted data format/
    );
  });

  it('handles unicode and long content', async () => {
    const plain = '🌿 émotion intense ' + 'x'.repeat(1500);
    const dec = await decryptNote(await encryptNote(plain));
    expect(dec).toBe(plain);
  });

  it('throws when ENCRYPTION_KEY is not set', async () => {
    const saved = process.env.ENCRYPTION_KEY;
    delete process.env.ENCRYPTION_KEY;
    await expect(encryptNote('test')).rejects.toThrow('ENCRYPTION_KEY environment variable is not set');
    process.env.ENCRYPTION_KEY = saved;
  });
});
