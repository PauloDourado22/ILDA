import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 4200,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3200',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3200',
  databasePath: process.env.DATABASE_PATH || './data/cafe.db',
  uploadsDir: process.env.UPLOADS_DIR || './uploads',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
};

if (!config.jwtSecret || config.jwtSecret.includes('replace')) {
  console.warn('[config] JWT_SECRET is missing or a placeholder — set a real value in .env before using auth.');
}
