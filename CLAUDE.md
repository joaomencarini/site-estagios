# Site de Estágios no Mercado Financeiro

## O que é
Site para ajudar universitários brasileiros a encontrar estágios no mercado financeiro (bancos, corretoras, gestoras, fintechs, consultorias). O site é uma **vitrine de links**: lista dados básicos de cada vaga (com filtros por **área**, **cidade** e **fonte**) e leva o aluno à página original para se candidatar.

## Contexto do autor
Iniciante em programação. Regra de ouro: **simplicidade acima de tudo**. Nada de frameworks, build steps ou dependências sem necessidade clara. Explicar o "porquê" de cada escolha em linguagem simples. Idioma do site e dos textos: português do Brasil.

## Stack (tudo gratuito)
- **HTML + CSS + JavaScript puro** — sem framework, sem build; abre direto no navegador.
- **Vagas em `data/vagas.js`** — dados separados do código, editáveis à mão, sem banco de dados. É `.js` (lista `vagas`) para o site funcionar abrindo o `index.html` direto, sem servidor.
- **Git + GitHub** — versionamento.
- **Scripts em Node.js (sem dependências)** em `scripts/` — atualizam vagas automaticamente e conferem links. Só rodam no GitHub Actions (ou no seu computador); o site em si continua sendo HTML/CSS/JS puro.
- **localStorage do navegador** — guarda o "Meu perfil" (interesses) só no aparelho de quem usa; sem login, sem backend e sem enviar nada a servidor.
- **GitHub Actions** — executa os scripts todo dia às 8h (Brasília) e faz commit se houver mudança.
- **GitHub Pages** — hospedagem gratuita, publicada a partir da branch `main` (pasta raiz). Endereço: https://joaomencarini.github.io/site-estagios/
- **Editor (VS Code)** — opcional: a extensão Live Server recarrega a página ao salvar.

## Estrutura de pastas
```
site-estagios/
├── CLAUDE.md
├── README.md
├── .nojekyll           # faz o GitHub Pages publicar os arquivos como estão
├── .github/workflows/
│   └── atualizar-vagas.yml   # roda os scripts todo dia às 8h (Brasília) e também sob demanda
├── scripts/
│   ├── fontes.json           # lista de empresas (Greenhouse) para buscar vagas
│   ├── atualizar-vagas.js    # busca vagas e gera data/vagas-auto.js
│   ├── verificar-links.js    # confere os links e gera data/status-links.json
│   └── util.js               # funções pequenas usadas pelos dois scripts
├── index.html          # página principal (lista de vagas + filtros)
├── adicionar.html      # formulário que gera o texto de uma vaga para colar em vagas.js
├── css/
│   └── estilo.css
├── js/
│   ├── regras.js       # regras de expiração, link inativo, e-mail, pontuação/ordenação por perfil (usadas pelo site, pelos scripts e pelos testes)
│   ├── app.js          # junta as vagas, esconde as vencidas/inativas, aplica filtros, desenha os cards
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

**Formas de candidatura no cartão:** só `link` = botão "Ver vaga e se candidatar"; só `emailCandidatura` = bloco de e-mail; os dois = os dois (botão do link primeiro); nenhum = sem botão e sem aviso. O texto da vaga é sempre escrito como texto puro (`textContent`), nunca com `innerHTML`.

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
O painel **Meu perfil** (no alto de `index.html`) deixa o usuário dizer o que procura: a lista **filtra** pelo que foi marcado e mostra primeiro as vagas mais relevantes. É feito só no navegador: **sem login, sem backend, nada é enviado a servidor e nada é coletado** (há uma linha dizendo isso no rodapé, inclusive sobre o nome). Não envie, registre nem cole esses dados em lugar nenhum.

- **O que o usuário informa:** nome opcional; **categorias de área** (ver "Categorias de área"; só aparecem as que existem nas vagas ativas), **cidades** e **tipos de empresa** (valores que existem nas vagas ativas); **modalidade** preferida (Presencial, Híbrido, Remoto; lista fixa); palavras-chave opcionais separadas por vírgula (ex.: `M&A, valuation`). Opções salvas que já não existem nas vagas continuam aparecendo (marcadas) para poderem ser desmarcadas.
- **Filtro (cada grupo marcado filtra):** a vaga precisa bater em **pelo menos uma opção de cada grupo marcado** (categorias, cidades, tipos, modalidade): "ou" dentro do grupo, "e" entre grupos. **Grupo sem nada marcado não filtra.** Exceções: vaga de área **"Diversas" passa em qualquer categoria** (mas ainda precisa bater nos outros grupos marcados); vaga **sem modalidade informada continua aparecendo**, com a indicação "Modalidade não informada" (a indicação só aparece enquanto o filtro está valendo). **Palavras-chave e nome NÃO filtram.**
- **Faixa acima da lista:** com algum grupo marcado aparece "Filtrando por: <categorias, cidades, tipos, modalidades> · N vagas" com o botão **Mostrar todas as vagas** (desliga o filtro sem apagar o perfil: caixas, pontuação e selos continuam). Desligado, a faixa diz "Filtro do perfil desligado · N vagas" e o botão vira **Voltar a filtrar**. O desligamento vale só nesta visita (não é guardado) e o filtro volta sozinho ao mudar qualquer categoria, cidade, tipo ou modalidade. Se nada bater: "Nenhuma vaga com esses critérios" com o botão **Mostrar todas as vagas**.
- **Ordem de aplicação:** 1) vagas ativas (não vencidas, link não quebrado, sem duplicata); 2) **filtros da página** (Área, Cidade, Fonte; a área aqui é a área crua da vaga); 3) **filtro do perfil**; 4) **ordenação** (relevância, mais recentes ou prazo) sobre o que sobrou; 5) selos. Os filtros da página e o do perfil **combinam** (interseção).
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

## Convenções
- Uma etapa por vez; não antecipar funcionalidades das etapas seguintes.
- Código com comentários curtos em português explicando o que cada bloco faz.
- Nomes de arquivos, variáveis e campos dos dados em português, sem acentos.
- Vagas fictícias de teste, se algum dia forem necessárias, devem ter `exemplo: true` e link `example.com`, e ser removidas antes de publicar.
- Antes de adicionar qualquer biblioteca ou ferramenta, justificar por que o JS puro não resolve.
