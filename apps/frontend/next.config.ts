import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://crm-saude.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
