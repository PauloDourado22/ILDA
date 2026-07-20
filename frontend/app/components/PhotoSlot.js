/**
 * Placeholder for a photo the café owner hasn't uploaded yet.
 *
 * The source design leans heavily on photography (hero shot, interior,
 * detail shots) that this project has no CMS field for yet — menu_items
 * has image_path, but there's no equivalent for hero/interior photos.
 * Rather than hardcode stock photography into a client-facing repo, this
 * renders an honest placeholder so the layout reads correctly today and
 * slots in real photos later without a redesign (see README v2 notes —
 * this is the natural home for a future `site_images` table + admin
 * upload, reusing the existing backend/src/middleware/upload.js pattern).
 *
 * `tone` picks the light or dark placeholder treatment depending on which
 * section it sits in (dark hero vs. light menu/about sections).
 */
export function PhotoSlot({ label, tone = 'light', style }) {
  return (
    <div className={`photo-slot photo-slot--${tone}`} style={style}>
      {label}
    </div>
  );
}
