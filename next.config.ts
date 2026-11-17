import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
