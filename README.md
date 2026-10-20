# Task Manager

Aplicação de gerenciamento de tarefas desenvolvida como projeto de estudo de React. A proposta é oferecer um espaço simples para organizar as atividades do dia a dia, com uma página inicial, cadastro de novas tarefas e uma tela para visualizar e acompanhar as tarefas cadastradas.

O projeto utiliza uma barra lateral para navegar entre as telas e tem como objetivo praticar a criação de componentes reutilizáveis, a navegação com React Router e a estilização com Tailwind CSS.

## Status do projeto

Em desenvolvimento. A estrutura de navegação, a sidebar recolhível e as páginas de início e de tarefas já estão implementadas. A página de tarefas ainda exibe uma mensagem de espera; o cadastro e o gerenciamento das tarefas serão desenvolvidos nas próximas etapas.

## Funcionalidades planejadas

- Cadastrar novas tarefas.
- Visualizar as tarefas cadastradas.
- Marcar tarefas como concluídas.
- Excluir tarefas.

## Tecnologias

- React — construção da interface com componentes.
- Vite — ambiente de desenvolvimento e geração do build.
- React Router — navegação entre as páginas.
- Tailwind CSS — estilização da interface.
- Lucide React — ícones.

## Como executar

Com Node.js e npm instalados, execute na pasta do projeto:

```bash
npm install
npm run dev
```

Abra no navegador o endereço informado pelo Vite no terminal.

### Testar em um celular na rede local

Conecte o computador e o celular à mesma rede Wi-Fi. Inicie o servidor com:

```bash
npm run dev
```

No Windows, execute `ipconfig` no PowerShell e encontre o endereço IPv4 da conexão Wi-Fi (por exemplo, `192.168.1.15`). No celular, abra `http://192.168.1.15:5173`, substituindo o IP pelo endereço do computador. Se o Firewall do Windows perguntar, permita o acesso em redes privadas.

## Referência de design

A interface deste projeto tem como referência o [Task Manager no Figma](https://www.figma.com/design/A5w7qejEx7p0jDkMsNIEg3/Task-Manager?node-id=0-1).
