import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Trailing slash for clean URLs
  // trailingSlash: false, // default — leave off for Vercel compatibility

  // Required: expose NEXT_PUBLIC_SITE_URL so QR codes always use the correct domain
  // This is a no-op in code since NEXT_PUBLIC_* are already inlined at build time,
  // but documents which env vars are used.
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "",
  },
};

export default nextConfig;
