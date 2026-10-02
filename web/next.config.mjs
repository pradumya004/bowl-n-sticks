/** @type {import('next').NextConfig} */

// next/image only optimizes remote images from hosts listed here, so Supabase
// Storage has to be allowed explicitly. Taken from the env var rather than
// hard-coded, so moving projects does not mean editing this file.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
