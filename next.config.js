/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "@prisma/adapter-libsql", "@libsql/client"],
  },
};

module.exports = nextConfig;
