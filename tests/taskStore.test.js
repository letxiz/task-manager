import test from "node:test"
import assert from "node:assert/strict"
import { JSDOM } from "jsdom"
import { act, createElement, StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { NotificationContext } from "../src/contexts/NotificationContext.js"
import { useTaskStore } from "../src/hooks/tasks/useTaskStore.js"

import { useTaskForm } from "../src/hooks/tasks/useTaskForm.js"
import { useTopicForm } from "../src/hooks/tasks/useTopicForm.js"
import { useTaskDialogs } from "../src/hooks/tasks/useTaskDialogs.js"

function montar(t, salvos = {}) {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://task-manager.test" })
  const originais = new Map()
  for (const [chave, valor] of Object.entries({ window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage, IS_REACT_ACT_ENVIRONMENT: true })) {
    originais.set(chave, Object.getOwnPropertyDescriptor(globalThis, chave))
    Object.defineProperty(globalThis, chave, { configurable: true, writable: true, value: valor })
  }
  for (const [chave, valor] of Object.entries(salvos)) localStorage.setItem(chave, valor)
  const mensagens = []
  let store
  let formulario
  let dialogos
  let formularioTarefa
  function Consumidor() {
    store = useTaskStore()
    formulario = useTopicForm(store)
    formularioTarefa = useTaskForm(store)
    dialogos = useTaskDialogs(store, formularioTarefa, formulario)
    return null
  }
  const root = createRoot(document.getElementById("root"))
  t.after(() => {
    act(() => root.unmount())
    dom.window.close()
    for (const [chave, descriptor] of originais) {
      if (descriptor) Object.defineProperty(globalThis, chave, descriptor)
      else Reflect.deleteProperty(globalThis, chave)
    }
  })
  act(() => root.render(createElement(StrictMode, null,
    createElement(NotificationContext.Provider, { value: (mensagem) => mensagens.push(mensagem) }, createElement(Consumidor)))))
  return { get store() { return store }, get formulario() { return formulario }, get formularioTarefa() { return formularioTarefa }, get dialogos() { return dialogos }, mensagens, storage: dom.window.localStorage }
}

for (const [campo, setter] of [["tarefas", "setTarefas"], ["topicos", "setTopicos"]]) {
  test(`${campo}: atualizações funcionais consecutivas preservam todos os itens`, (t) => {
    const app = montar(t)
    const inicial = app.store[campo]
    const primeira = { id: "1" }
    const segunda = { id: "2" }
    act(() => {
      app.store[setter]((atuais) => [...atuais, primeira])
      app.store[setter]((atuais) => [...atuais, segunda])
    })
    assert.deepEqual(app.store[campo], [primeira, segunda])
    assert.deepEqual(JSON.parse(app.storage.getItem("task-manager:dados"))[campo], [primeira, segunda])
    assert.deepEqual(inicial, [])
  })

  test(`${campo}: setter antigo usa a lista atual e aceita substituição seguida de função`, (t) => {
    const app = montar(t)
    const atualizar = app.store[setter]
    act(() => atualizar([{ id: "1" }]))
    act(() => atualizar((atuais) => [...atuais, { id: "2" }]))
    assert.deepEqual(app.store[campo].map((item) => item.id), ["1", "2"])
    act(() => {
      atualizar([{ id: "3" }])
      atualizar((atuais) => [...atuais, { id: "4" }])
    })
    assert.deepEqual(app.store[campo].map((item) => item.id), ["3", "4"])
  })
}

test("StrictMode: grava e notifica uma vez por chamada, fora do cálculo da lista", (t) => {
  const app = montar(t)
  const prototipo = Object.getPrototypeOf(app.storage)
  const gravar = prototipo.setItem
  let calculando = false
  let gravacoes = 0
  t.mock.method(prototipo, "setItem", function (...args) {
    assert.equal(calculando, false)
    gravacoes += 1
    return gravar.apply(this, args)
  })
  assert.equal(app.storage.length, 0)
  act(() => {
    assert.equal(app.store.setTarefas((atuais) => {
      calculando = true
      const proximas = [...atuais, { id: "1" }]
      calculando = false
      return proximas
    }, "Salvo."), true)
  })
  assert.equal(gravacoes, 1)
  assert.deepEqual(app.mensagens, ["Salvo."])
})

test("falha de gravação mantém atualizações consecutivas em memória e não notifica sucesso", (t) => {
  const app = montar(t)
  t.mock.method(Object.getPrototypeOf(app.storage), "setItem", () => { throw new Error("Quota") })
  act(() => {
    assert.equal(app.store.setTarefas((atuais) => [...atuais, { id: "1" }], "Salvo."), false)
    assert.equal(app.store.setTarefas((atuais) => [...atuais, { id: "2" }], "Salvo."), false)
  })
  assert.deepEqual(app.store.tarefas.map((item) => item.id), ["1", "2"])
  assert.ok(app.store.erroArmazenamento)
  assert.deepEqual(app.mensagens, [])
})

test("ações consecutivas preservam conclusão, movimento e exclusão de tópico", (t) => {
  const app = montar(t)
  act(() => {
    app.store.setTarefas([{ id: "1", concluida: false, topicoId: "a" }])
    app.store.setTopicos([{ id: "a", nome: "A" }])
  })
  act(() => {
    app.store.alternarConclusao("1")
    app.store.moverTarefa("1", "b")
    app.store.setTopicos((atuais) => [...atuais, { id: "b", nome: "B" }])
    assert.equal(app.store.excluirTopico("b"), true)
  })
  assert.deepEqual(app.store.tarefas, [{ id: "1", concluida: true, topicoId: "" }])
  assert.deepEqual(app.store.topicos, [{ id: "a", nome: "A" }])
})

test("erro no cálculo não altera a lista nem grava dados", (t) => {
  const app = montar(t)
  act(() => {
    assert.throws(() => app.store.setTarefas(() => { throw new Error("Cálculo inválido") }), /Cálculo inválido/)
    app.store.setTarefas((atuais) => [...atuais, { id: "1" }])
  })
  assert.deepEqual(app.store.tarefas, [{ id: "1" }])
  assert.deepEqual(app.mensagens, [])
})

test("exclusão de tópico usa uma única gravação para as duas listas", (t) => {
  const app = montar(t)
  act(() => {
    app.store.setTarefas([{ id: "1", titulo: "Tarefa", concluida: false, topicoId: "a" }])
    app.store.setTopicos([{ id: "a", nome: "A" }])
  })
  const prototipo = Object.getPrototypeOf(app.storage)
  const gravar = prototipo.setItem
  let gravacoes = 0
  t.mock.method(prototipo, "setItem", function (...args) {
    gravacoes += 1
    return gravar.apply(this, args)
  })
  act(() => assert.equal(app.store.excluirTopico("a"), true))
  assert.equal(gravacoes, 1)
})

test("uma gravação posterior só limpa o aviso se recuperar também a lista que falhou", (t) => {
  const app = montar(t)
  const prototipo = Object.getPrototypeOf(app.storage)
  const gravar = prototipo.setItem
  let falhar = true
  t.mock.method(prototipo, "setItem", function (...args) {
    if (falhar) throw new Error("Quota")
    return gravar.apply(this, args)
  })
  act(() => assert.equal(app.store.setTarefas([{ id: "1", titulo: "Tarefa", concluida: false }]), false))
  assert.ok(app.store.erroArmazenamento)
  falhar = false
  act(() => assert.equal(app.store.setTopicos([{ id: "a", nome: "A" }]), true))
  const salvo = JSON.parse(app.storage.getItem("task-manager:dados"))
  assert.deepEqual(salvo.tarefas, app.store.tarefas)
  assert.deepEqual(salvo.topicos, app.store.topicos)
  assert.equal(app.store.erroArmazenamento, "")
})

test("dados não carregados bloqueiam gravações e mantêm o aviso após editar outra lista", (t) => {
  const original = "{corrompido"
  const app = montar(t, { "meus-topicos": original })
  assert.ok(app.store.erroArmazenamento)
  act(() => {
    assert.equal(app.store.setTarefas([{ id: "1", titulo: "Teste", concluida: false }], "Salvo."), false)
    assert.equal(app.store.setTopicos([], "Salvo."), false)
  })
  assert.ok(app.store.erroArmazenamento)
  assert.equal(app.storage.getItem("meus-topicos"), original)
  assert.equal(app.storage.getItem("task-manager:dados"), null)
  assert.deepEqual(app.mensagens, [])
})

test("documento de versão futura não é sobrescrito", (t) => {
  const original = JSON.stringify({ versao: 99, tarefas: [], topicos: [] })
  const app = montar(t, { "task-manager:dados": original })
  act(() => assert.equal(app.store.setTarefas([]), false))
  assert.equal(app.storage.getItem("task-manager:dados"), original)
  assert.ok(app.store.erroArmazenamento)
})

test("falha ao excluir tópico preserva o documento completo anterior", (t) => {
  const app = montar(t)
  act(() => {
    app.store.setTarefas([{ id: "1", titulo: "Teste", concluida: false, topicoId: "a" }])
    app.store.setTopicos([{ id: "a", nome: "A" }])
  })
  const anterior = app.storage.getItem("task-manager:dados")
  t.mock.method(Object.getPrototypeOf(app.storage), "setItem", () => { throw new Error("Quota") })
  act(() => assert.equal(app.store.excluirTopico("a"), false))
  assert.equal(app.storage.getItem("task-manager:dados"), anterior)
  assert.equal(app.store.tarefas[0].topicoId, "")
  assert.deepEqual(app.store.topicos, [])
  assert.ok(app.store.erroArmazenamento)
})

for (const falhar of [false, true]) {
  test(`limpeza geral persiste as duas listas juntas (falha: ${falhar})`, (t) => {
    const app = montar(t)
    act(() => app.store.atualizarColecoes({
      tarefas: [{ id: "1", titulo: "Teste", concluida: false, topicoId: "a" }],
      topicos: [{ id: "a", nome: "A" }],
    }))
    const anterior = app.storage.getItem("task-manager:dados")
    act(() => app.dialogos.limpar())
    assert.equal(app.dialogos.limpeza.open, true)
    const prototipo = Object.getPrototypeOf(app.storage)
    const gravar = prototipo.setItem
    let gravacoes = 0
    t.mock.method(prototipo, "setItem", function (...args) {
      gravacoes += 1
      if (falhar) throw new Error("Quota")
      return gravar.apply(this, args)
    })
    act(() => app.dialogos.limpeza.onConfirm())
    assert.equal(gravacoes, 1)
    assert.equal(app.dialogos.limpeza.open, false)
    assert.deepEqual(app.store.tarefas, [])
    assert.deepEqual(app.store.topicos, [])
    assert.equal(app.mensagens.length, falhar ? 0 : 1)
    if (falhar) assert.equal(app.storage.getItem("task-manager:dados"), anterior)
    else assert.deepEqual(JSON.parse(app.storage.getItem("task-manager:dados")), { versao: 1, tarefas: [], topicos: [] })
  })

  test(`converter Sem tópico grava criação e vínculos juntos (falha: ${falhar})`, (t) => {
    const app = montar(t)
    act(() => app.store.atualizarColecoes({
      tarefas: [
        { id: "1", titulo: "Sem tópico", concluida: false, topicoId: "" },
        { id: "2", titulo: "Órfã", concluida: false, topicoId: "inexistente" },
        { id: "3", titulo: "Com tópico", concluida: false, topicoId: "a" },
      ],
      topicos: [{ id: "a", nome: "A" }],
    }))
    const anterior = app.storage.getItem("task-manager:dados")
    act(() => app.formulario.editarSemTopico())
    const prototipo = Object.getPrototypeOf(app.storage)
    const gravar = prototipo.setItem
    let gravacoes = 0
    t.mock.method(prototipo, "setItem", function (...args) {
      gravacoes += 1
      if (falhar) throw new Error("Quota")
      return gravar.apply(this, args)
    })
    act(() => app.formulario.props.onSubmit({ preventDefault() {} }))
    assert.equal(gravacoes, 1)
    const novo = app.store.topicos[1]
    assert.equal(novo.nome, "Sem tópico")
    assert.deepEqual(app.store.tarefas.map((tarefa) => tarefa.topicoId), [novo.id, novo.id, "a"])
    assert.equal(app.mensagens.length, falhar ? 0 : 1)
    if (falhar) assert.equal(app.storage.getItem("task-manager:dados"), anterior)
    else {
      const salvo = JSON.parse(app.storage.getItem("task-manager:dados"))
      assert.deepEqual(salvo.tarefas, app.store.tarefas)
      assert.deepEqual(salvo.topicos, app.store.topicos)
    }
  })
}

test("ações de criação validam campos obrigatórios sem gravar", (t) => {
  const app = montar(t)
  const tarefa = app.store.criarTarefa({ titulo: "   " })
  const topico = app.store.criarTopico({ nome: "   " })
  assert.equal(tarefa.campo, "titulo")
  assert.equal(tarefa.erro, "O título da tarefa é obrigatório.")
  assert.equal(topico.campo, "nome")
  assert.equal(topico.erro, "O nome do tópico é obrigatório.")
  assert.equal(app.storage.length, 0)
  assert.deepEqual(app.mensagens, [])
})

test("ações consecutivas de tópico impedem duplicidade sem depender de renderização", (t) => {
  const app = montar(t)
  const criar = app.store.criarTopico
  act(() => {
    assert.equal(criar({ nome: " Trabalho ", cor: "green" }).salvo, true)
    assert.equal(criar({ nome: "trabalho", cor: "blue" }).erro, "Já existe um tópico com esse nome.")
  })
  assert.equal(app.store.topicos.length, 1)
  assert.equal(app.store.topicos[0].nome, "Trabalho")
  assert.equal(app.mensagens.length, 1)
})

test("criar e editar tarefa normalizam textos e preservam identidade, conclusão, cor e ordem", (t) => {
  const app = montar(t)
  let id
  act(() => {
    const resultado = app.store.criarTarefa({ titulo: " Primeira ", descricao: " Texto ", cor: "#123456" })
    id = resultado.id
    app.store.criarTarefa({ titulo: "Segunda" })
    app.store.alternarConclusao(id)
    app.store.editarTarefa(id, { titulo: " Editada ", descricao: " Nova descrição ", data: "2026-11-20", topicoId: "a", cor: "outra" })
  })
  assert.deepEqual(app.store.tarefas[0], {
    id, titulo: "Editada", descricao: "Nova descrição", data: "2026-11-20", topicoId: "a", cor: "#123456", concluida: true,
  })
  assert.equal(app.store.tarefas[1].titulo, "Segunda")
  assert.equal(app.store.tarefas[1].concluida, false)
  assert.equal(app.store.tarefas[1].cor, "#ef4444")
  assert.deepEqual(JSON.parse(app.storage.getItem("task-manager:dados")).tarefas, app.store.tarefas)
})

test("editar tópico permite seu próprio nome e rejeita o nome de outro, preservando ordem e campos", (t) => {
  const app = montar(t)
  const original = { id: "a", nome: "A", cor: "blue", extra: "preservar" }
  act(() => app.store.setTopicos([original, { id: "b", nome: "B", cor: "green" }]))
  act(() => {
    assert.equal(app.store.editarTopico("a", { nome: " a ", cor: "rose" }).salvo, true)
    assert.equal(app.store.editarTopico("a", { nome: " b ", cor: "blue" }).erro, "Já existe um tópico com esse nome.")
  })
  assert.deepEqual(app.store.topicos[0], { ...original, nome: "a", cor: "rose" })
  assert.equal(app.store.topicos[1].id, "b")
  assert.deepEqual(original, { id: "a", nome: "A", cor: "blue", extra: "preservar" })
  assert.deepEqual(app.mensagens, ["Tópico atualizado com sucesso."])
})

test("ações de criação tratam falha de ID sem alterar nem persistir dados", (t) => {
  const app = montar(t)
  t.mock.method(globalThis.crypto, "randomUUID", () => { throw new Error("Indisponível") })
  for (const resultado of [app.store.criarTarefa({ titulo: "Tarefa" }), app.store.criarTopico({ nome: "Tópico" }), app.store.criarTopicoComTarefasSemTopico({ nome: "Grupo" })]) {
    assert.equal(resultado.campo, "criacao")
    assert.match(resultado.erro, /identificador seguro/)
  }
  assert.deepEqual(app.store.tarefas, [])
  assert.deepEqual(app.store.topicos, [])
  assert.equal(app.storage.length, 0)
})

test("ações distinguem falha de armazenamento de erro de validação", (t) => {
  const app = montar(t)
  t.mock.method(Object.getPrototypeOf(app.storage), "setItem", () => { throw new Error("Quota") })
  act(() => {
    const tarefa = app.store.criarTarefa({ titulo: " Tarefa " })
    assert.equal(tarefa.erro, "")
    assert.equal(tarefa.salvo, false)
    const topico = app.store.criarTopico({ nome: " Tópico ", cor: "inexistente" })
    assert.equal(topico.erro, "")
    assert.equal(topico.salvo, false)
  })
  assert.equal(app.store.tarefas[0].titulo, "Tarefa")
  assert.equal(app.store.topicos[0].cor, "blue")
  assert.deepEqual(app.mensagens, [])
  assert.ok(app.store.erroArmazenamento)
})

test("formulário de tarefa apresenta validação e mantém criação e edição funcionando", (t) => {
  const app = montar(t)
  act(() => app.formularioTarefa.abrir("a"))
  act(() => app.formularioTarefa.props.onSubmit({ preventDefault() {} }))
  assert.equal(app.formularioTarefa.props.erroTitulo, "O título da tarefa é obrigatório.")
  assert.equal(app.formularioTarefa.props.open, true)
  act(() => {
    app.formularioTarefa.props.onTitleChange(" Tarefa ")
    app.formularioTarefa.props.onDescriptionChange(" Texto ")
  })
  act(() => app.formularioTarefa.props.onSubmit({ preventDefault() {} }))
  assert.equal(app.store.tarefas[0].titulo, "Tarefa")
  assert.equal(app.store.tarefas[0].descricao, "Texto")
  assert.equal(app.store.tarefas[0].topicoId, "a")
  assert.equal(app.formularioTarefa.props.open, false)
  act(() => app.formularioTarefa.editar(app.store.tarefas[0]))
  act(() => app.formularioTarefa.props.onTitleChange(" Editada "))
  act(() => app.formularioTarefa.props.onSubmit({ preventDefault() {} }))
  assert.equal(app.store.tarefas.length, 1)
  assert.equal(app.store.tarefas[0].titulo, "Editada")
  assert.equal(app.formularioTarefa.props.open, false)
  assert.deepEqual(app.mensagens, ["Tarefa cadastrada com sucesso.", "Tarefa atualizada com sucesso."])
})

test("formulário de tópico apresenta duplicidade e permite editar o próprio nome", (t) => {
  const app = montar(t)
  act(() => app.store.criarTopico({ nome: "A", cor: "blue" }))
  act(() => app.formulario.abrir())
  act(() => app.formulario.props.onNameChange(" a "))
  act(() => app.formulario.props.onSubmit({ preventDefault() {} }))
  assert.equal(app.formulario.props.error, "Já existe um tópico com esse nome.")
  assert.equal(app.formulario.props.open, true)
  act(() => app.formulario.editar(app.store.topicos[0]))
  act(() => app.formulario.props.onColorChange("green"))
  act(() => app.formulario.props.onSubmit({ preventDefault() {} }))
  assert.equal(app.store.topicos.length, 1)
  assert.equal(app.store.topicos[0].cor, "green")
  assert.equal(app.formulario.props.open, false)
})

test("diálogo de exclusão delega a ação e limpa apenas o vínculo visual selecionado", (t) => {
  const app = montar(t)
  act(() => app.store.criarTopico({ nome: "A" }))
  const topico = app.store.topicos[0]
  act(() => {
    app.store.criarTarefa({ titulo: "Tarefa", topicoId: topico.id })
    app.formularioTarefa.abrir(topico.id)
    app.dialogos.solicitarExclusaoTopico(topico)
  })
  act(() => app.dialogos.exclusaoTopico.onConfirm())
  assert.deepEqual(app.store.topicos, [])
  assert.equal(app.store.tarefas[0].topicoId, "")
  assert.equal(app.formularioTarefa.props.topicoId, "")
  assert.equal(app.dialogos.exclusaoTopico.open, false)
  assert.equal(app.mensagens.filter((mensagem) => mensagem.startsWith("Tópico excluído")).length, 1)
})

test("ações mantêm reordenação manual, movimentação, conclusão e exclusão", (t) => {
  const app = montar(t)
  act(() => {
    app.store.atualizarColecoes({
      tarefas: [{ id: "1", concluida: false, topicoId: "a" }, { id: "2", concluida: false, topicoId: "b" }, { id: "3", concluida: false, topicoId: "a" }],
      topicos: [{ id: "a", nome: "A" }, { id: "b", nome: "B" }],
    })
  })
  act(() => {
    app.store.reordenarTopicos([...app.store.topicos].reverse())
    app.store.reordenarTarefas(["3", "1"])
    app.store.moverTarefa("3", "b")
    app.store.alternarConclusao("3")
    app.store.excluirTarefa("1")
  })
  assert.deepEqual(app.store.topicos.map((item) => item.id), ["b", "a"])
  assert.deepEqual(app.store.tarefas, [{ id: "3", concluida: true, topicoId: "b" }, { id: "2", concluida: false, topicoId: "b" }])
})

for (const tipo of ["tarefa", "topico"]) {
  test(`formulário de ${tipo} mantém tratamento visual da falha de ID`, (t) => {
    const app = montar(t)
    t.mock.method(globalThis.crypto, "randomUUID", () => { throw new Error("Indisponível") })
    if (tipo === "tarefa") {
      act(() => app.formularioTarefa.abrir())
      act(() => app.formularioTarefa.props.onTitleChange("Teste"))
      act(() => app.formularioTarefa.props.onSubmit({ preventDefault() {} }))
      assert.match(app.formularioTarefa.props.erroCriacao, /identificador seguro/)
      assert.equal(app.formularioTarefa.props.open, true)
    } else {
      act(() => app.formulario.abrir())
      act(() => app.formulario.props.onNameChange("Teste"))
      act(() => app.formulario.props.onSubmit({ preventDefault() {} }))
      assert.match(app.formulario.props.creationError, /identificador seguro/)
      assert.equal(app.formulario.props.open, true)
    }
    assert.equal(app.storage.length, 0)
  })
}

test("falha ao gravar preserva o comportamento existente dos modais de criação e edição", (t) => {
  const app = montar(t)
  t.mock.method(Object.getPrototypeOf(app.storage), "setItem", () => { throw new Error("Quota") })
  act(() => app.formularioTarefa.abrir())
  act(() => app.formularioTarefa.props.onTitleChange("Tarefa"))
  act(() => app.formularioTarefa.props.onSubmit({ preventDefault() {} }))
  assert.equal(app.formularioTarefa.props.open, false)
  assert.equal(app.store.tarefas.length, 1)
  act(() => app.formularioTarefa.editar(app.store.tarefas[0]))
  act(() => app.formularioTarefa.props.onTitleChange("Editada"))
  act(() => app.formularioTarefa.props.onSubmit({ preventDefault() {} }))
  assert.equal(app.formularioTarefa.props.open, false)
  assert.equal(app.store.tarefas[0].titulo, "Editada")
  act(() => app.formulario.abrir())
  act(() => app.formulario.props.onNameChange("Tópico"))
  act(() => app.formulario.props.onSubmit({ preventDefault() {} }))
  assert.equal(app.formulario.props.open, true)
  assert.equal(app.store.topicos.length, 1)
  act(() => app.formulario.editar(app.store.topicos[0]))
  act(() => app.formulario.props.onNameChange("Editado"))
  act(() => app.formulario.props.onSubmit({ preventDefault() {} }))
  assert.equal(app.formulario.props.open, false)
  assert.equal(app.store.topicos[0].nome, "Editado")
  assert.ok(app.store.erroArmazenamento)
  assert.deepEqual(app.mensagens, [])
})

for (const legado of [false, true]) {
  test(`recuperação parcial no store mantém IDs únicos e bloqueia sobrescrita (legado: ${legado})`, (t) => {
    const tarefas = [
      { id: "1", titulo: "Preservada", concluida: false, topicoId: "a" },
      { id: "1", titulo: "Duplicada", concluida: true },
      { id: "2", titulo: "Recuperada", concluida: false, descricao: {}, data: "inválida", topicoId: 4 },
      { id: "", titulo: "Sem ID", concluida: false },
    ]
    const topicos = [{ id: "a", nome: "A" }, { id: "a", nome: "Duplicado" }, { id: " ", nome: "Inválido" }]
    const originais = legado
      ? { "minhas-tarefas": JSON.stringify(tarefas), "meus-topicos": JSON.stringify(topicos) }
      : { "task-manager:dados": JSON.stringify({ versao: 1, tarefas, topicos }) }
    const app = montar(t, originais)
    assert.deepEqual(app.store.tarefas.map((item) => item.id), ["1", "2"])
    assert.deepEqual(app.store.topicos.map((item) => item.id), ["a"])
    assert.equal(app.store.tarefas[1].descricao, "")
    assert.equal(app.store.tarefas[1].data, "")
    assert.equal(app.store.tarefas[1].topicoId, "")
    assert.match(app.store.erroArmazenamento, /tarefas e tópicos/)
    act(() => {
      assert.equal(app.store.criarTarefa({ titulo: "Em memória" }).salvo, false)
      assert.equal(app.store.excluirTopico("a"), false)
    })
    for (const [chave, valor] of Object.entries(originais)) assert.equal(app.storage.getItem(chave), valor)
    assert.equal(app.storage.length, Object.keys(originais).length)
    assert.ok(app.store.erroArmazenamento)
    assert.deepEqual(app.mensagens, [])
  })
}
