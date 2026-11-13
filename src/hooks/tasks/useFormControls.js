import { useMemo } from "react"

// Só encaminha comandos de eventos. Os campos e erros ficam no formulário.
export function useFormControls(ref) {
  return useMemo(() => ({
    abrir: (...args) => ref.current?.abrir(...args),
    editar: (...args) => ref.current?.editar(...args),
    removerTopico: (...args) => ref.current?.removerTopico(...args),
    editarSemTopico: (...args) => ref.current?.editarSemTopico(...args),
  }), [ref])
}
