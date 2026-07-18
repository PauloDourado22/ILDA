import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import { config } from '../config.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Menu photo uploads are the one part of this API that takes arbitrary
 * binary input from a browser, so it gets the most scrutiny:
 *
 * - Filenames are replaced with a random UUID, never the client-supplied
 *   name. Trusting the original filename is how you get path traversal
 *   (`../../etc/passwd`) or one admin's upload silently overwriting another
 *   file that happens to share a name.
 * - The MIME type is checked against an allow-list, not a deny-list —
 *   deny-lists are trivially bypassed by a renamed file extension.
 * - Size is capped so someone can't fill the disk (or the request body)
 *   with a single oversized upload.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, or WebP images are allowed.'));
    }
    cb(null, true);
  },
});
