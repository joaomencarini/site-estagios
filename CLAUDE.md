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
│   ├── regras.js       # regras de expiração e de link inativo (usadas pelo site E pelos scripts)
│   ├── app.js          # junta as vagas, esconde as vencidas/inativas, aplica filtros, desenha os cards
│   └── adicionar.js    # lógica do formulário adicionar.html
└── data/
    ├── vagas.js          # vagas MANUAIS (você edita; uma por bloco { ... },)
    ├── vagas-auto.js     # vagas AUTOMÁTICAS (gerado pelo script; não edite)
    ├── status-links.json # histórico da verificação de links (gerado pelo script)
    └── status-links.js   # cópia do anterior para o site ler (gerado; o site não consegue ler .json direto do computador)
```

## Modelo de dados de uma vaga
Campos em `data/vagas.js` (datas sempre `AAAA-MM-DD`):
- `titulo`, `empresa`
- `area`: texto livre (ex.: Investimentos, Investment Banking, Risco, Asset Management, Operações). O filtro de área lista automaticamente as áreas que existirem nas vagas.
- `cidade`
- `tipoEmpresa`: Banco, Corretora, Gestora, Fintech, Consultoria, Seguradora ou Outro
- `fonte`: onde a vaga foi encontrada (ex.: "LinkedIn", "Polifinance", "Site da empresa")
- `link` (opcional): endereço da vaga original (precisa começar com `http://` ou `https://`). **Sem link**, o cartão não mostra botão nem aviso. Para vagas sem link, simplesmente não escreva a linha `link`.
- `emailCandidatura` (opcional): e-mail para onde enviar o CV, nas vagas que não têm página de candidatura. O cartão mostra "Enviar CV para: <e-mail>" com os botões **Copiar e-mail** e **Escrever e-mail** (abre o programa de e-mail do aluno via `mailto:`). Só aparece se o e-mail tiver formato seguro (sem espaços e sem `< > " ' , ; ? & # ( ) / \`); caso contrário é ignorado.
- `assuntoEmail` (opcional, só vale junto com `emailCandidatura`): assunto sugerido. O cartão mostra "Assunto: ..." com o botão **Copiar assunto**, e o botão "Escrever e-mail" já abre o e-mail com esse assunto (acentos, espaços, `|` e `&` são codificados).
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

## Regra do projeto sobre conteúdo das vagas
**Nunca copiar a descrição completa das vagas.** Guardar só os dados básicos acima, o link da vaga original e, quando a vaga pedir envio de CV por e-mail, o e-mail e o assunto indicados por ela (e só esses). A candidatura sempre acontece na página original, e a fonte é sempre indicada no cartão.

## Como cadastrar uma vaga
1. Encontre a vaga no site de origem (LinkedIn, Polifinance, site da empresa...) e deixe a página aberta.
2. Abra `adicionar.html` no navegador (duplo clique). Ela não tem link no site público; é uma ferramenta só para quem edita.
3. Preencha os campos (título, empresa, área, cidade, tipo de empresa, fonte, link, e-mail e assunto de candidatura, datas; link, e-mail, assunto e prazo podem ficar vazios), clique em **Gerar texto** e depois em **Copiar texto**. O formulário já cuida de aspas e vírgulas.
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
Confere cada vaga **com link**, manual ou automática, que ainda não venceu (vagas de exemplo e sem link são ignoradas). **Só o campo `link` é verificado: `emailCandidatura` e `assuntoEmail` nunca são acessados** (há teste para isso). Faz um GET (limite de 15 s, identificando-se como navegador):
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
6. **Evolução (só se necessário)** — favoritos (localStorage), formulário de envio de vaga, backend/banco (ex.: Supabase) apenas se o arquivo de vagas deixar de bastar.
7. **Candidatura por e-mail** — pronto quando: vagas que pedem CV por e-mail mostram o e-mail com "Copiar e-mail" e "Escrever e-mail" (e assunto, se houver); o verificador de links ignora e-mails; `adicionar.html` gera os dois campos.

## Convenções
- Uma etapa por vez; não antecipar funcionalidades das etapas seguintes.
- Código com comentários curtos em português explicando o que cada bloco faz.
- Nomes de arquivos, variáveis e campos dos dados em português, sem acentos.
- Vagas fictícias de teste, se algum dia forem necessárias, devem ter `exemplo: true` e link `example.com`, e ser removidas antes de publicar.
- Antes de adicionar qualquer biblioteca ou ferramenta, justificar por que o JS puro não resolve.
