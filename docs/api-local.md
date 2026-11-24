# API local

## Iniciar a API

Com Node.js 24 e npm, instale as dependências na raiz do repositório e inicie a API em um terminal próprio.

```bash
npm --prefix server ci
npm --prefix server start
```

Em outro terminal, faça a verificação de saúde.

```bash
curl -i http://127.0.0.1:3000/api/health
```

A resposta esperada é HTTP 200 com o JSON `{"status":"ok"}`. Para usar as rotas de dados, configure o PostgreSQL e reinicie a API após definir `DATABASE_URL`.

## PostgreSQL local

Para criar o banco de desenvolvimento, execute os comandos abaixo uma vez com o Docker em execução e a porta 5432 livre. A senha é gerada no shell e gravada em `server/.env`. Se já tiver um PostgreSQL local, use o formato de [server/.env.example](../server/.env.example) para apontar `DATABASE_URL` para ele e siga para a migração.

```bash
export POSTGRES_PASSWORD="$(openssl rand -hex 24)"
docker run --detach --name task-manager-db \
  --publish 127.0.0.1:5432:5432 \
  --env POSTGRES_USER=task_manager \
  --env POSTGRES_DB=task_manager \
  --env POSTGRES_PASSWORD \
  --volume task-manager-pgdata:/var/lib/postgresql/data \
  postgres:17
(umask 077 && set -C && printf 'DATABASE_URL=postgresql://task_manager:%s@127.0.0.1:5432/task_manager\n' "$POSTGRES_PASSWORD" > server/.env)
unset POSTGRES_PASSWORD
```

Quando o banco aceitar conexões, instale as dependências e aplique a migração inicial uma vez em um banco vazio.

```bash
docker exec task-manager-db pg_isready -h 127.0.0.1 -U task_manager -d task_manager
npm --prefix server ci
npm --prefix server run db:migrate
```

Para retomar um contêiner parado, use `docker start task-manager-db`. O volume mantém os dados entre reinicializações. O endpoint de saúde continua verificando apenas se a API responde.

## Rotas de tarefas e tópicos

Com o banco migrado, inicie a API com `npm --prefix server start`. Ela escuta apenas em `127.0.0.1:3000`.

| Método | Rota | Operação |
| --- | --- | --- |
| GET | `/api/tarefas`, `/api/topicos` | Lista na ordem salva. |
| POST | `/api/tarefas`, `/api/topicos` | Cria um registro e retorna HTTP 201. |
| GET | `/api/tarefas/:id`, `/api/topicos/:id` | Consulta um registro. |
| PATCH | `/api/tarefas/:id`, `/api/topicos/:id` | Atualiza os campos enviados em JSON. |
| DELETE | `/api/tarefas/:id`, `/api/topicos/:id` | Exclui um registro e retorna HTTP 204. |
| PATCH | `/api/tarefas/ordem/manual`, `/api/topicos/ordem/manual` | Recebe `antes` e `ordem` com os IDs na ordem anterior e na nova ordem. Retorna HTTP 204. |
| POST | `/api/registros/limpeza` | Recebe `tarefasIds` e `topicosIds` e exclui as duas coleções numa transação. Retorna HTTP 204. |

Ao criar uma tarefa, envie `titulo`. Os campos opcionais são `descricao`, `data` no formato `YYYY-MM-DD`, `topicoId`, `concluida` e `cor` hexadecimal de seis dígitos. Envie `data: ""` para limpar o prazo, `topicoId: ""` para mover a tarefa para **Sem tópico**, ou `concluida: false` para reabri-la.

Ao criar um tópico, envie `nome` e, opcionalmente, `cor` (`blue`, `green`, `purple`, `amber`, `rose`, `cyan` ou `orange`). Envie `agruparSemTopico: true` na criação para mover todas as tarefas sem tópico para o novo grupo. Ao excluir um tópico, suas tarefas voltam para **Sem tópico**.

As respostas de erro da API trazem uma mensagem no campo `erro`. Os códigos mais comuns são HTTP 400 para entrada inválida, 404 para registro ausente, 409 para conflito e 503 quando `DATABASE_URL` está ausente.

## Prévia da API no frontend

Com a API local em execução, rode `VITE_API_PREVIEW=true npm run dev`. Abra o endereço indicado pelo Vite em `127.0.0.1` para consultar as tarefas e os tópicos do PostgreSQL na seção **Prévia da API local**. O armazenamento do navegador depende do endereço e da porta. Se você usava `localhost` ou um endereço de rede, volte ao modo normal e abra o endereço original para consultar os dados daquela origem.

Para testar gravações, aponte a API para um **banco descartável** com o esquema migrado e inicie o frontend com `VITE_API_PREVIEW=write npm run dev`. Na seção **Prévia da API local**, escolha **Tarefas** ou **Tópicos**. O formulário permite criar, selecionar para editar e excluir após confirmação. Em tarefas, você pode testar descrição, prazo, cor, tópico e conclusão. Em tópicos, você pode testar a paleta e o agrupamento de tarefas sem tópico. Recarregue a página para conferir os dados salvos. Se a API perder a conexão, o formulário mantém os valores digitados enquanto estiver aberto.

Os fluxos principais de edição continuam usando o armazenamento do navegador. Para desativar a prévia, reinicie o Vite com `npm run dev`.

No piloto, selecione um registro e use **Subir na ordem** ou **Descer na ordem**. As tarefas mudam de posição apenas dentro do próprio grupo. **Limpar tarefas e tópicos do servidor** pede confirmação e preserva os registros de água. Se a lista usada para reordenação ou o conjunto de IDs usado para limpeza mudou desde a consulta, a API responde com HTTP 409 para que você revise os registros antes de tentar novamente.

Antes de uma futura importação, exporte os valores brutos de `task-manager:dados`, `minhas-tarefas`, `meus-topicos` e `consumo-agua` a partir da origem que contém os dados. A importação deverá usar o documento atual quando presente, preservar IDs, posições e vínculos, e apresentar conflitos e registros inválidos para revisão. Os dados de origem devem continuar disponíveis após a importação. Para água, só é possível recuperar o dia ainda salvo no navegador.

## Testes e cobertura

Com as dependências do servidor instaladas e o PostgreSQL em execução:

```bash
npm --prefix server test
```

A conta indicada por `DATABASE_URL` precisa de permissão para criar esquemas no banco escolhido. A suíte aplica a migração em um esquema temporário exclusivo e o remove ao terminar. Para medir a cobertura com o runner do Node:

```bash
cd server
node --env-file-if-exists=.env --experimental-test-coverage --test --test-isolation=none api.test.js
```

A suíte HTTP cobre saúde, CRUD de tarefas e tópicos, IDs legados, validação, falhas do banco e conflitos, nomes duplicados em gravações concorrentes, reordenação, limpeza em transação e preservação do consumo de água. A suíte do frontend verifica a prévia com jsdom e respostas HTTP simuladas. O roteiro opcional em Chromium cobre os fluxos principais no build de produção. [Como reproduzir a revisão no navegador](relatorio-final.md#evidências-e-reprodução)

## Limitações conhecidas

- A API foi projetada para desenvolvimento local. Ela escuta em `127.0.0.1:3000` e usa um conjunto compartilhado de registros. Autenticação e isolamento por usuário ainda estão pendentes. Mantenha a API e o proxy do piloto no ambiente local.
- `GET /api/health` verifica o processo Express. Para confirmar o acesso às tabelas, consulte `GET /api/tarefas` com o banco configurado.
- Os dados da prévia e os dados das telas principais são independentes. A importação e a sincronização ainda estão pendentes. O esquema possui a tabela de consumo de água, enquanto o painel de água continua no navegador.
- O editor do piloto seleciona registros com IDs UUID. A API direta também consulta e modifica registros com IDs legados válidos.
- A reordenação e a limpeza detectam mudanças nas listas de IDs enviadas. Edições individuais usam o último valor gravado para cada campo. Se a conexão cair durante uma criação, confira a lista do servidor antes de reenviar para evitar duplicatas.
- A migração inicial é aplicada uma vez por esquema vazio. A suíte HTTP usa PostgreSQL real, enquanto o teste de interface usa jsdom. A combinação navegador real, proxy Vite e PostgreSQL fica fora dessas suítes automatizadas.
