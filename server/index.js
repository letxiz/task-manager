import process from "node:process"
import { criarApp } from "./app.js"
import { criarPool } from "./db.js"

const host = "127.0.0.1"
const port = 3000
const pool = process.env.DATABASE_URL ? criarPool() : null

pool?.on("error", (erro) => {
  console.error("Conexão ociosa com PostgreSQL interrompida.", erro.code ?? "")
})

criarApp(pool).listen(port, host).on("listening", () => {
  console.log(`API disponível em http://${host}:${port}`)
})
