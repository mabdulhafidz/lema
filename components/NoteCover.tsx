import Image from 'next/image';

const PALETTE = [
  'oklch(0.55 0.2 27)',
  'oklch(0.45 0.1 250)',
  'oklch(0.5 0.12 160)',
  'oklch(0.6 0.14 70)',
];

type Props = {
  cover?: string;
  number: string;
  index: number;
  alt: string;
  label: string;
  variant?: 'hero' | 'card';
};

/** Uses the frontmatter `cover` image when present, otherwise a numbered color block. */
export default function NoteCover({ cover, number, index, alt, label, variant = 'card' }: Props) {
  const ratio = variant === 'hero' ? 'aspect-[4/3] md:aspect-video lg:aspect-[4/3]' : 'aspect-[4/3] lg:aspect-square';

  if (cover) {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900 ${ratio}`}>
        <Image
          src={cover}
          alt={alt}
          fill
          sizes={variant === 'hero' ? '(min-width: 1024px) 55vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          priority={variant === 'hero'}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col justify-between rounded-lg p-3.5 font-mono text-white transition-transform duration-300 group-hover:-translate-y-0.5 ${ratio}`}
      style={{ background: PALETTE[index % PALETTE.length] }}
      aria-hidden
    >
      <span className="text-[11px] opacity-85">{label.toUpperCase()}</span>
      <span
        className={`font-extrabold leading-[0.9] tracking-tighter ${variant === 'hero' ? 'text-8xl' : 'text-5xl md:text-6xl'}`}
      >
        {number}
      </span>
    </div>
  );
}
