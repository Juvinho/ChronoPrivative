import type {Metadata} from 'next';
import { Space_Mono } from 'next/font/google';
import './globals.css'; // Global styles

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'ChronoPrivative',
  description: 'A private blog',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${spaceMono.variable}`} suppressHydrationWarning>
      <body className="animated-grid-background min-h-screen text-[var(--theme-text-primary)]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
