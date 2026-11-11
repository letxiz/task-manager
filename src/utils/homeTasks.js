export function resumirTarefas(tarefas, limite = 5) {
  const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length
  const total = tarefas.length
  // Ordena uma cópia para não alterar a ordem manual usada em Minhas tarefas.
  // Pendentes vêm primeiro; dentro de cada status, o prazo mais próximo tem prioridade.
  const visiveis = [...tarefas]
    .sort((a, b) => {
      if (a.concluida !== b.concluida) return a.concluida ? 1 : -1
      // Datas ISO permitem comparar como texto; tarefas sem prazo ficam por último.
      return (a.data || "9999-12-31").localeCompare(b.data || "9999-12-31")
    })
    .slice(0, limite)
  return {
    total,
    concluidas,
    porcentagem: total ? Math.round((concluidas / total) * 100) : 0,
    visiveis,
  }
}

export function paginarTarefas(tarefas, pagina = 1, porPagina = 6) {
  // Ordena a lista inteira antes do recorte para manter a prioridade entre páginas.
  const resumo = resumirTarefas(tarefas, tarefas.length)
  // Mantém a página 1 na lista vazia e evita páginas inválidas após exclusões.
  const totalPaginas = Math.max(1, Math.ceil(resumo.total / porPagina))
  const paginaAtual = Math.min(Math.max(1, pagina), totalPaginas)
  const inicio = (paginaAtual - 1) * porPagina
  return {
    ...resumo,
    visiveis: resumo.visiveis.slice(inicio, inicio + porPagina),
    paginaAtual,
    totalPaginas,
    primeiro: resumo.total ? inicio + 1 : 0,
    ultimo: Math.min(inicio + porPagina, resumo.total),
  }
}
