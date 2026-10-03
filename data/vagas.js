// ============================================================
// LISTA DE VAGAS DO SITE
//
// Como cadastrar: abra adicionar.html, preencha o formulário, copie o texto
// gerado e cole AQUI, antes do "];" da última linha. Passo a passo completo
// no arquivo CLAUDE.md.
//
// REGRA: coloque só os dados básicos e o link da vaga original.
// Nunca copie a descrição completa da vaga.
//
// Campos de cada vaga:
//   titulo, empresa, area, cidade, tipoEmpresa, fonte, dataPublicacao
//   link (opcional): endereço da vaga original. Sem link, o cartão fica sem o botão.
//   modalidade (opcional): "presencial", "hibrido" ou "remoto". Só preencha se a própria vaga informar.
//     NUNCA presuma nem invente. Sem esse campo, a vaga aparece normalmente (sem selo de modalidade).
//   emailCandidatura (opcional): e-mail para enviar o CV. Pode ser UM texto ("a@empresa.com") ou uma LISTA
//     (["a@empresa.com", "b@empresa.com"]). Cada e-mail é validado; os inválidos são ignorados. O cartão mostra
//     "Enviar CV para: ..." com um "Copiar e-mail" por endereço e o botão "Escrever e-mail", que abre o programa
//     de e-mail com TODOS os destinatários válidos.
//   assuntoEmail (opcional, só com emailCandidatura): assunto sugerido; o cartão mostra "Assunto: ..."
//     com o botão "Copiar assunto" e já usa o assunto ao escrever o e-mail.
//   Se houver link e e-mail, o cartão mostra os dois. Sem nenhum dos dois, fica sem botão.
//   prazoInscricao (opcional): a vaga some no dia seguinte a essa data.
//     Sem prazo, a vaga some 45 dias depois da data de publicação.
//   exemplo: true (opcional, só para vagas de teste): mostra o selo "EXEMPLO".
//   Datas sempre no formato AAAA-MM-DD (ex.: 2026-10-15).
// ============================================================
const vagas = [
  {
    titulo: "Programa de Estágio XTAG 2027",
    empresa: "XP Inc.",
    area: "Diversas (Investment Banking, Research, Risco, Asset)",
    cidade: "São Paulo",
    tipoEmpresa: "Corretora",
    fonte: "Site da empresa",
    link: "https://job-boards.greenhouse.io/candidaturasdirecionadasxpinc/jobs/8805413002",
    dataPublicacao: "2026-10-01",
    prazoInscricao: "2026-10-13"
  },
  {
    titulo: "Programa de Estágio 2027",
    empresa: "Banco ABC Brasil",
    area: "Mercado de Capitais",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "Site da empresa",
    link: "https://www.ciadeestagios.com.br/vagas/bancoabcbrasil/",
    dataPublicacao: "2026-10-01"
  },
  {
    titulo: "Estágio em Investments",
    empresa: "Solen Software Group",
    area: "Investimentos",
    cidade: "São Paulo",
    tipoEmpresa: "Outro",
    fonte: "Polifinance",
    link: "https://mailing-polifinance.github.io/banner3669.html",
    dataPublicacao: "2026-09-30",
    prazoInscricao: "2026-11-01"
  },
  {
    titulo: "Estágio em Capital Solutions",
    empresa: "Ártica",
    area: "Capital Solutions",
    cidade: "São Paulo",
    tipoEmpresa: "Outro",
    fonte: "Polifinance",
    link: "https://vagas.artica.capital/",
    dataPublicacao: "2026-09-29",
    prazoInscricao: "2026-10-23"
  },
  {
    titulo: "Estágio em Investment Banking",
    empresa: "Banco Safra",
    area: "Investment Banking",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "Polifinance",
    link: "https://mailing-polifinance.github.io/banner3664.html",
    dataPublicacao: "2026-09-29",
    prazoInscricao: "2026-10-02"
  },
  {
    titulo: "Estágio ou Estágio de Férias em DCM",
    empresa: "BR Partners",
    area: "DCM",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "Polifinance",
    link: "https://www.portalsinergyrh.com.br/Portal/MeuPortal/MeuPortal?empresa=1600&master=0",
    dataPublicacao: "2026-09-29"
  },
  {
    titulo: "Estágio em Asset Management",
    empresa: "GCB Investimentos",
    area: "Asset Management",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    link: "https://grupogcbinvestimentos.inhire.app/vagas/6a544b6c-849e-4bfb-9aa5-713481288240/estagio-asset-management",
    dataPublicacao: "2026-09-28"
  },
  {
    titulo: "Estágio em Middle Office",
    empresa: "Lakewood Investment Management",
    area: "Middle Office",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    link: "https://mailing-polifinance.github.io/banner3666.html",
    dataPublicacao: "2026-09-28"
  },
  {
    titulo: "Estágio em Operações",
    empresa: "Sinai Asset",
    area: "Operações",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    link: "https://mailing-polifinance.github.io/banner3655.html",
    dataPublicacao: "2026-09-28"
  },
  {
    titulo: "Estágio em Mesa de Operações",
    empresa: "WHG",
    area: "Tesouraria",
    cidade: "São Paulo",
    tipoEmpresa: "Outro",
    fonte: "Polifinance",
    link: "https://mailing-polifinance.github.io/banner3654.html",
    dataPublicacao: "2026-09-25"
  },
  {
    titulo: "Estágio em Project Finance",
    empresa: "Banco BV",
    area: "Project Finance",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "Polifinance",
    link: "https://mailing-polifinance.github.io/banner3659.html",
    dataPublicacao: "2026-09-25"
  },
  {
    titulo: "Estágio em Risco",
    empresa: "Ativa Investimentos",
    area: "Risco",
    cidade: "São Paulo",
    tipoEmpresa: "Corretora",
    fonte: "Polifinance",
    link: "https://jobs.quickin.io/ativainvestimentos/jobs/6aaab6a0f62a2400138d40f8",
    dataPublicacao: "2026-09-25"
  },
  {
    titulo: "Estágio em Special Situations",
    empresa: "Alinea Capital",
    area: "Special Situations",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    link: "https://mailing-polifinance.github.io/banner3656.html",
    dataPublicacao: "2026-09-24"
  },
  {
    titulo: "Estágio em Infraestrutura",
    empresa: "Kinea Investimentos",
    area: "Infraestrutura",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    link: "https://mailing-polifinance.github.io/banner3651.html",
    dataPublicacao: "2026-09-24"
  },
  {
    titulo: "Estágio ou Analista Jr. em Asset Management",
    empresa: "Verde Asset Management",
    area: "Asset Management",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    link: "https://mailing-polifinance.github.io/banner3645.html",
    dataPublicacao: "2026-09-24"
  },
  {
    titulo: "Estágio em Investimentos",
    empresa: "H2 Kapital",
    area: "Investimentos",
    cidade: "São Paulo",
    tipoEmpresa: "Outro",
    fonte: "Polifinance",
    link: "https://mailing-polifinance.github.io/banner3647.html",
    dataPublicacao: "2026-09-23"
  },
  {
    titulo: "Estágio em Equities",
    empresa: "AZ Quest",
    area: "Research",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    link: "https://mailing-polifinance.github.io/banner3640.html",
    dataPublicacao: "2026-09-23"
  },
  {
    titulo: "Estágio em Asset Management",
    empresa: "Kapitalo Investimentos",
    area: "Asset Management",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    link: "https://mailing-polifinance.github.io/banner3649.html",
    dataPublicacao: "2026-09-23"
  },
  {
    titulo: "Estágio em Investment Solutions",
    empresa: "SulAmérica Investimentos",
    area: "Investimentos",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    link: "https://mailing-polifinance.github.io/banner3642.html",
    dataPublicacao: "2026-09-23"
  },
  {
    titulo: "Estágio em Operations",
    empresa: "Sten Multi-Family Office",
    area: "Operações",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    emailCandidatura: "isabela.ghirali@sten-mfo.com",
    assuntoEmail: "Estágio Operations - Nome do Candidato",
    dataPublicacao: "2026-09-22"
  },
  {
    titulo: "Estágio em Crédito",
    empresa: "V8 Capital",
    area: "Crédito",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    emailCandidatura: "selecaodevantrh@gmail.com",
    dataPublicacao: "2026-09-21"
  },
  {
    titulo: "Estágio em M&A",
    empresa: "Agibank",
    area: "M&A",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "Polifinance",
    emailCandidatura: "corp.dev@agi.com.br",
    assuntoEmail: "Estagiário(a) de M&A | (Nome Completo)",
    dataPublicacao: "2026-09-21"
  },
  {
    titulo: "Estágio de Investimentos",
    empresa: "RPA Capital",
    area: "Investimentos",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    link: "https://mailing-polifinance.github.io/banner3644.html",
    emailCandidatura: "henrique.watanabe@rpacapital.com",
    dataPublicacao: "2026-09-23"
  },
  {
    titulo: "Estágio em M&A",
    empresa: "Banco Haitong",
    area: "M&A",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "Polifinance",
    emailCandidatura: "acenturione@haitongib.com.br",
    assuntoEmail: "Estágio M&A",
    dataPublicacao: "2026-10-01"
  },
  {
    titulo: "Estágio em Investment Banking",
    empresa: "Santander",
    area: "Investment Banking",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "Polifinance",
    emailCandidatura: [
      "lauren.wang@santander.com.br",
      "jose.fachim@santander.com.br",
      "eduardo.vescovi@santander.com.br",
      "joao.skowronski@santander.com.br"
    ],
    assuntoEmail: "Investment Banking Internship - Full Name (University)",
    dataPublicacao: "2026-10-01",
    prazoInscricao: "2026-10-25"
  },
  {
    titulo: "Estágio em Fund Management",
    empresa: "BlueOak Investments",
    area: "Fund Management",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    emailCandidatura: "carreira@blueoak.com.br",
    assuntoEmail: "(NOME COMPLETO) - Vaga Estagiário Fund Mgmt BlueOak",
    dataPublicacao: "2026-10-01"
  },
  {
    titulo: "Estágio em Credit Research",
    empresa: "XP Inc.",
    area: "Credit Research",
    cidade: "São Paulo",
    tipoEmpresa: "Corretora",
    fonte: "Polifinance",
    emailCandidatura: "lucas.macchi@xpi.com.br",
    assuntoEmail: "Estágio Credit Research",
    dataPublicacao: "2026-10-02"
  },
  {
    titulo: "Estágio em Securitização & Renda Fixa",
    empresa: "VERT Capital",
    area: "Securitização & Renda Fixa",
    cidade: "São Paulo",
    tipoEmpresa: "Outro",
    fonte: "Polifinance",
    link: "https://vert-capital.gupy.io/jobs/11548820",
    dataPublicacao: "2026-10-02",
    prazoInscricao: "2026-10-07"
  },
  {
    titulo: "Estágio em Multi Family Office",
    empresa: "Bradesco",
    area: "Multi Family Office",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "Polifinance",
    emailCandidatura: [
      "gustavo.castro@bradesco.com.br",
      "pedro.p.rodrigues@bradesco.com.br"
    ],
    assuntoEmail: "Estágio Consolidação - (Nome do Candidato)",
    dataPublicacao: "2026-10-02",
    prazoInscricao: "2026-10-15"
  },
  {
    titulo: "Global Wealth Management - Business Risk Intern",
    empresa: "UBS",
    area: "Risco / Wealth Management",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "LinkedIn",
    link: "https://www.linkedin.com/jobs/view/4473392575",
    dataPublicacao: "2026-10-03"
  },
  {
    titulo: "Estagiário de Crédito",
    empresa: "Grupo Yamaha Brasil",
    area: "Crédito",
    cidade: "São Paulo",
    tipoEmpresa: "Outro",
    fonte: "LinkedIn",
    link: "https://www.linkedin.com/jobs/view/4471782487",
    dataPublicacao: "2026-09-30"
  },
  {
    titulo: "Estágio em Suporte à Diretoria e Operacional",
    empresa: "BTG Pactual",
    area: "Suporte à Diretoria e Operacional",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "LinkedIn",
    link: "https://www.linkedin.com/jobs/view/4466419671",
    dataPublicacao: "2026-10-03"
  },
];
