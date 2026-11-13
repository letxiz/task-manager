import { recuperarTarefas, recuperarTopicos } from "./taskSchema.js"
export { dataISOValida } from "./taskSchema.js"

// As chaves legadas permanecem intactas como cópia anterior à migração.
export const TASK_DOCUMENT_KEY = "task-manager:dados"
export const TASK_DOCUMENT_VERSION = 1
const ERRO_LEITURA = "Não foi possível carregar todos os dados salvos. Os dados originais foram preservados e a gravação está bloqueada para evitar perda. Recupere o armazenamento e recarregue a página."
const ERRO_GRAVACAO = "Não foi possível salvar tarefas e tópicos neste navegador. As alterações estão apenas em memória e podem ser perdidas ao sair da página."

function lerLegado(storage, chave, recuperar) {
  try {
    const valor = storage.getItem(chave)
    return recuperar(valor === null ? [] : JSON.parse(valor))
  } catch {
    return { itens: [], invalido: true }
  }
}

function resultadoCarregamento(tarefas, topicos) {
  const invalidas = []
  if (tarefas.invalido) invalidas.push("tarefas")
  if (topicos.invalido) invalidas.push("tópicos")
  const erro = invalidas.length
    ? `Foram encontrados dados inválidos em ${invalidas.join(" e ")}. Os itens recuperáveis foram carregados. ${ERRO_LEITURA}`
    : ""
  return { tarefas: tarefas.itens, topicos: topicos.itens, erro }
}

export function carregarTarefas(storage) {
  let resultado
  try {
    resultado = lerLegado(storage ?? localStorage, "minhas-tarefas", recuperarTarefas)
  } catch {
    resultado = { itens: [], invalido: true }
  }
  return { tarefas: resultado.itens, erro: resultado.invalido ? ERRO_LEITURA : "" }
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
      if (dados?.versao !== TASK_DOCUMENT_VERSION) throw new Error("Documento incompatível")
      return resultadoCarregamento(recuperarTarefas(dados.tarefas), recuperarTopicos(dados.topicos))
    } catch {
      return { tarefas: [], topicos: [], erro: ERRO_LEITURA }
    }
  }
  return resultadoCarregamento(
    lerLegado(origem, "minhas-tarefas", recuperarTarefas),
    lerLegado(origem, "meus-topicos", recuperarTopicos),
  )
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
