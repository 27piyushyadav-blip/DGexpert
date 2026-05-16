/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: "standalone",
  //reactCompiler: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["*.cloudworkstations.dev", "localhost:3000", "localhost:3001"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", 
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", 
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com", // [!code ++] Added for registration avatars
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com", // Added for dicebear avatars
      },
      // ✅ Allow backend local image uploads
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
    ],
  },
  // Preserving your specific cloud environment origin
  allowedDevOrigins: [
    "3000-firebase-mindnamo-1766703496806.cluster-ys234awlzbhwoxmkkse6qo3fz6.cloudworkstations.dev"
  ],
};

export default nextConfig;
