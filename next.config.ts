import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@google/genai'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jnfxijwavgplafrikeud.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
  },
};



export default nextConfig;
