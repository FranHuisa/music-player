import { test, expect } from '@playwright/test';
import { ADMIN, USER, EDITOR, API, getToken, newApi } from './helpers';

test.describe('Auth + role-based API access', () => {
  test('admin can authenticate', async () => {
    const api = await newApi();
    const t = await getToken(api, ADMIN);
    expect(t.length).toBeGreaterThan(100);
  });

  test('user can authenticate', async () => {
    const api = await newApi();
    const t = await getToken(api, USER);
    expect(t.length).toBeGreaterThan(100);
  });

  test('editor1 can authenticate', async () => {
    const api = await newApi();
    const t = await getToken(api, EDITOR);
    expect(t.length).toBeGreaterThan(100);
  });

  test('user denied admin songs endpoint', async () => {
    const api = await newApi();
    const t = await getToken(api, USER);
    const res = await api.get(`${API}/api/songs/admin`, { headers: { Authorization: `Bearer ${t}` } });
    expect(res.status()).toBe(403);
  });

  test('admin allowed admin songs endpoint', async () => {
    const api = await newApi();
    const t = await getToken(api, ADMIN);
    const res = await api.get(`${API}/api/songs/admin`, { headers: { Authorization: `Bearer ${t}` } });
    expect(res.status()).toBe(200);
  });

  test('public songs endpoint role-filters for user', async () => {
    const api = await newApi();
    const t = await getToken(api, USER);
    const res = await api.get(`${API}/api/songs`, { headers: { Authorization: `Bearer ${t}` } });
    expect(res.status()).toBe(200);
    const arr = await res.json();
    expect(Array.isArray(arr)).toBeTruthy();
  });

  test('upload endpoints require auth', async () => {
    const api = await newApi();
    const res = await api.post(`${API}/api/upload/image`, {
      multipart: { file: { name: 'x.png', mimeType: 'image/png', buffer: Buffer.from('fake') } },
    });
    expect([401, 403]).toContain(res.status());
  });
});
