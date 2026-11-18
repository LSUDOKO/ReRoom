import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Marketing images are pre-sized WebP; Workers has no Next image optimizer by default.
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  serverExternalPackages: [
    "@manycore/aholo-sdk-asset",
    "@manycore/aholo-sdk-world",
    "@manycore/aholo-sdk-lux3d",
    "@manycore/aholo-sdk-core",
  ],
};

export default nextConfig;
