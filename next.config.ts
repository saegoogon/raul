import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async redirects() {
    return [
      ...["/play", "/shop", "/rank", "/submit", "/post/:id", "/pay/:path*", "/u/:path*"].map((source) => ({
        source,
        destination: "/",
        permanent: false,
      })),
    ];
  },
};

export default nextConfig;
