import './globals.css';

export const metadata = {
  title: 'Café Nascer do Sol',
  description: 'Slow coffee and fresh pastries in the heart of Leiria.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
