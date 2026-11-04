# Task Manager

Aplicação web para organizar tarefas por tópicos. O projeto está em desenvolvimento e foi criado com React e Vite.

## Funcionalidades

- Criar e editar tarefas com título, descrição e data.
- Marcar tarefas como concluídas e excluí-las.
- Criar, editar e excluir tópicos, com cores personalizáveis.
- Organizar tarefas por tópico e reordená-las por arrastar e soltar.
- Salvar tarefas e tópicos no armazenamento local do navegador (`localStorage`).
- Usar a navegação responsiva, com menu lateral adaptado para dispositivos móveis.
- Receber confirmações e avisos sobre as ações realizadas.

A página **Início** mostra o resumo das tarefas, uma prévia com até cinco itens e o acompanhamento diário de água. Os dados das tarefas são compartilhados entre as páginas. O consumo de água reinicia a cada dia, com meta ajustável e opção de desfazer o último registro.

As informações ficam salvas neste navegador. Não há API ou sincronização entre dispositivos.

## Organização das branches

O desenvolvimento está organizado em três branches locais, com responsabilidades previstas para cada etapa:

| Branch | Objetivo |
| --- | --- |
| `feat/layout` | Construir a estrutura visual, a sidebar, a navegação e a adaptação para dispositivos móveis, com Tailwind CSS e ícones do Lucide. |
| `feat/inicio` | Desenvolver a página inicial, com resumo das tarefas e atalhos para as principais ações. |
| `feat/nova-tarefa` | Implementar o formulário de cadastro, a validação dos campos e o armazenamento das novas tarefas. |

Uma mesma branch pode incluir componentes, estilos e configurações necessários àquela etapa. A tabela descreve a divisão do trabalho, não o status de conclusão das funcionalidades.

## Tecnologias

- React 19 e React Router — interface e navegação.
- Vite — servidor de desenvolvimento e build.
- Tailwind CSS — estilos.
- dnd-kit — interações de arrastar e soltar.
- Lucide React — ícones.
- Poppins — tipografia.

## Requisitos

- Node.js compatível com a versão do Vite usada no projeto.
- npm.

## Como executar

Na pasta do projeto, instale as dependências e inicie o servidor:

```bash
npm install
npm run dev
```

Abra no navegador o endereço exibido no terminal.

### Acessar em outro dispositivo da rede local

Inicie o servidor aceitando conexões da rede:

```bash
npm run dev -- --host 0.0.0.0
```

Descubra o endereço IP local do computador, conecte o outro dispositivo à mesma rede e acesse `http://IP-DO-COMPUTADOR:5173` (por exemplo, `http://192.168.1.15:5173`). Talvez seja necessário permitir a conexão na configuração do firewall.

## Verificações

```bash
npm run lint
npm run build
```

## Referência de design

A interface tem como referência o [Task Manager no Figma](https://www.figma.com/design/A5w7qejEx7p0jDkMsNIEg3/Task-Manager?node-id=0-1).

## Autoria

Projeto desenvolvido em parceria por [letxiz](https://github.com/letxiz) e [zeni-node](https://github.com/zeni-node).

## Verificações

```bash
npm run lint
npm test
npm run build
```

Os testes verificam o resumo das tarefas e o armazenamento diário de água.
