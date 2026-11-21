import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // serve modern formats so the large phone photos download much smaller
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
