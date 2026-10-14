# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegada pelo usuário para executar o plano aprovado: PWA responsiva com React + TypeScript + Vite, Supabase Postgres/Auth como backend, e Vercel como hospedagem do frontend. App público requer login; sem administração no produto.

## Users

Pessoas que estudam para o Enem 2026 e querem acompanhar o cronograma e o que concluíram. Cada pessoa usa sua própria conta e vê apenas seus registros.

## Product Purpose

Transformar o cronograma Operação ENEM 2026 em uma visão diária prática e em uma biblioteca de aulas e materiais. Sucesso significa encontrar a tarefa do dia, abrir o recurso necessário e registrar no próprio perfil o progresso que realizou.

## Positioning

Um cronograma do Enem organizado por data, com botões que abrem os recursos corretos e progresso individual sincronizado no Supabase — sem virar um organizador de rotina e sem inferir notas.

## Operating Context

- Cobertura do cronograma: 13/10/2026 a 15/11/2026, com provas em 08/11 e 15/11.
- Datas no fuso `America/Cuiaba`, mostradas em `dd/mm/aaaa`.
- Uso principalmente no celular, com versão desktop responsiva.
- Recursos externos são abertos por botões (por exemplo, Hospital Questiona e YouTube); não exibir URLs como texto.
- A pessoa retorna ao app depois de estudar para marcar aulas/tarefas e informar questões ou erros.

## Capabilities and Constraints

- Tela Hoje, Cronograma, Aulas, Redação e Materiais, com navegação inferior em mobile e barra lateral em desktop.
- Biblioteca com 32 aulas Assaad (28 programadas e quatro extras) e dez vídeos de Redação.
- Cadastro/login, confirmação de email, recuperação de senha e saída usando Supabase Auth.
- O Supabase é a única persistência de conteúdo e progresso: cronograma, materiais, conclusão de aulas/tarefas, questões, redações e erros.
- Persistir somente a sessão Auth no navegador, por escolha expressa do usuário. Não usar IndexedDB/localStorage para conteúdo ou progresso e não criar exportação de backup local.
- Conteúdo/progresso exigem rede. Offline, explicar que não é possível carregar/gravar dados; não enfileirar mudanças localmente.
- Não armazenar credenciais do Hospital Questiona. Não armazenar senha do app nas tabelas próprias.
- RLS deve garantir isolamento por `auth.uid()` em todas as tabelas pessoais. Nunca confiar apenas em filtros do frontend.
- Fontes de verdade são PDF, planilha e links enviados. Preservar valores pendentes; não inventar títulos, duração, horários ou estatísticas.
- Sem agenda de trabalho/curso/refeições, sem login social, sem avaliação automática da redação e sem promessa de aprovação.

## Brand Commitments

Nome Operação ENEM 2026. Visual preto e branco minimalista, banner preto abstrato na tela Hoje e superfícies/cartões bem arredondados. Voz curta, calma, prática e sem promessas.

## Evidence on Hand

- `/home/ubuntu/upload/Operacao_ENEM_2026.pdf`
- `/home/ubuntu/upload/Serie-Super-Aulas-Assaad.xlsx`
- `/home/ubuntu/upload/Prompt_APP_Operacao_ENEM_2026.md`
- Dez links de YouTube para redação enviados pelo usuário na conversa.
- Nenhum depoimento, estatística de aprovação, login do Hospital Questiona ou credencial externa foi fornecido; não criar esses itens.

## Product Principles

1. Mostrar a próxima ação sem inventar rotina horária.
2. Preservar datas e tarefas das fontes enviadas; pendências continuam explicitamente pendentes.
3. Acompanhar o progresso por conta e mantê-lo no Supabase, sem persistência local de dados do aluno.
4. Abrir recursos externos por ações claras e manter a interface simples e acessível.

## Accessibility & Inclusion

Mobile-first, alvos de toque mínimos de 44 × 44 px, navegação por teclado e foco visível, contraste WCAG AA, rótulos explícitos em formulários e botões, texto em português brasileiro, e respeito a `prefers-reduced-motion`.
