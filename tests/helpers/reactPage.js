import { JSDOM } from "jsdom"
import { createServer } from "vite"
import react from "@vitejs/plugin-react"
import { act, createElement, memo } from "react"

export async function criarAmbientePaginas({ antesDeCarregarTarefas } = {}) {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://task-manager.test" })
  const originais = new Map()
  for (const [chave, valor] of Object.entries({ window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })) {
    originais.set(chave, Object.getOwnPropertyDescriptor(globalThis, chave))
    Object.defineProperty(globalThis, chave, { configurable: true, writable: true, value: valor })
  }
  // Simula a abertura e o fechamento do diálogo no jsdom.
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true }
  dom.window.HTMLDialogElement.prototype.close = function () { this.open = false }
  dom.window.HTMLElement.prototype.showPopover = function () { this.setAttribute("data-popover-open", "") }
  dom.window.HTMLElement.prototype.hidePopover = function () { this.removeAttribute("data-popover-open") }
  dom.window.matchMedia = (media) => ({ media, matches: false, addEventListener() {}, removeEventListener() {} })
  const { createRoot } = await import("react-dom/client")
  const { MemoryRouter, useNavigate } = await import("react-router-dom")
  const server = await createServer({ configFile: false, plugins: [react(), {
    name: "test-delayed-task-route",
    async transform(_, id) {
      if (id.endsWith("/src/routes/(app)/Tasks.jsx")) await antesDeCarregarTarefas?.()
    },
  }], server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom", optimizeDeps: { noDiscovery: true } })
  const { TaskContext, TaskActionsContext } = await server.ssrLoadModule("/src/contexts/TaskContext.js")
  const { NotificationContext } = await server.ssrLoadModule("/src/contexts/NotificationContext.js")
  return {
    async montarApp(rota = "/", salvos = {}) {
      localStorage.clear()
      for (const [chave, valor] of Object.entries(salvos)) localStorage.setItem(chave, valor)
      const { default: App } = await server.ssrLoadModule("/src/App.jsx")
      let navigate
      function Comandos() {
        navigate = useNavigate()
        return null
      }
      const root = createRoot(document.getElementById("root"))
      await act(async () => root.render(createElement(MemoryRouter, { initialEntries: [rota] }, createElement(App), createElement(Comandos))))
      return {
        navegar: async (destino) => { await act(async () => navigate(destino)) },
        desmontar: async () => { await act(async () => root.unmount()) },
      }
    },
    async montar(caminho, dados, props) {
      localStorage.clear()
      const { default: Pagina } = await server.ssrLoadModule(caminho)
      const root = createRoot(document.getElementById("root"))
      const mensagens = []
      const renderizar = async (atuais) => {
        await act(async () => root.render(createElement(MemoryRouter, null,
          createElement(NotificationContext.Provider, { value: notificar },
            createElement(TaskActionsContext.Provider, { value: atuais },
              createElement(TaskContext.Provider, { value: atuais }, createElement(Pagina, props)))))))
      }
      const notificar = (mensagem) => mensagens.push(mensagem)
      await renderizar(dados)
      return { mensagens, renderizar, desmontar: async () => { await act(async () => root.unmount()) } }
    },
    async montarProvider() {
      localStorage.clear()
      const { default: TaskProvider } = await server.ssrLoadModule("/src/components/tasks/TaskProvider.jsx")
      const hooks = await server.ssrLoadModule("/src/hooks/tasks/useTaskData.js")
      const useActions = hooks.useTaskActions
      let dados
      let acoes
      const contagens = { dados: 0, acoes: 0 }
      const Dados = memo(function Dados() {
        dados = hooks.useTaskData()
        contagens.dados += 1
        return null
      })
      const Acoes = memo(function Acoes() {
        acoes = useActions()
        contagens.acoes += 1
        return null
      })
      const filhos = [createElement(Dados, { key: "dados" }), createElement(Acoes, { key: "acoes" })]
      const root = createRoot(document.getElementById("root"))
      const mensagens = []
      const notify = (mensagem) => mensagens.push(mensagem)
      const renderizar = async (notificar = notify) => {
        await act(async () => root.render(createElement(NotificationContext.Provider, { value: notificar },
          createElement(TaskProvider, null, filhos))))
      }
      await renderizar()
      return { get dados() { return dados }, get acoes() { return acoes }, contagens, mensagens, renderizar, desmontar: async () => { await act(async () => root.unmount()) } }
    },
    async montarHook(caminho, nome, props) {
      const modulo = await server.ssrLoadModule(caminho)
      const useHook = modulo[nome]
      let resultado
      function Consumidor({ dados }) {
        resultado = useHook(dados)
        return null
      }
      const root = createRoot(document.getElementById("root"))
      const atualizar = async (dados) => { await act(async () => root.render(createElement(Consumidor, { dados }))) }
      await atualizar(props)
      return { get atual() { return resultado }, atualizar, desmontar: async () => { await act(async () => root.unmount()) } }
    },
    async fechar() {
      await server.close()
      dom.window.close()
      for (const [chave, descriptor] of originais) {
        if (descriptor) Object.defineProperty(globalThis, chave, descriptor)
        else Reflect.deleteProperty(globalThis, chave)
      }
    },
  }
}

export async function clicar(elemento) {
  if (!elemento) throw new Error("Elemento não encontrado")
  await act(async () => elemento.click())
}

export async function preencher(elemento, texto) {
  if (!elemento) throw new Error("Campo não encontrado")
  const prototipo = elemento.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(prototipo, "value").set
  await act(async () => {
    setter.call(elemento, texto)
    elemento.dispatchEvent(new window.Event("input", { bubbles: true }))
  })
}

export function botao(texto) {
  return [...document.querySelectorAll("button")].find((item) => item.textContent.trim() === texto || item.getAttribute("aria-label") === texto)
}

export async function enviar(formulario) {
  await act(async () => formulario.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })))
}
