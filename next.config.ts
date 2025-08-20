import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "shared.akamai.steamstatic.com",
      },
      {
        hostname: "media.nextlevelbundle.com",
      },
      {
        hostname: "avatars.steamstatic.com",
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
