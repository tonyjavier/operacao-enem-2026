# Operação ENEM 2026

PWA responsiva para consultar o cronograma do Enem 2026, abrir aulas e materiais por botões e acompanhar o progresso da conta do estudante.

## Estado do projeto

- Interface React + TypeScript + Vite; PWA instalável em celular e desktop, com botão **Instalar app** no login e na sidebar. Não é um APK nem um app de loja.
- Backend no projeto Supabase **`operacao-enem-2026`**; conteúdo inicial importado e progresso isolado por RLS.
- **Sem persistência local de dados de estudo**. O navegador mantém somente a sessão gerenciada pelo Supabase Auth; o service worker pré-armazena apenas arquivos estáticos. A gravação exige conexão.
- Publicado em produção na Netlify em [operacao-enem-2026.netlify.app](https://operacao-enem-2026.netlify.app), conectado ao repositório público [tonyjavier/operacao-enem-2026](https://github.com/tonyjavier/operacao-enem-2026); a branch `main` publica automaticamente.

## Executar localmente

1. Use Node.js 22 e pnpm.
2. Copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` com os valores públicos do projeto aprovado. Nunca use `service_role` no frontend.
3. Instale dependências com `pnpm install --frozen-lockfile`.
4. Execute `pnpm dev` (porta 5173).
5. Valide com `pnpm check` e gere a PWA com `pnpm build`; `pnpm preview` serve a pasta `dist` na porta 4173.

Não comite `.env.local`. As variáveis `VITE_*` entram no bundle e devem ser somente credenciais públicas; o isolamento é feito por RLS.

## Supabase e conteúdo

As migrations em `supabase/migrations/` definem tabelas de conteúdo, contas/progresso, políticas RLS, índices, bucket privado para fotos do caderno de erros e a carga de conteúdo do cronograma. Incluem 32 aulas (28 do cronograma e quatro adicionais), 10 vídeos de Redação, 34 dias, 144 tarefas e 11 recursos (materiais e referências). Consulte o SQL versionado antes de reaplicá-lo a outro projeto.

A identidade proprietária é obtida por `auth.uid()`; não aceite `user_id` de formulários como fonte de autoridade. Não desative RLS. O bucket `error-attachments` é privado e aceita JPEG, PNG e WebP até 10 MB.

No projeto Supabase de produção, o Site URL está definido como `https://operacao-enem-2026.netlify.app` e a allowlist contém somente `https://operacao-enem-2026.netlify.app/` e `https://operacao-enem-2026.netlify.app/reset-password`.

O SMTP personalizado está desativado. O SMTP padrão do Supabase só envia para endereços autorizados da equipe do projeto; para permitir cadastro de outros endereços, será necessário escolher e configurar um provedor SMTP próprio. Até isso ser feito, o fluxo completo de confirmação/recuperação e o teste com duas contas não estão validados.

## Deploy de produção na Netlify

O site está conectado ao repositório GitHub acima. A branch `main` é publicada automaticamente; comando de build `pnpm run build`, diretório publicado `dist` e fallback SPA em `public/_redirects`. As variáveis públicas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` estão configuradas no ambiente Netlify; nunca adicione `service_role` ao frontend. A publicação Production atual está pronta no endereço acima.

## Decisões de UX

Mobile: cinco destinos na navegação inferior. Desktop: barra lateral com os mesmos destinos e animação discreta que respeita movimento reduzido. A tela Hoje mantém **Fazer questões** como atalho e permite concluir a tarefa, mas não oferece formulário para contar questões novas/refeitas. Redação mantém os 10 vídeos, microtreinos recolhidos, meta informativa de cinco textos até 07/11 e cronômetro independente; não oferece ficha, contador ou lista de produções. Registros antigos no banco não são apagados.

O botão **Instalar app** usa a opção nativa do navegador quando disponível. No iPhone/iPad, mostra como adicionar à Tela de Início; no Android/desktop, mostra o caminho pelo menu do navegador. Botões externos não imprimem URLs; tarefas, aulas, vídeos, progresso e erros vêm do Supabase, sem dados fictícios.
