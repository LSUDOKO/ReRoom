import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500"] });

const site = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "ReRoom — Scan it. Remix it. Live in it.", template: "%s · ReRoom" },
  description:
    "Turn a phone video of your room into a walkable 3D space, add AI furniture with doors and drawers that really open, and restyle everything in one click. Built on Aholo.",
  openGraph: {
    title: "ReRoom — Scan it. Remix it. Live in it.",
    description: "Redesign your real room in 3D with AI furniture that works. Built on Aholo.",
    images: ["/og.png"],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#050712" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
