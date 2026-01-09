import type { Metadata } from 'next';
import { Geist, Geist_Mono, Changa, Patua_One } from 'next/font/google';
import './globals.css';
import Provider from './provider';

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
});

const patua = Patua_One({
  variable: '--font-patua-one',
  weight: '400',
  subsets: ['latin'],
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
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${changa.variable} ${patua.variable} antialiased`}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
