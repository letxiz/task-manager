# Task Manager

**Organização de tarefas por tópicos e acompanhamento de hábitos em uma aplicação React.**

Desenvolvido em parceria por [letxiz](https://github.com/letxiz) e [zeni-node](https://github.com/zeni-node). Reúne gerenciamento de tarefas, organização por arrastar e soltar e controle diário de água, com interface responsiva e persistência no navegador.

[Funcionalidades](#funcionalidades) · [Decisões técnicas](#decisões-técnicas) · [Execução local](#execução-local) · [Validação](#validação)

## Sobre o projeto

A proposta é reunir compromissos e um hábito diário em um espaço simples de acompanhar. As tarefas podem ser organizadas em tópicos com cores, filtradas por status e consultadas por prazo. O painel inicial apresenta um resumo e permite concluir tarefas sem sair da página.

O projeto exercita gerenciamento de estado compartilhado, composição de componentes, formulários, persistência local e interações de arraste. A interface passou por ajustes a partir de feedback de uso, incluindo a simplificação de ações, a redução de notificações e a paginação da lista inicial.

## Funcionalidades

### Tarefas e tópicos

- Cadastro e edição de tarefas com título, descrição, prazo e tópico opcional.
- Conclusão, reabertura, consulta de detalhes e exclusão de tarefas.
- Busca por título ou descrição combinada com filtros de status.
- Tópicos com sete opções de cor e grupos que podem ser expandidos ou recolhidos.
- Reordenação de tópicos e tarefas e movimentação entre grupos por arrastar e soltar.
- Transformação do grupo **Sem tópico** em um tópico nomeado, mantendo suas tarefas.
- Confirmação para excluir tópicos ou limpar todos os dados; ao excluir um tópico, suas tarefas são preservadas.

### Painel inicial

- Resumo do total de tarefas, pendências e conclusões.
- Lista ordenada por pendências e prazos, com seis tarefas por página.
- Controles **Anterior** e **Próxima** exibidos somente quando há mais de seis tarefas.
- Consulta de detalhes, edição e controle de conclusão.
- Registro de consumo de água, meta diária ajustável e opção de desfazer o último registro.

### Interface

- Navegação lateral recolhível no computador e menu para dispositivos móveis.
- Status com texto e cores para diferenciar tarefas pendentes e concluídas.
- Modais com fechamento por Escape, rótulos para controles e estilos de foco para navegação por teclado.
- Notificações de criação, atualização e exclusão, sem avisos para cada fechamento ou cancelamento.

## Tecnologias

| Tecnologia | Uso no projeto |
| --- | --- |
| React 19 | Componentes, estado e composição da interface. |
| React Router 7 | Rotas e layout compartilhado. |
| Tailwind CSS 4 | Estilos responsivos, tema e estados visuais. |
| dnd-kit | Ordenação e movimentação de tarefas e tópicos. |
| Vite 8 | Servidor de desenvolvimento e build de produção. |
| Express 5 e PostgreSQL 17 | API local e persistência dos dados do piloto. |
| Lucide React | Ícones da interface. |
| Node.js Test Runner e jsdom | Testes de lógica, interface e integração HTTP da API. |
| ESLint | Verificação estática do código. |

## Decisões técnicas

**Estado compartilhado com Context e hooks.** As páginas Início e Minhas Tarefas usam o mesmo conjunto de dados por meio do `TaskProvider`. Hooks específicos concentram a lógica de persistência, formulários, modais e arraste.

**Componentes organizados por responsabilidade.** A área de tarefas separa lista, controles e modais. A linha da tarefa e sua prévia de arraste compartilham o componente de conteúdo para manter a apresentação consistente.

**Persistência com `localStorage`.** Tarefas, tópicos e consumo de água permanecem após recarregar a página. O controle de água considera o dia local e reinicia o consumo na mudança de dia, mantendo a meta.

**Funções de dados separadas da interface.** Ordenação, resumo e paginação das tarefas podem ser testados sem renderizar componentes. A paginação ajusta a página atual quando a quantidade de tarefas diminui.

## Estrutura

```text
src/
├── components/
│   ├── home/             # Painel inicial e controle de água
│   ├── layout/           # Navegação e cabeçalho
│   ├── tasks/
│   │   ├── controls/     # Calendário, opções e tooltip
│   │   ├── list/         # Tarefas, tópicos e componentes de arraste
│   │   └── modals/       # Formulários e detalhes
│   └── ui/               # Notificações e confirmação
├── contexts/             # Contextos compartilhados
├── hooks/                # Lógica de tarefas, formulários e hábitos
├── routes/               # Páginas e layout das rotas
├── constants/            # Cores e estilos compartilhados
└── utils/                # Datas, persistência, resumo e paginação
tests/                    # Testes automatizados
server/                   # API, migração PostgreSQL e testes HTTP
docs/                     # Guias de uso e desenvolvimento
```

## Execução local

Use **Node.js 24** e npm. O frontend em modo local roda com as configurações padrão.

```bash
git clone https://github.com/letxiz/task-manager.git
cd task-manager
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite no terminal. Para testar em outro dispositivo na mesma rede, use o endereço de rede informado pelo servidor.

### GitHub Pages

O GitHub Actions publica o frontend da branch `main` depois de rodar o lint e os testes. Em [Minhas Tarefas no GitHub Pages](https://letxiz.github.io/task-manager/#/tasks), a rota usa `#/tasks` para funcionar ao abrir ou recarregar o endereço. As tarefas e o consumo de água ficam no navegador.

### API local opcional

Para iniciar o Express em outro terminal:

```bash
npm --prefix server ci
npm --prefix server start
```

Em outro terminal, `curl -fsS http://127.0.0.1:3000/api/health` deve retornar `{"status":"ok"}`. Para configurar o PostgreSQL, usar as rotas de tarefas e tópicos ou ativar a prévia, siga o [guia da API local](docs/api-local.md).

## Validação

```bash
npm run lint
npm test
npm run build
```

O comando da raiz inclui testes de lógica, persistência e interface em jsdom. Para executar a suíte HTTP da API com PostgreSQL, use `npm --prefix server test` após configurar o banco. Consulte os pré-requisitos e a cobertura no [guia da API local](docs/api-local.md).

Para visualizar o build de produção localmente:

```bash
npm run preview
```

## Escopo atual

As telas principais usam `localStorage`. Os dados pertencem à origem e ao perfil do navegador. A prévia optativa lê e grava tarefas e tópicos no PostgreSQL. Importação de dados locais, contas e sincronização entre dispositivos ainda estão pendentes.

## Documentação e créditos

- [Guia de uso](docs/uso.md)
- [API local, PostgreSQL e testes](docs/api-local.md)
- [Guia de desenvolvimento e fluxo de branches](docs/desenvolvimento.md)
- [Persistência de tarefas e tópicos no navegador](docs/persistencia.md)
- [Referência de design no Figma](https://www.figma.com/design/A5w7qejEx7p0jDkMsNIEg3/Task-Manager?node-id=0-1), adaptada durante o desenvolvimento.

Desenvolvido por [letxiz](https://github.com/letxiz) e [zeni-node](https://github.com/zeni-node).
