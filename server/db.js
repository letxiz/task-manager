import process from "node:process"
import pg from "pg"

export function criarPool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("Defina DATABASE_URL no ambiente do servidor ou em server/.env.")
  }

  return new pg.Pool({ connectionString, connectionTimeoutMillis: 5000 })
}
