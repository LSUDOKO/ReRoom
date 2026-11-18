"use client";
import dynamic from "next/dynamic";
import { BrandLoader } from "../ui";

const SharedView = dynamic(() => import("./SharedView"), {
  ssr: false,
  loading: () => <BrandLoader label="Opening the shared design" />,
});

export default function ViewLoader() {
  return <SharedView />;
}
