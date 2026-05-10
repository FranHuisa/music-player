import { APIRequestContext, Page, expect, request } from '@playwright/test';

export const API = 'http://localhost:8080';
export const FRONT = 'http://localhost:4200';

export interface Creds {
  username: string;
  password: string;
}

export const ADMIN: Creds = { username: 'admin', password: 'admin' };
export const USER: Creds = { username: 'user', password: 'user' };
export const EDITOR: Creds = { username: 'editor1', password: 'admin' };

export async function getToken(req: APIRequestContext, creds: Creds): Promise<string> {
  const res = await req.post(`${API}/api/authenticate`, {
    data: { username: creds.username, password: creds.password },
  });
  expect(res.ok(), `auth failed for ${creds.username}: ${res.status()}`).toBeTruthy();
  const body = await res.json();
  return body.id_token as string;
}

export async function newApi() {
  return await request.newContext();
}

export async function loginUI(page: Page, creds: Creds) {
  const api = await newApi();
  const token = await getToken(api, creds);
  await page.goto('/');
  await page.evaluate(t => {
    localStorage.setItem('jhi-authenticationToken', JSON.stringify(t));
    sessionStorage.setItem('jhi-authenticationToken', JSON.stringify(t));
  }, token);
  await page.reload();
  await page.waitForLoadState('networkidle');
}
