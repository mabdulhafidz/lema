import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import ThemeToggle from './ThemeToggle';

export default async function SiteHeader() {
  const t = await getTranslations('HomePage');
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 font-mono text-sm md:px-12">
      <Link href="/" className="font-bold hover:opacity-70">
        {t('title')}
      </Link>
      <div className="flex items-center gap-1">
      <ThemeToggle />
      <LocaleSwitcher />
      </div>
    </header>
  );
}
