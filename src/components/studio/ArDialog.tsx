"use client";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { proxied } from "@/lib/api";
import type { Item } from "@/lib/store";
import { Button, Modal } from "../ui";

export function arUrl(item: Item) {
  const src = new URL(proxied(item.glb!), location.origin).toString();
  const u = new URL("/ar", location.origin);
  u.searchParams.set("src", src);
  u.searchParams.set("name", item.name);
  u.searchParams.set("h", String(item.height));
  return u.toString();
}

export default function ArDialog({ open, onClose, item }: { open: boolean; onClose: () => void; item: Item }) {
  const [qr, setQr] = useState("");
  const url = open && item.glb ? arUrl(item) : "";
  useEffect(() => {
    if (url) QRCode.toDataURL(url, { margin: 1, width: 240, color: { dark: "#121417" } }).then(setQr);
  }, [url]);
  const local = typeof location !== "undefined" && /localhost|127\.0\.0\.1/.test(location.hostname);
  return (
    <Modal open={open} onClose={onClose} title={`${item.name} in AR`}>
      <div className="flex flex-col items-center gap-4 text-center">
        {qr && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt="QR code that opens this piece in AR on your phone" width={240} height={240} className="rounded-panel border border-line" />
        )}
        <p className="text-sm text-slate">
          Scan with your phone camera. iPhone opens it in AR Quick Look, Android in Scene Viewer, at {Math.round(item.height * 100)} cm tall.
        </p>
        {local && <p className="rounded-btn bg-amber-soft p-2 text-xs text-ink">You&apos;re on localhost, so your phone can&apos;t reach this link. It works on the deployed site.</p>}
        <a href={url} target="_blank" rel="noreferrer" className="w-full">
          <Button variant="primary" className="w-full">Open the AR page</Button>
        </a>
      </div>
    </Modal>
  );
}
