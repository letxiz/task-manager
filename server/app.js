import express from "express"
import { rotasRegistros, ErroApi } from "./registros.js"

export function criarApp(pool) {
  const app = express()
  app.disable("x-powered-by")

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" })
  })

  app.use("/api", express.json(), rotasRegistros(pool))
  app.use((_req, res) => res.status(404).json({ erro: "Rota não encontrada." }))
  app.use((erro, _req, res, next) => {
    if (res.headersSent) return next(erro)
    if (erro instanceof ErroApi) return res.status(erro.status).json({ erro: erro.message })
    if (erro.type === "entity.parse.failed") return res.status(400).json({ erro: "JSON inválido." })
    if (erro.type === "entity.too.large") return res.status(413).json({ erro: "Corpo da requisição muito grande." })
    if (erro.status === 415) return res.status(415).json({ erro: "Formato da requisição não aceito." })
    if (erro instanceof URIError) return res.status(400).json({ erro: "Identificador inválido." })
    if (erro.code === "23503") return res.status(400).json({ erro: "O tópico informado não existe." })

    console.error("Falha ao processar a requisição.", erro.code ?? "")
    res.status(500).json({ erro: "Não foi possível processar a requisição." })
  })

  return app
}
