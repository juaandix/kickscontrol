import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "static.nike.com" },
      { hostname: "images.puma.com" },
      { hostname: "m.media-amazon.com" },
    ],
  },
};

export default nextConfig;
