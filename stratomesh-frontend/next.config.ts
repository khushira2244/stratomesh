import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },

  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: "https://stratomesh-3tvv.vercel.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;