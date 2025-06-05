import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  /* config options here */
  experimental: {
    // swcPlugins: [
    //   [
    //     path.resolve(__dirname, '../plugin/target/wasm32-wasip1/release/react_semantic_tagger.wasm'),
    //     {},
    //   ],
    // ],
  },
};

export default nextConfig;
