import { useRef, useState } from "react"
import PropTypes from "prop-types"
import { TOPIC_COLORS, getTopicColor } from "../../constants/topicColors.js"
import { recuperarTarefas, recuperarTopicos } from "../../utils/taskSchema.js"
import { indexarTarefas } from "../../utils/taskGroups.js"

const tarefaVazia = { id: "", titulo: "", descricao: "", data: "", topicoId: "", cor: "#ef4444", concluida: false }
const topicoVazio = { id: "", nome: "", cor: TOPIC_COLORS[0].id, agruparSemTopico: false }
const idEditavel = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
const campoClasse = "ml-2 max-w-full rounded-lg border border-stone-300 px-2 py-1"

async function solicitar(caminho, method, status, campos) {
  const resposta = await fetch(caminho, {
    method,
    headers: campos === undefined ? { Accept: "application/json" } : { "Content-Type": "application/json", Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
    body: campos === undefined ? undefined : JSON.stringify(campos),
  })
  if (resposta.status >= 400 && resposta.status < 500) {
    const erro = await resposta.json().catch(() => null)
    return { erro: erro?.erro || "A API recusou a operação." }
  }
  if (resposta.status !== status) throw new Error("Gravação sem confirmação.")
  return { resposta }
}

async function gravarRegistro(colecao, { id, ...campos }, excluir) {
  const caminho = id ? `/api/${colecao}/${id}` : `/api/${colecao}`
  const resultado = excluir
    ? await solicitar(caminho, "DELETE", 204)
    : await solicitar(caminho, id ? "PATCH" : "POST", id ? 200 : 201, campos)
  if (resultado.erro || excluir) return resultado
  const recuperar = colecao === "tarefas" ? recuperarTarefas : recuperarTopicos
  const { itens: [registro], invalido } = recuperar([await resultado.resposta.json()])
  if (invalido || (id && registro.id !== id)) throw new Error("Resposta inválida.")
  return { registro }
}

export default function ApiTaskPilot({ tarefas, topicos, onChange, onReorder, onClear }) {
  const [colecao, setColecao] = useState("tarefas")
  const [formulario, setFormulario] = useState(tarefaVazia)
  const [gravando, setGravando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const [confirmando, setConfirmando] = useState(false)
  const gravacaoPendente = useRef(false)
  const tarefa = colecao === "tarefas"
  const registros = tarefa ? tarefas : topicos
  const vazio = tarefa ? tarefaVazia : topicoVazio
  const campoNome = tarefa ? "titulo" : "nome"
  const registroAtual = registros.find(({ id }) => id === formulario.id)
  let grupo = registros
  if (tarefa && registroAtual) {
    const indice = indexarTarefas(tarefas, topicos)
    grupo = indice.porTopico.get(registroAtual.topicoId) ?? indice.tarefasSemTopico
  }
  const posicao = grupo.indexOf(registroAtual)

  function selecionar(id) {
    const registro = registros.find((item) => item.id === id)
    setFormulario(!registro ? vazio : tarefa
      ? { ...tarefaVazia, ...registro, cor: registro.cor ?? tarefaVazia.cor }
      : { ...topicoVazio, id, nome: registro.nome, cor: getTopicColor(registro.cor).id })
    setConfirmando(false)
    setAviso(null)
  }

  function mudarColecao(proxima) {
    if (proxima === colecao) return
    setColecao(proxima)
    setFormulario(proxima === "tarefas" ? tarefaVazia : topicoVazio)
    setConfirmando(false)
    setAviso(null)
  }

  function mudar(campo, valor) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }))
  }

  async function executar(operacao, confirmar, sucesso) {
    if (gravacaoPendente.current) return
    gravacaoPendente.current = true
    setGravando(true)
    setAviso(null)
    try {
      const resultado = await operacao()
      const { erro } = resultado
      if (erro) {
        setAviso({ erro })
        return
      }
      confirmar(resultado)
      setConfirmando(false)
      setAviso({ sucesso })
    } catch {
      setAviso({ erro: "A API não confirmou a gravação. Abra a prévia em outra aba para conferir o servidor antes de reenviar." })
    } finally {
      gravacaoPendente.current = false
      setGravando(false)
    }
  }

  function salvar(excluir = false) {
    const campos = { ...formulario, [campoNome]: formulario[campoNome].trim() }
    if (!excluir && !campos[campoNome]) {
      setAviso({ erro: tarefa ? "Informe o título da tarefa." : "Informe o nome do tópico." })
      return
    }
    if (!tarefa && campos.id) delete campos.agruparSemTopico
    void executar(
      () => gravarRegistro(colecao, campos, excluir),
      ({ registro }) => {
        onChange(colecao, { registro, excluirId: excluir ? campos.id : "", agruparSemTopico: campos.agruparSemTopico })
        setFormulario(excluir || !campos.id ? vazio : { ...vazio, ...registro })
      },
      excluir ? "Registro excluído do servidor." : "Registro salvo no servidor.",
    )
  }

  function mover(direcao) {
    const vizinho = grupo[posicao + direcao]
    if (!registroAtual || !vizinho) return
    const ids = registros.map(({ id }) => id)
    const reordenados = registros.map((registro) => {
      if (registro === registroAtual) return vizinho
      if (registro === vizinho) return registroAtual
      return registro
    })
    void executar(
      () => solicitar(`/api/${colecao}/ordem/manual`, "PATCH", 204, { antes: ids, ordem: reordenados.map(({ id }) => id) }),
      () => onReorder(colecao, reordenados),
      "Ordem atualizada no servidor.",
    )
  }

  function limpar() {
    void executar(
      () => solicitar("/api/registros/limpeza", "POST", 204, {
        tarefasIds: tarefas.map(({ id }) => id),
        topicosIds: topicos.map(({ id }) => id),
      }),
      () => {
        onClear()
        setFormulario(vazio)
      },
      "Tarefas e tópicos excluídos do servidor.",
    )
  }

  function enviar(evento) {
    evento.preventDefault()
    if (!confirmando) salvar()
  }

  return (
    <form onSubmit={enviar} className="border-t border-stone-200 pt-3">
      <h3 className="font-medium">Gravar no banco de teste</h3>
      <fieldset disabled={gravando} className="mt-2 space-y-2">
        <div role="group" aria-label="Tipo de registro" className="flex gap-4">
          <button type="button" aria-pressed={tarefa} className="underline" onClick={() => mudarColecao("tarefas")}>Tarefas</button>
          <button type="button" aria-pressed={!tarefa} className="underline" onClick={() => mudarColecao("topicos")}>Tópicos</button>
        </div>
        <label className="block">
          {tarefa ? "Tarefa do servidor" : "Tópico do servidor"}
          <select value={formulario.id} onChange={(evento) => selecionar(evento.target.value)} className={campoClasse}>
            <option value="">{tarefa ? "Nova tarefa" : "Novo tópico"}</option>
            {registros.filter(({ id }) => idEditavel.test(id)).map((registro) => (
              <option key={registro.id} value={registro.id}>{registro[campoNome]}</option>
            ))}
          </select>
        </label>
        <label className="block">
          {tarefa ? "Título" : "Nome"}
          <input required value={formulario[campoNome]} onChange={(evento) => mudar(campoNome, evento.target.value)} className={campoClasse} />
        </label>
        {tarefa ? (
          <>
            <label className="block">Descrição<textarea value={formulario.descricao} onChange={(evento) => mudar("descricao", evento.target.value)} className={campoClasse} /></label>
            <label className="block">Prazo<input type="date" value={formulario.data} onChange={(evento) => mudar("data", evento.target.value)} className={campoClasse} /></label>
            <label className="block">Tópico
              <select value={formulario.topicoId} onChange={(evento) => mudar("topicoId", evento.target.value)} className={campoClasse}>
                <option value="">Sem tópico</option>
                {topicos.map(({ id, nome }) => <option key={id} value={id}>{nome}</option>)}
              </select>
            </label>
            <label className="block">Cor<input type="color" value={formulario.cor} onChange={(evento) => mudar("cor", evento.target.value)} className={campoClasse} /></label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formulario.concluida} onChange={(evento) => mudar("concluida", evento.target.checked)} />Concluída
            </label>
          </>
        ) : (
          <>
            <label className="block">Cor
              <select value={formulario.cor} onChange={(evento) => mudar("cor", evento.target.value)} className={campoClasse}>
                {TOPIC_COLORS.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
              </select>
            </label>
            {!formulario.id && <label className="flex items-center gap-2">
              <input type="checkbox" checked={formulario.agruparSemTopico} onChange={(evento) => mudar("agruparSemTopico", evento.target.checked)} />Agrupar tarefas sem tópico
            </label>}
          </>
        )}
        {confirmando ? (
          <div className="space-y-2">
            <p>{confirmando === "limpeza"
              ? `Excluir ${tarefas.length} tarefa(s) e ${topicos.length} tópico(s) do banco de teste?`
              : tarefa ? "Excluir esta tarefa do servidor?" : "Excluir este tópico do servidor? As tarefas voltarão para Sem tópico."}</p>
            <button type="button" className="mr-3 underline" onClick={() => setConfirmando(false)}>Cancelar</button>
            <button type="button" className="font-medium text-red-800 underline" onClick={() => confirmando === "limpeza" ? limpar() : salvar(true)}>{gravando ? "Excluindo…" : confirmando === "limpeza" ? "Confirmar limpeza" : "Confirmar exclusão"}</button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" className="rounded-lg bg-primary px-3 py-2 font-medium text-white disabled:opacity-60">{gravando ? "Salvando…" : "Salvar no servidor"}</button>
              {formulario.id && <button type="button" className="text-red-800 underline" onClick={() => setConfirmando("registro")}>Excluir do servidor</button>}
              {posicao >= 0 && grupo.length > 1 && (
                <>
                  <button type="button" className="underline disabled:opacity-60" disabled={posicao === 0} onClick={() => mover(-1)}>Subir na ordem</button>
                  <button type="button" className="underline disabled:opacity-60" disabled={posicao === grupo.length - 1} onClick={() => mover(1)}>Descer na ordem</button>
                </>
              )}
            </div>
            {tarefas.length + topicos.length > 0 && <button type="button" className="text-red-800 underline" onClick={() => setConfirmando("limpeza")}>Limpar tarefas e tópicos do servidor</button>}
          </div>
        )}
      </fieldset>
      {aviso?.erro && <p role="alert" className="mt-2 text-red-800">{aviso.erro}</p>}
      {aviso?.sucesso && <p role="status" className="mt-2">{aviso.sucesso}</p>}
    </form>
  )
}

ApiTaskPilot.propTypes = {
  tarefas: PropTypes.array.isRequired, topicos: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired, onReorder: PropTypes.func.isRequired, onClear: PropTypes.func.isRequired,
}
