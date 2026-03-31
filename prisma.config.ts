import path from "path"
import { defineConfig } from "prisma/config"

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  migrate: {
    adapter: async () => {
      const { PrismaLibSQL } = await import("@prisma/adapter-libsql")
      const { createClient } = await import("@libsql/client")
      const client = createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      })
      return new PrismaLibSQL(client)
    },
  },
})
