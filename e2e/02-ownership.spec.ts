import { test, expect } from '@playwright/test';
import { ADMIN, EDITOR, API, getToken, newApi } from './helpers';

test.describe('Ownership checks', () => {
  test('editor cannot update foreign album (Fix 3)', async () => {
    const api = await newApi();
    const adminTok = await getToken(api, ADMIN);
    const listRes = await api.get(`${API}/api/albums?eagerload=true&page=0&size=1`, {
      headers: { Authorization: `Bearer ${adminTok}` },
    });
    expect(listRes.status()).toBe(200);
    const albums = await listRes.json();
    if (albums.length === 0) {
      test.skip(true, 'No albums to test against');
      return;
    }
    const target = albums[0];

    const editorTok = await getToken(api, EDITOR);
    const res = await api.put(`${API}/api/albums/${target.id}`, {
      headers: { Authorization: `Bearer ${editorTok}`, 'Content-Type': 'application/json' },
      data: { ...target, title: 'hijacked-by-editor1' },
    });
    expect(res.status(), 'editor should be forbidden from foreign album').toBe(400);
    const body = await res.json();
    expect(JSON.stringify(body)).toContain('forbidden');
  });

  test('editor cannot delete foreign song (Fix 5)', async () => {
    const api = await newApi();
    const adminTok = await getToken(api, ADMIN);
    const songsRes = await api.get(`${API}/api/songs/admin?page=0&size=1`, {
      headers: { Authorization: `Bearer ${adminTok}` },
    });
    expect(songsRes.status()).toBe(200);
    const songs = await songsRes.json();
    if (songs.length === 0) {
      test.skip(true, 'No songs to test against');
      return;
    }
    const target = songs[0];

    const editorTok = await getToken(api, EDITOR);
    const res = await api.delete(`${API}/api/songs/${target.id}`, {
      headers: { Authorization: `Bearer ${editorTok}` },
    });
    // Delete with no ownership match returns no-op (early return) or 400 forbidden depending on impl
    expect([204, 400]).toContain(res.status());
    if (res.status() === 204) {
      // Confirm song still exists
      const check = await api.get(`${API}/api/songs/${target.id}`, {
        headers: { Authorization: `Bearer ${adminTok}` },
      });
      expect(check.status(), 'song should still exist after foreign editor delete attempt').toBe(200);
    }
  });

  test('admin can update any album', async () => {
    const api = await newApi();
    const adminTok = await getToken(api, ADMIN);
    const listRes = await api.get(`${API}/api/albums?eagerload=true&page=0&size=1`, {
      headers: { Authorization: `Bearer ${adminTok}` },
    });
    const albums = await listRes.json();
    if (albums.length === 0) {
      test.skip(true, 'No albums');
      return;
    }
    const target = albums[0];

    const res = await api.put(`${API}/api/albums/${target.id}`, {
      headers: { Authorization: `Bearer ${adminTok}`, 'Content-Type': 'application/json' },
      data: { ...target, title: target.title },
    });
    expect(res.status()).toBe(200);
  });
});
