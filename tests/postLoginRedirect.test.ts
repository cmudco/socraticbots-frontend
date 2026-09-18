// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  consumePostLoginRedirect,
  rememberPostLoginRedirect,
  voiceSignupLandingPath,
} from '@/utils/postLoginRedirect';

describe('voice sign-up landing path', () => {
  it('opens the assignment when the code unlocked exactly one', () => {
    expect(voiceSignupLandingPath([{ id: 12, name: 'Oral exam', examTitle: '' }])).toBe(
      '/voice-exams/12'
    );
  });

  it('falls back to the assignment list when several were unlocked', () => {
    expect(
      voiceSignupLandingPath([
        { id: 12, name: 'Oral exam', examTitle: '' },
        { id: 13, name: 'Reflection', examTitle: '' },
      ])
    ).toBe('/voice-exams');
  });
});

describe('post-login redirect memory', () => {
  beforeEach(() => {
    // Node's own localStorage global shadows jsdom's and silently drops writes.
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    });
  });

  it('is consumed exactly once', () => {
    rememberPostLoginRedirect('/voice-exams/12');
    expect(consumePostLoginRedirect()).toBe('/voice-exams/12');
    expect(consumePostLoginRedirect()).toBeNull();
  });

  it('never redirects off-site', () => {
    rememberPostLoginRedirect('https://evil.example/phish');
    expect(consumePostLoginRedirect()).toBeNull();
    rememberPostLoginRedirect('//evil.example');
    expect(consumePostLoginRedirect()).toBeNull();
  });
});
