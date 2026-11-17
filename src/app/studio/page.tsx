import StudioLoader from "@/components/studio/StudioLoader";

export const metadata = { title: "Studio" };

export default async function StudioPage({ searchParams }: PageProps<"/studio">) {
  const q = await searchParams;
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  return <StudioLoader roomId={str(q.room)} worldId={str(q.world)} worldName={str(q.name)} demo={q.demo === "1"} />;
}
