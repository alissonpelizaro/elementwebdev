# elementwebdev.com.br

Site institucional da **Element Web Development LTDA** — software house de aplicativos mobile e desktop.

Slogan: **Do elemento ao produto.**

Estático, sem build step, sem dependências. Publicado via GitHub Pages.

## Estrutura

```
index.html                 página única (PT-BR com toggle EN)
assets/css/style.css       estilos + animações
assets/js/main.js          partículas, tilt 3D, scroll effects, i18n
assets/img/                screenshots dos cases + og image
assets/favicon.svg         ícone (tile "El")
CNAME                      elementwebdev.com.br
.nojekyll                  desliga o processamento Jekyll do Pages
robots.txt · sitemap.xml   SEO
```

## Rodar localmente

Qualquer servidor estático:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

Abrir o `index.html` direto via `file://` também funciona.

## Recursos técnicos

- Campo de partículas em canvas com repulsão pelo cursor, densidade adaptada à viewport, pausa fora da tela
- Cursor customizado com interpolação, botões magnéticos, tilt 3D nos cards
- Cases empilhados com `position: sticky` + escala progressiva em todos os cartões
- Seção de processo com scroll horizontal fixado (pinned): altura do pin calculada a partir do percurso real, cada etapa reage à distância do centro da tela, numeral gigante e contador acompanham o scroll; fallback de swipe no mobile
- Cursor nativo escondido (classe aplicada por JS, então falha de JS devolve o ponteiro) e seleção de texto/imagem desativada fora dos campos de formulário
- Um único loop `requestAnimationFrame` para tudo; só `transform` e `opacity` são animados
- `prefers-reduced-motion` desliga cursor, grão, partículas, pin e reveals
- Sem framework, sem bundler, sem requisição externa além do Google Fonts
