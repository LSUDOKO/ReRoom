"use client";
import clsx from "clsx";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useStudio } from "@/lib/store";

export default function Toast() {
  const toast = useStudio((s) => s.toast);
  const [shown, setShown] = useState<typeof toast>(null);
  useEffect(() => {
    if (!toast) return;
    setShown(toast);
    const t = setTimeout(() => setShown(null), toast.tone === "error" ? 6000 : 3200);
    return () => clearTimeout(t);
  }, [toast]);
  if (!shown) return null;
  return (
    <div
      key={shown.id}
      role="status"
      aria-live="polite"
      className={clsx(
        "rise absolute left-1/2 top-16 z-30 flex max-w-md -translate-x-1/2 items-center gap-2 rounded-btn px-3.5 py-2 text-sm shadow-lg",
        shown.tone === "error" && "bg-danger text-white",
        shown.tone === "magic" && "bg-amber text-ink",
        (!shown.tone || shown.tone === "info") && "bg-ink text-white",
      )}
    >
      {shown.tone === "magic" && <Sparkles size={15} />}
      {shown.text}
    </div>
  );
}
