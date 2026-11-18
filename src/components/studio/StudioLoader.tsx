"use client";
import dynamic from "next/dynamic";
import { BrandLoader } from "../ui";
import type { StudioProps } from "./Studio";

// The 3D engine is browser-only.
const Studio = dynamic(() => import("./Studio"), {
  ssr: false,
  loading: () => <BrandLoader label="Opening the studio" />,
});

export default function StudioLoader(p: StudioProps) {
  return <Studio {...p} />;
}
