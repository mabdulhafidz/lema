import type { Metadata } from 'next';
import { JetBrains_Mono, IBM_Plex_Sans, Newsreader } from 'next/font/google';
import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/next';
import SiteHeader from '@/components/SiteHeader';

const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

type Props = {
  children: React.ReactNode;
};

const mono = JetBrains_Mono({ variable: '--font-jetbrains', subsets: ['latin'] });
const sans = IBM_Plex_Sans({ variable: '--font-plex', subsets: ['latin'], weight: ['400', '500', '600'] });
const serif = Newsreader({ variable: '--font-newsreader', subsets: ['latin'], style: ['normal', 'italic'] });

export const metadata: Metadata = {
  title: 'Lema',
  description: 'Catatan kuliah Bahasa Indonesia',
};

export default async function RootLayout({ children }: Props) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${mono.variable} ${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
        <body className="flex min-h-full flex-col bg-white text-black dark:bg-black dark:text-white">
        <NextIntlClientProvider>
          <SiteHeader />
          {children}
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}