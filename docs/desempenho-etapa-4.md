# Medição de renderizações — Etapa 4

Cenário: React real em jsdom, com páginas carregadas pelo Vite e 120 tarefas.
Contadores em getters medem acessos a campos da coleção. A medição inicial foi
feita antes das alterações desta etapa e repetida com os mesmos dados e eventos.

| Interação | Antes | Depois |
| --- | ---: | ---: |
| Tasks: cinco alterações no título do formulário; leituras de título/conclusão | 7.200 | 0 |
| Home: cinco alterações no título do formulário; leituras de título/conclusão | 6.940 | 0 |
| Home: cinco trocas de página; leituras de data | 5.590 | 150 |

São contagens de trabalho, não tempos de resposta ou FPS. jsdom não mede layout,
pintura, foco nativo de diálogos ou a experiência de arraste no navegador.

## Decisões

- TaskForm e TopicForm possuem os hooks e os estados dos formulários. Digitar não
  atualiza o estado das páginas. useImperativeHandle expõe apenas os comandos de
  abertura, edição e remoção do tópico selecionado. O ref é uma prop do React 19.
- useFormControls mantém estáveis os comandos que encaminham os eventos aos
  formulários, sem ler o conteúdo das referências durante a renderização.
- Tasks memoriza os filtros por lista, status e busca normalizada. A contagem de
  concluídas depende apenas da lista. Abrir detalhes e confirmações não refaz esses
  cálculos. Alterações nos dados ou filtros invalidam os resultados.
- HomeTaskList memoriza a ordenação por identidade da lista; trocar de página só
  recorta o resumo pronto. A função paginarTarefas continua compatível.
- HomeTaskList usa memo para evitar renderizações causadas por registro de água ou
  abertura de detalhes. O callback de detalhes é estável. A data local é uma prop
  explícita para que a mudança de dia também invalide essa memoização.

Os oito testes em tests/rendering.test.js verificam as contagens, envio dos campos,
criação de tópico, busca, filtros, atualização da lista, mudança de dia e ajuste de
página após exclusões. Os testes de homeTasks comparam a paginação reutilizada com a
API existente e verificam que a ordem manual original não é alterada.

A estabilidade das ações do Context continua reservada à Etapa 6. Agrupamento e
arraste continuam reservados à Etapa 5.
