const { defineConfig } = require("prisma/config");
const { PrismaLibSQL } = require("@prisma/adapter-libsql");

module.exports = defineConfig({
  engine: "js",
  experimental: { adapter: true },
  schema: require("path").join("prisma", "schema.prisma"),
  adapter: async () => {
    return new PrismaLibSQL({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  },
});
