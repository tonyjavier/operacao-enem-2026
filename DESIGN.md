# Design System — Operação ENEM 2026

## Direção

**Minimalismo suíço/editorial em modo Operar.** A experiência deve parecer uma página de estudo bem editada: foco tipográfico, respiro, preto e branco, ações diretas. Nada de fotos genéricas, gamificação colorida, gráficos sem dados ou estética de painel corporativo.

## Tokens

- `--ink: #111111`
- `--ink-soft: #292929`
- `--paper: #FFFFFF`
- `--canvas: #F5F5F5`
- `--surface-muted: #EBEBEB`
- `--text-secondary: #666666`
- `--border: #D9D9D9`
- `--danger: #B42318` (somente erros/ações destrutivas)
- `--radius-card: 24px`
- `--radius-control: 16px`
- `--radius-pill: 999px`

Usar Inter se disponível; caso contrário, fonte de sistema sans-serif. Texto de corpo a partir de 16 px; metadados nunca abaixo de 12 px.

## Composição

- Banner da tela Hoje: preto, arredondado, texto branco, padrão geométrico monocromático feito em CSS/SVG original; data/foco em primeiro plano.
- Cartões brancos em fundo quase branco, raio 20–24 px, borda fina e sombra muito sutil.
- Mobile: navegação inferior fixa com cinco destinos, respeitando safe areas. Desktop: barra lateral esquerda persistente, mesma hierarquia e rótulos.
- Conteúdo limitado a largura de leitura; colunas adaptativas sem overflow horizontal.
- Marca: wordmark “OPERAÇÃO ENEM” e “2026”; símbolo simples de dois traços verticais e um ponto.

## Componentes e estados

- Botão primário preto com texto branco; secundário branco com borda escura.
- Botões que abrem links usam verbos: “Fazer questões”, “Assistir aula”, “Abrir material”; endereço fica oculto.
- Estados confirmados, estimados e pendentes usam texto/ícone/formato além de cor.
- Formulários com labels visíveis, erros junto aos campos e loading sem duplo envio.
- Offline, erro de rede, lista vazia e falha do Supabase devem ter mensagens explícitas; nunca mostrar progresso fictício.

## Movimento e acessibilidade

Transições pontuais de 150–220 ms para seleção e confirmação; sem parallax ou animação contínua. Respeitar `prefers-reduced-motion`. Foco de teclado visível, contraste de texto ≥ 4.5:1 e alvos de toque ≥ 44 px.
