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
        hostname: "**.nextlevelbundle.com",
      },
      {
        hostname: "avatars.steamstatic.com",
      },
      {
        hostname: "store.akamai.steamstatic.com",
      },
      {
        hostname: "**.digiphile.co",
      },
      {
        hostname: "placeholder.com",
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
