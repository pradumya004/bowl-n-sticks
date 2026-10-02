import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */

// next/image only optimizes remote images from hosts listed here, so Supabase
// Storage has to be allowed explicitly. Taken from the env var rather than
// hard-coded, so moving projects does not mean editing this file.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

// The repo root has its own package.json for the db tooling, so Next would
// otherwise guess the workspace root is one level up and trace the wrong files.
const here = fileURLToPath(new URL(".", import.meta.url));

const nextConfig = {
  turbopack: { root: here },
  outputFileTracingRoot: here,
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
