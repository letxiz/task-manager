# Context e estabilidade das ações — Etapa 6

## Diagnóstico e medição

O store recriava 15 funções públicas a cada renderização. TaskProvider entregava
um objeto novo ao Context em toda renderização. Um consumidor inscrito nesse
Context recebia atualizações mesmo utilizando apenas os comandos.

A medição usa React real, o Provider real e consumidores memorizados em jsdom.
Os elementos filhos permanecem idênticos, isolando a propagação pelo Context das
renderizações normais do pai. Os consumidores não usam StrictMode nesta medição.

| Cenário | Antes | Depois |
| --- | ---: | ---: |
| Cinco criações: renderizações adicionais do consumidor de ações | 5 | 0 |
| Cinco criações: identidades de funções trocadas | 75 | 0 |
| Três renderizações do pai: atualizações do consumidor combinado | 3 | 0 |
| Três renderizações do pai: atualizações do consumidor de ações | 3 | 0 |

## Interface e implementação

- TaskContext fornece tarefas, tópicos e erro de armazenamento.
- TaskActionsContext fornece o conjunto de ações. useTaskActions permite assinar
  somente esse Context. TopicForm utiliza essa assinatura e memo, sem receber o
  objeto de dados da página como prop.
- useTaskData mantém a interface combinada existente, juntando estado e ações.
  Ele continua inscrito nas mudanças de dados, como as páginas precisam.
- atualizarColecoes usa useCallback; o conjunto de ações usa uma única fábrica
  useMemo para manter estáveis as funções relacionadas, sem uma cadeia de callbacks.
  Os comandos continuam consultando dadosAtuais apenas quando executados.
- O estado publicado e a interface combinada também são memorizados. Uma atualização
  com as mesmas referências de coleções e o mesmo erro não propaga um novo valor.

As ações são estáveis durante mudanças nos dados e avisos de gravação. Se a função
externa de notificação mudar, o conjunto de ações é recriado para utilizar o novo
callback. Essa dependência é intencional e está coberta por teste.

## Validação e limites

Os seis testes em tests/taskContext.test.js verificam as medições, comandos capturados
antes de outras renderizações, leitura do estado recente, falha e recuperação da
persistência, troca da função de notificação e atualização sem mudança nas coleções.
Os testes anteriores de store, páginas, agrupamento e arraste continuam passando.

A separação evita atualizações provocadas pelo Context para consumidores apenas de
ações. Ela não impede renderizações normais de componentes causadas por seus pais;
por isso TopicForm também usa memo. Os demais consumidores que precisam dos dados
continuam renderizando quando esses dados mudam. Não foi adicionada biblioteca de estado.
