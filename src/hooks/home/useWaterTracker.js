import { useEffect, useState } from "react"
import { useNotification } from "../../contexts/NotificationContext"
import { carregarAgua, diaLocal, registroDoDia, WATER_STORAGE_KEY } from "../../utils/waterStorage"

export function useWaterTracker() {
  const notify = useNotification()
  const [inicial] = useState(() => {
    try {
      return carregarAgua(localStorage)
    } catch {
      return carregarAgua({ getItem: () => { throw new Error("Armazenamento indisponível") } })
    }
  })
  const [registro, setRegistro] = useState(inicial.registro)
  const [erro, setErro] = useState(inicial.erro)
  const [hoje, setHoje] = useState(diaLocal)

  // Atualiza o dia sem recarregar.
  useEffect(() => {
    const atualizarDia = () => setHoje(diaLocal())
    const timer = setInterval(atualizarDia, 30000)
    window.addEventListener("focus", atualizarDia)
    return () => {
      clearInterval(timer)
      window.removeEventListener("focus", atualizarDia)
    }
  }, [])

  const atual = registroDoDia(registro, hoje)
  const total = atual.quantidades.reduce((soma, quantidade) => soma + quantidade, 0)
  // Limita o círculo a 100%.
  const porcentagem = Math.min(100, Math.round((total / atual.meta) * 100))

  function salvar(proximo, mensagem) {
    setRegistro(proximo)
    setHoje(proximo.dia)
    try {
      localStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(proximo))
      setErro("")
      if (mensagem) notify(mensagem)
    } catch {
      setErro("Não foi possível salvar o consumo. As alterações podem ser perdidas ao sair da página.")
    }
  }

  function adicionar(quantidade) {
    const dia = registroDoDia(registro)
    salvar({ ...dia, quantidades: [...dia.quantidades, quantidade] })
  }

  // Remove apenas o último consumo.
  function desfazer() {
    const dia = registroDoDia(registro)
    if (!dia.quantidades.length) return
    salvar({ ...dia, quantidades: dia.quantidades.slice(0, -1) })
  }

  function alterarMeta(meta) {
    if (!Number.isInteger(meta) || meta < 100 || meta > 10000) return false
    salvar({ ...registroDoDia(registro), meta }, "Meta de água atualizada.")
    return true
  }

  return { total, meta: atual.meta, porcentagem, erro, adicionar, desfazer, alterarMeta, temRegistros: atual.quantidades.length > 0 }
}
