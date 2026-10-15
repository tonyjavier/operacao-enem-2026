# TODO — Operação ENEM 2026

## Banco Supabase: conteúdo versionado, progresso e isolamento RLS

- [x] Criar migration SQL versionada no projeto `operacao-enem-2026` para `plan_versions`, `schedule_days`, `day_tasks`, `lessons`, `essay_videos` e `resources`; incluir versão do cronograma, datas, objetivos, foco, tipo de dia, tarefas ordenadas, links, títulos, durações, prioridades, estado de disponibilidade e origem. Seed com os 24 dias do cronograma diário, os 10 dias de reta final (06/11–15/11), as 28 aulas do JSON, as quatro aulas adicionais da planilha, os 10 vídeos de Redação, os oito materiais e as três referências. Links e metadados devem vir dos anexos e links enviados. Aula privada/título/duração pendentes continuam identificados como pendentes; materiais sem URL continuam sem botão de abrir.
- [x] Criar as tabelas pessoais `profiles`, `user_lesson_progress`, `user_essay_video_progress`, `user_task_progress`, `user_question_sessions`, `user_error_notes` e `user_essay_entries`, ligadas a `auth.users`, com checks de domínio/contagem, chaves estrangeiras e índices.
- [x] Ativar RLS. Cronograma e materiais: leitura somente autenticada. Tabelas pessoais: `SELECT`, `INSERT`, `UPDATE` e `DELETE` permitidos apenas quando `auth.uid() = user_id`, com validação também em `WITH CHECK`; `anon` não pode consultar nem gravar. Nunca aceitar a identidade do proprietário vinda do formulário/cliente.
- [x] Usar `operation_id` UUID único por conta para impedir duplicação de sessões de questões se uma requisição for repetida. Tarefas e progresso de vídeo devem ser únicos por usuário e item. Criar ou atualizar perfil sem guardar senha.
- [x] Gerar tipos TypeScript e auditar segurança/performance do schema; verificar contagens do seed via consultas de leitura limitadas.

## Autenticação e privacidade cloud-only

- [x] Implementar cadastro email/senha, confirmação de email, login, recuperação/troca de senha, restauração de sessão e sair usando Supabase Auth.
- [x] Proteger as rotas pessoais: sem sessão, encaminhar para Entrar; após autenticar, carregar conteúdo e progresso diretamente do Supabase.
- [x] Não armazenar conteúdo, cronograma, progresso, erros, redações, contagens, filas ou backups no dispositivo; a única persistência local autorizada é a sessão gerida pelo Supabase Auth. Em offline, avisar e impedir gravação, sem fila local.
- [x] Usar somente URL e publishable key no bundle cliente. Nenhuma service role/secret key deve chegar ao browser ou ao repositório. O app nunca guarda a senha do Hospital Questiona.

## Hoje: próxima ação do cronograma

- [x] Detectar a data no fuso `America/Cuiaba`; exibir datas `dd/mm/aaaa`, dia da semana, foco e contagem para as provas de 08/11 e 15/11. Se a data estiver fora da faixa, mostrar a data programada mais próxima e explicação clara.
- [x] Mostrar tarefas do dia em sequência prática, sem agenda pessoal de trabalho/curso/almoço/noite. Quando houver questões previstas, a primeira ação principal é o botão **Fazer questões**, que abre o Hospital Questiona sem revelar a URL.
- [x] Mostrar aula Assaad/vídeo de Redação previsto e seu microtreino com botões **Assistir aula**/**Assistir vídeo**, abrindo YouTube externamente. Não incorporar player nem expor endereços.
- [x] Manter **Fazer questões** como atalho e permitir marcar a tarefa como concluída; retirar da tela Hoje o formulário de contagem/registro de questões, conforme pedido de simplificação. Erros continuam registráveis no caderno de erros. Não apagar linhas antigas de `user_question_sessions`.
- [x] Tratar dias de revisão e prova com cartões e conteúdo próprios, sem sugerir aulas longas em 06/11–08/11 e sem alterar as instruções do PDF.

## Cronograma: calendário e detalhe de data

- [x] Exibir os 24 dias de 13/10 a 05/11 e os 10 dias da reta final de 06/11 a 15/11, com tipos/revisões/provas, foco, objetivo e tarefas consultados do Supabase.
- [x] Permitir trocar de data, abrir detalhe, identificar tarefas concluídas por conta e navegar para o item de aula/material correspondente. Mostrar intervalo entre provas de 09/11 a 14/11 e as duas datas de prova.
- [x] Separar valores confirmados/estimados/pendentes e preservar metas/faixas como faixas do documento, sem convertê-las em estatísticas de realização.

## Biblioteca de aulas e vídeos de Redação

- [x] Mostrar as 32 aulas Assaad da planilha; distinguir as 28 programadas e as quatro extras. Manter número, título, disciplina, prioridade, duração, data prevista, disponibilidade e link direto quando fornecidos.
- [x] Aula 24 com estado de vídeo indisponível e título/duração pendentes (não preencher com dado inventado). Outras aulas indisponíveis também devem explicar por que não podem ser abertas.
- [x] Busca e filtros por origem, disciplina e situação. Botões de vídeo abrem o URL no YouTube sem exibir o link. Após voltar, permitir marcar em andamento/concluída, registrar tempo/ponto retomável manual e anotação no Supabase.
- [x] Mostrar os 10 vídeos de Redação em ordem, usando as URLs exatas fornecidas pelo usuário, com título, duração, data e tarefa prática do JSON. Sem pontuação automática.

## Redação, materiais, caderno de erros e conta

- [x] Aba Redação com trilha dos 10 vídeos e tarefas, microtreinos recolhidos até serem solicitados, meta informativa de cinco redações completas até 07/11 e cronômetro independente de 80–90 min. Conforme pedido de simplificação, não exibir contador, ficha ou lista de produções; manter sem alterações os registros antigos em `user_essay_entries`.
- [x] Materiais e referências como cartões com botão verbal para abrir. Hospital Questiona apenas abre o destino; Super Aulas/Redação na Prática, Padrões de Matemática, Palavras-chave, Humanas e complementar conforme as regras da fonte. Aula de Humanas e vídeo complementar continuam PENDENTES onde aplicável. PreparaENEM fica identificado como material para uso na escola, sem link.
- [x] Caderno de erros com disciplina, assunto, texto/foto opcional, tipo, correção em uma frase, data sugerida de revisão conforme a regra da fonte, e marcação de revisão salva no Supabase.
- [x] Progresso pessoal: cada estudante vê o status das próprias tarefas, aulas, vídeos e erros; a conta é identificada no menu e pode encerrar a sessão. Produções antigas não são exibidas pela interface. Não oferecer exportação/backup local de dados.

## UI responsiva, PWA e entrega

- [x] Design preto e branco minimalista, banner preto abstrato na tela Hoje, cartões arredondados de 20–24 px, superfícies brancas, sombras discretas, tipografia legível e ícones SVG de linha. Sem fotos genéricas, URLs à mostra, ícones emoji ou rotinas pessoais.
- [x] Mobile: cinco destinos na navegação inferior. Desktop: barra lateral com os mesmos destinos e animação discreta de entrada/abertura; movimento reduzido é respeitado. Manter formulários restantes, botões, estados loading/vazio/erro/offline, contraste WCAG AA, foco visível e alvos ≥44 px.
- [x] PWA instalável com manifest e ícones; botão **Instalar app** aparece no login e na sidebar. Usa o prompt nativo quando disponível e instruções de “Adicionar à Tela de Início” no iPhone. Service worker pode armazenar somente assets estáticos; deve excluir Auth, API, conteúdo do cronograma e progresso pessoal.
- [x] A tela Hoje rejeita datas ISO impossíveis com fallback seguro e não mistura respostas de carregamentos de datas diferentes; só publica o conjunto de dados da data ainda selecionada.
- [x] Ponto de retomada e tempo assistido são validados no cliente e no banco contra duração conhecida; status de conclusão e timestamp precisam concordar.
- [x] Caderno de erros ordena por data de revisão, sugere amanhã e recalcula a sugestão ao salvar; uploads só são removidos depois de confirmar que nenhuma nota os referencia; rótulo informa o limite real de 10 MB.
- [x] Tarefas não podem apontar para recurso/aula/vídeo de outra versão do cronograma. O gerador de seeds escreve em `supabase/generated/`, não reescreve nem apaga migrations históricas e liga recursos à mesma versão.
- [x] Testes Node nativos e smoke check do manifest, ícones, fallback Netlify e service worker rodam no build sem dependências extras; removida importação duplicada da fonte e a configuração de hospedagem legada da Vercel.
- [x] Executar build e verificações estáticas; validar layout em 375 px, tablet e desktop; corrigir defeitos encontrados.
- [x] Publicar em Production na Netlify, conectada ao repositório GitHub `tonyjavier/operacao-enem-2026`; `main` publica automaticamente com `pnpm run build` e `dist`, fallback SPA e variáveis públicas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
- [x] Configurar Supabase Auth com Site URL `https://operacao-enem-2026.netlify.app` e redirects exatos `https://operacao-enem-2026.netlify.app/` e `https://operacao-enem-2026.netlify.app/reset-password`, preservando segurança sem wildcards.
- [ ] Habilitar SMTP próprio para permitir cadastro/recuperação de usuários fora da equipe Supabase; o SMTP padrão só envia a endereços autorizados da equipe. Após configurar email, testar confirmação, login, redefinição de senha e isolamento RLS com duas contas. Não armazenar credenciais SMTP no repositório.
