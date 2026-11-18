import { SiteFooter, SiteHeader } from "@/components/Site";

export const metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <>
      <SiteHeader />
      <main className="sheet flex-1"><div className="mx-auto max-w-2xl px-5 py-16 font-light leading-relaxed">
        <h1 className="display text-5xl">Privacy</h1>
        <p className="mt-2 text-sm text-slate">Plain-language summary. Last updated 18 November 2026.</p>
        <h2 className="mt-10 text-2xl font-semibold tracking-tight">What we collect</h2>
        <p className="mt-2">Room videos or photos you upload, product and material photos you add, and the text you type to describe furniture.</p>
        <h2 className="mt-8 text-2xl font-semibold tracking-tight">Why</h2>
        <p className="mt-2">
          Only to build your 3D room and furniture. Files are processed by Aholo (Manycore Tech) for reconstruction, generation, material transfer and export.
          We don&apos;t sell data or use it for advertising.
        </p>
        <h2 className="mt-8 text-2xl font-semibold tracking-tight">Where your designs live</h2>
        <p className="mt-2">
          In guest mode, your rooms list and designs are saved in this browser only. Share links contain the design itself in the part of the link
          after “#”, which browsers never send to a server. Photos are resized and stripped of location data before upload.
        </p>
        <h2 className="mt-8 text-2xl font-semibold tracking-tight">Retention and deletion</h2>
        <p className="mt-2">
          Generated result links from Aholo expire after about two hours. Use “Delete my data on this device” on the Scan page to clear everything saved
          locally. Scans are private by default: nothing is shared unless you create a share link.
        </p>
        <h2 className="mt-8 text-2xl font-semibold tracking-tight">Please don&apos;t</h2>
        <p className="mt-2">Scan other people&apos;s homes without consent, or upload photos of people.</p>
      </div></main>
      <SiteFooter />
    </>
  );
}
