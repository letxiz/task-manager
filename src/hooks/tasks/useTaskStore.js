import { useCallback, useMemo, useRef, useState } from "react"
import { gerarIdSeguro } from "../../utils/generateId.js"
import { useNotification } from "../../contexts/NotificationContext.js"
import { TOPIC_COLORS, getTopicColor } from "../../constants/topicColors.js"
import { carregarDocumentoTarefas, salvarDocumentoTarefas } from "../../utils/taskStorage.js"

export function useTaskStore() {
  const notify = useNotification()
  const [armazenamento] = useState(() => {
    const dados = carregarDocumentoTarefas()
    return { ...dados, topicos: dados.topicos.map((topico, index) => ({
      ...topico,
      cor: topico.cor ? getTopicColor(topico.cor).id : TOPIC_COLORS[index % TOPIC_COLORS.length].id,
    })) }
  })
  const [dados, atualizarEstado] = useState(() => ({ tarefas: armazenamento.tarefas, topicos: armazenamento.topicos }))
  const [erroArmazenamento, setErroArmazenamento] = useState(armazenamento.erro)
  const dadosAtuais = useRef(dados)
  const { tarefas, topicos } = dados

  // O cálculo é puro; publicação, persistência e notificações acontecem depois.
  // A referência preserva atualizações consecutivas e setters de renders antigos.
  const atualizarColecoes = useCallback((atualizacao, mensagem) => {
    const proximos = typeof atualizacao === "function" ? atualizacao(dadosAtuais.current) : atualizacao
    dadosAtuais.current = proximos
    atualizarEstado(proximos)
    if (armazenamento.erro) return false
    const resultado = salvarDocumentoTarefas(proximos)
    setErroArmazenamento(resultado.erro)
    if (resultado.erro) return false
    if (mensagem) notify(mensagem)
    return true
  }, [armazenamento.erro, notify])

  const acoes = useMemo(() => {
    function setTarefas(atualizar, mensagem) {
      return atualizarColecoes((atuais) => ({
        ...atuais, tarefas: typeof atualizar === "function" ? atualizar(atuais.tarefas) : atualizar,
      }), mensagem)
    }

    function setTopicos(atualizar, mensagem) {
      return atualizarColecoes((atuais) => ({
        ...atuais, topicos: typeof atualizar === "function" ? atualizar(atuais.topicos) : atualizar,
      }), mensagem)
    }

    // Resultados distinguem validação/geração de ID de falha na persistência.
    // Uma falha ao salvar ainda mantém a alteração em memória, como nos setters.
    function novoId() {
      try {
        return { id: gerarIdSeguro() }
      } catch {
        return { campo: "criacao", erro: "Este navegador não conseguiu gerar um identificador seguro. Tente novamente em um navegador atualizado." }
      }
    }

    function camposTarefa(campos) {
      return { titulo: campos.titulo.trim(), descricao: (campos.descricao ?? "").trim(), data: campos.data ?? "", topicoId: campos.topicoId ?? "" }
    }

    function criarTarefa(campos) {
      const normalizados = camposTarefa(campos)
      if (!normalizados.titulo) return { campo: "titulo", erro: "O título da tarefa é obrigatório." }
      const identidade = novoId()
      if (identidade.erro) return identidade
      const tarefa = { ...normalizados, id: identidade.id, cor: campos.cor ?? "#ef4444", concluida: false }
      const salvo = setTarefas((atuais) => [...atuais, tarefa], "Tarefa cadastrada com sucesso.")
      return { erro: "", salvo, id: tarefa.id }
    }

    function editarTarefa(id, campos) {
      const normalizados = camposTarefa(campos)
      if (!normalizados.titulo) return { campo: "titulo", erro: "O título da tarefa é obrigatório." }
      // Preserva ID, conclusão, cor, posição e quaisquer outros campos existentes.
      const salvo = setTarefas((atuais) => atuais.map((tarefa) => tarefa.id === id ? { ...tarefa, ...normalizados } : tarefa), "Tarefa atualizada com sucesso.")
      return { erro: "", salvo }
    }

    function validarTopico(campos, id) {
      const nome = campos.nome.trim()
      if (!nome) return { campo: "nome", erro: "O nome do tópico é obrigatório." }
      if (dadosAtuais.current.topicos.some((topico) => topico.id !== id && topico.nome.toLocaleLowerCase() === nome.toLocaleLowerCase())) {
        return { campo: "nome", erro: "Já existe um tópico com esse nome." }
      }
      return { nome, cor: getTopicColor(campos.cor).id }
    }

    function criarNovoTopico(campos, agruparSemTopico) {
      const normalizados = validarTopico(campos)
      if (normalizados.erro) return normalizados
      const identidade = novoId()
      if (identidade.erro) return identidade
      const topico = { ...normalizados, id: identidade.id }
      const salvo = atualizarColecoes((atuais) => ({
        topicos: [...atuais.topicos, topico],
        tarefas: agruparSemTopico ? atuais.tarefas.map((tarefa) =>
          !tarefa.topicoId || !atuais.topicos.some((item) => item.id === tarefa.topicoId)
            ? { ...tarefa, topicoId: topico.id } : tarefa) : atuais.tarefas,
      }), agruparSemTopico ? "Tópico atualizado. Suas tarefas foram mantidas no grupo." : "Tópico criado com sucesso.")
      return { erro: "", salvo, id: topico.id }
    }

    function criarTopico(campos) {
      return criarNovoTopico(campos, false)
    }

    function criarTopicoComTarefasSemTopico(campos) {
      return criarNovoTopico(campos, true)
    }

    function editarTopico(id, campos) {
      const normalizados = validarTopico(campos, id)
      if (normalizados.erro) return normalizados
      const salvo = setTopicos((atuais) => atuais.map((topico) => topico.id === id ? { ...topico, ...normalizados } : topico), "Tópico atualizado com sucesso.")
      return { erro: "", salvo }
    }

    function limparDados() {
      return atualizarColecoes({ tarefas: [], topicos: [] }, "Todas as tarefas e tópicos foram excluídos.")
    }

    function reordenarTopicos(topicosOrdenados) {
      return setTopicos(topicosOrdenados)
    }

    function alternarConclusao(id) {
      setTarefas((atuais) =>
        atuais.map((tarefa) =>
          tarefa.id === id
            ? { ...tarefa, concluida: !tarefa.concluida }
            : tarefa
        )
      )
    }
    function excluirTarefa(id) {
      setTarefas((atuais) => atuais.filter((tarefa) => tarefa.id !== id), "Tarefa excluída.")
    }
    function moverTarefa(id, novoTopicoId) {
      // String vazia remove o vínculo.
      setTarefas((atuais) =>
        atuais.map((tarefa) =>
          tarefa.id === id ? { ...tarefa, topicoId: novoTopicoId } : tarefa
        )
      )
    }
    function reordenarTarefas(idsOrdenados) {
      setTarefas((atuais) => {
        const idsDoGrupo = new Set(idsOrdenados)
        const tarefasPorId = new Map(atuais.map((tarefa) => [tarefa.id, tarefa]))
        let indiceOrdenado = 0

        // Preserva a ordem dos outros grupos.
        return atuais.map((tarefa) => {
          if (!idsDoGrupo.has(tarefa.id)) return tarefa
          const tarefaOrdenada = tarefasPorId.get(idsOrdenados[indiceOrdenado])
          indiceOrdenado += 1
          return tarefaOrdenada
        })
      })
    }

    // Exclui o tópico, mantém as tarefas.
    function excluirTopico(id) {
      return atualizarColecoes((atuais) => ({
        tarefas: atuais.tarefas.map((tarefa) => tarefa.topicoId === id ? { ...tarefa, topicoId: "" } : tarefa),
        topicos: atuais.topicos.filter((topico) => topico.id !== id),
      }), "Tópico excluído. As tarefas foram mantidas em Sem tópico.")
    }

    return {
      setTarefas, setTopicos, atualizarColecoes,
      criarTarefa, editarTarefa, criarTopico, editarTopico, criarTopicoComTarefasSemTopico, limparDados, reordenarTopicos,
      alternarConclusao, excluirTarefa, moverTarefa, reordenarTarefas, excluirTopico,
    }
  }, [atualizarColecoes])

  return useMemo(() => ({ tarefas, topicos, erroArmazenamento, acoes, ...acoes }), [tarefas, topicos, erroArmazenamento, acoes])
}
