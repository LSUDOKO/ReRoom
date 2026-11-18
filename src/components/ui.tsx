"use client";
import clsx from "clsx";
import { BRAND_BLUE, BRAND_NAVY, MARK_PATH, MARK_TRANSFORM } from "./brand";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "magic" | "danger";

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  return (
    <button
      {...p}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-btn font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-8 px-3 text-[13px]",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-[15px]",
        variant === "primary" && "bg-blue text-on hover:bg-blue-deep",
        variant === "secondary" && "border border-line bg-white text-ink hover:bg-paper",
        variant === "ghost" && "text-slate hover:bg-paper hover:text-ink",
        variant === "magic" && "bg-amber text-navy hover:brightness-105",
        variant === "danger" && "border border-line bg-white text-danger hover:bg-red-50",
        className,
      )}
    />
  );
}

export function IconButton({
  label,
  active,
  className,
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean; children: ReactNode }) {
  return (
    <button
      {...p}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={clsx(
        "inline-flex size-9 items-center justify-center rounded-btn text-slate transition-colors hover:bg-paper hover:text-ink disabled:opacity-40",
        active && "bg-ink text-white hover:bg-ink hover:text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { id: T; label: string; icon?: ReactNode }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-[10px] bg-paper p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={clsx(
            "inline-flex h-8 items-center gap-1.5 rounded-[8px] px-3 text-[13px] font-medium transition-colors",
            value === o.id ? "bg-white text-ink shadow-[0_1px_2px_rgb(18_20_23/0.12)]" : "text-slate hover:text-ink",
          )}
        >
          {o.icon}
          <span className="max-sm:hidden">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal aria-label={title} className={clsx("rise w-full rounded-panel bg-white p-6 shadow-2xl", wide ? "max-w-3xl" : "max-w-md")}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl leading-tight">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-slate hover:bg-paper hover:text-ink" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** The ReRoom app icon (blue rounded square, navy RR monogram) with the wordmark. */
export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2 font-display text-[21px] font-semibold tracking-[-0.03em]", className)}>
      <LogoIcon className="size-7 shrink-0" />
      {!mark && "ReRoom"}
    </span>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="69 76 1116 1101" className={className} aria-hidden>
      <rect x="69" y="76" width="1116" height="1101" rx="215" fill={BRAND_BLUE} />
      <g transform={MARK_TRANSFORM} fill={BRAND_NAVY}>
        <path d={MARK_PATH} />
      </g>
    </svg>
  );
}

/** Just the monogram, filled with currentColor (or a gradient via CSS). */
export function LogoMark({ className, fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="150 300 960 665" className={className} aria-hidden>
      <g transform={MARK_TRANSFORM} fill={fill}>
        <path d={MARK_PATH} />
      </g>
    </svg>
  );
}
