/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: ["@prisma/client", "@prisma/adapter-libsql", "@libsql/client"],
  },
};

module.exports = nextConfig;
