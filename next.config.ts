
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ["6000-firebase-prernagram-1754738150817.cluster-73qgvk7hjjadkrjeyexca5ivva.cloudworkstations.dev"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lqvdylprytkgiaabyywa.supabase.co',
      },
    ],
  },
};

export default nextConfig;
