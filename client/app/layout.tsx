import type { Metadata } from 'next';
import { Geist, Geist_Mono, Changa, Patua_One } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const changa = Changa({
  variable: '--font-changa',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const patua = Patua_One({
  variable: '--font-patua-one',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Mnemonic',
  description: 'Your memory, structured and searchable.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${changa.variable} ${patua.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster position='top-right' richColors />
        </Providers>
      </body>
    </html>
  );
}
