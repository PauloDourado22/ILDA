'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, getContentFresh } from '../lib/api';
import { auth } from '../lib/auth';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [savedMessage, setSavedMessage] = useState(null);

  const [siteForm, setSiteForm] = useState(null);
  const [hoursForm, setHoursForm] = useState(null);
  const [newItem, setNewItem] = useState({ categoryId: '', name: '', description: '', priceEuros: '' });

  useEffect(() => {
    const t = auth.getToken();
    if (!t) {
      router.replace('/admin/login');
      return;
    }
    setToken(t);
  }, [router]);

  const load = useCallback(async () => {
    try {
      const data = await getContentFresh();
      setContent(data);
      setSiteForm({
        cafeName: data.settings.cafe_name,
        heroTitle: data.settings.hero_title,
        heroSubtitle: data.settings.hero_subtitle,
        aboutText: data.settings.about_text,
        address: data.settings.address ?? '',
        phone: data.settings.phone ?? '',
        email: data.settings.email ?? '',
      });
      setHoursForm(
        data.hours.map((h) => ({
          weekday: h.weekday,
          closed: !!h.closed,
          openTime: h.open_minute != null ? minutesToTime(h.open_minute) : '09:00',
          closeTime: h.close_minute != null ? minutesToTime(h.close_minute) : '18:00',
        }))
      );
      if (data.menu[0]) setNewItem((f) => ({ ...f, categoryId: data.menu[0].id }));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  function flashSaved(label) {
    setSavedMessage(label);
    setTimeout(() => setSavedMessage(null), 2500);
  }

  async function handleSaveSite(e) {
    e.preventDefault();
    setError(null);
    try {
      await adminApi.updateSite(token, siteForm);
      flashSaved('Homepage content saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveHours(e) {
    e.preventDefault();
    setError(null);
    try {
      const payload = hoursForm.map((h) => ({
        weekday: h.weekday,
        closed: h.closed,
        openMinute: timeToMinutes(h.openTime),
        closeMinute: timeToMinutes(h.closeTime),
      }));
      await adminApi.updateHours(token, payload);
      flashSaved('Hours saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    setError(null);
    try {
      await adminApi.createMenuItem(token, {
        categoryId: Number(newItem.categoryId),
        name: newItem.name,
        description: newItem.description || null,
        priceCents: Math.round(Number(newItem.priceEuros) * 100),
      });
      setNewItem((f) => ({ ...f, name: '', description: '', priceEuros: '' }));
      load();
      flashSaved('Menu item added.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteItem(id) {
    if (!confirm('Delete this menu item?')) return;
    try {
      await adminApi.deleteMenuItem(token, id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleImageUpload(id, file) {
    try {
      await adminApi.uploadMenuItemImage(token, id, file);
      load();
      flashSaved('Photo uploaded.');
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    auth.clearToken();
    router.push('/admin/login');
  }

  if (!token || !content || !siteForm || !hoursForm) return null;

  return (
    <div className="admin">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Site admin</h1>
        <button className="btn-small" onClick={handleLogout}>Log out</button>
      </div>

      {error && <p className="error-text" style={{ marginBottom: 16 }}>{error}</p>}
      {savedMessage && <p className="success-text" style={{ marginBottom: 16 }}>{savedMessage}</p>}

      <div className="admin-card">
        <h2>Homepage content</h2>
        <form onSubmit={handleSaveSite}>
          <div className="form-group">
            <label>Café name</label>
            <input value={siteForm.cafeName} onChange={(e) => setSiteForm((f) => ({ ...f, cafeName: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Hero title <span style={{ fontWeight: 400, color: '#a09484' }}>(the big marketing headline, not the café name)</span></label>
            <input value={siteForm.heroTitle} onChange={(e) => setSiteForm((f) => ({ ...f, heroTitle: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Hero subtitle</label>
            <input value={siteForm.heroSubtitle} onChange={(e) => setSiteForm((f) => ({ ...f, heroSubtitle: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>About text</label>
            <textarea value={siteForm.aboutText} onChange={(e) => setSiteForm((f) => ({ ...f, aboutText: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={siteForm.address} onChange={(e) => setSiteForm((f) => ({ ...f, address: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={siteForm.phone} onChange={(e) => setSiteForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={siteForm.email} onChange={(e) => setSiteForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <button className="btn" type="submit">Save homepage content</button>
        </form>
      </div>

      <div className="admin-card">
        <h2>Opening hours</h2>
        <form onSubmit={handleSaveHours}>
          {hoursForm.map((h, i) => (
            <div className="hours-row" key={h.weekday}>
              <label>{WEEKDAY_LABELS[h.weekday]}</label>
              <input
                type="checkbox"
                checked={h.closed}
                onChange={(e) =>
                  setHoursForm((form) => form.map((r, ri) => (ri === i ? { ...r, closed: e.target.checked } : r)))
                }
              />
              <span style={{ fontSize: 12 }}>Closed</span>
              {!h.closed && (
                <>
                  <input
                    type="time"
                    value={h.openTime}
                    onChange={(e) =>
                      setHoursForm((form) => form.map((r, ri) => (ri === i ? { ...r, openTime: e.target.value } : r)))
                    }
                  />
                  <span>–</span>
                  <input
                    type="time"
                    value={h.closeTime}
                    onChange={(e) =>
                      setHoursForm((form) => form.map((r, ri) => (ri === i ? { ...r, closeTime: e.target.value } : r)))
                    }
                  />
                </>
              )}
            </div>
          ))}
          <button className="btn" type="submit" style={{ marginTop: 10 }}>Save hours</button>
        </form>
      </div>

      <div className="admin-card">
        <h2>Menu</h2>
        {content.menu.map((category) => (
          <div key={category.id} style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, textTransform: 'uppercase', color: '#a9562e' }}>{category.name}</h3>
            {category.items.map((item) => (
              <div className="item-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong> — €{(item.priceCents / 100).toFixed(2)}
                  {item.imagePath && (
                    <span style={{ marginLeft: 8, fontSize: 12, color: '#776b5f' }}>(photo uploaded)</span>
                  )}
                </div>
                <div>
                  <label className="btn-small" style={{ cursor: 'pointer' }}>
                    Upload photo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => e.target.files[0] && handleImageUpload(item.id, e.target.files[0])}
                    />
                  </label>
                  <button className="btn-small" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ))}

        <h3 style={{ fontSize: 14, marginTop: 24 }}>Add a menu item</h3>
        <form onSubmit={handleAddItem}>
          <div className="form-group">
            <label>Category</label>
            <select
              value={newItem.categoryId}
              onChange={(e) => setNewItem((f) => ({ ...f, categoryId: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e8ddcd' }}
            >
              {content.menu.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Name</label>
            <input required value={newItem.name} onChange={(e) => setNewItem((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input value={newItem.description} onChange={(e) => setNewItem((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Price (EUR)</label>
            <input required type="number" step="0.01" min="0" value={newItem.priceEuros} onChange={(e) => setNewItem((f) => ({ ...f, priceEuros: e.target.value }))} />
          </div>
          <button className="btn" type="submit">Add item</button>
        </form>
      </div>
    </div>
  );
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
