import bcrypt from 'bcryptjs';
import { db } from './index.js';

const ownerEmail = 'owner@example.com';
const ownerPassword = 'change-me-please';

const existingOwner = db.prepare('SELECT id FROM users WHERE email = ?').get(ownerEmail);
if (!existingOwner) {
  const passwordHash = bcrypt.hashSync(ownerPassword, 12);
  db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(ownerEmail, passwordHash);
  console.log(`Created owner account: ${ownerEmail} / ${ownerPassword}`);
} else {
  console.log('Owner account already exists, skipping.');
}

const settingsExist = db.prepare('SELECT id FROM site_settings WHERE id = 1').get();
if (!settingsExist) {
  db.prepare(
    `INSERT INTO site_settings (id, cafe_name, hero_title, hero_subtitle, about_text, address, phone, email)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    'ILDA',
    'Coffee, made like it matters.',
    'Slow coffee and fresh pastries in the heart of Leiria.',
    'We roast locally, bake every morning, and keep a table open for you. ' +
      'Family-run since day one — come sit a while.',
    'Rua Central 12, Leiria, Portugal',
    '+351 244 000 000',
    'ola@cafenascerdosol.pt'
  );
  console.log('Seeded homepage content.');
} else {
  console.log('Homepage content already seeded, skipping.');
}

const hoursCount = db.prepare('SELECT COUNT(*) as n FROM hours').get().n;
if (hoursCount === 0) {
  const insertHours = db.prepare(
    'INSERT INTO hours (weekday, open_minute, close_minute, closed) VALUES (?, ?, ?, ?)'
  );
  // Closed Monday (weekday 1), open 08:00-19:00 the rest of the week.
  for (let weekday = 0; weekday <= 6; weekday += 1) {
    if (weekday === 1) {
      insertHours.run(weekday, null, null, 1);
    } else {
      insertHours.run(weekday, 8 * 60, 19 * 60, 0);
    }
  }
  console.log('Seeded weekly hours.');
} else {
  console.log('Hours already seeded, skipping.');
}

const categoryCount = db.prepare('SELECT COUNT(*) as n FROM menu_categories').get().n;
if (categoryCount === 0) {
  const insertCategory = db.prepare('INSERT INTO menu_categories (name, sort_order) VALUES (?, ?)');
  const insertItem = db.prepare(
    `INSERT INTO menu_items (category_id, name, description, price_cents, sort_order)
     VALUES (?, ?, ?, ?, ?)`
  );

  const menu = [
    {
      name: 'Coffee',
      items: [
        { name: 'Espresso', description: 'Single shot, house blend.', price: 120 },
        { name: 'Galão', description: 'Milky coffee in a tall glass.', price: 180 },
        { name: 'Cappuccino', description: 'Espresso, steamed milk, foam.', price: 220 },
      ],
    },
    {
      name: 'Pastries',
      items: [
        { name: 'Pastel de nata', description: 'Baked fresh every morning.', price: 130 },
        { name: 'Croissant', description: 'Butter croissant.', price: 160 },
      ],
    },
  ];

  menu.forEach((category, categoryIndex) => {
    const { lastInsertRowid: categoryId } = insertCategory.run(category.name, categoryIndex);
    category.items.forEach((item, itemIndex) => {
      insertItem.run(categoryId, item.name, item.description, item.price, itemIndex);
    });
  });
  console.log('Seeded menu categories and items.');
} else {
  console.log('Menu already seeded, skipping.');
}
