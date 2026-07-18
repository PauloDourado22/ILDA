import Link from 'next/link';
import { getContent } from './lib/api';
import { HoursTable } from './components/HoursTable';

// Server component — this fetch runs on the server (build/ISR time), not in
// the browser. See app/lib/api.js for the `revalidate: 60` explanation.
export default async function Home() {
  const { settings, hours, menu } = await getContent();

  return (
    <>
      <nav className="nav">
        <span className="brand">{settings.hero_title}</span>
        <Link href="/admin/login" style={{ fontSize: 12, color: '#776b5f' }}>Owner login</Link>
      </nav>

      <div className="hero">
        <h1>{settings.hero_title}</h1>
        <p>{settings.hero_subtitle}</p>
      </div>

      <div className="container">
        <section>
          <h2>About</h2>
          <p className="about-text">{settings.about_text}</p>
        </section>

        <section>
          <h2>Menu</h2>
          {menu.map((category) => (
            <div className="menu-category" key={category.id}>
              <h3>{category.name}</h3>
              {category.items.map((item) => (
                <div className="menu-item" key={item.id}>
                  <div>
                    <div className="menu-item-name">{item.name}</div>
                    {item.description && <div className="menu-item-desc">{item.description}</div>}
                  </div>
                  <div className="menu-item-price">€{(item.priceCents / 100).toFixed(2)}</div>
                </div>
              ))}
            </div>
          ))}
        </section>

        <section>
          <h2>Hours &amp; contact</h2>
          <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
            <HoursTable hours={hours} />
            <div className="contact-info">
              {settings.address && <div>{settings.address}</div>}
              {settings.phone && <div>{settings.phone}</div>}
              {settings.email && <div>{settings.email}</div>}
            </div>
          </div>
        </section>
      </div>

      <footer>&copy; {new Date().getFullYear()} {settings.hero_title}</footer>
    </>
  );
}
