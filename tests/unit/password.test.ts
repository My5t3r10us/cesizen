import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('lib/auth/password', () => {
  it('hashPassword returns salt:hash hex format', () => {
    const hashed = hashPassword('Password123');
    const parts = hashed.split(':');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toMatch(/^[0-9a-f]{32}$/); // 16 bytes salt
    expect(parts[1]).toMatch(/^[0-9a-f]{128}$/); // 64 bytes hash
  });

  it('produces different hashes for the same password (random salt)', () => {
    expect(hashPassword('Password123')).not.toBe(hashPassword('Password123'));
  });

  it('verifyPassword accepts the correct password', () => {
    const hashed = hashPassword('CorrectHorseBatteryStaple1');
    expect(verifyPassword('CorrectHorseBatteryStaple1', hashed)).toBe(true);
  });

  it('verifyPassword rejects an incorrect password', () => {
    const hashed = hashPassword('Password123');
    expect(verifyPassword('Password124', hashed)).toBe(false);
    expect(verifyPassword('', hashed)).toBe(false);
  });

  it('verifyPassword is case sensitive', () => {
    const hashed = hashPassword('Password123');
    expect(verifyPassword('password123', hashed)).toBe(false);
  });
});
