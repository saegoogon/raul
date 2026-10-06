import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async rewrites() {
    return [{ source: "/@:username", destination: "/p/:username" }];
  },
  async redirects() {
    return [
      { source: "/drive/:path*", destination: "/", permanent: false },
      { source: "/dashboard/:path*", destination: "/", permanent: false },
      { source: "/dashboard", destination: "/", permanent: false },
      ...["/play", "/shop", "/rank", "/submit", "/post/:id", "/pay/:path*", "/u/:path*", "/s/:path*"].map((source) => ({
        source,
        destination: "/",
        permanent: false,
      })),
    ];
  },
};

export default nextConfig;
