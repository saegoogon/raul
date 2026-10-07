import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async rewrites() {
    return [{ source: "/@:username", destination: "/u/:username" }];
  },
  async redirects() {
    return [
      { source: "/drive/:path*", destination: "/", permanent: false },
      { source: "/dashboard/:path*", destination: "/", permanent: false },
      { source: "/dashboard", destination: "/", permanent: false },
      { source: "/shop", destination: "/", permanent: false },
      { source: "/shop/:path*", destination: "/", permanent: false },
      { source: "/product/:path*", destination: "/", permanent: false },
      { source: "/cart", destination: "/", permanent: false },
      { source: "/checkout", destination: "/", permanent: false },
      { source: "/checkout/:path*", destination: "/", permanent: false },
      ...["/play", "/rank", "/pay/:path*", "/s/:path*"].map((source) => ({
        source,
        destination: "/",
        permanent: false,
      })),
    ];
  },
};

export default nextConfig;
