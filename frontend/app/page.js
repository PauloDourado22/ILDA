import Link from 'next/link';
import { getContent } from './lib/api';
import { PhotoSlot } from './components/PhotoSlot';
import { WEEKDAY_LABELS, formatMinutes, computeOpenStatus, splitLastWord, directionsUrl } from './lib/time';

// Renders "lead <em>last</em>" — the italic-serif accent on the final word
// of a heading, used throughout the design (hero headline, "the menu,
// today"). Splitting at render time means it keeps working no matter what
// the owner types into the admin panel, instead of a hardcoded string.
function Emphasized({ text }) {
  const { lead, last } = splitLastWord(text);
  return (
    <>
      {lead}
      <em>{last}</em>
    </>
  );
}

// Server component — this fetch runs on the server (build/ISR time), not in
// the browser. See app/lib/api.js for the `revalidate: 60` explanation.
export default async function Home() {
  const { settings, hours, menu } = await getContent();

  const status = computeOpenStatus(hours);
  const mapsUrl = directionsUrl(settings.address);
  const menuWithItems = menu.filter((category) => category.items.length > 0);

  return (
    <>
      <header className="site-header">
        <nav className="site-nav">
          <span className="brand">{settings.cafe_name}</span>
          <div className="nav-links">
            <a href="#menu">Menu</a>
            <a href="#space">Space</a>
            <a href="#hours">Hours</a>
          </div>
          {mapsUrl ? (
            <a className="nav-cta" href={mapsUrl} target="_blank" rel="noreferrer">Find us ↗</a>
          ) : (
            <a className="nav-cta" href="#hours">Find us</a>
          )}
        </nav>

        <div className="hero">
          <h1><Emphasized text={settings.hero_title} /></h1>
          <div className="hero-meta">
            <p className="hero-desc">{settings.hero_subtitle}</p>
            <div className="hero-status">
              <span className="status-dot" style={{ '--dot-color': status.isOpen ? 'var(--open-dot)' : 'var(--ink-muted)' }}>
                {status.label}
              </span>
              {settings.address && <span>{settings.address}</span>}
            </div>
          </div>
        </div>

        {/* Nested inside the dark header on purpose. The overlap effect
            comes from `.hero-photos` combining a negative top margin (which
            pulls everything *after* it in normal flow up, so the menu
            section's box starts higher than it looks) with an equal-and-
            opposite translateY (which shifts the photos back down visually
            without affecting layout). Net result: the photos still paint at
            their natural position at the bottom of the dark band, but the
            light menu section's box now starts underneath them — so the
            menu section (painted later, on top) covers the bottom slice of
            the photos with its own top padding, and the photos read as
            bleeding into the seam. See `.section-inner--tight`'s padding for
            the matching compensation on the other side of that seam. */}
        <div className="hero-photos">
          <PhotoSlot tone="dark" label="Wide interior shot — morning light" />
          <PhotoSlot tone="dark" label="Detail — cup on the counter" />
        </div>
      </header>

      <section className="section" id="menu">
        <div className="section-inner section-inner--tight">
          <div className="section-head">
            <h2><Emphasized text="The menu, today" /></h2>
            <span className="hint">Updated daily by the owner — no developer required</span>
          </div>

          {menuWithItems.length > 0 ? (
            <div className="menu-grid">
              {menuWithItems.map((category) => (
                <div className="menu-cat" key={category.id} style={{ display: 'contents' }}>
                  <div className="eyebrow menu-cat-label">{category.name}</div>
                  <div>
                    {category.items.map((item) => (
                      <div className="menu-row" key={item.id}>
                        <span className="name">{item.name}</span>
                        <span className="desc">{item.description}</span>
                        <span className="price">€{(item.priceCents / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="menu-empty">The menu is being updated — check back soon.</p>
          )}
        </div>
      </section>

      <section className="section" id="space">
        <div className="section-inner">
          <div className="space-grid">
            <div>
              <div className="eyebrow" style={{ marginBottom: 20 }}>The space</div>
              <h2>About</h2>
              <p className="space-text">{settings.about_text}</p>
            </div>
            <div className="space-photos">
              <PhotoSlot tone="light" label="Interior — morning light" />
              <PhotoSlot tone="light" label="Detail shot" />
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="hours">
        <div className="section-inner">
          <div className="hours-visit-grid">
            <div>
              <div className="eyebrow" style={{ marginBottom: 20 }}>Hours</div>
              <div className="hours-list">
                {hours.map((row) => (
                  <span key={row.weekday} style={{ display: 'contents' }}>
                    <span className="day">{WEEKDAY_LABELS[row.weekday]}</span>
                    <span className="time">
                      {row.closed ? 'Closed' : `${formatMinutes(row.open_minute)} – ${formatMinutes(row.close_minute)}`}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: 20 }}>Visit</div>
              <div className="visit-block">
                {settings.address && <div>{settings.address}</div>}
                {settings.phone && <div>{settings.phone}</div>}
                {settings.email && <div><a href={`mailto:${settings.email}`}>{settings.email}</a></div>}
              </div>
              {mapsUrl && (
                <a className="directions-btn" href={mapsUrl} target="_blank" rel="noreferrer">Get directions ↗</a>
              )}
            </div>

            <PhotoSlot tone="light" label="Map or storefront photo" />
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="wrap">
          <span className="brand">{settings.cafe_name}</span>
          <span>{status.label}</span>
          {settings.address && <span>{settings.address}</span>}
          {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
          <Link className="owner-login" href="/admin/login">Owner login</Link>
        </div>
      </footer>
    </>
  );
}
