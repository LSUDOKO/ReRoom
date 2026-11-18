// Workers buffer uploads in 128 MB of memory, so the Cloudflare build sets a lower cap.
export const UPLOAD_MAX_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB ?? 500);
