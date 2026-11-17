import ScanFlow from "@/components/ScanFlow";
import { SiteFooter, SiteHeader } from "@/components/Site";

export const metadata = { title: "Scan your room" };

export default function ScanPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <ScanFlow />
      </main>
      <SiteFooter />
    </>
  );
}
