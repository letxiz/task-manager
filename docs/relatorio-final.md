# Relatório final — task-manager, Etapas 1–9

## Resultado

As nove etapas foram executadas incrementalmente. A revisão final confirmou **98
testes automatizados passando**, lint e build, além de **sete cenários funcionais
passando em Chromium real**. Não foram observadas regressões nos fluxos exercitados.
A auditoria de acessibilidade identificou pendências preexistentes: a revisão não
constitui aprovação integral de acessibilidade.

A branch é `refactor/task-manager-improvements`. As Etapas 1–3 estão no checkpoint
`0c705eb`; as Etapas 4–9 permanecem como alterações locais para revisão. `dev`
permanece em `e850d35`. Nenhum merge, rebase, push, exclusão de branch ou integração
com API foi realizado nesta revisão.

## Alterações por etapa

| Etapa | Resultado e arquivos principais |
| --- | --- |
| 1 — Estado | Setters usam a coleção mais recente, inclusive em chamadas consecutivas e callbacks antigos. Cálculo separado de persistência e notificações. `useTaskStore.js`. |
| 2 — Persistência | Documento único versionado, operações conjuntas em uma gravação, avisos de erro confiáveis e legado preservado. `taskStorage.js`, store e hooks dos formulários/diálogos. |
| 3 — Domínio | Validação, normalização, IDs, criação/edição, exclusão, agrupamento e notificações nas ações do store. Formulários mantêm estado visual. |
| 4 — Renderização | Campos junto aos modais; filtros e contagens memorizados; ordenação separada da paginação. `TaskForm.jsx`, `TopicForm.jsx`, `useFormControls.js`, páginas, `HomeTaskList.jsx` e `homeTasks.js`. |
| 5 — Agrupamento | Índices com Map/Set compartilhados pela lista e pelo arraste, preservando a ordem manual. `taskGroups.js`, `TaskList.jsx` e `useTaskDrag.js`. |
| 6 — Context | Contexts de estado/ações separados; comandos estáveis; interface combinada preservada. `TaskProvider.jsx`, `TaskContext.js`, `useTaskData.js` e store. |
| 7 — Dados | Validação por registro, recuperação parcial, IDs únicos e bloqueio de gravações diante de dados inválidos. `taskSchema.js` e `taskStorage.js`. |
| 8 — Rotas | `/tasks` sob demanda, status de carregamento e proteção contra falha do módulo, com layout e store preservados. `App.jsx` e `TaskRouteBoundary.jsx`. |
| 9 — Revisão | Testes no build de produção, comparação com o commit anterior, evidências e runner opcional de navegador. `tests/browser/finalReview.mjs` e este relatório. |

JavaScript, React 19 e Vite 8 foram mantidos. Não foi adicionada biblioteca de estado.
`jsdom` é a única dependência adicionada ao projeto, somente para desenvolvimento.
Playwright, axe-core e Chromium usados na revisão foram instalados em `/tmp`.

## Verificações finais

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Passou |
| `npm test` | 98 testes, 98 passaram, nenhum ignorado ou falho |
| `npm run build` | Passou, Vite 8.3.0 |
| `git diff --check` | Passou |
| Script de navegador | Sete cenários funcionais passaram |

A confirmação final dos comandos foi executada fora do sandbox: o ambiente restrito
sinalizou EPERM em subprocessos do Node. Isso permitiu confirmar os 98 casos reais,
além das execuções diretas de testes feitas durante o trabalho.

### Cobertura automatizada

| Arquivo | Casos |
| --- | ---: |
| `homeTasks.test.js` | 6 |
| `rendering.test.js` | 11 |
| `routeBundle.test.js` | 1 |
| `routes.test.js` | 5 |
| `taskContext.test.js` | 6 |
| `taskDrag.test.js` | 8 |
| `taskGroups.test.js` | 4 |
| `taskSchema.test.js` | 6 |
| `taskStorage.test.js` | 14 |
| `taskStore.test.js` | 32 |
| `waterStorage.test.js` | 5 |

### Fluxos exercitados em navegador

Ambiente: Chromium headless 158.0.8127.18, Playwright 1.65.0 e axe-core 4.14.0,
executando o build de produção por preview local. Foram usados perfis temporários,
dados sintéticos e emulação de dispositivo; nenhum perfil ou dado pessoal foi usado.

1. Criação, edição, conclusão e exclusão de tarefa; criação, edição e exclusão de
   tópico mantendo tarefas; busca por descrição, filtros e persistência após reload.
2. Acesso às 13 tarefas pela paginação do início, prioridade de pendentes/prazos e
   preservação da ordem manual armazenada.
3. Arraste com mouse: reordenação dentro do tópico, movimentação entre tópicos,
   passagem por Sem tópico, tópico vazio e persistência após reload.
4. Arraste com teclado: reordenação de tarefa e tópico usando os anúncios do dnd-kit
   para confirmar o alvo. A navegação aninhada já existente pode passar por uma tarefa
   interna antes de alcançar o tópico seguinte.
5. Arraste com toque emulado: pressão longa e reordenação de tarefas sem tópico.
6. Responsividade em 320, 390, 768 e 1440 px sem overflow horizontal; menu móvel,
   Escape, retorno de foco e ausência de foco em controles do fundo durante os modais.
7. Migração do legado mantendo as cópias antigas; carregamento parcial de documento
   inválido; aviso e bloqueio de sobrescrita, mesmo após interação com tarefas recuperadas.

O foco inicial do formulário e o ciclo nativo de Tab foram comparados com a versão
anterior. O comportamento foi preservado. O Chromium pode passar pelo foco do
documento ao completar o ciclo, sem focar controles interativos do fundo.

## Desempenho observado

| Cenário | Antes | Depois |
| --- | ---: | ---: |
| Cinco digitações em Tasks, leituras de título/conclusão | 7.200 | 0 |
| Cinco digitações em Home, leituras de título/conclusão | 6.940 | 0 |
| Cinco trocas de página, leituras de data | 5.590 | 150 |
| Agrupamento de 120 tarefas/12 tópicos, leituras de vínculo/ID | 4.464 | 504 |
| Cinco atualizações, renderizações extras do consumidor de ações | 5 | 0 |
| Cinco atualizações, identidades de funções trocadas | 75 | 0 |
| JavaScript inicial antes/depois da divisão de rotas | 438,82 kB | 358,25 kB |
| JavaScript inicial gzip, relatório do Vite | 135,86 kB | 112,09 kB |

As contagens são medições de trabalho em React/jsdom; não são FPS ou tempos de
resposta. A divisão de rotas reduz aproximadamente 18,4% do JavaScript inicial,
mas acrescenta uma requisição no primeiro acesso a tarefas. O módulo separado tem
81,51 kB (24,75 kB gzip). O tamanho total não diminui.

## Acessibilidade: pendências confirmadas antes das refatorações

A auditoria foi comparada com uma cópia isolada do commit `e850d35`, no mesmo
navegador, viewport e dados, após carregar a rota e as fontes. Os mesmos grupos de
alertas e quantidades foram reproduzidos:

| Tela | Regras apontadas pelo axe |
| --- | --- |
| Tarefas | `aria-allowed-role`, `color-contrast`, `list`, `nested-interactive` |
| Início | `color-contrast`, `label-content-name-mismatch` |

O contraste do menu lateral inclui relações de 4,44:1 para texto secundário e 3,71:1
para o item selecionado, abaixo dos 4,5:1 exigidos nos tamanhos usados. As linhas
arrastáveis usam elementos de lista com papel de botão contendo outros controles;
isso afeta a semântica de lista e produz alertas de controles interativos aninhados.
No início, nomes acessíveis não incluem todo o texto visível de alguns botões de
tarefa e do controle de 1 litro de água.

O formulário móvel auditado não apresentou violações no conjunto WCAG utilizado.
Isso não certifica a página inteira nem substitui testes com leitores de tela.
Os alertas existentes foram documentados, sem redesenhar cores ou a estrutura de
interação nesta refatoração. Uma correção dedicada de acessibilidade permanece
recomendada antes de declarar conformidade.

## Dados, limites e riscos restantes

- O documento continua na versão 1. Chaves legadas permanecem intactas, representando
  a cópia anterior à migração, e não um backup atualizado.
- Dados inválidos bloqueiam gravações na sessão. Alterações apenas em memória ainda
  podem ser perdidas ao sair da página; a recuperação assistida está em `persistencia.md`.
- Conflitos de edição entre abas não foram implementados.
- Não foram executados testes em Firefox, Safari, dispositivo físico ou leitor de
  tela. O toque foi emulado pelo Chromium.
- O limite de erro de rota não recarrega a página automaticamente. Uma falha de import
  pode exigir reload para nova tentativa; o retorno ao início mantém o store montado.

## Evidências e reprodução

- `docs/validacao/resultado-navegador.json`: cenários e detalhes dos alertas do axe.
- `docs/validacao/comparacao-acessibilidade.json`: comparação com `e850d35`.
- `/tmp/task-manager-final-qa/artifacts/`: screenshots e saída da execução do navegador.
- `desempenho-etapa-4.md`, `desempenho-etapa-5.md`, `desempenho-etapa-6.md` e
  `desempenho-etapa-8.md`: métodos e decisões de cada otimização.

Para reproduzir a revisão de navegador sem adicionar dependências ao projeto:

```bash
npm install --prefix /tmp/task-manager-final-qa --no-package-lock playwright@1.65.0 axe-core@4.14.0
PLAYWRIGHT_BROWSERS_PATH=/tmp/task-manager-final-qa/browsers node /tmp/task-manager-final-qa/node_modules/playwright/cli.js install chromium --only-shell
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Em outro terminal:

```bash
TASK_MANAGER_QA_PACKAGE_JSON=/tmp/task-manager-final-qa/package.json \
PLAYWRIGHT_BROWSERS_PATH=/tmp/task-manager-final-qa/browsers \
node tests/browser/finalReview.mjs
```

O script retorna falha para cenários funcionais que não passam e registra a auditoria
axe separadamente. Seu código de saída zero não significa ausência de problemas de
acessibilidade. Em ambientes restritos, navegador e servidor podem exigir permissão
para executar processos e abrir a porta local.

Nenhuma operação adicional no Git está autorizada por este relatório. O próximo
checkpoint ou a integração em dev dependem da autorização do usuário. A futura
branch de API pode partir de dev depois que as refatorações forem revisadas e integradas.
