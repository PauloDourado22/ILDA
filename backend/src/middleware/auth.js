import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }
  try {
    req.user = jwt.verify(header.slice('Bearer '.length), config.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
