export default function HomeHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Início
        </h1>
        <p className="mt-2 text-sm text-muted">
          Um olhar para o seu dia. Uma tarefa de cada vez.
        </p>
      </div>
    </header>
  )
}
