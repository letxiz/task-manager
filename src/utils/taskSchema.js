export function idValido(valor) {
  // Não normaliza IDs: espaços ou controles também quebram referências ARIA.
  return typeof valor === "string" && valor.length > 0 && !/[\s\p{Cc}]/u.test(valor)
}

export function dataISOValida(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false
  const data = new Date(`${valor}T00:00:00`)
  const [ano, mes, dia] = valor.split("-").map(Number)
  return ano >= 1000 && data.getFullYear() === ano &&
    data.getMonth() === mes - 1 && data.getDate() === dia
}

function objetoValido(valor) {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor)
}

function recuperarTarefa(tarefa) {
  if (!objetoValido(tarefa) || !idValido(tarefa.id) ||
      typeof tarefa.titulo !== "string" || !tarefa.titulo.trim() ||
      typeof tarefa.concluida !== "boolean") return null
  const item = { ...tarefa }
  let invalido = false
  if (item.descricao !== undefined && typeof item.descricao !== "string") {
    item.descricao = ""
    invalido = true
  }
  if (item.data !== undefined && item.data !== "" && !dataISOValida(item.data)) {
    item.data = ""
    invalido = true
  }
  if (item.topicoId !== undefined && item.topicoId !== "" && !idValido(item.topicoId)) {
    item.topicoId = ""
    invalido = true
  }
  if (item.cor !== undefined && typeof item.cor !== "string") {
    delete item.cor
    invalido = true
  }
  return { item, invalido }
}

function recuperarTopico(topico) {
  if (!objetoValido(topico) || !idValido(topico.id) ||
      typeof topico.nome !== "string" || !topico.nome.trim()) return null
  const item = { ...topico }
  const invalido = item.cor !== undefined && typeof item.cor !== "string"
  if (invalido) delete item.cor
  return { item, invalido }
}

function recuperarColecao(registros, recuperar) {
  if (!Array.isArray(registros)) return { itens: [], invalido: true }
  const ids = new Set()
  const itens = []
  let invalido = false
  for (const registro of registros) {
    const resultado = recuperar(registro)
    if (!resultado || ids.has(resultado.item.id)) {
      invalido = true
      continue
    }
    ids.add(resultado.item.id)
    itens.push(resultado.item)
    invalido ||= resultado.invalido
  }
  return { itens, invalido }
}

export function recuperarTarefas(registros) {
  return recuperarColecao(registros, recuperarTarefa)
}

export function recuperarTopicos(registros) {
  return recuperarColecao(registros, recuperarTopico)
}
