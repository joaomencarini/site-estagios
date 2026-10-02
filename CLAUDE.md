# Largada Fin — estágios no mercado financeiro

## O que é
**Largada Fin** é um site para ajudar universitários brasileiros a encontrar estágios no mercado financeiro (bancos, corretoras, gestoras, fintechs, consultorias). O site é uma **vitrine de links**: lista dados básicos de cada vaga (com filtros por **área**, **cidade** e **fonte**) e leva o aluno à página original para se candidatar.

## Contexto do autor
Iniciante em programação. Regra de ouro: **simplicidade acima de tudo**. Nada de frameworks, build steps ou dependências sem necessidade clara. Explicar o "porquê" de cada escolha em linguagem simples. Idioma do site e dos textos: português do Brasil.

## Nome do site (um único lugar)
O nome ("Largada Fin"), a frase ("Estágios no mercado financeiro, num só lugar") e a descrição ficam **só em `js/marca.js`** (`MARCA`). O JavaScript (`aplicarMarca`) escreve título da aba, cabeçalho, rodapé e meta tags a partir dali (elementos com `data-marca="nome"`/`"frase"`). Os textos do HTML (`<title>`, `<meta description>`, `og:*`, cabeçalho e rodapé) são só uma **reserva** para quem não roda JavaScript (buscadores, pré-visualização de links): **para trocar o nome, mude `js/marca.js` e os mesmos textos de reserva em `index.html` e `adicionar.html`**; o teste "marca" (`node --test`) falha se um deles ficar diferente ou se o nome antigo sobrar em algum arquivo do site.

## REGRA DE SEGURANÇA (dados pessoais)
**O repositório e o site são públicos.** NUNCA grave currículo ou dado pessoal de usuário em nenhum arquivo do repositório (`data/`, `js/`, exemplos de teste com dados reais, etc.). Em testes, use **só currículo fictício** (os testes usam "Pessoa Fictícia"). O `.gitignore` bloqueia por segurança arquivos como `perfil-estagios*.json`, `curriculo*` e `cv-*.pdf`, mas a regra vale mesmo assim: antes de qualquer commit, confira que nenhum arquivo traz dado pessoal real.

## Stack (tudo gratuito)
- **HTML + CSS + JavaScript puro** — sem framework, sem build; abre direto no navegador.
- **Vagas em `data/vagas.js`** — dados separados do código, editáveis à mão, sem banco de dados. É `.js` (lista `vagas`) para o site funcionar abrindo o `index.html` direto, sem servidor.
- **Git + GitHub** — versionamento.
- **Scripts em Node.js (sem dependências)** em `scripts/` — atualizam vagas automaticamente e conferem links. Só rodam no GitHub Actions (ou no seu computador); o site em si continua sendo HTML/CSS/JS puro.
- **localStorage do navegador** — guarda o "Meu perfil" (interesses) só no aparelho de quem usa; sem login, sem backend e sem enviar nada a servidor.
- **IndexedDB do navegador** — guarda o arquivo do currículo (PDF/Word) anexado, só no aparelho de quem usa.
- **pdf.js e mammoth** (únicas bibliotecas, copiadas em `js/vendor/`, sem CDN) — só para ler o texto do currículo anexado. Justificativa: ler PDF e .docx em JS puro não é viável.
- **GitHub Actions** — executa os scripts todo dia às 8h (Brasília) e faz commit se houver mudança.
- **GitHub Pages** — hospedagem gratuita, publicada a partir da branch `main` (pasta raiz). Endereço: https://joaomencarini.github.io/site-estagios/
- **Editor (VS Code)** — opcional: a extensão Live Server recarrega a página ao salvar.

## Estrutura de pastas
```
site-estagios/
├── CLAUDE.md
├── .gitignore          # impede subir perfil/currículo exportado por engano
├── README.md
├── .nojekyll           # faz o GitHub Pages publicar os arquivos como estão
├── .github/workflows/
│   └── atualizar-vagas.yml   # roda os scripts todo dia às 8h (Brasília) e também sob demanda
├── scripts/
│   ├── fontes.json           # lista de empresas (Greenhouse) para buscar vagas
│   ├── atualizar-vagas.js    # busca vagas e gera data/vagas-auto.js
│   ├── verificar-links.js    # confere os links e gera data/status-links.json
│   └── util.js               # funções pequenas usadas pelos dois scripts
├── index.html          # página principal (busca, filtros, lista) + painel "Meu perfil" + janela de candidatura em passos
├── adicionar.html      # formulário que gera o texto de uma vaga para colar em vagas.js
├── css/
│   └── estilo.css      # sistema de design (variáveis de cor/espaço/texto, modo escuro, impressão do currículo)
├── js/
│   ├── marca.js        # nome, frase e descrição do site (único lugar) + aplicarMarca()
│   ├── regras.js       # regras de expiração, link inativo, e-mail, pontuação/ordenação por perfil, currículo, prompt, exportar/importar (usadas pelo site, pelos scripts e pelos testes)
│   ├── app.js          # junta as vagas, esconde as vencidas/inativas, busca e filtros, chips, cartões, painel "Meu perfil" (abas, currículo, arquivo)
│   ├── candidatura.js  # janela de candidatura em 3 passos (currículo/adaptar, e-mail ou resumo, enviar) e folha do currículo + PDF
│   ├── arquivo.js      # guarda/lê/apaga o arquivo do currículo (PDF/Word) no IndexedDB do navegador
│   ├── extrair.js      # tira o texto do PDF (pdf.js) ou do .docx (mammoth), no navegador
│   ├── vendor/         # bibliotecas copiadas (pdf.js e mammoth), versões fixas + licenças; ver js/vendor/LEIA-ME.md
│   └── adicionar.js    # lógica do formulário adicionar.html
├── testes/
│   └── regras.test.js  # testes unitários das regras (node --test)
└── data/
    ├── vagas.js          # vagas MANUAIS (você edita; uma por bloco { ... },)
    ├── vagas-auto.js     # vagas AUTOMÁTICAS (gerado pelo script; não edite)
    ├── status-links.json # histórico da verificação de links (gerado pelo script)
    └── status-links.js   # cópia do anterior para o site ler (gerado; o site não consegue ler .json direto do computador)
```

## Modelo de dados de uma vaga
Campos em `data/vagas.js` (datas sempre `AAAA-MM-DD`):
- `titulo`, `empresa`
- `area`: texto livre (ex.: Investimentos, Investment Banking, Risco, Asset Management, Operações). O filtro de área da página lista automaticamente as áreas que existirem nas vagas. Para o "Meu perfil", cada área é agrupada em uma **categoria** (ver "Categorias de área"); isso **não altera** o valor guardado em `vagas.js` / `vagas-auto.js`.
- `cidade`
- `tipoEmpresa`: Banco, Corretora, Gestora, Fintech, Consultoria, Seguradora ou Outro
- `modalidade` (opcional): `"presencial"`, `"hibrido"` ou `"remoto"` (sem acento e em minúsculas). **Só preencha se a própria vaga informar. Nunca presuma nem invente** (hoje nenhuma vaga tem esse dado, e o robô de vagas automáticas também não preenche). Sem o campo, a vaga aparece normalmente. O cartão mostra um selo com a modalidade só quando o dado existe. Valor desconhecido (ex.: `"home office"`) é tratado como "não informada".
- `fonte`: onde a vaga foi encontrada (ex.: "LinkedIn", "Polifinance", "Site da empresa")
- `link` (opcional): endereço da vaga original (precisa começar com `http://` ou `https://`). **Sem link**, o cartão não mostra botão nem aviso. Para vagas sem link, simplesmente não escreva a linha `link`.
- `emailCandidatura` (opcional): e-mail para onde enviar o CV, nas vagas que não têm página de candidatura. Aceita **um texto** (`"a@empresa.com"`) **ou uma lista** (`["a@empresa.com", "b@empresa.com"]`; use a lista quando a vaga pedir envio para vários e-mails; um texto com vários e-mails juntos, como `"a@x.com; b@x.com"`, **não** funciona). Cada e-mail é validado com a mesma regra segura (sem espaços e sem `< > " ' , ; ? & # ( ) / \`); os **inválidos e os repetidos são ignorados**, sem quebrar o cartão, e se nenhum for válido o cartão fica sem bloco de e-mail. O cartão mostra "Enviar CV para: ..." com **um botão "Copiar e-mail" por endereço** e o botão **Escrever e-mail**, que abre o programa de e-mail do aluno (`mailto:`) com **todos os destinatários válidos separados por vírgula**.
- `assuntoEmail` (opcional, só vale junto com `emailCandidatura`): assunto sugerido (um só, vale para todos os destinatários). O cartão mostra "Assunto: ..." com o botão **Copiar assunto**, e o botão "Escrever e-mail" já abre o e-mail com esse assunto (acentos, espaços, `|` e `&` são codificados).
- `dataPublicacao`
- `prazoInscricao` (opcional): a vaga **some no dia seguinte** a essa data. Sem prazo definido: não escreva a linha; nesse caso a vaga some 45 dias depois da `dataPublicacao` (ver "Quando uma vaga deixa de aparecer").
- `exemplo: true` (opcional, só para vagas fictícias de teste): mostra o selo "EXEMPLO"

**Formas de candidatura no cartão:** o cartão mostra **um único botão principal**: **"Ver vaga"** (a vaga tem `link`; abre em nova aba) ou **"Candidatar-se"** (só `emailCandidatura`; abre a janela de candidatura). Vaga com link ganha também o link discreto "Preparar candidatura" (abre a mesma janela). **Sem link e sem e-mail válido: sem botão e sem aviso.** Copiar e-mail/assunto, escrever e-mail, reescrever currículo etc. **não ficam no cartão**: ficam na janela de candidatura (ver "Janela de candidatura em passos"). O texto da vaga é sempre escrito como texto puro (`textContent`), nunca com `innerHTML`.

**O que o cartão mostra:** cargo, empresa, etiquetas (área, cidade, modalidade só se a vaga informar, "Combina com você" quando aplicável; área "Diversas" aparece como "Várias áreas", com o texto completo no `title`), o **prazo em destaque** (`situacaoPrazo` em `js/regras.js`: até 14 dias "Termina em N dias" (hoje/amanhã incluídos), depois "Inscrições até dd/mm/aaaa"; **vermelho até 3 dias, âmbar até 7**, neutro depois; sem `prazoInscricao`, nada) e a legenda "Fonte: ..." (a fonte continua sempre indicada; com filtro de modalidade em ação, vagas sem esse dado ganham " · Modalidade não informada"). A data de publicação não aparece mais.

As vagas automáticas (`data/vagas-auto.js`) têm os mesmos campos mais `origem` (de qual fonte vieram). Guardam só título, empresa, cidade, link e data; `area`, `tipoEmpresa` e `fonte` vêm do `scripts/fontes.json`.

## Quando uma vaga deixa de aparecer no site
Nada é apagado dos arquivos de dados: o site (`js/app.js` + `js/regras.js`) apenas **esconde** a vaga. Vale para vagas manuais e automáticas:
- **Com `prazoInscricao`:** some no dia seguinte ao prazo (no dia do prazo ainda aparece).
- **Vaga manual sem prazo:** some **45 dias depois da `dataPublicacao`**. Exemplo: publicada em 2026-10-01, aparece até 2026-11-14 e some a partir de 2026-11-15. Quem manda é o prazo: se houver prazo, a regra dos 45 dias não é usada.
- **Vaga automática (tem o campo `origem`):** **não usa a regra dos 45 dias**. Enquanto a fonte (Greenhouse) listar a vaga, ela está aberta; quando some da fonte, o script a tira de `data/vagas-auto.js` e ela deixa de ser mostrada.
- **Link quebrado:** some quando o link falha em **2 dias diferentes** (ver "Verificação de links"). Se o link voltar a funcionar, a vaga volta.
- **Mesma vaga nas duas listas** (mesmo link em `vagas.js` e em `vagas-auto.js`): vale a manual e a automática é ignorada. O prazo da manual é mantido (útil para pôr prazo numa vaga que o robô encontrou).

## Categorias de área
As áreas das vagas são muito variadas. Em `js/regras.js` (`CATEGORIAS_AREA`) cada área é agrupada em uma **categoria**, usada pelo painel "Meu perfil" (marcar, filtrar e pontuar). O casamento é por **texto normalizado** (sem acento, minúsculas) e por **"contém"**: a área precisa conter um dos termos da categoria. Vale a **primeira categoria, na ordem da tabela**, que casar (ex.: "Risco e Investimentos" cai em "Investimentos e Gestão"). Área que não casa com nenhum termo cai em **"Outras"**.

| Categoria | Termos (a área contém) |
|---|---|
| Investimentos e Gestão | asset management, investimentos, fund management, special situations, venture capital, private equity, real estate, infraestrutura |
| Banco de Investimento e M&A | m&a, investment banking, dcm, project finance, capital solutions |
| Risco e Crédito | risco, crédito, controle e risco, cobrança |
| Operações e Backoffice | operações, operations, backoffice, middle office, mesa de operações |
| Research | equity research, equities, research |
| Comercial e Wealth | comercial, wealth, multi-family office |
| Outras | (tudo o que não casou acima) |

(O termo "research" sozinho foi acrescentado à categoria Research para a área "Research" não cair em "Outras".)

- **"Diversas":** área que **começa** com "Diversas" ("Diversas", "Diversas Áreas", "Diversas (Investment Banking, Research, ...)") **não tem categoria** e conta como compatível com **qualquer** categoria marcada no filtro. O cartão mostra o selo **"Várias áreas"**. Ela passa no filtro de categoria, mas **não ganha os +3** da pontuação (ver abaixo).
- **Como adicionar uma regra nova:** abra `js/regras.js`, ache `CATEGORIAS_AREA` e acrescente o termo (em minúsculas, pode ter acento) na lista `termos` da categoria certa; ou crie um bloco novo `{ nome: "...", termos: [...] }` (a ordem do bloco importa: a primeira categoria que casar vence). Depois acrescente um caso em `testes/regras.test.js` e rode `node --test`. Não é preciso mexer em `data/`. A tabela acima deve ser atualizada junto.
- **Mapa hoje com as áreas reais (01/10/2026):** Investimentos e Gestão = Investimentos, Asset Management, Special Situations, Infraestrutura; Banco de Investimento e M&A = Investment Banking, M&A, DCM, Project Finance, Capital Solutions; Risco e Crédito = Risco, Crédito; Operações e Backoffice = Operações, Middle Office; Research = Research; Várias áreas = "Diversas" e "Diversas (Investment Banking, Research, Risco, Asset)"; **Outras = Tesouraria e Mercado de Capitais** (candidatas a ganhar regra: ex. "tesouraria" e "mercado de capitais").

## Personalização por interesses ("Meu perfil")
O **Meu perfil** é um painel aberto pelo botão "Meu perfil" no cabeçalho (painel lateral à direita no desktop, tela cheia no celular; é um `<dialog>`: Esc fecha, foco preso, rótulo acessível). Tem **duas abas** (setas, Home e End trocam de aba): **"O que busco"** (nome, áreas, cidades, tipos, modalidade, palavras-chave) e **"Meu currículo"**. Fica uma linha fixa: "Seu perfil e currículo ficam só neste navegador." Deixa o usuário dizer o que procura: a lista **filtra** pelo que foi marcado e mostra primeiro as vagas mais relevantes. É feito só no navegador: **sem login, sem backend, nada é enviado a servidor e nada é coletado** (há uma linha dizendo isso no rodapé, inclusive sobre o nome). Não envie, registre nem cole esses dados em lugar nenhum.

### Busca e filtros da tela principal (Etapa 10)
Acima da lista: **busca por cargo ou empresa** (todas as palavras precisam aparecer no cargo ou na empresa, sem acento nem maiúsculas) e **3 filtros rápidos: Área (categoria, ver "Categorias de área"), Cidade e Modalidade**. Em **"Mais filtros"** (recolhido por padrão): tipo de empresa, fonte e palavras-chave (**qualquer uma** das palavras no cargo ou na empresa). Tudo isso é `passaFiltrosPagina` (`js/regras.js`) e **combina com "e"**. Regras iguais às do perfil: vaga de área "Diversas" passa em qualquer categoria; vaga **sem modalidade informada continua aparecendo** (com a indicação "Modalidade não informada"). Linha de resumo: "27 vagas" (ou "N de 27 vagas" com filtro) e o ordenador. Os filtros ativos aparecem como **etiquetas removíveis** (inclusive uma "Meu perfil: ..." que desliga o filtro do perfil sem apagá-lo; desligada, vira "Filtro do perfil desligado · Voltar a filtrar") e **"Limpar tudo"** (limpa busca e filtros e desliga o filtro do perfil; o perfil não é apagado). Sem resultados: "Nenhuma vaga com esses filtros" com o botão **"Limpar filtros"**.

- **O que o usuário informa:** nome opcional; **categorias de área** (ver "Categorias de área"; só aparecem as que existem nas vagas ativas), **cidades** e **tipos de empresa** (valores que existem nas vagas ativas); **modalidade** preferida (Presencial, Híbrido, Remoto; lista fixa); palavras-chave opcionais separadas por vírgula (ex.: `M&A, valuation`). Opções salvas que já não existem nas vagas continuam aparecendo (marcadas) para poderem ser desmarcadas.
- **Filtro (cada grupo marcado filtra):** a vaga precisa bater em **pelo menos uma opção de cada grupo marcado** (categorias, cidades, tipos, modalidade): "ou" dentro do grupo, "e" entre grupos. **Grupo sem nada marcado não filtra.** Exceções: vaga de área **"Diversas" passa em qualquer categoria** (mas ainda precisa bater nos outros grupos marcados); vaga **sem modalidade informada continua aparecendo**, com a indicação "Modalidade não informada" (a indicação só aparece enquanto o filtro está valendo). **Palavras-chave e nome NÃO filtram.**
- **Filtro do perfil na lista:** aparece como etiqueta "Meu perfil: <categorias, cidades, tipos, modalidades>" ao lado dos outros filtros ativos; clicar nela **desliga o filtro sem apagar o perfil** (caixas, pontuação e selos continuam) e ela vira "Filtro do perfil desligado · Voltar a filtrar". O desligamento vale só nesta visita (não é guardado) e o filtro volta sozinho ao mudar qualquer categoria, cidade, tipo ou modalidade do perfil. Se nada bater, vale o estado vazio acima.
- **Ordem de aplicação:** 1) vagas ativas (não vencidas, link não quebrado, sem duplicata); 2) **filtros da página** (busca, Área = categoria, Cidade, Modalidade, tipo, fonte, palavras-chave); 3) **filtro do perfil**; 4) **ordenação** (relevância, mais recentes ou prazo) sobre o que sobrou; 5) selos. Os filtros da página e o do perfil **combinam** (interseção).
- **Nome:** se preenchido, o topo do site mostra "Olá, <nome>! Estas são as vagas com mais a ver com você."; sem nome, o texto de sempre. O nome entra **sempre como texto puro** (`textContent`, nunca HTML), com no máximo **60 caracteres** e espaços sobrando removidos (`limparNome`). Só personaliza a saudação: **não filtra, não pontua e não conta como perfil preenchido**.
- **Onde fica salvo:** `localStorage`, chave `estagiosPerfil`, com `try/catch`. Se o navegador bloquear o armazenamento, o site funciona normalmente: o perfil vale só durante a visita e aparece um aviso. Dados guardados quebrados, antigos ou estranhos são ignorados/ajustados (`sanitizarPerfil`); um perfil antigo com `areas` cruas é convertido para categorias. O botão **Limpar meu perfil** esvazia a tela e **apaga a chave** do navegador (`apagarPerfil`).
- **Pontuação** (`pontuarVaga` em `js/regras.js`; pesos em `PESOS`): **categoria** da área igual a uma marcada **+3** (vaga "Diversas" **não** ganha, pois não tem categoria própria); cidade igual **+2**; tipo de empresa igual **+1**; alguma palavra-chave no **título ou na empresa** **+2** (uma vez só; não olha área, cidade, fonte nem tipo); **modalidade da vaga igual a uma das preferidas +2** (vaga sem modalidade informada ganha 0 nesse critério). Máximo: 10. A pontuação **ordena dentro do que o filtro deixou**. A comparação ignora maiúsculas, acentos e espaços nas pontas.
- **Selo "Combina com você":** aparece quando a vaga tem pelo menos **60% da pontuação máxima possível** para aquele perfil (só contam os critérios que o usuário preencheu; ex.: com categoria e cidade marcadas o máximo é 5 e o selo exige 3 ou mais). Para não prejudicar vagas, **critérios que ela não pode cumprir saem do máximo**: sem modalidade informada não conta "modalidade"; "Diversas" não conta "categoria". Perfil vazio: sem selo.
- **Ordenação** (menu "Ordenar:" ao lado do contador; `ordenarVagas`):
  - **Relevância** (padrão): maior pontuação primeiro. Desempate: **prazo mais próximo primeiro** (vagas com prazo antes das sem prazo), depois **publicação mais recente**. **Sem perfil preenchido (categorias, cidades, tipos, modalidades e palavras-chave vazios), mantém a ordem de sempre** (publicação mais recente primeiro).
  - **Mais recentes:** publicação mais recente primeiro (ignora o perfil).
  - **Prazo:** prazo mais próximo primeiro, vagas sem prazo no fim (por data de publicação).
  - Empates totais mantêm a ordem original.
- **Testes:** `node --test` (na pasta do projeto, Node 18 ou mais novo) roda `testes/regras.test.js`, que cobre o mapeamento de categorias (incluindo "Diversas" e "Outras"), o filtro por grupo (e/ou, "Diversas", modalidade sem dado), o estado vazio, a combinação com os filtros da página, pontuação, ordenação, selo, nome (com `<script>`, aspas, espaços e nome longo), `localStorage` indisponível/bloqueado/com dados quebrados ou antigos e as regras de expiração, e-mail e link inativo. Ao mudar pesos, categorias ou regras, atualize os testes e esta seção.

## Meu currículo e candidatura (Etapas 9, 9b e 9c, sem servidor)
Tudo roda no navegador. **Nenhum texto é enviado a servidor** (o site não usa `fetch`, XHR, beacon nem WebSocket; o rodapé diz isso e precisa continuar verdadeiro). Se mexer aqui, mantenha assim.

- **Meu currículo:** na aba "Meu currículo" do painel (o **caminho principal é "Anexar PDF ou Word"**; o texto extraído fica abaixo para conferir e editar, e "Colar texto manualmente" é a opção secundária, recolhida enquanto não há texto). Uma linha mostra o estado: "Currículo salvo: nome.pdf, 120 KB", "Currículo salvo: só o texto, N caracteres" ou "Nenhum currículo salvo.". O campo de texto (até **15.000 caracteres**, com contador). Fica em `perfil.curriculo` no `localStorage` (chave `estagiosPerfil`), junto do resto do perfil. É sempre texto puro; `limparCurriculo` troca CRLF por LF, tira caracteres de controle e corta em 15.000. **Não filtra nem pontua vagas** e não conta como "perfil preenchido".
- **Exportar / importar:** botões "Exportar perfil" (baixa `perfil-estagios.json`) e "Importar perfil", dentro de **"Mais opções"** (menu recolhido no fim do painel, junto com "Limpar meu perfil"). Formato: `{ "formato": "estagios-perfil", "versao": 1, "perfil": { ... } }`. A importação (`validarImportacao`) recusa, com mensagem em português e **sem alterar nada**: arquivo maior que 100.000 caracteres, JSON inválido, formato ou versão diferentes, perfil sem nenhum campo conhecido e currículo acima de 15.000. Campos desconhecidos são descartados. Importar substitui o perfil atual. O arquivo exportado tem dado pessoal: **nunca o coloque no repositório** (por isso o `.gitignore`).
- **Limpar meu perfil** apaga tudo, inclusive o currículo, e remove a chave do `localStorage`.
- **Candidatura:** o cartão abre a **janela de candidatura em passos** (ver a seção própria abaixo). Os prompts e regras abaixo continuam valendo; só mudou onde aparecem.
  - **Sem currículo:** a janela explica e leva à aba "Meu currículo".
  - **Com currículo:** o passo 2 mostra um **prompt** (`montarPrompt`) para o aluno **copiar e colar** na IA que preferir (ChatGPT, Claude...). O site **não executa o prompt nem chama IA**. O aluno cola a resposta no campo; no passo 3, com e-mail, "Escrever e-mail" abre o programa de e-mail com destinatários, assunto e esse texto no corpo, e há "Copiar e-mail". Com link, aparece "Abrir vaga". Aviso fixo: "Confira tudo antes de enviar."
  - **Prompt por e-mail:** até 150 palavras; no idioma do assunto exigido (ou português do Brasil se não houver assunto); "Use SOMENTE informações que estão no currículo abaixo. Não invente experiência, notas, empresas, datas ou números."; sem placeholders; termina com o nome do candidato. **Prompt por formulário (só link):** "resumo do meu perfil" (até 80 palavras) + exatamente 3 pontos de ligação com a vaga, até 150 palavras no total.
  - **Proteção contra "injeção de prompt":** os dados entram entre marcadores (`<<<VAGA>>>…<<<FIM_VAGA>>>`, `<<<CANDIDATO>>>`, `<<<CURRICULO>>>`); o prompt manda tratar o que está dentro como dado, nunca como instrução; `escaparMarcadores` impede que o texto imite um marcador (`<<<` vira `< < <`); campos curtos viram linha única. Tudo é inserido como texto puro (`textContent`/`value`), nunca `innerHTML`.
  - **Limite do `mailto:`:** programas de e-mail cortam endereços muito longos. Acima de `LIMITE_MAILTO` (**1800** caracteres, já codificado), o botão "Escrever e-mail" é desativado, aparece um aviso e continuam valendo "Copiar e-mail" e "Copiar texto".
- **Testes:** os de currículo, prompt, mailto com corpo e exportar/importar estão em `testes/regras.test.js` (só com currículo fictício). Ao mudar o prompt ou o formato de exportação, atualize os testes e esta seção (suba a `versao` se o formato mudar de forma incompatível).

### Anexar currículo em PDF ou Word (Etapa 9b)
Botão **Anexar PDF ou Word** (.pdf ou .docx) na aba "Meu currículo". Tudo no navegador; **nenhum arquivo nem texto sai do aparelho** (sem `fetch`/XHR/beacon; as bibliotecas vêm de `js/vendor/`, nunca de CDN).
- **Validação** (`validarArquivoCurriculo`, `conferirConteudoArquivo` em `js/regras.js`): só `.pdf` e `.docx` (qualquer caixa), de 1 byte até **5 MB** (5 MB exatos passam). `.doc` antigo, `.txt`, imagens e arquivo sem extensão são recusados com mensagem clara. O conteúdo também é conferido pelos primeiros bytes (um `.pdf` que não é PDF, ou um Word antigo/arquivo do Office com senha, é recusado). Recusou = **nada muda** (texto e arquivo guardado continuam como estavam).
- **Texto:** extraído por `js/extrair.js` (PDF: pdf.js, máx. 40 páginas e 30 s, `isEvalSupported: false`; DOCX: mammoth `extractRawText`) e passado por `prepararTextoExtraido` (limpa, corta em 15.000 e avisa). Preenche o campo "Meu currículo" para o aluno revisar e editar; se o campo já tem texto, o site **pergunta** antes de substituir (Cancelar = mantém o texto e guarda o arquivo mesmo assim). Mesmo caminho de sempre depois: o texto vai para `montarPrompt` entre os marcadores.
- **Falhas (nunca inventar texto):** PDF/DOCX sem texto extraível (escaneado, só imagens): avisa, **guarda o arquivo**, deixa o campo como estava e pede para colar o texto. PDF com senha, arquivo danificado ou leitor indisponível: avisa e não guarda. A página nunca trava.
- **Aberto direto do disco (`file://`):** o pdf.js 4.x é módulo e o navegador não o carrega assim; o site avisa (PDF só funciona pelo endereço publicado ou Live Server). `.docx` funciona em qualquer caso.
- **Arquivo original no IndexedDB** (`js/arquivo.js`; banco `estagiosArquivo`, loja `arquivos`, chave `curriculo`; um arquivo por vez; guarda nome, tipo, tamanho, data e os bytes; o nome é limpo por `limparNomeArquivo`; o registro lido é revalidado). O painel mostra nome e tamanho na linha de estado + **Remover arquivo**. Se o IndexedDB não existir ou falhar, o site avisa e o arquivo vale só nesta visita; o texto segue funcionando. **Limpar meu perfil** apaga também o arquivo. **O backup (exportar/importar) guarda só o texto**; isso está escrito na tela.
- **Na candidatura:** o passo 3 ("Enviar") tem o aviso fixo "O botão Escrever e-mail não consegue anexar arquivos. Anexe o currículo baixado, ou use Compartilhar com anexo no celular.", **Baixar meu currículo** (baixa com o nome original) e **Compartilhar com anexo** (só aparece se `navigator.share` + `navigator.canShare({ files })` funcionarem; compartilha o arquivo, o assunto como título e o e-mail colado como texto; se a pessoa cancelar, nada acontece). O passo 2 mostra o destinatário e o assunto exigido, cada um com "Copiar". Sem arquivo anexado, a janela diz como anexar.
- **Segurança:** nome do arquivo e texto extraído entram só como texto puro (`textContent`/`value`). **Nunca coloque PDF/Word de currículo no repositório:** o `.gitignore` bloqueia `*.pdf`, `*.docx`, `*.doc`, `*.odt`, `*.rtf` (exceto `js/vendor/**`) e há um teste que falha se aparecer algum no projeto. Testes usam só arquivos fictícios gerados na hora, fora do repositório.
- **Bibliotecas:** pdf.js 4.10.38 (a 3.x tem falha de segurança conhecida, CVE-2024-4367) e mammoth 1.13.0, em `js/vendor/`, com licenças e instruções de atualização em `js/vendor/LEIA-ME.md`.
- **Testes:** unitários em `testes/regras.test.js` (validação de tipo/tamanho/nome estranho, conteúdo pelos bytes, tamanho/data, texto extraído, dados do compartilhar, ausência de PDF/Word no repositório). No navegador foram feitos com PDF/DOCX fictícios (inclusive sem texto, com senha, de 5 MB e maior que 5 MB), a 360px e 1280px, sem rolagem horizontal, sem erros no console, só requisições GET ao próprio site, e com IndexedDB indisponível.

### Reescrever currículo para a vaga (Etapa 9c)
**Adaptar para esta vaga** é uma das duas opções do **passo 1** da janela de candidatura (a outra é "Usar meu currículo como está"). Sem texto de currículo salvo: a janela explica e leva à aba "Meu currículo". Tudo no navegador; **o site não chama IA nem rede**: monta um prompt para o aluno copiar e lê a resposta que ele cola.
- **Passo 1 (prompt, `montarPromptReescrita` em `js/regras.js`):** dados da vaga (título, empresa **só para referência, a IA não deve citá-la**, área, cidade e, se houver, o assunto exigido) e o currículo entre `<<<VAGA>>>…<<<FIM_VAGA>>>` e `<<<CURRICULO>>>…<<<FIM_CURRICULO>>>`, escapados (`<<<`/`>>>` e também `===`, para o texto de alguém não fingir ser um bloco da resposta). Regras: reescrever para a **área** e o tipo da vaga; usar **SOMENTE** o que está no currículo (nada de inventar experiências, cursos, notas, empresas, datas, números, habilidades ou idiomas; faltou, não preenche); mudar resumo e objetivo para a área, reordenar experiências, linguagem da área; não citar a empresa nem falar de interesse nela; caber em **UMA página** (~450 palavras); sem markdown. Idioma: **inglês só se o assunto exigido estiver em inglês** (`idiomaDaVaga`, na dúvida português).
- **Formato da resposta** (marcadores sozinhos em uma linha, nesta ordem): `===NOME===`, `===CONTATO===`, `===RESUMO===`, `===OBJETIVO===`, `===EDUCACAO===`, `===EXPERIENCIA===`, `===HABILIDADES===`, `===IDIOMAS===`, `===LACUNAS===`. Em EDUCACAO e EXPERIENCIA os itens de lista começam com `- ` (em EXPERIENCIA, cada experiência tem uma linha de título sem `- ` seguida dos itens). LACUNAS = lista curta do que a área costuma valorizar e o currículo não mostra.
- **Passo 2 ("Montar currículo", `lerRespostaCurriculo`):** leitura **tolerante**: aceita ordem trocada, minúsculas, acento (`===EDUCAÇÃO===`), apelidos (`FORMACAO`), enfeites de markdown (`**===NOME===**`, ``` ), texto de conversa antes do primeiro marcador (ignorado) e conteúdo na mesma linha do marcador; marcador só vale **sozinho na linha** (no meio da frase é texto). Blocos ausentes/vazios não quebram: viram aviso "Estes blocos não vieram…"; marcador desconhecido (ex. `===PROJETOS===`) é ignorado com aviso e **não** vaza para o bloco anterior. Se não achar **nenhum** bloco do currículo: mostra a **resposta original** e pede para conferir o formato. Lê no máximo 30.000 caracteres.
- **Prévia (folha A4):** título (nome) centralizado em negrito, contato centralizado, seções (Resumo, Objetivo, Educação, Experiência, Habilidades, Idiomas; em inglês se a vaga pedir inglês) com título em negrito e linha inferior, Calibri/Arial 10,5pt, marcadores nas listas. É **editável** (`contenteditable`); colar ou arrastar vira só texto simples. **LACUNAS fica FORA da folha**, numa caixa "Sugestões para você avaliar (não vão para o PDF)", e nunca entra no PDF nem no "Copiar texto". Um aviso aproximado diz quando o currículo pode passar de **uma página** A4.
- **Baixar PDF** (passo 1, ao adaptar): `window.print()` com `@media print`: enquanto imprime, o `<body>` ganha a classe `imprimindo-cv`, todo o site (inclusive as janelas) fica escondido e só aparece `#area-impressao` (uma **cópia** da folha, A4, margens 15 mm/18 mm, sem borda). O `document.title` vira `CV_<Nome>_<Area>` (`nomeCurriculoPdf`, sem acento nem símbolos) e é restaurado no evento `afterprint`. Fora do botão (Ctrl+P normal) o site imprime como sempre. A tela explica: escolha "Salvar como PDF" como destino na janela de impressão. **Copiar texto** copia o que está na folha (inclusive as edições), com `- ` nos itens.
- **Segurança:** vaga, currículo e resposta da IA entram só como texto puro (`textContent`/`value`, `createElement`); nunca `innerHTML` com dado bruto. A resposta é só dado: nada é executado.
- **Testes:** unitários do prompt (marcadores e regras, inglês, sem currículo, injeção) e do parser (completa, faltando, ordem trocada, `<script>`, marcadores falsos, desconhecidos, apelidos, entradas estranhas) em `testes/regras.test.js`. No navegador (360px e 1280px) com currículo e respostas fictícios: folha, edição, colar HTML, aviso de página cheia, **mídia print** (só a área do currículo visível), **PDF gerado pelo Chromium** (1 página, só o currículo, título do arquivo certo), sem rolagem horizontal, sem erros no console e sem requisições além de GET ao próprio site.

## Janela de candidatura em passos (Etapa 10)
Um único `<dialog>` (`js/candidatura.js`) substitui as antigas janelas "Preparar candidatura" e "Reescrever currículo". Abre pelo botão do cartão ("Candidatar-se" ou "Preparar candidatura"). Cabeçalho com **cargo e empresa**, **indicador de 3 passos**, botões **Voltar / Próximo** (no passo 3, "Concluir"). Cada passo tem uma instrução de uma linha. Vagas por e-mail e vagas só com link seguem o **mesmo esqueleto de 3 passos**. Esc fecha, o foco fica preso na janela (`prenderFoco`) e volta ao botão do cartão ao fechar; no celular a janela ocupa a tela toda.
1. **Currículo.** Sem currículo salvo: explica e leva à aba "Meu currículo". Com currículo: **"Usar meu currículo como está"** (mostra o arquivo salvo e "Baixar meu currículo") ou **"Adaptar para esta vaga"** (prompt para copiar, campo para colar a resposta, "Montar currículo", folha A4 editável, LACUNAS fora da folha, "Baixar PDF" e "Copiar texto"; ver "Reescrever currículo para a vaga").
2. **E-mail** (vaga com e-mail): destinatário(s) e **assunto exigido, cada um com "Copiar"**, o prompt do e-mail e o campo para colar o texto escrito pela IA. **Resumo** (vaga só com link): o prompt do formulário (resumo + 3 pontos de ligação) e o campo para colar.
3. **Enviar.** "Confira tudo antes de enviar." Vaga com e-mail: **Escrever e-mail** (mailto com todos os destinatários, assunto e o texto; aviso de que não anexa arquivos; limite de 1800 caracteres) e "Copiar e-mail". Vaga com link: **Abrir vaga** (nova aba) e, se houver, o texto do passo 2 para copiar (vaga só com link). Sempre: **Baixar meu currículo** e **Compartilhar com anexo** (só se o navegador suportar). Se o aluno adaptou o currículo, deve anexar o PDF que baixou no passo 1 (o site não guarda o PDF adaptado).
- Vaga **sem forma de candidatura** não tem botão no cartão, logo não abre esta janela.
- Navegar entre passos nunca apaga o que foi digitado; fechar a janela descarta o que foi colado nela (o currículo salvo no perfil continua).

## Visual (Etapa 10)
`css/estilo.css` é um sistema de design simples: **variáveis** no topo (cores de fundo, texto, texto secundário, borda e **uma cor de destaque**; espaçamentos `--e1`…`--e7`; tamanhos de texto `--t-*`; cantos `--r-*`; altura mínima de toque `--altura-toque: 44px`). Fonte do sistema (nada de fontes ou imagens externas; um teste confere). Contraste mínimo AA (conferido no navegador nos modos claro e escuro), foco visível, links "Ir para a lista de vagas", `prefers-color-scheme: dark` (modo escuro) e `prefers-reduced-motion` (sem animações). Celular: uma coluna, margens de 16px, botões e campos com pelo menos 44px; desktop: lista em 2 colunas e perfil como painel lateral. Para mudar a cara do site, mexa primeiro nas variáveis.

## Regra do projeto sobre conteúdo das vagas
**Nunca copiar a descrição completa das vagas.** Guardar só os dados básicos acima, o link da vaga original e, quando a vaga pedir envio de CV por e-mail, o e-mail e o assunto indicados por ela (e só esses). A candidatura sempre acontece na página original, e a fonte é sempre indicada no cartão.

## Como cadastrar uma vaga
1. Encontre a vaga no site de origem (LinkedIn, Polifinance, site da empresa...) e deixe a página aberta.
2. Abra `adicionar.html` no navegador (duplo clique). Ela não tem link no site público; é uma ferramenta só para quem edita.
3. Preencha os campos (título, empresa, área, cidade, tipo de empresa, modalidade (só se a vaga informar), fonte, link, e-mail(s) e assunto de candidatura, datas; link, e-mail, assunto e prazo podem ficar vazios; vários e-mails: separe por vírgula, ponto e vírgula ou espaço, e o formulário gera a lista), clique em **Gerar texto** e depois em **Copiar texto**. O formulário já cuida de aspas e vírgulas.
4. Abra `data/vagas.js` no editor e cole o texto **antes** do `];` final, depois da última vaga.
5. **Confira os links** (ver "Regra permanente" abaixo: aqui no Code a rede é bloqueada, a verificação real é feita pelo workflow).
6. Salve, abra `index.html` e confira o cartão e o botão "Ver vaga e se candidatar" (vaga sem link fica sem botão).
7. Publique: `git add .`, `git commit -m "Adiciona vagas"` e `git push` na `main`. O GitHub Pages atualiza o site em cerca de 1 a 3 minutos.

Vagas manuais que saíram do ar na fonte original devem ser removidas de `data/vagas.js` (as demais somem sozinhas pelas regras da seção anterior).

## Regra permanente: verificação de links
**O ambiente do Claude Code bloqueia a rede e não consegue testar links** (os sites das vagas e a API do Greenhouse são bloqueados). A verificação real acontece no workflow do GitHub. Por isso, sempre que o João pedir para adicionar vagas:
1. **Nunca diga que um link foi testado, ou que funciona, se o teste foi bloqueado** (ou nem foi feito). Diga "sem teste".
2. Avise sempre, ao entregar: "A verificação real acontece no workflow do GitHub: rode **Actions > Atualizar vagas > Run workflow** e confira o bloco **RESUMO** do passo **Verificar links**."
3. Se o João disser que já testou os links, aceite e registre isso; se um teste for possível de verdade (rede liberada), faça um GET em cada link novo antes do commit e informe o resultado de cada um.
4. Não publique vaga que se saiba estar com link quebrado (404, 410, DNS inexistente) ou com inscrições encerradas; avise o João e deixe a vaga de fora.
5. Vaga sem link não precisa de teste. 403, 429, erro 5xx ou timeout significam "não verificado", não "quebrado".

## Como funciona a atualização automática
O workflow `.github/workflows/atualizar-vagas.yml` roda todo dia às 8h (Brasília) e também manualmente (aba **Actions** > **Atualizar vagas** > **Run workflow**). Ele executa `atualizar-vagas.js`, depois `verificar-links.js`, e só faz commit se algum arquivo em `data/` mudou. Para rodar no computador: `node scripts/atualizar-vagas.js` e `node scripts/verificar-links.js` (Node 18 ou mais novo).

### Como adicionar uma empresa nova em `scripts/fontes.json`
A empresa precisa usar o Greenhouse para as vagas. O "token" é a última parte do endereço do quadro de vagas dela (`boards.greenhouse.io/TOKEN`, `job-boards.greenhouse.io/TOKEN`). Confirme abrindo `https://boards-api.greenhouse.io/v1/boards/TOKEN/jobs` no navegador: deve aparecer um texto com `"jobs": [...]`. Depois acrescente um bloco ao arquivo (vírgula entre os blocos):
```json
{
  "empresa": "Nome da Empresa",
  "greenhouse": "token-da-empresa",
  "tipoEmpresa": "Banco",
  "area": "Diversas",
  "fonte": "Site da empresa",
  "ignorarIds": []
}
```
- `empresa`: nome que aparece no cartão. `tipoEmpresa`: Banco, Corretora, Gestora, Fintech, Consultoria, Seguradora ou Outro. `area` e `fonte`: valores usados nos filtros.
- O script guarda só vagas cujo título tenha "estágio", "estagiário(a)", "internship" ou "summer job" (sem diferenciar maiúsculas ou acentos), e nunca guarda a descrição.
- Ele **ignora** títulos que contenham "2026.1" (ciclo antigo) e vagas cujo ID esteja em `ignorarIds`. O ID é o número no fim do endereço da vaga (`.../jobs/8805413002` tem ID `8805413002`). Exemplo: `"ignorarIds": ["8805413002", "8680906002"]`. `ignorarIds` é opcional e vale só para a empresa em que está escrito.
- Para parar de buscar uma empresa, remova o bloco: as vagas dela saem de `vagas-auto.js` na próxima atualização.
- Se uma empresa falhar (site fora do ar, token errado), as vagas que já existiam dela são mantidas e o log mostra `FALHA`.

### Verificação de links (`scripts/verificar-links.js`)
Confere cada vaga **com link**, manual ou automática, que ainda não venceu (vagas de exemplo e sem link são ignoradas). **Só o campo `link` é verificado: `emailCandidatura` (texto ou lista) e `assuntoEmail` nunca são acessados** (há teste para isso). Faz um GET (limite de 15 s, identificando-se como navegador):
- **Falha:** HTTP 404 ou 410; endereço (DNS) inexistente; página com status 200 que contenha "expirad", "encerrad", "não está mais disponível", "no longer available", "page not found" ou "job not found" (scripts e estilos da página são ignorados); ou redirecionamento do Greenhouse para a página de erro (`error=true`).
- **Não verificado** (não conta como falha): 403, 429, erros 5xx, timeout, outros status inesperados e erros de rede. 
- **Ok:** o resto.
- **Histórico** em `data/status-links.json`, por link: data da última checagem, resultado, motivo e `falhasConsecutivas`. Uma falha conta no máximo uma vez por dia. Com **2 falhas em dias diferentes** a vaga fica inativa e o site deixa de mostrá-la; um resultado "ok" zera a contagem e reativa a vaga. "Não verificado" não altera a contagem.
- Se o servidor não conseguir abrir nem o site de controle (github.com), o script avisa "SEM REDE", não verifica nada e não altera o histórico (para uma queda de internet não esconder todas as vagas).
- No fim, o log mostra o resumo (quantos ok, com falha e não verificados), lista as vagas com falha e as que ficaram inativas ou foram reativadas.
- Cuidado: frases como "encerrad" podem aparecer em páginas de vagas abertas (por exemplo, "processos encerrados"). Se uma vaga boa for escondida por engano, remova a frase suspeita da lista `FRASES_ENCERRADA` no script ou me avise.

### Se o workflow não aparecer ou não rodar
- O agendamento (`schedule`) **só roda a partir da branch padrão** do repositório. Ela precisa ser a `main` (Settings > Branches > Default branch).
- Para o workflow poder gravar commits: Settings > Actions > General > Workflow permissions > **Read and write permissions**.
- Se a `main` tiver proteção de branch (exigir pull request), o commit automático será recusado.

## Plano em etapas (cada uma só termina quando o critério "pronto" é atendido)
1. **Lista de vagas com filtros** — pronto quando: abre ≥10 vagas de exemplo; filtro por área e por cidade funcionam (juntos ou separados); mostra mensagem se nada for encontrado; botão "limpar filtros".
2. **Visual e celular** — pronto quando: layout legível em tela de 360px e de desktop; sem rolagem horizontal.
3. **Publicar** — pronto quando: site acessível por link público do GitHub Pages.
4. **Busca por texto e página de detalhe da vaga** — pronto quando: busca por palavra-chave filtra título/empresa; clicar numa vaga mostra detalhes.
5. **Vagas reais, mantidas à mão** — pronto quando: ≥20 vagas reais com link de candidatura válido e data de publicação; vagas antigas somem ou são marcadas. (Em andamento: 24 vagas reais cadastradas em 01/10/2026, a maioria da Polifinance e sem link. Infraestrutura pronta: campos `fonte`, `link` e `prazoInscricao`, filtro por fonte, `adicionar.html`.)
5b. **Atualização automática e verificação de links** — pronto quando: o workflow roda sozinho todo dia, atualiza `data/vagas-auto.js` (Greenhouse), registra `data/status-links.json` e o site esconde vagas vencidas ou com link quebrado.
6. **Personalização por interesses** — pronto quando: o painel "Meu perfil" (áreas, cidades, tipos, palavras-chave) fica salvo no localStorage sem quebrar se ele estiver bloqueado; a lista ordena por relevância (pontuação testada em `testes/`), com selo "Combina com você" e ordenação por relevância, mais recentes ou prazo; nada é enviado a servidor.
6b. **Nome e modalidade no perfil** — pronto quando: o nome opcional aparece na saudação do topo (texto puro, até 60 caracteres); a modalidade preferida soma +2 sem prejudicar vagas sem esse dado (o filtro opcional da 6b foi substituído pelo filtro por grupo da 6c); "Limpar meu perfil" apaga tudo do navegador.
6c. **Filtro de verdade a partir do perfil, com categorias de área** — pronto quando: o perfil escolhe categorias (mapa área → categoria em `js/regras.js`, com "Diversas" compatível com todas e selo "Várias áreas"); cada grupo marcado filtra a lista (e entre grupos, ou dentro do grupo; sem modalidade informada continua aparecendo); a faixa "Filtrando por" tem "Mostrar todas as vagas"/"Voltar a filtrar"; o estado vazio tem botão; combina com os filtros da página; palavras-chave só pontuam.
7. **Candidatura por e-mail** — pronto quando: vagas que pedem CV por e-mail mostram o e-mail com "Copiar e-mail" e "Escrever e-mail" (e assunto, se houver); o verificador de links ignora e-mails; `adicionar.html` gera os dois campos. (Extensão: `emailCandidatura` aceita também uma lista de e-mails, cada um com "Copiar e-mail" e um "Escrever e-mail" com todos os destinatários.)
8. **Evolução (só se necessário)** — favoritos (localStorage), formulário de envio de vaga, backend/banco (ex.: Supabase) apenas se o arquivo de vagas deixar de bastar.
9. **Meu currículo no navegador + "Preparar candidatura"** — pronto quando: o currículo (até 15.000 caracteres) fica só no `localStorage`; exportar/importar perfil funciona e recusa arquivos inválidos; "Preparar candidatura" gera o prompt (e-mail ou formulário) e abre o e-mail com o texto colado; "Limpar meu perfil" apaga o currículo; nada é enviado a servidor; testes só com currículo fictício.
9b. **Anexar currículo em PDF ou Word** — pronto quando: aceita .pdf/.docx até 5 MB e recusa o resto com mensagem; extrai o texto no navegador (sem CDN, sem rede) e pergunta antes de substituir; avisa em PDF sem texto/com senha sem travar; guarda o arquivo no IndexedDB (com aviso se indisponível) e "Limpar meu perfil" o apaga; a janela "Preparar candidatura" tem Baixar meu currículo, Compartilhar com anexo (se suportado) e o aviso sobre anexo; testes só com arquivos fictícios.
9c. **Reescrever currículo para a vaga** — pronto quando: o botão aparece em todo cartão e na janela de candidatura; o prompt (testado) usa só o currículo, com blocos marcados e escapados; "Montar currículo" lê a resposta com tolerância, avisa o que faltou e mostra a folha A4 editável com as LACUNAS fora dela; "Baixar PDF" imprime só a folha, com o título do arquivo `CV_<Nome>_<Area>`; nada é enviado a servidor; testes só com dados fictícios.
10. **Redesign: site mais limpo e candidatura guiada** — pronto quando: o site se chama Largada Fin (nome definido só em `js/marca.js`); a tela principal tem busca, 3 filtros rápidos, "Mais filtros", resumo, ordenador e etiquetas removíveis; o perfil é um painel com duas abas; cada cartão tem um único botão principal e o prazo em destaque; a candidatura é uma janela em 3 passos; nenhuma função anterior foi perdida; visual com variáveis, modo escuro, foco visível e movimento reduzido; testado a 360, 768 e 1280px; tag git `pre-redesign` no commit anterior (35dca29).

## Convenções
- Uma etapa por vez; não antecipar funcionalidades das etapas seguintes.
- O nome do site é escrito **só em `js/marca.js`** (mais os textos de reserva do HTML, conferidos por teste).
- Código com comentários curtos em português explicando o que cada bloco faz.
- Nomes de arquivos, variáveis e campos dos dados em português, sem acentos.
- Vagas fictícias de teste, se algum dia forem necessárias, devem ter `exemplo: true` e link `example.com`, e ser removidas antes de publicar.
- Antes de adicionar qualquer biblioteca ou ferramenta, justificar por que o JS puro não resolve.
