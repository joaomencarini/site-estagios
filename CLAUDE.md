# Site de Estágios no Mercado Financeiro

## O que é
Site para ajudar universitários brasileiros a encontrar estágios no mercado financeiro (bancos, corretoras, gestoras, fintechs, consultorias). Primeira entrega: página que lista vagas de exemplo com filtros por **área** e **cidade**.

## Contexto do autor
Iniciante em programação. Regra de ouro: **simplicidade acima de tudo**. Nada de frameworks, build steps ou dependências sem necessidade clara. Explicar o "porquê" de cada escolha em linguagem simples. Idioma do site e dos textos: português do Brasil.

## Stack (tudo gratuito)
- **HTML + CSS + JavaScript puro** — sem framework, sem build; abre direto no navegador.
- **Vagas em `data/vagas.js`** — dados separados do código, editáveis à mão, sem banco de dados. É `.js` (lista `vagas`) para o site funcionar abrindo o `index.html` direto, sem servidor.
- **Git + GitHub** — versionamento.
- **GitHub Pages** — hospedagem gratuita (publicar quando a etapa 1 estiver pronta).
- **Editor (VS Code)** — opcional: a extensão Live Server recarrega a página ao salvar.

## Estrutura de pastas
```
site-estagios/
├── CLAUDE.md
├── README.md
├── index.html          # página principal (lista de vagas + filtros)
├── css/
│   └── estilo.css
├── js/
│   └── app.js          # lê a lista de vagas, aplica filtros, desenha os cards
└── data/
    └── vagas.js        # vagas de exemplo (dados fictícios)
```

## Modelo de dados de uma vaga
`id`, `titulo`, `empresa`, `area` (Investimentos, Risco, Crédito, Controladoria, Tesouraria, Research), `cidade`, `tipoEmpresa` (Banco, Corretora, Gestora, Fintech, Consultoria, Seguradora), `dataPublicacao` (AAAA-MM-DD). Campos como `link` e `modalidade` entram em etapas futuras.

## Plano em etapas (cada uma só termina quando o critério "pronto" é atendido)
1. **Lista de vagas com filtros** — pronto quando: abre ≥10 vagas de exemplo; filtro por área e por cidade funcionam (juntos ou separados); mostra mensagem se nada for encontrado; botão "limpar filtros".
2. **Visual e celular** — pronto quando: layout legível em tela de 360px e de desktop; sem rolagem horizontal.
3. **Publicar** — pronto quando: site acessível por link público do GitHub Pages.
4. **Busca por texto e página de detalhe da vaga** — pronto quando: busca por palavra-chave filtra título/empresa; clicar numa vaga mostra detalhes.
5. **Vagas reais, mantidas à mão** — pronto quando: ≥20 vagas reais com link de candidatura válido e data de publicação; vagas antigas somem ou são marcadas.
6. **Evolução (só se necessário)** — favoritos (localStorage), formulário de envio de vaga, backend/banco (ex.: Supabase) apenas se o arquivo de vagas deixar de bastar.

## Convenções
- Uma etapa por vez; não antecipar funcionalidades das etapas seguintes.
- Código com comentários curtos em português explicando o que cada bloco faz.
- Nomes de arquivos, variáveis e campos dos dados em português, sem acentos.
- Dados de exemplo devem ser claramente fictícios até a etapa 5.
- Antes de adicionar qualquer biblioteca ou ferramenta, justificar por que o JS puro não resolve.
