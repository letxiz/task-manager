# Persistência de tarefas e tópicos

O documento `task-manager:dados` no localStorage tem o formato
`{ "versao": 1, "tarefas": [...], "topicos": [...] }`.
Cada gravação substitui o documento completo. Exclusão de tópico, limpeza geral
e conversão de “Sem tópico” salvam as duas coleções em uma única chamada.

## Migração e compatibilidade

Na ausência do documento, o aplicativo lê `minhas-tarefas` e `meus-topicos`.
A primeira alteração salva cria o documento novo. Carregar a página não grava dados.
As duas chaves antigas não são alteradas nem removidas, mesmo após a migração.
Elas representam uma cópia anterior à migração, não um backup atualizado.
Um documento novo vazio tem precedência sobre o legado para não restaurar itens
que o usuário já excluiu.

## Falhas e recuperação

Se a gravação falhar, o último documento completo permanece armazenado.
As alterações continuam em memória, o retorno da ação é `false` e o aviso permanece
visível. A próxima gravação bem-sucedida salva as duas listas atuais e limpa o aviso.

Se a leitura falhar, houver dados inválidos ou uma versão desconhecida, as gravações
ficam bloqueadas nessa sessão. As coleções legíveis podem ser exibidas, mas os dados
originais não são substituídos. Recarregar só deve acontecer após recuperar os dados;
alterações mantidas apenas em memória serão perdidas ao sair.

Para recuperação assistida, exporte primeiro os valores brutos de `task-manager:dados`,
`minhas-tarefas` e `meus-topicos` pelas ferramentas do navegador, guardando uma cópia
fora do localStorage. Corrija uma cópia do documento e valide seu conteúdo antes de
restaurá-lo. Se for necessário recorrer ao legado, compare as duas coleções antigas
com o documento atual: elas podem não conter alterações posteriores à migração.
Nunca remova o documento atual para forçar a leitura do legado sem antes exportá-lo.
O aplicativo não executa restauração, limpeza ou correção automática desses dados.

A persistência continua local ao navegador. Sincronização e resolução de conflitos
entre abas não fazem parte desta alteração.

## Validação e recuperação parcial (Etapa 7)

O schema continua na versão 1; não houve mudança de formato. Documentos de versão
futura ou sem versão reconhecida não são interpretados nem substituídos.

Cada coleção é validada de forma independente. Registros inválidos não impedem a
leitura dos demais. A primeira ocorrência válida de cada ID é mantida, na ordem
original; as demais continuam preservadas no conteúdo bruto do armazenamento.
IDs precisam ser strings não vazias, sem espaços nem caracteres de controle.
Formatos antigos não UUID e Unicode continuam aceitos. Os IDs não são aparados,
renomeados ou gerados durante o carregamento, para não alterar os vínculos.

Tarefas precisam de ID, título não vazio e conclusão booleana; tópicos precisam de
ID e nome não vazio. Registros com campos obrigatórios inválidos não entram na
visualização. Campos opcionais ausentes continuam aceitos. Descrição, prazo e vínculo
com tipo/conteúdo inválido recebem string vazia apenas em memória; cores com tipo
inválido usam o padrão visual. Campos extras são preservados. Vínculos válidos com
tópicos ausentes permanecem intactos, e a tarefa aparece em Sem tópico.

Qualquer omissão, duplicidade ou ajuste gera aviso identificando a coleção afetada
e bloqueia as gravações durante a sessão. Isso impede que uma recuperação parcial
apague registros não exibidos. O aplicativo não escolhe entre cópias duplicadas para
uma recuperação definitiva: o usuário pode comparar os registros brutos exportados
antes de decidir como corrigir os dados. Um JSON sintaticamente corrompido não é
parcialmente interpretado; seu conteúdo original permanece disponível para análise.
