import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // the About page is now part of the home page
    return [{ source: "/about", destination: "/", permanent: true }];
  },
  images: {
    // serve modern formats so the large phone photos download much smaller
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
