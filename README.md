# Operação ENEM 2026

PWA responsiva para consultar o cronograma do Enem 2026, abrir aulas e materiais por botões e acompanhar o progresso da conta do estudante.

## Estado do projeto

- Interface React + TypeScript + Vite; PWA instalável para celular e desktop.
- Backend no projeto Supabase **`operacao-enem-2026`**; conteúdo inicial importado e progresso isolado por RLS.
- **Sem persistência local de dados de estudo**. O navegador mantém somente a sessão gerenciada pelo Supabase Auth; o service worker pré-armazena apenas arquivos estáticos. A gravação exige conexão.
- O app está disponível em preview do Sandbox. **Ainda não foi publicado em produção nem vinculado a um repositório Vercel.**

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

Para executar Supabase Auth em outro domínio, ajuste no Dashboard do **projeto novo**: Auth → URL Configuration. Defina o Site URL da instalação e inclua os domínios de preview/desenvolvimento e a rota `/reset-password` na lista de Redirect URLs. Configure e teste o email de confirmação/recuperação antes de convidar estudantes.

## Deploy de preview na Vercel

Configuração de build preparada: framework Vite, comando `pnpm build`, saída `dist`; o `vercel.json` fornece fallback SPA. No momento não há projeto Vercel para este app nem repositório conectado. Para criar a Preview, vincule um repositório Git privado ao projeto Vercel (via integração Git autorizada) e configure as duas variáveis públicas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no ambiente Preview. Atualize então os Redirect URLs do Supabase para o hostname gerado. Produção permanece pendente de revisão do usuário.

## Decisões de UX

Mobile: cinco destinos na navegação inferior. Desktop: barra lateral com os mesmos destinos. A tela Hoje prioriza “Fazer questões” quando a tarefa existir; botões externos abrem o destino e não imprimem a URL. Aula/vídeo indisponível fica indicado como pendente, sem substituição inventada. As contagens, notas e conclusões exibidas vêm do banco ou de informação digitada pelo estudante.
