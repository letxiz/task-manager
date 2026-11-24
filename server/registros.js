import { randomUUID } from "node:crypto"
import { Router } from "express"
import { getTopicColor, TOPIC_COLORS } from "../src/constants/topicColors.js"
import { dataISOValida, idValido } from "../src/utils/taskSchema.js"

export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem)
    this.status = status
  }
}

const camposTarefa = "id, titulo, descricao, coalesce(to_char(prazo, 'YYYY-MM-DD'), '') AS data, cor, concluida, coalesce(topico_id, '') AS \"topicoId\""
const camposTopico = "id, nome, coalesce(cor, 'blue') AS cor"

function texto(valor) {
  return typeof valor === "string" && !valor.includes("\0")
}

const regrasTarefa = {
  titulo: (valor) => texto(valor) && valor.trim() !== "",
  descricao: texto,
  data: (valor) => valor === "" || dataISOValida(valor),
  cor: (valor) => texto(valor) && /^#[0-9a-f]{6}$/i.test(valor),
  concluida: (valor) => typeof valor === "boolean",
  topicoId: (valor) => valor === "" || idValido(valor),
}

const regrasTopico = {
  nome: (valor) => texto(valor) && valor.trim() !== "",
  cor: (valor) => TOPIC_COLORS.some((cor) => cor.id === valor),
}

function validarCampos(corpo, regras, obrigatorio) {
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo) || !Object.keys(corpo).length) {
    throw new ErroApi(400, "Envie um objeto JSON com os campos da operação.")
  }
  for (const [campo, valor] of Object.entries(corpo)) {
    if (!Object.hasOwn(regras, campo)) throw new ErroApi(400, `Campo não reconhecido: ${campo}.`)
    if (!regras[campo](valor)) throw new ErroApi(400, `Valor inválido para o campo ${campo}.`)
  }
  if (obrigatorio && !Object.hasOwn(corpo, obrigatorio)) {
    throw new ErroApi(400, `O campo ${obrigatorio} é obrigatório.`)
  }
}

async function consultarUm(resultado, mensagem) {
  const { rows } = await resultado
  if (!rows.length) throw new ErroApi(404, mensagem)
  return rows[0]
}

async function emTransacao(pool, operacao) {
  const cliente = await pool.connect()
  try {
    await cliente.query("BEGIN")
    const resultado = await operacao(cliente)
    await cliente.query("COMMIT")
    return resultado
  } catch (erro) {
    await cliente.query("ROLLBACK")
    throw erro
  } finally {
    cliente.release()
  }
}

function gravarEmOrdem(pool, chave, operacao) {
  return emTransacao(pool, async (cliente) => {
    // Uma gravação por vez evita posições repetidas e tópicos com o mesmo nome.
    await cliente.query("SELECT pg_advisory_xact_lock(317514, $1)", [chave])
    return operacao(cliente)
  })
}

function idsUnicos(ids) {
  return Array.isArray(ids) && ids.every(idValido) && new Set(ids).size === ids.length
}

function mesmosIds(ids, outros) {
  const conjunto = new Set(outros)
  return ids.length === outros.length && ids.every((id) => conjunto.has(id))
}

function registrarReordenacao(rotas, pool, tabela) {
  rotas.patch("/ordem/manual", async (req, res) => {
    validarCampos(req.body, { antes: idsUnicos, ordem: idsUnicos }, "antes")
    const { antes, ordem } = req.body
    if (!ordem || !mesmosIds(antes, ordem)) throw new ErroApi(400, "Envie os mesmos IDs na nova ordem.")

    await emTransacao(pool, async (cliente) => {
      await cliente.query(`LOCK TABLE ${tabela} IN SHARE ROW EXCLUSIVE MODE`)
      const colunas = tabela === "tarefas" ? "id, topico_id" : "id"
      const { rows } = await cliente.query(`SELECT ${colunas} FROM ${tabela} ORDER BY posicao, id`)
      if (rows.length !== antes.length || rows.some(({ id }, indice) => id !== antes[indice])) {
        throw new ErroApi(409, "A lista mudou no servidor. Recarregue a prévia antes de reordenar.")
      }
      if (tabela === "tarefas") {
        const grupos = new Map(rows.map(({ id, topico_id }) => [id, topico_id]))
        if (ordem.some((id, indice) => grupos.get(id) !== rows[indice].topico_id)) {
          throw new ErroApi(409, "Reordene tarefas dentro do mesmo tópico. Se um vínculo mudou, recarregue a prévia.")
        }
      }
      await cliente.query(
        `UPDATE ${tabela} AS registro SET posicao = nova.posicao - 1
         FROM unnest($1::text[]) WITH ORDINALITY AS nova(id, posicao)
         WHERE registro.id = nova.id`,
        [ordem],
      )
    })
    res.sendStatus(204)
  })
}

async function limparRegistros(pool, { tarefasIds, topicosIds }) {
  await emTransacao(pool, async (cliente) => {
    await cliente.query("LOCK TABLE topicos, tarefas IN SHARE ROW EXCLUSIVE MODE")
    const { rows: tarefas } = await cliente.query("SELECT id FROM tarefas")
    const { rows: topicos } = await cliente.query("SELECT id FROM topicos")
    if (!mesmosIds(tarefasIds, tarefas.map(({ id }) => id)) || !mesmosIds(topicosIds, topicos.map(({ id }) => id))) {
      throw new ErroApi(409, "Os registros mudaram no servidor. Recarregue a prévia antes de confirmar a limpeza.")
    }
    await cliente.query("DELETE FROM tarefas")
    await cliente.query("DELETE FROM topicos")
  })
}

async function validarNome(cliente, nome, id = null) {
  const { rows } = await cliente.query(
    "SELECT 1 FROM topicos WHERE lower(nome) = lower($1) AND id IS DISTINCT FROM $2 LIMIT 1",
    [nome, id],
  )
  if (rows.length) throw new ErroApi(409, "Já existe um tópico com esse nome.")
}

export function rotasRegistros(pool) {
  const router = Router()
  const tarefas = Router()
  const topicos = Router()
  const tarefaAusente = "Tarefa não encontrada."
  const topicoAusente = "Tópico não encontrado."

  for (const rotas of [tarefas, topicos]) {
    rotas.use((_req, _res, next) => {
      if (!pool) throw new ErroApi(503, "Configure DATABASE_URL no servidor para acessar os registros.")
      next()
    })
    rotas.param("id", (_req, _res, next, id) => {
      if (!idValido(id)) throw new ErroApi(400, "Identificador inválido.")
      next()
    })
  }

  registrarReordenacao(tarefas, pool, "tarefas")
  registrarReordenacao(topicos, pool, "topicos")

  router.post("/registros/limpeza", async (req, res) => {
    if (!pool) throw new ErroApi(503, "Configure DATABASE_URL no servidor para acessar os registros.")
    validarCampos(req.body, { tarefasIds: idsUnicos, topicosIds: idsUnicos }, "tarefasIds")
    if (!req.body.topicosIds) throw new ErroApi(400, "O campo topicosIds é obrigatório.")
    await limparRegistros(pool, req.body)
    res.sendStatus(204)
  })

  tarefas.get("/", async (_req, res) => {
    const { rows } = await pool.query(`SELECT ${camposTarefa} FROM tarefas ORDER BY posicao, id`)
    res.json(rows)
  })

  tarefas.get("/:id", async (req, res) => {
    res.json(await consultarUm(
      pool.query(`SELECT ${camposTarefa} FROM tarefas WHERE id = $1`, [req.params.id]),
      tarefaAusente,
    ))
  })

  tarefas.post("/", async (req, res) => {
    validarCampos(req.body, regrasTarefa, "titulo")
    const { titulo, descricao = "", data = "", cor = "#ef4444", concluida = false, topicoId = "" } = req.body
    const { rows } = await gravarEmOrdem(pool, 1, (cliente) => cliente.query(
      `INSERT INTO tarefas (id, titulo, descricao, prazo, cor, concluida, topico_id, posicao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT coalesce(max(posicao) + 1, 0) FROM tarefas))
       RETURNING ${camposTarefa}`,
      [randomUUID(), titulo.trim(), descricao.trim(), data || null, cor, concluida, topicoId || null],
    ))
    res.status(201).json(rows[0])
  })

  tarefas.patch("/:id", async (req, res) => {
    validarCampos(req.body, regrasTarefa)
    const { titulo, descricao, data, cor, concluida, topicoId } = req.body
    const tarefa = await consultarUm(pool.query(
      `UPDATE tarefas SET titulo = coalesce($2, titulo), descricao = coalesce($3, descricao),
       prazo = CASE WHEN $4::text IS NULL THEN prazo ELSE nullif($4, '')::date END,
       cor = coalesce($5, cor), concluida = coalesce($6, concluida),
       topico_id = CASE WHEN $7::text IS NULL THEN topico_id ELSE nullif($7, '') END
       WHERE id = $1 RETURNING ${camposTarefa}`,
      [req.params.id, titulo?.trim(), descricao?.trim(), data, cor, concluida, topicoId],
    ), tarefaAusente)
    res.json(tarefa)
  })

  tarefas.delete("/:id", async (req, res) => {
    await consultarUm(pool.query("DELETE FROM tarefas WHERE id = $1 RETURNING id", [req.params.id]), tarefaAusente)
    res.sendStatus(204)
  })

  topicos.get("/", async (_req, res) => {
    const { rows } = await pool.query(`SELECT ${camposTopico} FROM topicos ORDER BY posicao, id`)
    res.json(rows)
  })

  topicos.get("/:id", async (req, res) => {
    res.json(await consultarUm(
      pool.query(`SELECT ${camposTopico} FROM topicos WHERE id = $1`, [req.params.id]),
      topicoAusente,
    ))
  })

  topicos.post("/", async (req, res) => {
    validarCampos(req.body, { ...regrasTopico, agruparSemTopico: (valor) => typeof valor === "boolean" }, "nome")
    const { nome, cor, agruparSemTopico } = req.body
    const topico = await gravarEmOrdem(pool, 2, async (cliente) => {
      await validarNome(cliente, nome.trim())
      const { rows: [criado] } = await cliente.query(
        `INSERT INTO topicos (id, nome, cor, posicao)
         VALUES ($1, $2, $3, (SELECT coalesce(max(posicao) + 1, 0) FROM topicos))
         RETURNING ${camposTopico}`,
        [randomUUID(), nome.trim(), getTopicColor(cor).id],
      )
      if (agruparSemTopico) await cliente.query("UPDATE tarefas SET topico_id = $1 WHERE topico_id IS NULL", [criado.id])
      return criado
    })
    res.status(201).json(topico)
  })

  topicos.patch("/:id", async (req, res) => {
    validarCampos(req.body, regrasTopico)
    const { id } = req.params
    const { nome, cor } = req.body
    const topico = await gravarEmOrdem(pool, 2, async (cliente) => {
      await consultarUm(cliente.query("SELECT id FROM topicos WHERE id = $1 FOR UPDATE", [id]), topicoAusente)
      if (nome !== undefined) await validarNome(cliente, nome.trim(), id)
      return consultarUm(cliente.query(
        `UPDATE topicos SET nome = coalesce($2, nome), cor = coalesce($3, cor)
         WHERE id = $1 RETURNING ${camposTopico}`,
        [id, nome?.trim(), cor],
      ), topicoAusente)
    })
    res.json(topico)
  })

  topicos.delete("/:id", async (req, res) => {
    await consultarUm(pool.query("DELETE FROM topicos WHERE id = $1 RETURNING id", [req.params.id]), topicoAusente)
    res.sendStatus(204)
  })

  router.use("/tarefas", tarefas)
  router.use("/topicos", topicos)
  return router
}
