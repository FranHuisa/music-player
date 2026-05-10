import { test, expect } from '@playwright/test';
import { ADMIN, USER, API, getToken, newApi } from './helpers';

function makeBuffer(sizeMB: number): Buffer {
  return Buffer.alloc(sizeMB * 1024 * 1024, 0xff);
}

test.describe('File upload limits + auth (Fran 15MB requirement + Fix CRITICAL)', () => {
  test('anon upload image rejected', async () => {
    const api = await newApi();
    const res = await api.post(`${API}/api/upload/image`, {
      multipart: { file: { name: 't.png', mimeType: 'image/png', buffer: Buffer.from('PNG-fake') } },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('anon upload audio rejected', async () => {
    const api = await newApi();
    const res = await api.post(`${API}/api/upload/audio`, {
      multipart: { file: { name: 't.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('MP3-fake') } },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('user can upload image (USER role allowed)', async () => {
    const api = await newApi();
    const t = await getToken(api, USER);
    const res = await api.post(`${API}/api/upload/image`, {
      headers: { Authorization: `Bearer ${t}` },
      multipart: { file: { name: 'tiny.png', mimeType: 'image/png', buffer: Buffer.from('PNG-fake') } },
    });
    expect([200, 201]).toContain(res.status());
  });

  test('user CANNOT upload audio (audio = ADMIN/EDITOR/ARTIST only)', async () => {
    const api = await newApi();
    const t = await getToken(api, USER);
    const res = await api.post(`${API}/api/upload/audio`, {
      headers: { Authorization: `Bearer ${t}` },
      multipart: { file: { name: 'tiny.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('fake') } },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('admin can upload 5MB image (under 15MB limit)', async () => {
    const api = await newApi();
    const t = await getToken(api, ADMIN);
    const res = await api.post(`${API}/api/upload/image`, {
      headers: { Authorization: `Bearer ${t}` },
      multipart: { file: { name: 'mid.png', mimeType: 'image/png', buffer: makeBuffer(5) } },
      timeout: 60000,
    });
    expect([200, 201]).toContain(res.status());
  });

  test('admin upload 20MB image rejected (over 15MB limit)', async () => {
    const api = await newApi();
    const t = await getToken(api, ADMIN);
    const res = await api.post(`${API}/api/upload/image`, {
      headers: { Authorization: `Bearer ${t}` },
      multipart: { file: { name: 'huge.png', mimeType: 'image/png', buffer: makeBuffer(20) } },
      timeout: 60000,
    });
    expect([400, 413, 500]).toContain(res.status());
  });
});
