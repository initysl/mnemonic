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

const siteUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';
const siteName = 'Mnemonic';
const description = 'Your AI-Powered Note Management System';
const ogImage = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: siteName,
};
const sharedMeta = {
  title: siteName,
  description,
};

export const metadata: Metadata = {
  title: {
    default: sharedMeta.title,
    template: `%s | ${sharedMeta.title}`,
  },
  description: sharedMeta.description,
  applicationName: sharedMeta.title,
  keywords: [
    'Notes app',
    'Personal knowledge base',
    'Voice notes',
    'AI-powered notes',
  ],
  authors: [{ name: 'Yusuf' }],
  creator: 'Mnemonic Team',
  metadataBase: new URL(siteUrl),

  openGraph: {
    title: sharedMeta.title,
    description: sharedMeta.description,
    url: siteUrl,
    siteName: sharedMeta.title,
    images: [ogImage],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: sharedMeta.title,
    description: sharedMeta.description,
    images: [ogImage.url],
    creator: '@initysl',
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  robots: {
    index: true,
    follow: true,
  },
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
