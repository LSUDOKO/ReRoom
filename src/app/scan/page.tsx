import ScanFlow from "@/components/ScanFlow";
import { SiteFooter, SiteHeader } from "@/components/Site";

export const metadata = { title: "Scan your room" };

export default function ScanPage() {
  return (
    <>
      <SiteHeader />
      <main className="studio-dark band relative flex-1 overflow-hidden">
        <div aria-hidden className="glow -right-60 -top-40 w-[760px]" />
        <div aria-hidden className="grain" />
        <div className="relative">
          <ScanFlow />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
