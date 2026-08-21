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

## Publicar no GitHub Pages

1. **Settings → Pages → Build and deployment**: source `Deploy from a branch`, branch `main`, pasta `/ (root)`.
2. O arquivo `CNAME` já aponta para `elementwebdev.com.br` — o Pages lê ele automaticamente.
3. **Settings → Pages → Custom domain**: confirmar `elementwebdev.com.br` e marcar **Enforce HTTPS** depois que o certificado for emitido.

### DNS no registrador

Apex (`elementwebdev.com.br`) — registros `A`:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

E `AAAA` (opcional, IPv6):

```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

Subdomínio `www` — registro `CNAME` apontando para `<usuario>.github.io`.

A propagação leva de alguns minutos a algumas horas. O certificado TLS é emitido pelo GitHub depois que o DNS resolve.

## Preencher antes de publicar

Marcados no HTML com `data-legal`:

| Onde | O que | Estado |
|---|---|---|
| `index.html` — seção Empresa | CNPJ `29.740.328/0001-26` | preenchido |
| `index.html` — seção Empresa | Endereço da sede | placeholder `Curitiba — PR, Brasil` |
| `index.html` — JSON-LD | `addressLocality` / `addressRegion` | placeholder |
| `index.html` | Telefone | ausente — a App Store costuma pedir |

Para o **DUNS** e para a ficha da **App Store**, razão social, endereço e telefone precisam bater exatamente com o registro do CNPJ.

## Recursos técnicos

- Campo de partículas em canvas com repulsão pelo cursor, densidade adaptada à viewport, pausa fora da tela
- Cursor customizado com interpolação, botões magnéticos, tilt 3D nos cards
- Cases empilhados com `position: sticky` + escala progressiva em todos os cartões
- Seção de processo com scroll horizontal fixado (pinned): altura do pin calculada a partir do percurso real, cada etapa reage à distância do centro da tela, numeral gigante e contador acompanham o scroll; fallback de swipe no mobile
- Cursor nativo escondido (classe aplicada por JS, então falha de JS devolve o ponteiro) e seleção de texto/imagem desativada fora dos campos de formulário
- Um único loop `requestAnimationFrame` para tudo; só `transform` e `opacity` são animados
- `prefers-reduced-motion` desliga cursor, grão, partículas, pin e reveals
- Sem framework, sem bundler, sem requisição externa além do Google Fonts
