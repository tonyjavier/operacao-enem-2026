# Sistema visual — Operação ENEM 2026

Fonte de verdade: `../../DESIGN.md`. As sugestões automáticas de paleta foram descartadas por conflito com o pedido explícito do usuário.

## Direção aprovada

Aplicativo em modo **Operar**: minimalismo suíço/editorial monocromático, mobile-first, conteúdo prático e legível. Preto e branco como identidade, banner abstrato escuro na tela Hoje e cartões bastante arredondados. Não usar rosa, índigo, dourado, fotografias genéricas, gráficos ilustrativos ou cores por disciplina.

## Tokens

| Token | Valor |
|---|---|
| Tinta principal | `#111111` |
| Tinta secundária | `#292929` |
| Papel | `#FFFFFF` |
| Fundo | `#F5F5F5` |
| Superfície secundária | `#EBEBEB` |
| Texto secundário | `#666666` |
| Borda | `#D9D9D9` |
| Erro/ação destrutiva | `#B42318` |
| Cartão | `24px` |
| Controle | `16px` |
| Pílula | `999px` |

Inter variável local; fonte base 16px. Corpo com altura de linha confortável. Banner preto com geometria monocromática própria em CSS/SVG; nada de imagem de banco.

## Estrutura e interação

- Cinco destinos: Hoje, Cronograma, Aulas, Redação, Materiais.
- Celular: barra inferior; desktop: barra lateral persistente.
- Botões de links externos descrevem a ação e nunca imprimem o URL.
- Estados são identificados por texto e ícone, não somente por cor.
- Foco de teclado visível, contraste WCAG AA, alvos de pelo menos 44px e `prefers-reduced-motion` respeitado.
- Cache PWA só de assets estáticos; nunca cachear respostas do Supabase/Auth ou dados de estudante.
