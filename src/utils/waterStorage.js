export const WATER_STORAGE_KEY = "consumo-agua"
export const DEFAULT_WATER_GOAL = 2500

// Usa a data local: converter para UTC poderia mudar o dia perto da meia-noite.
export function diaLocal(data = new Date()) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, "0")
  const dia = String(data.getDate()).padStart(2, "0")
  return `${ano}-${mes}-${dia}`
}

// Novo dia zera o consumo, mantém a meta.
export function registroDoDia(registro, dia = diaLocal()) {
  return registro.dia === dia ? registro : { ...registro, dia, quantidades: [] }
}

export function carregarAgua(storage, dia = diaLocal()) {
  const vazio = { dia, meta: DEFAULT_WATER_GOAL, quantidades: [] }
  try {
    const texto = storage.getItem(WATER_STORAGE_KEY)
    if (texto === null) return { registro: vazio, erro: "" }
    // O armazenamento pode conter dados antigos ou editados; valida antes de calcular o consumo.
    const registro = JSON.parse(texto)
    if (!registro || typeof registro.dia !== "string" ||
        !Number.isInteger(registro.meta) || registro.meta < 100 || registro.meta > 10000 ||
        !Array.isArray(registro.quantidades) ||
        !registro.quantidades.every((valor) => Number.isInteger(valor) && valor > 0 && valor <= 1000)) {
      throw new Error("Registro inválido")
    }
    return { registro: registroDoDia(registro, dia), erro: "" }
  } catch {
    return { registro: vazio, erro: "Não foi possível carregar o consumo salvo. Um novo registro substituirá os dados anteriores." }
  }
}

export function formatarLitros(ml) {
  return `${(ml / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} L`
}
