import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { config } from '../config.js';
import { isNonEmptyString } from '../utils/validate.js';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body ?? {};
  if (!isNonEmptyString(email, 200) || !isNonEmptyString(password, 200)) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  const invalidCredentials = () => res.status(401).json({ error: 'Invalid email or password.' });

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return invalidCredentials();
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
  res.json({ token });
});
