"use client";
import dynamic from "next/dynamic";
import type { StudioProps } from "./Studio";

// The 3D engine is browser-only.
const Studio = dynamic(() => import("./Studio"), {
  ssr: false,
  loading: () => <div className="flex h-dvh items-center justify-center bg-paper text-sm text-slate">Opening the studio…</div>,
});

export default function StudioLoader(p: StudioProps) {
  return <Studio {...p} />;
}
