import { test, expect } from '@playwright/test';
import { ADMIN, USER, API, getToken, newApi } from './helpers';

test.describe('Playlist flow (cherry-picked Fran feature)', () => {
  test('user can create + list playlist via API', async () => {
    const api = await newApi();
    const t = await getToken(api, USER);

    const create = await api.post(`${API}/api/playlists`, {
      headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
      data: { name: 'E2E test playlist', description: 'created by playwright', isPublic: false, createdAt: new Date().toISOString() },
    });
    expect(create.status(), `create: ${create.status()}`).toBe(201);
    const created = await create.json();
    expect(created.id).toBeTruthy();

    const listMine = await api.get(`${API}/api/playlists/my`, { headers: { Authorization: `Bearer ${t}` } });
    expect(listMine.status()).toBe(200);
    const mine = await listMine.json();
    expect(Array.isArray(mine)).toBeTruthy();
    expect(mine.find((p: { id: number }) => p.id === created.id)).toBeTruthy();

    await api.delete(`${API}/api/playlists/${created.id}`, { headers: { Authorization: `Bearer ${t}` } });
  });

  test('add song to playlist endpoint exists', async () => {
    const api = await newApi();
    const userTok = await getToken(api, USER);
    const adminTok = await getToken(api, ADMIN);

    const songsRes = await api.get(`${API}/api/songs?page=0&size=1`, { headers: { Authorization: `Bearer ${adminTok}` } });
    const songs = await songsRes.json();
    if (!songs.length) {
      test.skip(true, 'No songs');
      return;
    }
    const song = songs[0];

    const create = await api.post(`${API}/api/playlists`, {
      headers: { Authorization: `Bearer ${userTok}`, 'Content-Type': 'application/json' },
      data: { name: 'addsong-test', description: '', isPublic: false, createdAt: new Date().toISOString() },
    });
    const playlist = await create.json();

    const addRes = await api.post(`${API}/api/playlists/${playlist.id}/songs/${song.id}`, {
      headers: { Authorization: `Bearer ${userTok}` },
    });
    expect([200, 201, 204]).toContain(addRes.status());

    await api.delete(`${API}/api/playlists/${playlist.id}`, { headers: { Authorization: `Bearer ${userTok}` } });
  });
});
