import { notFound } from "next/navigation";
import Thumbs from "./Thumbs";

/** Dev-only tool; not shipped in production. */
export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <Thumbs />;
}
