"use client";
import dynamic from "next/dynamic";

const SharedView = dynamic(() => import("./SharedView"), {
  ssr: false,
  loading: () => <div className="flex h-dvh items-center justify-center bg-paper text-sm text-slate">Opening shared design…</div>,
});

export default function ViewLoader() {
  return <SharedView />;
}
