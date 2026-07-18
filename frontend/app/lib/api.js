export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4200';

/**
 * Server-side fetch used by the public homepage (app/page.js). `next:
 * { revalidate: 60 }` is the whole "no redeploy needed" story: Next.js
 * serves a cached version of this page for up to 60 seconds, then
 * regenerates it in the background on the next request. The café owner
 * edits the menu in the admin panel and the public site picks it up within
 * a minute — no rebuild, no deploy, no calling a developer.
 */
export async function getContent() {
  const res = await fetch(`${API_BASE_URL}/api/content`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Failed to load content: ${res.status}`);
  return res.json();
}

// Used by the admin panel instead of getContent() above — the admin needs
// to see its own just-saved edits immediately, so this deliberately opts out
// of the 60s ISR cache with `cache: 'no-store'`.
export async function getContentFresh() {
  const res = await fetch(`${API_BASE_URL}/api/content`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load content: ${res.status}`);
  return res.json();
}

async function adminRequest(path, { token, ...options } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed with status ${res.status}`);
  return data;
}

export const adminApi = {
  login: (email, password) =>
    adminRequest('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  updateSite: (token, payload) =>
    adminRequest('/api/admin/site', { method: 'PUT', token, body: JSON.stringify(payload) }),
  updateHours: (token, hours) =>
    adminRequest('/api/admin/hours', { method: 'PUT', token, body: JSON.stringify({ hours }) }),
  createCategory: (token, name) =>
    adminRequest('/api/admin/menu-categories', { method: 'POST', token, body: JSON.stringify({ name }) }),
  createMenuItem: (token, payload) =>
    adminRequest('/api/admin/menu-items', { method: 'POST', token, body: JSON.stringify(payload) }),
  updateMenuItem: (token, id, payload) =>
    adminRequest(`/api/admin/menu-items/${id}`, { method: 'PUT', token, body: JSON.stringify(payload) }),
  deleteMenuItem: (token, id) =>
    adminRequest(`/api/admin/menu-items/${id}`, { method: 'DELETE', token }),
  uploadMenuItemImage: (token, id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return adminRequest(`/api/admin/menu-items/${id}/image`, { method: 'POST', token, body: formData });
  },
};
