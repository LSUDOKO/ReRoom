"use client";
import { deflateSync, inflateSync, strFromU8, strToU8 } from "fflate";
import type { SampleRoom } from "./catalog";
import type { Item } from "./store";

// Share links carry the whole design in the URL fragment: nothing is stored server-side,
// and the fragment is never sent to any server.

export type SharedDesign = {
  v: 1;
  room: Pick<SampleRoom, "id" | "name" | "url" | "calibration" | "camera">;
  styleId: string | null;
  items: Pick<Item, "name" | "category" | "libId" | "glb" | "urdf" | "variants" | "position" | "yaw" | "height" | "open">[];
};

const b64url = (u8: Uint8Array) => btoa(String.fromCharCode(...u8)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

export function encodeDesign(room: SampleRoom, styleId: string | null, items: Item[]) {
  const d: SharedDesign = {
    v: 1,
    room: { id: room.id, name: room.name, url: room.url, calibration: room.calibration, camera: room.camera },
    styleId,
    items: items
      .filter((i) => i.status === "ready" && i.glb)
      .map((i) => ({
        name: i.name,
        category: i.category,
        libId: i.libId,
        glb: i.glb,
        // live articulation results live in blob URLs on this device only
        urdf: i.urdf && !i.urdf.files ? i.urdf : undefined,
        variants: Object.fromEntries(Object.entries(i.variants).filter(([k]) => k === styleId)),
        position: i.position.map((n) => Math.round(n * 1000) / 1000) as Item["position"],
        yaw: Math.round(i.yaw * 1000) / 1000,
        height: Math.round(i.height * 1000) / 1000,
        open: false,
      })),
  };
  return b64url(deflateSync(strToU8(JSON.stringify(d)), { level: 9 }));
}

export function decodeDesign(s: string): SharedDesign | null {
  try {
    const d = JSON.parse(strFromU8(inflateSync(fromB64url(s)))) as SharedDesign;
    return d.v === 1 ? d : null;
  } catch {
    return null;
  }
}
