import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
      },
    ],
  },
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
