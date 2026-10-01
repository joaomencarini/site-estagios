# Site de Estágios no Mercado Financeiro

## O que é
Site para ajudar universitários brasileiros a encontrar estágios no mercado financeiro (bancos, corretoras, gestoras, fintechs, consultorias). O site é uma **vitrine de links**: lista dados básicos de cada vaga (com filtros por **área**, **cidade** e **fonte**) e leva o aluno à página original para se candidatar.

## Contexto do autor
Iniciante em programação. Regra de ouro: **simplicidade acima de tudo**. Nada de frameworks, build steps ou dependências sem necessidade clara. Explicar o "porquê" de cada escolha em linguagem simples. Idioma do site e dos textos: português do Brasil.

## Stack (tudo gratuito)
- **HTML + CSS + JavaScript puro** — sem framework, sem build; abre direto no navegador.
- **Vagas em `data/vagas.js`** — dados separados do código, editáveis à mão, sem banco de dados. É `.js` (lista `vagas`) para o site funcionar abrindo o `index.html` direto, sem servidor.
- **Git + GitHub** — versionamento.
- **GitHub Pages** — hospedagem gratuita, publicada a partir da branch `main` (pasta raiz). Endereço: https://joaomencarini.github.io/site-estagios/
- **Editor (VS Code)** — opcional: a extensão Live Server recarrega a página ao salvar.

## Estrutura de pastas
```
site-estagios/
├── CLAUDE.md
├── README.md
├── .nojekyll           # faz o GitHub Pages publicar os arquivos como estão
├── index.html          # página principal (lista de vagas + filtros)
├── adicionar.html      # formulário que gera o texto de uma vaga para colar em vagas.js
├── css/
│   └── estilo.css
├── js/
│   ├── app.js          # lê a lista de vagas, esconde as vencidas, aplica filtros, desenha os cards
│   └── adicionar.js    # lógica do formulário adicionar.html
└── data/
    └── vagas.js        # lista de vagas (começa com 3 exemplos fictícios)
```

## Modelo de dados de uma vaga
Campos em `data/vagas.js` (datas sempre `AAAA-MM-DD`):
- `titulo`, `empresa`
- `area`: Investimentos, Risco, Crédito, Controladoria, Tesouraria ou Research
- `cidade`
- `tipoEmpresa`: Banco, Corretora, Gestora, Fintech, Consultoria ou Seguradora
- `fonte`: onde a vaga foi encontrada (ex.: "LinkedIn", "Polifinance", "Site da empresa")
- `link`: endereço da vaga original (precisa começar com `http://` ou `https://`)
- `dataPublicacao`
- `prazoInscricao` (opcional): depois dessa data a vaga **some sozinha** do site (no dia do prazo ela ainda aparece)
- `exemplo: true` (só nas vagas fictícias de teste): mostra o selo "EXEMPLO"

## Regra do projeto sobre conteúdo das vagas
**Nunca copiar a descrição completa das vagas.** Guardar só os dados básicos acima e o link da vaga original. A candidatura sempre acontece na página original, e a fonte é sempre indicada no cartão.

## Como cadastrar uma vaga
1. Encontre a vaga no site de origem (LinkedIn, Polifinance, site da empresa...) e deixe a página aberta.
2. Abra `adicionar.html` no navegador (duplo clique). Ela não tem link no site público; é uma ferramenta só para quem edita.
3. Preencha os campos (título, empresa, área, cidade, tipo de empresa, fonte, link, datas), clique em **Gerar texto** e depois em **Copiar texto**. O formulário já cuida de aspas e vírgulas.
4. Abra `data/vagas.js` no editor e cole o texto **antes** do `];` final, depois da última vaga.
5. Na primeira vez, apague os 3 blocos de exemplo (os marcados com `exemplo: true`).
6. Salve, abra `index.html` e confira o cartão e o botão "Ver vaga e se candidatar".
7. Publique: `git add .`, `git commit -m "Adiciona vagas"` e `git push` na `main`. O GitHub Pages atualiza o site em cerca de 1 a 3 minutos.

Vagas que saíram do ar na fonte original devem ser removidas de `data/vagas.js` (se tiverem `prazoInscricao`, somem sozinhas).

## Plano em etapas (cada uma só termina quando o critério "pronto" é atendido)
1. **Lista de vagas com filtros** — pronto quando: abre ≥10 vagas de exemplo; filtro por área e por cidade funcionam (juntos ou separados); mostra mensagem se nada for encontrado; botão "limpar filtros".
2. **Visual e celular** — pronto quando: layout legível em tela de 360px e de desktop; sem rolagem horizontal.
3. **Publicar** — pronto quando: site acessível por link público do GitHub Pages.
4. **Busca por texto e página de detalhe da vaga** — pronto quando: busca por palavra-chave filtra título/empresa; clicar numa vaga mostra detalhes.
5. **Vagas reais, mantidas à mão** — pronto quando: ≥20 vagas reais com link de candidatura válido e data de publicação; vagas antigas somem ou são marcadas. (Infraestrutura já pronta: campos `fonte`, `link` e `prazoInscricao`, filtro por fonte, `adicionar.html`.)
6. **Evolução (só se necessário)** — favoritos (localStorage), formulário de envio de vaga, backend/banco (ex.: Supabase) apenas se o arquivo de vagas deixar de bastar.

## Convenções
- Uma etapa por vez; não antecipar funcionalidades das etapas seguintes.
- Código com comentários curtos em português explicando o que cada bloco faz.
- Nomes de arquivos, variáveis e campos dos dados em português, sem acentos.
- Vagas de exemplo devem ser claramente fictícias (`exemplo: true`, link `example.com`) e removidas ao cadastrar vagas reais.
- Antes de adicionar qualquer biblioteca ou ferramenta, justificar por que o JS puro não resolve.
