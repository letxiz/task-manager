# Agrupamento e arraste — Etapa 5

## Diagnóstico e medição

Antes, TaskList filtrava todas as tarefas para cada tópico. useTaskDrag procurava
cada vínculo com some nos tópicos e TaskList usava includes repetidamente ao filtrar
as tarefas sem tópico. Isso multiplicava os percursos conforme as coleções cresciam.

Na página Tasks, com React real em jsdom, 120 tarefas e 12 tópicos, a medição de
leituras de vínculo/ID de tópico na montagem caiu de **4.464 para 504**.
Esses valores medem trabalho na página, não latência ou FPS de um navegador.

## Alterações e invariantes

- indexarTarefas percorre tarefas e tópicos para construir grupos, tarefas por ID e
  posições dos tópicos em Map. O custo de construção é O(tarefas + tópicos).
- useTaskDrag memoriza o índice pelas duas coleções. Prévia e cancelamento não
  reconstroem o índice. O início do arraste consulta a tarefa por ID; reordenação de
  tópico consulta suas posições; reordenação de tarefa examina apenas seu grupo.
- TaskList reutiliza o índice completo. Quando há uma lista visível distinta,
  agrupa seus itens uma vez e usa Set para verificar a presença de tarefas sem tópico.
- Os grupos preservam a ordem manual e as referências dos objetos. Sem tópico
  mantém a ordem da coleção completa e a comparação por referência usada antes.
  Tarefas órfãs continuam nessa seção. Tópicos vazios continuam visíveis sem filtros.
- Sensores, suas configurações, coordenadas de teclado, detecção de colisão e IDs
  do dnd-kit permanecem iguais. O estado visual da prévia também permanece igual.

## Validação e limites

Os testes comparam o agrupamento com o algoritmo anterior para diferentes listas,
filtros e ordens; verificam crescimento linear até 10.000 tarefas; executam os
callbacks reais do hook com eventos no formato do dnd-kit; verificam prévia,
cancelamento, movimentos, reordenação e atualização das coleções. Testes de página
verificam a quantidade de itens e a presença dos grupos sob filtros.

jsdom não oferece layout e gestos reais. Os testes não substituem a verificação
manual de arraste com mouse, toque e teclado em navegador prevista na revisão final.
As alterações da Etapa 4 permanecem preservadas nesta mesma branch, sem novo commit.
