import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['motion'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
