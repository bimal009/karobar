import { drizzle } from "drizzle-orm/neon-serverless"
import ws from "ws"

const db = drizzle({
  connection: process.env.DATABASE_URL!,
  ws,
})

export default db
