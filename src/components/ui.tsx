"use client";
import clsx from "clsx";
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
        variant === "primary" && "bg-blue text-white hover:bg-blue-deep",
        variant === "secondary" && "border border-line bg-white text-ink hover:bg-paper",
        variant === "ghost" && "text-slate hover:bg-paper hover:text-ink",
        variant === "magic" && "bg-amber text-ink hover:brightness-95",
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
          {o.label}
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

export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-2 font-display text-[22px] font-semibold tracking-tight", className)}>
      <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden>
        <rect width="64" height="64" rx="14" fill="#2F6BFF" />
        <path d="M16 46V24l16-10 16 10v22" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
        <path d="M26 46V34h12v12" fill="#FFB020" />
      </svg>
      ReRoom
    </span>
  );
}
