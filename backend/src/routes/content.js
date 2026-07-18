import { Router } from 'express';
import { db } from '../db/index.js';

export const contentRouter = Router();

/**
 * GET /api/content
 *
 * The single endpoint the public Next.js site calls. Everything the homepage
 * needs — hero text, hours, menu — comes back in one response, so the
 * frontend does one fetch instead of choreographing four. The admin panel
 * writes to several tables; the public site only ever reads this one shape.
 */
contentRouter.get('/', (req, res) => {
  const settings = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
  const hours = db.prepare('SELECT * FROM hours ORDER BY weekday').all();

  const categories = db.prepare('SELECT * FROM menu_categories ORDER BY sort_order').all();
  const items = db
    .prepare('SELECT * FROM menu_items WHERE active = 1 ORDER BY sort_order')
    .all();

  const menu = categories.map((category) => ({
    id: category.id,
    name: category.name,
    items: items
      .filter((item) => item.category_id === category.id)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        priceCents: item.price_cents,
        imagePath: item.image_path,
      })),
  }));

  res.json({
    settings,
    hours,
    menu,
  });
});
