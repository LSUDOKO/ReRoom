/** Responsive still from /public/marketing: `<name>-<width>.webp` files rendered from 4K masters. */
export function Shot({
  name,
  widths,
  sizes,
  alt,
  className = "",
  priority,
}: {
  name: string;
  widths: number[];
  sizes: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/marketing/${name}-${widths[Math.min(1, widths.length - 1)]}.webp`}
      srcSet={widths.map((w) => `/marketing/${name}-${w}.webp ${w}w`).join(", ")}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}
