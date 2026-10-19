import { describe, it, expect } from 'vitest';
import { waitForOwaAccessToken } from './browser-login.js';

function page(evaluate: () => Promise<boolean>) {
  return { isClosed: () => false, evaluate };
}

describe('waitForOwaAccessToken', () => {
  it('keeps polling when a page navigation rejects the check', async () => {
    let calls = 0;
    const login = page(async () => {
      calls += 1;
      if (calls === 1) throw new Error('Execution context was destroyed');
      return false;
    });
    const outlook = page(async () => calls >= 2);
    const found = await waitForOwaAccessToken(
      { pages: () => [login, outlook] },
      1_000,
      1,
    );
    expect(found).toBe(outlook);
  });

  it('returns null when no page has a token before the deadline', async () => {
    const login = page(async () => false);
    const found = await waitForOwaAccessToken({ pages: () => [login] }, 30, 1);
    expect(found).toBeNull();
  });
});
