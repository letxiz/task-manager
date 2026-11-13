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
