import test from "node:test"
import assert from "node:assert/strict"
import { build } from "vite"
import { gzipSync } from "node:zlib"
import { Buffer } from "node:buffer"

test("build mantém dnd-kit fora dos chunks carregados inicialmente", async () => {
  const resultado = await build({ logLevel: "silent", build: { write: false } })
  const chunks = new Map(resultado.output.filter((item) => item.type === "chunk").map((item) => [item.fileName, item]))
  const iniciais = new Set()
  function visitar(nome) {
    if (iniciais.has(nome)) return
    iniciais.add(nome)
    for (const dependencia of chunks.get(nome).imports) if (chunks.has(dependencia)) visitar(dependencia)
  }
  for (const chunk of chunks.values()) if (chunk.isEntry) visitar(chunk.fileName)
  const temDnd = (chunk) => Object.keys(chunk.modules).some((id) => id.includes("@dnd-kit"))
  assert.equal([...iniciais].some((nome) => temDnd(chunks.get(nome))), false)
  assert.ok([...chunks.values()].some((chunk) => !iniciais.has(chunk.fileName) && temDnd(chunk)))
  const bruto = [...iniciais].reduce((total, nome) => total + Buffer.byteLength(chunks.get(nome).code), 0)
  const gzip = [...iniciais].reduce((total, nome) => total + gzipSync(chunks.get(nome).code).length, 0)
  console.log(`JavaScript inicial: ${bruto} bytes; gzip: ${gzip} bytes`)
})
