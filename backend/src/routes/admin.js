import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { isNonEmptyString, isNonNegativeInteger } from '../utils/validate.js';

export const adminRouter = Router();

// Everything in this router requires a valid owner JWT — this is the whole
// "mini-CMS" surface. The public site (routes/content.js) never touches
// these routes.
adminRouter.use(requireAuth);

// --- Site settings (hero text, about text, contact info) -----------------

adminRouter.put('/site', (req, res) => {
  const { heroTitle, heroSubtitle, aboutText, address, phone, email } = req.body ?? {};

  if (!isNonEmptyString(heroTitle, 200) || !isNonEmptyString(heroSubtitle, 300) || !isNonEmptyString(aboutText, 2000)) {
    return res.status(400).json({ error: 'heroTitle, heroSubtitle, and aboutText are required.' });
  }

  db.prepare(
    `UPDATE site_settings
     SET hero_title = ?, hero_subtitle = ?, about_text = ?, address = ?, phone = ?, email = ?,
         updated_at = datetime('now')
     WHERE id = 1`
  ).run(heroTitle, heroSubtitle, aboutText, address ?? null, phone ?? null, email ?? null);

  res.json(db.prepare('SELECT * FROM site_settings WHERE id = 1').get());
});

// --- Hours -----------------------------------------------------------------

adminRouter.put('/hours', (req, res) => {
  const { hours } = req.body ?? {};
  if (!Array.isArray(hours) || hours.length !== 7) {
    return res.status(400).json({ error: 'hours must be an array of 7 entries (one per weekday).' });
  }

  const update = db.transaction((rows) => {
    for (const row of rows) {
      if (!isNonNegativeInteger(row.weekday) || row.weekday > 6) {
        throw new Error('Each hours entry needs a weekday 0-6.');
      }
      db.prepare(
        'UPDATE hours SET open_minute = ?, close_minute = ?, closed = ? WHERE weekday = ?'
      ).run(
        row.closed ? null : row.openMinute,
        row.closed ? null : row.closeMinute,
        row.closed ? 1 : 0,
        row.weekday
      );
    }
  });

  try {
    update(hours);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  res.json(db.prepare('SELECT * FROM hours ORDER BY weekday').all());
});

// --- Menu categories ---------------------------------------------------

adminRouter.post('/menu-categories', (req, res) => {
  const { name, sortOrder } = req.body ?? {};
  if (!isNonEmptyString(name, 100)) {
    return res.status(400).json({ error: 'name is required.' });
  }
  const result = db
    .prepare('INSERT INTO menu_categories (name, sort_order) VALUES (?, ?)')
    .run(name, sortOrder ?? 0);
  res.status(201).json(db.prepare('SELECT * FROM menu_categories WHERE id = ?').get(result.lastInsertRowid));
});

// --- Menu items ----------------------------------------------------------

adminRouter.post('/menu-items', (req, res) => {
  const { categoryId, name, description, priceCents, sortOrder } = req.body ?? {};

  if (!isNonNegativeInteger(categoryId) || !isNonEmptyString(name, 100) || !isNonNegativeInteger(priceCents)) {
    return res.status(400).json({ error: 'categoryId, name, and priceCents are required.' });
  }

  const category = db.prepare('SELECT id FROM menu_categories WHERE id = ?').get(categoryId);
  if (!category) return res.status(404).json({ error: 'Category not found.' });

  const result = db
    .prepare(
      `INSERT INTO menu_items (category_id, name, description, price_cents, sort_order)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(categoryId, name, description ?? null, priceCents, sortOrder ?? 0);

  res.status(201).json(db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid));
});

adminRouter.put('/menu-items/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Menu item not found.' });

  const { name, description, priceCents, active } = req.body ?? {};
  db.prepare(
    `UPDATE menu_items
     SET name = COALESCE(?, name),
         description = COALESCE(?, description),
         price_cents = COALESCE(?, price_cents),
         active = COALESCE(?, active)
     WHERE id = ?`
  ).run(name ?? null, description ?? null, priceCents ?? null, active === undefined ? null : (active ? 1 : 0), id);

  res.json(db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id));
});

adminRouter.delete('/menu-items/:id', (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'Menu item not found.' });
  res.status(204).end();
});

// Image upload for a menu item. Returns the path to save on the item via the
// PUT /menu-items/:id call above — kept as a separate step so the upload
// endpoint stays single-purpose (accept a file, store it, return where it
// landed) rather than also handling item field updates.
adminRouter.post('/menu-items/:id/image', upload.single('image'), (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Menu item not found.' });
  if (!req.file) return res.status(400).json({ error: 'No image file received.' });

  const imagePath = `/uploads/${req.file.filename}`;
  db.prepare('UPDATE menu_items SET image_path = ? WHERE id = ?').run(imagePath, id);
  res.json(db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id));
});

// Multer errors (bad mime type, file too large) land here instead of
// crashing the process — without this handler, a rejected upload would
// otherwise surface as a generic 500 with no useful message for the admin UI.
adminRouter.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message });
  next();
});
