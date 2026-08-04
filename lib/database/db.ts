import { drizzle } from "drizzle-orm/neon-serverless"
import { defineRelations } from "drizzle-orm/relations"
import ws from "ws"
import * as schema from "./schemas/index"
import { buildRelationsConfig } from "./schemas/relations"

const relations = defineRelations(schema, buildRelationsConfig)

const db = drizzle({
  connection: process.env.DATABASE_URL!,
  relations,
  ws,
})

export default db
