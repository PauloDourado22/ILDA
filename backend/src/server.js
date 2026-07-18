import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { contentRouter } from './routes/content.js';
import { adminRouter } from './routes/admin.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '200kb' }));

// Uploaded menu photos are served as plain static files. They're already
// validated (allow-listed mime type, capped size, randomized filename) by
// the upload middleware before they ever land in this directory — see
// middleware/upload.js for why that matters.
app.use('/uploads', express.static(path.resolve(config.uploadsDir)));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/admin', adminRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Café CMS API listening on http://localhost:${config.port}`);
});
