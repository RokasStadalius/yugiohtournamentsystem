import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/images/**', // allows anything after /card-images/
      },
    ],
  },
};

export default nextConfig;
