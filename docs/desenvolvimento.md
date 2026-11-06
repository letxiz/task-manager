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
| `tests/` | Testes do resumo, paginação de tarefas e armazenamento de água. |

Os dados de tarefas são compartilhados pelo `TaskProvider`. A persistência usa o armazenamento local do navegador; não é necessário configurar um backend ou credenciais para executar o projeto.

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

Confira também as interações afetadas no navegador, incluindo telas pequenas. Os testes existentes cobrem apenas parte da aplicação.

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
