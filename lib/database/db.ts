import { drizzle } from "drizzle-orm/neon-serverless"
import ws from "ws"
import * as schema from "./schemas/index"

const db = drizzle({
  connection: process.env.DATABASE_URL!,
  ...schema,
  ws,
})

export default db
