import Image from 'next/image';

/**
 * A photo slot in the layout — either a real photo (`src` provided) or an
 * honest placeholder while the café owner hasn't uploaded one yet.
 *
 * The source design leans heavily on photography (hero shot, interior,
 * detail shots) that this project has no CMS field for yet — menu_items
 * has image_path, but there's no equivalent for hero/interior photos. Until
 * that exists, `src` is passed in directly from page.js as a static file
 * under frontend/public/ rather than through the admin panel (see README v2
 * notes — a `site_images` table + admin upload reusing
 * backend/src/middleware/upload.js is the natural real version of this).
 *
 * `tone` picks the light or dark placeholder treatment depending on which
 * section it sits in (dark hero vs. light menu/about sections) — only
 * matters when there's no `src` yet.
 */
export function PhotoSlot({ label, tone = 'light', src, style }) {
  if (src) {
    return (
      <div className="photo-slot photo-slot--image" style={style}>
        <Image src={src} alt={label} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
      </div>
    );
  }

  return (
    <div className={`photo-slot photo-slot--${tone}`} style={style}>
      {label}
    </div>
  );
}
