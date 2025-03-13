import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yugiohtmsblob.blob.core.windows.net',
        pathname: '/card-images/**', // allows anything after /card-images/
      },
    ],
  },
};

export default nextConfig;
