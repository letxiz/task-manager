function Home() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Início</h1>

      <section aria-labelledby="welcome-title">
        <h2 id="welcome-title" className="text-xl font-semibold">Boas-vindas</h2>
        {/* Adicione a apresentação. */}
      </section>

      <section aria-labelledby="summary-title">
        <h2 id="summary-title" className="text-xl font-semibold">Resumo das tarefas</h2>
        {/* Adicione os contadores. */}
      </section>

      <section aria-labelledby="shortcuts-title">
        <h2 id="shortcuts-title" className="text-xl font-semibold">Atalhos</h2>
        {/* Adicione os links. */}
      </section>
    </div>
  )
}

export default Home
