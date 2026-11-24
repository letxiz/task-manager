# Guia de desenvolvimento

## Estrutura

| Caminho | Responsabilidade |
| --- | --- |
| `src/routes/(app)/` | Páginas e layout da aplicação. |
| `src/components/layout/` | Menu lateral e cabeçalho de navegação. |
| `src/components/home/` | Resumo de tarefas e controle de água. |
| `src/components/tasks/` | Listas, grupos, formulários e modais. |
| `src/components/ui/` | Notificações e confirmação de ações. |
| `src/hooks/` | Estado e lógica de tarefas, formulários e água. |
| `src/contexts/` | Contextos de tarefas e notificações. |
| `src/constants/` | Paleta de tópicos e estilos compartilhados. |
| `src/utils/` | Datas, persistência e funções auxiliares. |
| `src/index.css` | Tema global e fontes. |
| `tests/` | Testes de lógica, persistência, rotas e interface em jsdom. |
| `server/` | API Express, migração PostgreSQL e suíte de integração HTTP. |

As telas principais compartilham os dados de tarefas por meio do `TaskProvider` e persistem no navegador. Para trabalhar na prévia ou nos endpoints, configure o PostgreSQL conforme o [guia da API local](api-local.md).

## Branches e pull requests

Use `dev` para integrar mudanças e `main` para a versão principal. Crie uma branch para cada alteração a partir da `dev` atualizada:

```bash
git switch dev
git pull --ff-only
git switch -c feat/nome-da-mudanca
```

Prefixos sugeridos: `feat/` para funcionalidades, `fix/` para correções, `refactor/` para reorganização do código e `docs/` para documentação.

Antes de enviar alterações de código, execute:

```bash
npm run lint
npm test
npm run build
```

Para alterações na API, execute também `npm --prefix server test` com o PostgreSQL local configurado. Confira as interações afetadas no navegador, incluindo telas pequenas.

O roteiro opcional em Chromium inclui uma auditoria com axe. Os alertas conhecidos incluem contraste, estrutura de listas e controles interativos aninhados em Minhas Tarefas, além de divergência entre rótulo visível e nome acessível no Início em tela pequena. [Cenários e resultados da revisão de acessibilidade](relatorio-final.md#evidências-e-reprodução)

Faça o commit e o primeiro envio da branch:

```bash
git add .
git commit -m "feat: descreve a alteração"
git push -u origin feat/nome-da-mudanca
```

No GitHub, abra um pull request com **base `dev`** e **compare a branch da alteração**. Revise os arquivos antes do merge. Depois:

```bash
git switch dev
git pull --ff-only
```

A integração de `dev` em `main` deve ocorrer em outro pull request, após a validação das mudanças. Enviar uma branch com `git push` não faz merge automaticamente.
