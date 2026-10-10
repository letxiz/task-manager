import { Link } from "react-router-dom"

function NotFound() {
  return (
    <>
      <p className="font-semibold text-red-700">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Página não encontrada</h1>
      <p className="mt-3 text-slate-600">O endereço que você acessou não existe.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg px-3 py-3 font-medium text-red-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-red-700">
        Voltar para o início
      </Link>
    </>
  )
}

export default NotFound
