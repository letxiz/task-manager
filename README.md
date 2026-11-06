# Task Manager

Aplicação web para organizar tarefas por tópicos e acompanhar o consumo diário de água. Desenvolvida com React e Vite, com interface responsiva e dados salvos no navegador.

## Funcionalidades

### Início

- Resumo das tarefas e das conclusões.
- Prévia de até cinco tarefas, com detalhes e controle de conclusão.
- Controle diário de água, com meta ajustável e opção de desfazer o último registro.

### Minhas Tarefas

- Criar e editar tarefas com título, descrição, prazo e tópico.
- Concluir, reabrir e excluir tarefas.
- Criar tópicos pelo botão **Novo tópico**, ao lado de **Nova tarefa** no topo da página.
- Editar e excluir tópicos, com seleção de cor no formulário.
- Buscar por título ou descrição e filtrar por todas, pendentes ou concluídas.
- Recolher e expandir grupos de tópicos.
- Reordenar tópicos e tarefas por arrastar e soltar.
- Consultar contadores e progresso de conclusão.
- Limpar tarefas e tópicos com confirmação.

### Navegação

- Menu lateral com páginas, tópicos e contadores de tarefas por tópico.
- Clique no ícone do Task Manager para expandir ou recolher a lateral no computador.
- No celular, abra a navegação pelo botão de menu e feche pelo ícone do Task Manager.
- Notificações das ações realizadas e dados de tarefas compartilhados entre as páginas.

## Armazenamento

Tarefas, tópicos e informações do controle de água ficam no `localStorage`. O consumo de água reinicia a cada dia. Não há API, login ou sincronização entre dispositivos. Limpar os dados do site no navegador remove as informações salvas.

## Tecnologias

React 19, React Router, Vite, Tailwind CSS, tailwind-variants, dnd-kit, Lucide React e Poppins. O projeto usa ESLint e o executor de testes do Node.js.

## Como executar

Use Node.js 24 e npm para reproduzir o ambiente validado no desenvolvimento.

```bash
git clone https://github.com/letxiz/task-manager.git
cd task-manager
npm install
npm run dev
```

Abra o endereço exibido pelo Vite no terminal.

Para acessar de outro dispositivo na mesma rede:

```bash
npm run dev -- --host 0.0.0.0
```

Use o endereço de rede exibido no terminal. Se necessário, permita a conexão no firewall.

## Comandos

| Comando | Função |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run lint` | Verifica o código com ESLint. |
| `npm test` | Executa os testes automatizados. |
| `npm run build` | Gera o build de produção em `dist/`. |
| `npm run preview` | Exibe uma prévia local do build gerado. |

Os testes atuais cobrem o resumo das tarefas e o armazenamento diário de água. Para conferir o build, execute `npm run build` e depois `npm run preview`.

## Documentação

- [Guia de uso](docs/uso.md)
- [Guia de desenvolvimento e branches](docs/desenvolvimento.md)

## Referência de design

Interface inspirada no [Task Manager no Figma](https://www.figma.com/design/A5w7qejEx7p0jDkMsNIEg3/Task-Manager?node-id=0-1), com adaptações de contraste, tipografia e organização das ações.

## Autoria

Projeto desenvolvido em parceria por [letxiz](https://github.com/letxiz) e [zeni-node](https://github.com/zeni-node).
