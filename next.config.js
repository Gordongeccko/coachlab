/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    serverExternalPackages: ["@prisma/client", "@prisma/adapter-libsql", "@libsql/client"],
  },
};

module.exports = nextConfig;
