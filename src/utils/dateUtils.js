export function formatarDataISO(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, "0")
  const dia = String(data.getDate()).padStart(2, "0")

  return `${ano}-${mes}-${dia}`
}

// Exibe a data em DD/MM/AAAA.
export function formatarDataExibicao(dataISO) {
  if (!dataISO) return ""

  const [ano, mes, dia] = dataISO.split("-")
  return `${dia}/${mes}/${ano}`
}

export function converterDataDigitada(texto) {
  const correspondencia = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!correspondencia) return ""

  const [, diaTexto, mesTexto, anoTexto] = correspondencia
  const dia = Number(diaTexto)
  const mes = Number(mesTexto)
  const ano = Number(anoTexto)
  const data = new Date(ano, mes - 1, dia)

  // Rejeita datas inexistentes.
  if (
    ano < 1000 ||
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return ""
  }

  return formatarDataISO(data)
}

// Máscara DD/MM/AAAA.
export function aplicarMascaraData(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 8)

  if (digitos.length <= 2) return digitos
  if (digitos.length <= 4) {
    return `${digitos.slice(0, 2)}/${digitos.slice(2)}`
  }

  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`
}
