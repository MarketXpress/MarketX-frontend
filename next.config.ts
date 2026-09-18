import type { NextConfig } from "next";

/**
 * The Supabase project host, derived from the same variable the client uses so
 * the two cannot drift apart. Without this entry `next/image` refuses to
 * optimize listing photographs and every product image on the site 404s.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            // Narrowed to the public object path: this allows listing photos
            // and nothing else the storage API happens to expose.
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
