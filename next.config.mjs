/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow external images if needed in future
  images: {
    remotePatterns: [],
  },
  // Add PWA headers
  async headers() {
    return [
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },
    ];
  },
};

export default nextConfig;
