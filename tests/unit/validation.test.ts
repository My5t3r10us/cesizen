import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  passwordChangeSchema,
  deleteAccountSchema,
  entrySchema,
  articleSchema,
} from '@/lib/validation/schemas';

describe('registerSchema', () => {
  const valid = {
    email: 'user@example.com',
    password: 'Password1',
    confirmPassword: 'Password1',
    nom: 'Doe',
    prenom: 'Jane',
  };

  it('accepts valid input', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid email', () => {
    const r = registerSchema.safeParse({ ...valid, email: 'nope' });
    expect(r.success).toBe(false);
  });

  it('requires uppercase, lowercase, digit, and 8+ chars', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'short1A', confirmPassword: 'short1A' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, password: 'alllower1', confirmPassword: 'alllower1' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, password: 'ALLUPPER1', confirmPassword: 'ALLUPPER1' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, password: 'NoDigitsHere', confirmPassword: 'NoDigitsHere' }).success).toBe(false);
  });

  it('rejects mismatched confirmPassword', () => {
    const r = registerSchema.safeParse({ ...valid, confirmPassword: 'Different1' });
    expect(r.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts email + password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });
  it('rejects empty values', () => {
    expect(loginSchema.safeParse({ email: '', password: '' }).success).toBe(false);
  });
});

describe('profileUpdateSchema', () => {
  it('accepts valid profile data', () => {
    expect(profileUpdateSchema.safeParse({
      email: 'profile@example.com',
      nom: 'Doe',
      prenom: 'Jane',
      currentPassword: 'Password123',
    }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(profileUpdateSchema.safeParse({
      email: 'bad',
      nom: 'Doe',
      prenom: 'Jane',
    }).success).toBe(false);
  });
});

describe('passwordChangeSchema', () => {
  const valid = {
    currentPassword: 'Password123',
    newPassword: 'NewPassword123',
    confirmNewPassword: 'NewPassword123',
  };

  it('accepts valid password change data', () => {
    expect(passwordChangeSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects weak new password', () => {
    expect(passwordChangeSchema.safeParse({
      ...valid,
      newPassword: 'weak',
      confirmNewPassword: 'weak',
    }).success).toBe(false);
  });

  it('rejects mismatched confirmation', () => {
    expect(passwordChangeSchema.safeParse({
      ...valid,
      confirmNewPassword: 'Different123',
    }).success).toBe(false);
  });
});

describe('deleteAccountSchema', () => {
  it('requires current password', () => {
    expect(deleteAccountSchema.safeParse({ currentPassword: 'Password123' }).success).toBe(true);
    expect(deleteAccountSchema.safeParse({ currentPassword: '' }).success).toBe(false);
  });
});

describe('entrySchema', () => {
  it('accepts intensity 1..10', () => {
    for (const i of [1, 5, 10]) {
      expect(entrySchema.safeParse({ emotionId: 1, intensity: i }).success).toBe(true);
    }
  });
  it('rejects intensity out of range', () => {
    expect(entrySchema.safeParse({ emotionId: 1, intensity: 0 }).success).toBe(false);
    expect(entrySchema.safeParse({ emotionId: 1, intensity: 11 }).success).toBe(false);
  });
  it('rejects emotionId <= 0', () => {
    expect(entrySchema.safeParse({ emotionId: 0, intensity: 5 }).success).toBe(false);
  });
  it('rejects note > 2000 chars', () => {
    const r = entrySchema.safeParse({ emotionId: 1, intensity: 5, note: 'x'.repeat(2001) });
    expect(r.success).toBe(false);
  });
  it('accepts optional note + tags', () => {
    expect(entrySchema.safeParse({
      emotionId: 1, intensity: 5, note: 'ok', contextTags: ['travail'],
    }).success).toBe(true);
  });
});

describe('articleSchema', () => {
  it('rejects invalid slug', () => {
    expect(articleSchema.safeParse({
      title: 't', slug: 'Bad Slug!', content: 'x', isPublished: false,
    }).success).toBe(false);
  });
  it('accepts kebab-case slug', () => {
    expect(articleSchema.safeParse({
      title: 't', slug: 'mon-super-article-2', content: 'x', isPublished: true,
    }).success).toBe(true);
  });
});
