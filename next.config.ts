import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/customer",
        destination: "/customer/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
