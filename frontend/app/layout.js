import { Instrument_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';

// next/font self-hosts the font files at build time (no runtime request to
// Google Fonts, no layout shift while they load) and exposes them as CSS
// variables so globals.css can reference them without hardcoding a stack.
// Instrument Sans is the body/UI face; Instrument Serif is used sparingly,
// as an italic accent on headings (see the `<em>` treatment in page.js).
const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://ilda-ruby.vercel.app'),
  title: 'ILDA',
  description: 'Slow coffee and fresh pastries in the heart of Leiria.',
  openGraph: {
    title: 'ILDA — Coffee, made like it matters.',
    description: 'Slow coffee and fresh pastries in the heart of Leiria.',
    images: ['/og-image.png'],
  },
  twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
