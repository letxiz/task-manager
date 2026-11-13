# Carregamento das rotas — Etapa 8

## Diagnóstico e decisão

App importava todas as telas de forma estática. O bundle inicial incluía o dnd-kit,
embora o início e a página 404 não o utilizem. Uma análise dos módulos do build
identificou 108.152 bytes renderizados do dnd-kit antes da minificação.

Somente a rota /tasks passou a usar React.lazy com import dinâmico. Home, NotFound,
layout e Providers continuam no carregamento inicial. A divisão foi mantida pelo
benefício medido, sem bibliotecas adicionais ou migração do roteador.

## Comparação dos builds

Valores em kB decimais, conforme o relatório de npm run build do Vite 8.3.0:

| JavaScript | Antes | Depois |
| --- | ---: | ---: |
| Carregamento inicial | 438,82 | 358,25 |
| Carregamento inicial gzip | 135,86 | 112,09 |
| Módulo de tarefas sob demanda | — | 81,51 |
| Módulo de tarefas gzip | — | 24,75 |

O JavaScript inicial diminuiu aproximadamente 18,4% sem compressão e 17,5% em gzip.
O tamanho total não diminui: visitar /tasks também baixa o módulo separado e acrescenta
uma requisição no primeiro acesso. Há um pequeno custo de divisão e da interface de
erro. O CSS continua compartilhado: passou de 46,73 para 46,98 kB.

## Comportamento e proteção

Suspense envolve apenas o conteúdo de tarefas, com status acessível de carregamento.
O menu, o cabeçalho e os Providers continuam montados durante a espera.
TaskRouteBoundary trata falhas de carregamento/renderização dessa rota, mantém a
navegação e oferece retorno ao início. Não há reload automático nem recriação do
store. Após falha no import, recarregar permite tentar carregar o módulo novamente;
o React.lazy mantém em cache tanto a resolução quanto a rejeição da tentativa atual.

## Verificação

- Acesso direto a /tasks com o carregamento do módulo atrasado intencionalmente.
- Início em sessão nova sem solicitar tarefas até navegar para /tasks.
- Criação, conclusão e navegação entre telas preservando dados e histórico.
- Página 404 e retorno ao início.
- Falha de módulo mantendo menu, dados do Provider e documento armazenado.
- Inspeção do grafo do build: nenhum módulo do dnd-kit nos chunks iniciais, mesmo
  considerando suas dependências estáticas; dnd-kit presente no chunk sob demanda.

Os testes usam React real e jsdom, com atraso/falha controlados pelo Vite. Não são
medições de latência ou de cache HTTP de um navegador. A revisão final de navegação
e experiência no navegador permanece na Etapa 9.
