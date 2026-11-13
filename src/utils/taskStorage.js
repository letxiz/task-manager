export function dataISOValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false
  const data = new Date(`${valor}T00:00:00`)
  const [ano, mes, dia] = valor.split("-").map(Number)
  // Rejeita dias inexistentes.
  return ano >= 1000 && data.getFullYear() === ano &&
    data.getMonth() === mes - 1 && data.getDate() === dia
}

export function carregarTarefas(storage) {
  try {
    const salvas = (storage ?? localStorage).getItem("minhas-tarefas")
    const tarefas = salvas === null ? [] : JSON.parse(salvas)
    // Valida campos e IDs únicos.
    const ids = new Set()
    if (!Array.isArray(tarefas) || !tarefas.every((tarefa) => {
      if (!tarefa || typeof tarefa !== "object" ||
          typeof tarefa.id !== "string" || !tarefa.id.trim() || ids.has(tarefa.id) ||
          typeof tarefa.titulo !== "string" || !tarefa.titulo.trim() ||
          (tarefa.descricao !== undefined && typeof tarefa.descricao !== "string") ||
          (tarefa.data !== undefined && tarefa.data !== "" && !dataISOValida(tarefa.data)) ||
          typeof tarefa.concluida !== "boolean") return false
      ids.add(tarefa.id)
      return true
    })) throw new Error("Dados inválidos")
    return { tarefas, erro: "" }
  } catch {
    // Preserva os dados inválidos.
    return {
      tarefas: [],
      erro: "Não foi possível carregar as tarefas salvas. Os dados anteriores foram preservados; adicionar tarefas substituirá a lista salva.",
    }
  }
}

// As chaves legadas permanecem intactas como cópia anterior à migração.
export const TASK_DOCUMENT_KEY = "task-manager:dados"
export const TASK_DOCUMENT_VERSION = 1
const ERRO_LEITURA = "Não foi possível carregar todos os dados salvos. Os dados originais foram preservados e a gravação está bloqueada para evitar perda. Recupere o armazenamento e recarregue a página."
const ERRO_GRAVACAO = "Não foi possível salvar tarefas e tópicos neste navegador. As alterações estão apenas em memória e podem ser perdidas ao sair da página."

function lerTopicos(valor) {
  const topicos = valor === null ? [] : JSON.parse(valor)
  if (!Array.isArray(topicos)) throw new Error("Tópicos inválidos")
  const validos = topicos.filter((topico) => topico && typeof topico.id === "string" && typeof topico.nome === "string")
  return { topicos: validos, invalido: validos.length !== topicos.length }
}

export function carregarDocumentoTarefas(storage) {
  let origem
  let documento
  try {
    origem = storage ?? localStorage
    documento = origem.getItem(TASK_DOCUMENT_KEY)
  } catch {
    return { tarefas: [], topicos: [], erro: ERRO_LEITURA }
  }
  if (documento !== null) {
    try {
      const dados = JSON.parse(documento)
      if (dados?.versao !== TASK_DOCUMENT_VERSION || !Array.isArray(dados.tarefas) || !Array.isArray(dados.topicos)) {
        throw new Error("Documento incompatível")
      }
      const tarefas = carregarTarefas({ getItem: () => JSON.stringify(dados.tarefas) })
      const topicos = lerTopicos(JSON.stringify(dados.topicos))
      return { tarefas: tarefas.tarefas, topicos: topicos.topicos, erro: tarefas.erro || topicos.invalido ? ERRO_LEITURA : "" }
    } catch {
      return { tarefas: [], topicos: [], erro: ERRO_LEITURA }
    }
  }

  const tarefas = carregarTarefas(origem)
  try {
    const topicos = lerTopicos(origem.getItem("meus-topicos"))
    return { tarefas: tarefas.tarefas, topicos: topicos.topicos, erro: tarefas.erro || topicos.invalido ? ERRO_LEITURA : "" }
  } catch {
    return { tarefas: tarefas.tarefas, topicos: [], erro: ERRO_LEITURA }
  }
}

export function salvarDocumentoTarefas(dados, storage) {
  try {
    // Uma única substituição evita persistir somente metade de uma operação.
    const documento = JSON.stringify({ versao: TASK_DOCUMENT_VERSION, tarefas: dados.tarefas, topicos: dados.topicos })
    const destino = storage ?? localStorage
    destino.setItem(TASK_DOCUMENT_KEY, documento)
    return { erro: "" }
  } catch {
    return { erro: ERRO_GRAVACAO }
  }
}
