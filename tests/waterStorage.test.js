import test from "node:test"
import assert from "node:assert/strict"
import { carregarAgua, diaLocal, formatarLitros, registroDoDia, DEFAULT_WATER_GOAL } from "../src/utils/waterStorage.js"

const hoje = "2026-11-03"
const storage = (valor) => ({ getItem: () => valor })

test("primeiro acesso começa sem consumo e com meta padrão", () => {
  assert.deepEqual(carregarAgua(storage(null), hoje), {
    registro: { dia: hoje, meta: DEFAULT_WATER_GOAL, quantidades: [] }, erro: "",
  })
})

test("recupera consumo e meta personalizados no mesmo dia", () => {
  const registro = { dia: hoje, meta: 3000, quantidades: [100, 250, 500, 1000] }
  assert.deepEqual(carregarAgua(storage(JSON.stringify(registro)), hoje), { registro, erro: "" })
})

test("virada do dia limpa consumo e mantém meta sem alterar o registro anterior", () => {
  const anterior = { dia: "2026-11-02", meta: 3000, quantidades: [250, 500] }
  assert.deepEqual(registroDoDia(anterior, hoje), { dia: hoje, meta: 3000, quantidades: [] })
  assert.deepEqual(anterior.quantidades, [250, 500])
  assert.deepEqual(carregarAgua(storage(JSON.stringify(anterior)), hoje).registro.quantidades, [])
})

test("dados inválidos e armazenamento bloqueado geram aviso", () => {
  for (const valor of ["null", "{}", "[1]", "inválido", JSON.stringify({ dia: hoje, meta: -1, quantidades: [] }), JSON.stringify({ dia: hoje, meta: 2500, quantidades: [-250] })]) {
    const resultado = carregarAgua(storage(valor), hoje)
    assert.ok(resultado.erro)
    assert.deepEqual(resultado.registro.quantidades, [])
  }
  assert.ok(carregarAgua({ getItem: () => { throw new Error("Bloqueado") } }, hoje).erro)
})

test("data local e litros usam o formato esperado", () => {
  assert.equal(diaLocal(new Date(2026, 10, 3, 23, 59)), hoje)
  assert.equal(formatarLitros(2500), "2,5 L")
  assert.equal(formatarLitros(250), "0,25 L")
  assert.equal(formatarLitros(0), "0 L")
})
