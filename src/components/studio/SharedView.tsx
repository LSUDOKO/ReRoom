"use client";
import { DoorOpen, Footprints, Orbit } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { decodeDesign } from "@/lib/share";
import { uid, useStudio } from "@/lib/store";
import { STYLES } from "@/lib/catalog";
import { Logo, Segmented } from "../ui";
import Viewport from "./Viewport";

/** Read-only viewer for a design packed into the URL fragment. */
export default function SharedView() {
  const [bad, setBad] = useState(false);
  const mode = useStudio((s) => s.mode);
  const room = useStudio((s) => s.room);
  const styleId = useStudio((s) => s.styleId);
  const items = useStudio((s) => s.items);

  useEffect(() => {
    const d = decodeDesign(location.hash.slice(1));
    if (!d) return setBad(true);
    const st = useStudio.getState();
    st.setRoom({ ...d.room, blurb: "", source: "sample" });
    st.load(
      d.items.map((i) => ({ ...i, uid: uid(), origin: "library", status: "ready", meshRef: i.glb, variants: i.variants ?? {} })),
      d.styleId,
    );
  }, []);

  if (bad)
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
        <Logo />
        <p className="text-slate">This share link is incomplete. Ask for a fresh link.</p>
        <Link href="/" className="text-blue underline">Go to ReRoom</Link>
      </div>
    );

  const openable = items.filter((i) => i.urdf);
  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-14 items-center gap-3 border-b border-line bg-white px-3">
        <Link href="/"><Logo className="text-[19px]" /></Link>
        <span className="truncate text-sm text-slate">
          {room?.name}
          {styleId && ` · ${STYLES.find((s) => s.id === styleId)?.name}`}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Segmented
            label="Camera mode"
            value={mode === "top" ? "orbit" : mode}
            onChange={(m) => useStudio.getState().setMode(m)}
            options={[
              { id: "orbit", label: "Orbit", icon: <Orbit size={14} /> },
              { id: "walk", label: "Walk", icon: <Footprints size={14} /> },
            ]}
          />
          <Link href="/studio" className="hidden h-9 items-center rounded-btn bg-blue px-3 text-[13px] font-medium text-on sm:inline-flex">
            Design your own
          </Link>
        </div>
      </header>
      <div className="relative min-h-0 flex-1">
        <Viewport readOnly />
        {openable.length > 0 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {openable.map((i) => (
              <button
                key={i.uid}
                onClick={() => useStudio.getState().patch(i.uid, { open: !i.open })}
                className="inline-flex h-9 items-center gap-1.5 rounded-btn bg-white px-3 text-[13px] font-medium shadow"
              >
                <DoorOpen size={14} /> {i.open ? "Close" : "Open"} {i.name.toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
