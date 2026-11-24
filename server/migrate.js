import { readFile } from "node:fs/promises"
import process from "node:process"
import { criarPool } from "./db.js"

if (!process.env.DATABASE_URL) {
  console.error("Defina DATABASE_URL no ambiente do servidor ou em server/.env.")
  process.exitCode = 1
} else {
  const pool = criarPool()

  try {
    const sql = await readFile(new URL("./migrations/001_initial.sql", import.meta.url), "utf8")
    await pool.query(sql)
    console.log("Migração 001 aplicada.")
  } catch (erro) {
    console.error(`Falha ao aplicar a migração 001 (${erro.code ?? "sem código"}).`)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}
