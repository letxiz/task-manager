import { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { recuperarTarefas, recuperarTopicos } from "../../utils/taskSchema.js"
import ApiTaskPilot from "./ApiTaskPilot.jsx"

async function consultar(caminho, recuperar, signal) {
  const resposta = await fetch(caminho, { signal, headers: { Accept: "application/json" } })
  if (resposta.status === 503) throw new Error("Configure o PostgreSQL na API local.")
  if (!resposta.ok) throw new Error("Confira se a API e o PostgreSQL estão em execução.")

  const resultado = recuperar(await resposta.json())
  if (resultado.invalido) throw new Error("A API retornou registros em um formato inválido.")
  return resultado.itens
}

export default function ApiPreview({ permiteGravar = false }) {
  const [consulta, setConsulta] = useState(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(8000)])

    Promise.all([
      consultar("/api/tarefas", recuperarTarefas, signal),
      consultar("/api/topicos", recuperarTopicos, signal),
    ]).then(([tarefas, topicos]) => {
      if (!controller.signal.aborted) setConsulta({ tarefas, topicos })
    }).catch((erro) => {
      if (controller.signal.aborted) return
      const mensagem = erro.name === "TimeoutError" || erro instanceof TypeError
        ? "Confira a conexão com a API local."
        : erro instanceof SyntaxError ? "A API retornou uma resposta inválida." : erro.message
      setConsulta({ erro: mensagem })
      controller.abort()
    })

    return () => controller.abort()
  }, [tentativa])

  function recarregar() {
    setConsulta(null)
    setTentativa((atual) => atual + 1)
  }

  function atualizarRegistro(colecao, { registro, excluirId, agruparSemTopico }) {
    setConsulta((atual) => {
      const lista = atual[colecao]
      const registros = excluirId
        ? lista.filter(({ id }) => id !== excluirId)
        : lista.some(({ id }) => id === registro.id)
          ? lista.map((item) => item.id === registro.id ? registro : item)
          : [...lista, registro]
      if (colecao === "tarefas") return { ...atual, tarefas: registros }
      const tarefas = atual.tarefas.map((tarefa) => {
        if (excluirId && tarefa.topicoId === excluirId) return { ...tarefa, topicoId: "" }
        if (agruparSemTopico && !tarefa.topicoId) return { ...tarefa, topicoId: registro.id }
        return tarefa
      })
      return { tarefas, topicos: registros }
    })
  }

  return (
    <section aria-labelledby="previa-api-titulo" className="my-4 rounded-xl border border-stone-200 bg-white p-4 text-sm">
      <h2 id="previa-api-titulo" className="font-semibold">Prévia da API local</h2>
      {consulta === null && <p role="status" className="mt-2">Carregando tarefas e tópicos do servidor…</p>}
      {consulta?.erro && (
        <div className="mt-2">
          <p role="alert" className="text-red-800">Não foi possível consultar a API. {consulta.erro}</p>
          <button type="button" className="mt-2 underline" onClick={recarregar}>Tentar novamente</button>
        </div>
      )}
      {consulta?.tarefas && (
        <div className="mt-2 space-y-2">
          <p role="status">{consulta.tarefas.length} tarefa(s) e {consulta.topicos.length} tópico(s) no servidor.</p>
          <details>
            <summary className="cursor-pointer">Ver registros do servidor</summary>
            <h3 className="mt-2 font-medium">Tarefas</h3>
            {consulta.tarefas.length ? (
              <ul className="list-disc pl-5">
                {consulta.tarefas.map((tarefa) => <li key={tarefa.id}>{tarefa.titulo}</li>)}
              </ul>
            ) : <p>Nenhuma tarefa no servidor.</p>}
            <h3 className="mt-2 font-medium">Tópicos</h3>
            {consulta.topicos.length ? (
              <ul className="list-disc pl-5">
                {consulta.topicos.map((topico) => <li key={topico.id}>{topico.nome}</li>)}
              </ul>
            ) : <p>Nenhum tópico no servidor.</p>}
          </details>
          {permiteGravar && (
            <ApiTaskPilot tarefas={consulta.tarefas} topicos={consulta.topicos} onChange={atualizarRegistro}
              onReorder={(colecao, registros) => setConsulta((atual) => ({ ...atual, [colecao]: registros }))}
              onClear={() => setConsulta({ tarefas: [], topicos: [] })}
            />
          )}
        </div>
      )}
    </section>
  )
}

ApiPreview.propTypes = { permiteGravar: PropTypes.bool }
