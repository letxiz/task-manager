import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { resolve } from "node:path"

// Ferramentas de QA opcionais podem ser instaladas fora das dependências do projeto.
const qaRequire = createRequire(process.env.TASK_MANAGER_QA_PACKAGE_JSON ?? import.meta.url)
const { chromium, expect } = qaRequire("playwright/test")
const axeSource = readFileSync(qaRequire.resolve("axe-core/axe.min.js"), "utf8")
const base = process.env.TASK_MANAGER_QA_URL ?? "http://127.0.0.1:4173"
const artifacts = resolve(process.env.TASK_MANAGER_QA_OUTPUT ?? "/tmp/task-manager-final-qa/artifacts")
mkdirSync(artifacts, { recursive: true })
const browser = await chromium.launch({ headless: true })
const ambiente = { navegador: browser.version(), playwright: qaRequire("playwright/package.json").version, axeCore: qaRequire("axe-core/package.json").version }
const results = []
const accessibility = []
const key = "task-manager:dados"
const tarefa = (id, topicoId = "", data = "") => ({ id, titulo: `Tarefa ${id}`, descricao: "", data, topicoId, concluida: false })
const fixture = { versao: 1, tarefas: [tarefa("a1", "a"), tarefa("a2", "a"), tarefa("b1", "b"), tarefa("s1")], topicos: [{ id: "a", nome: "A", cor: "blue" }, { id: "b", nome: "B", cor: "green" }, { id: "c", nome: "Vazio", cor: "rose" }] }
const pause = (ms) => new Promise((done) => setTimeout(done, ms))
async function doc(page) { return page.evaluate((chave) => JSON.parse(localStorage.getItem(chave)), key) }
async function seed(page, dados, route = "/tasks") {
  await page.goto(base)
  await page.evaluate(({ chave, dados }) => { localStorage.clear(); localStorage.setItem(chave, JSON.stringify(dados)) }, { chave: key, dados })
  await page.goto(`${base}${route}`)
  await page.getByRole("heading", { name: route === "/tasks" ? "Minhas Tarefas" : "Início", exact: true }).waitFor()
  await page.evaluate(() => document.fonts.ready)
}
async function audit(page, name) {
  await page.addScriptTag({ content: axeSource })
  const result = await page.evaluate(() => axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } }))
  accessibility.push({ name, violations: result.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })) })
}
async function run(name, options, test) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1800 }, locale: "pt-BR", reducedMotion: "reduce", ...options })
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  try {
    await test(page, context)
    assert.deepEqual(errors, [], "Erros de execução no navegador")
    results.push({ name, status: "pass" })
    console.log(`PASS ${name}`)
  } catch (error) {
    results.push({ name, status: "fail", error: error.message, pageErrors: errors })
    await page.screenshot({ path: `${artifacts}/${name}-failure.png`, fullPage: true }).catch(() => {})
    console.log(`FAIL ${name}: ${error.message}`)
  } finally { await context.close() }
}
const row = (page, id) => page.locator('li[aria-roledescription="sortable"]').filter({ has: page.getByRole("button", { name: `Ver detalhes da tarefa Tarefa ${id}`, exact: true }) })
async function mouseDrag(page, source, target) {
  const from = await source.boundingBox()
  const to = await target.boundingBox()
  assert.ok(from && to)
  await page.mouse.move(from.x + from.width * 0.7, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(from.x + from.width * 0.7 + 12, from.y + from.height / 2, { steps: 4 })
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 20 })
  await pause(150)
  await page.mouse.up()
}

await run("desktop-crud-persistence", {}, async (page) => {
  await page.goto(`${base}/tasks`)
  await page.getByRole("button", { name: "Ações de tarefas" }).click()
  await page.getByRole("button", { name: "Novo tópico", exact: true }).click()
  await page.locator("#topic-name").fill("Trabalho")
  await page.getByRole("button", { name: "Criar tópico", exact: true }).click()
  await page.getByRole("button", { name: "Nova tarefa", exact: true }).click()
  assert.equal(await page.evaluate(() => !!document.activeElement.closest("dialog[open]")), true)
  await page.locator("#titulo").fill("Planejar revisão")
  await page.locator("#descricao").fill("Descrição pesquisável")
  await page.locator("#data").fill("20122026")
  await page.locator("#tarefa-topico").selectOption({ label: "Trabalho" })
  await page.getByRole("button", { name: "Salvar tarefa", exact: true }).click()
  await expect(page.getByRole("button", { name: "Nova tarefa", exact: true })).toBeFocused()
  assert.equal((await doc(page)).tarefas[0].data, "2026-12-20")
  await page.getByRole("button", { name: "Ver detalhes da tarefa Planejar revisão", exact: true }).click()
  await page.locator("dialog[open]").getByRole("button", { name: "Editar", exact: true }).click()
  await page.locator("#titulo").fill("Revisão editada")
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click()
  await page.getByRole("checkbox", { name: "Concluir Revisão editada", exact: true }).locator("..").click()
  await page.getByRole("button", { name: /^Pendentes/ }).click()
  await expect(page.getByText("Nenhuma tarefa encontrada.")).toBeVisible()
  await page.getByRole("button", { name: /^Concluídas/ }).click()
  await page.locator("#task-search").fill(" PESQUISÁVEL ")
  await expect(page.getByRole("button", { name: "Ver detalhes da tarefa Revisão editada", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Limpar busca" }).click()
  await page.getByRole("button", { name: /^Todas/ }).click()
  await page.reload()
  await expect(page.getByRole("checkbox", { name: "Reabrir Revisão editada", exact: true })).toBeChecked()
  await page.getByRole("button", { name: "Mais opções de Trabalho", exact: true }).click()
  await page.locator("dialog[open]").getByRole("button", { name: "Editar", exact: true }).click()
  await page.locator("#topic-name").fill("Trabalho editado")
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click()
  await page.getByRole("button", { name: "Mais opções de Trabalho editado", exact: true }).click()
  await page.locator("dialog[open]").getByRole("button", { name: "Excluir", exact: true }).click()
  await expect(page.locator("dialog[open]").getByRole("button", { name: "Cancelar", exact: true })).toBeFocused()
  await page.locator("dialog[open]").getByRole("button", { name: "Excluir tópico", exact: true }).click()
  assert.equal((await doc(page)).tarefas[0].topicoId, "")
  await expect(page.getByRole("button", { name: "Editar Sem tópico", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Mais opções de Revisão editada", exact: true }).click()
  await page.locator("dialog[open]").getByRole("button", { name: "Excluir", exact: true }).click()
  await expect.poll(async () => (await doc(page)).tarefas.length).toBe(0)
  await page.getByRole("button", { name: "Nova tarefa", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Nova tarefa", exact: true })).toBeFocused()
})

await run("desktop-pagination-ordering", {}, async (page) => {
  const tarefas = Array.from({ length: 13 }, (_, i) => ({ ...tarefa(String(i)), data: i % 2 ? "" : "2026-12-20", concluida: i % 3 === 0 }))
  await seed(page, { versao: 1, tarefas, topicos: [] }, "/")
  const before = await doc(page)
  const visited = []
  for (let i = 0; i < 3; i += 1) {
    visited.push(...await page.locator('button[aria-label^="Ver detalhes da tarefa"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute("aria-label"))))
    if (i < 2) await page.getByRole("button", { name: "Próxima página", exact: true }).click()
  }
  assert.equal(new Set(visited).size, 13)
  assert.ok(visited[0].endsWith("Tarefa 2"))
  assert.deepEqual(await doc(page), before)
  await expect(page.getByRole("button", { name: "Próxima página", exact: true })).toBeDisabled()
})

await run("desktop-mouse-dnd", {}, async (page) => {
  await seed(page, fixture)
  await mouseDrag(page, row(page, "a2"), row(page, "a1"))
  await expect.poll(async () => (await doc(page)).tarefas.filter((t) => t.topicoId === "a").map((t) => t.id)).toEqual(["a2", "a1"])
  await mouseDrag(page, row(page, "a1"), row(page, "b1"))
  await expect.poll(async () => (await doc(page)).tarefas.find((t) => t.id === "a1").topicoId).toBe("b")
  await mouseDrag(page, row(page, "a1"), page.locator('section[aria-labelledby="unassigned-title"]'))
  await expect.poll(async () => (await doc(page)).tarefas.find((t) => t.id === "a1").topicoId).toBe("")
  await mouseDrag(page, row(page, "a1"), page.locator('section[aria-labelledby="topic-c"]'))
  await expect.poll(async () => (await doc(page)).tarefas.find((t) => t.id === "a1").topicoId).toBe("c")
  await page.reload()
  await expect(page.locator('section[aria-labelledby="topic-c"]').getByRole("button", { name: "Ver detalhes da tarefa Tarefa a1", exact: true })).toBeVisible()
  await page.screenshot({ path: `${artifacts}/tasks-desktop.png`, fullPage: true })
  await audit(page, "tasks-desktop")
})

await run("desktop-keyboard-dnd", {}, async (page) => {
  await seed(page, fixture)
  const first = row(page, "a1")
  await first.focus()
  await page.keyboard.press("Space")
  await expect(first).toHaveAttribute("aria-pressed", "true")
  await pause(80)
  await page.keyboard.press("ArrowDown")
  await expect(page.locator('[id^="DndLiveRegion"]')).toContainText("task:a2")
  await pause(150)
  await page.keyboard.press("Space")
  await expect.poll(async () => (await doc(page)).tarefas.filter((t) => t.topicoId === "a").map((t) => t.id)).toEqual(["a2", "a1"])
  await pause(300)
  const handle = page.getByRole("button", { name: "Arrastar tópico A", exact: true })
  await handle.focus()
  await page.keyboard.press("Space")
  await expect(handle).toHaveAttribute("aria-pressed", "true")
  // A navegação aninhada pode passar primeiro por uma tarefa do próprio tópico.
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press("ArrowDown")
    await pause(80)
    if ((await page.locator('[id^="DndLiveRegion"]').innerText()).includes("topic:b")) break
  }
  await pause(150)
  await page.keyboard.press("Space")
  await expect.poll(async () => (await doc(page)).topicos.map((t) => t.id)).toEqual(["b", "a", "c"])
})

await run("mobile-touch-dnd", { viewport: { width: 390, height: 1000 }, isMobile: true, hasTouch: true }, async (page, context) => {
  await seed(page, { versao: 1, tarefas: [tarefa("s1"), tarefa("s2")], topicos: [] })
  const from = await row(page, "s1").boundingBox()
  const to = await row(page, "s2").boundingBox()
  const cdp = await context.newCDPSession(page)
  const x = from.x + from.width * 0.7
  const y = from.y + from.height / 2
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] })
  await pause(400)
  for (let i = 1; i <= 10; i += 1) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y + (to.y + to.height / 2 - y) * i / 10 }] })
  }
  await pause(150)
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
  await expect.poll(async () => (await doc(page)).tarefas.map((t) => t.id)).toEqual(["s2", "s1"])
})

await run("responsive-focus-accessibility", {}, async (page) => {
  await seed(page, fixture)
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow horizontal em ${width}px`)
    if (width < 768) {
      await page.getByRole("button", { name: "Abrir menu", exact: true }).click()
      await expect(page.locator("#mobile-menu")).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(page.getByRole("button", { name: "Abrir menu", exact: true })).toBeFocused()
    }
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole("button", { name: "Nova tarefa", exact: true }).click()
  await page.locator("#titulo").fill("Teste de foco")
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press("Tab")
    // Chromium pode passar pelo foco do documento ao completar o ciclo nativo;
    // nenhum controle interativo do fundo pode receber foco durante o modal.
    assert.equal(await page.evaluate(() => document.activeElement === document.body || !!document.activeElement.closest("dialog[open]")), true)
  }
  await audit(page, "task-form-mobile")
  await page.screenshot({ path: `${artifacts}/task-form-mobile.png`, fullPage: true })
  await page.keyboard.press("Escape")
  await page.locator("#mobile-menu").evaluate((dialog) => dialog.showModal())
  await page.locator('#mobile-navigation a[href="/"]').click()
  await expect(page.getByRole("heading", { name: "Início", exact: true })).toBeVisible()
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
  await audit(page, "home-mobile")
  await page.screenshot({ path: `${artifacts}/home-mobile.png`, fullPage: true })
})

await run("storage-recovery", {}, async (page) => {
  const legado = { tarefas: [tarefa("antiga")], topicos: [] }
  await page.goto(base)
  await page.evaluate((dados) => { localStorage.clear(); localStorage.setItem("minhas-tarefas", JSON.stringify(dados.tarefas)); localStorage.setItem("meus-topicos", JSON.stringify(dados.topicos)) }, legado)
  await page.goto(`${base}/tasks`)
  await page.getByRole("checkbox", { name: "Concluir Tarefa antiga", exact: true }).locator("..").click()
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("minhas-tarefas"))[0].concluida), false)
  assert.equal((await doc(page)).tarefas[0].concluida, true)
  const corrupto = JSON.stringify({ versao: 1, tarefas: [tarefa("valida"), tarefa("valida"), { id: "", titulo: "Inválida", concluida: false }], topicos: [] })
  await page.evaluate(({ chave, valor }) => localStorage.setItem(chave, valor), { chave: key, valor: corrupto })
  await page.reload()
  await expect(page.getByRole("alert")).toContainText("gravação está bloqueada")
  await expect(page.getByRole("checkbox", { name: "Concluir Tarefa valida", exact: true })).toHaveCount(1)
  await page.getByRole("checkbox", { name: "Concluir Tarefa valida", exact: true }).locator("..").click()
  assert.equal(await page.evaluate((chave) => localStorage.getItem(chave), key), corrupto)
})

await browser.close()
writeFileSync(`${artifacts}/results.json`, JSON.stringify({ ambiente, results, accessibility }, null, 2))
console.log(JSON.stringify({ results, accessibility: accessibility.map(({ name, violations }) => ({ name, violations: violations.map(({ id, impact, nodes }) => ({ id, impact, elements: nodes.length })) })) }, null, 2))
if (results.some((result) => result.status === "fail")) process.exitCode = 1
