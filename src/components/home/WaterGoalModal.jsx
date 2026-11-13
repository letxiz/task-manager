import { useDialog } from "../../hooks/useDialog"
import { useState } from "react"
import PropTypes from "prop-types"
import { X } from "lucide-react"

export default function WaterGoalModal({ open, goal, onCancel, onSave }) {
  const { dialogRef, handleCancel } = useDialog(open, onCancel)
  // Só aplica a meta ao salvar.
  const [valor, setValor] = useState(String(goal))

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="water-goal-title"
      onCancel={handleCancel}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border-0 bg-white p-6 text-slate-800 shadow-xl backdrop:bg-slate-950/50"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="water-goal-title" className="text-lg font-semibold">
          Meta de água
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancelar alteração da meta"
          className="rounded-lg p-2 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X size={18} />
        </button>
      </div>
      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (onSave(Number(valor))) onCancel(false)
        }}
      >
        <label htmlFor="water-goal" className="block text-sm font-medium">
          Sua meta diária em mililitros
        </label>
        <input
          id="water-goal"
          type="number"
          min="100"
          max="10000"
          step="100"
          required
          autoFocus
          value={valor}
          onChange={(event) => setValor(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-2 focus:outline-primary"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Salvar meta
          </button>
        </div>
      </form>
    </dialog>
  )
}

WaterGoalModal.propTypes = {
  open: PropTypes.bool.isRequired,
  goal: PropTypes.number.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
}
