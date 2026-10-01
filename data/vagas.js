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
//   link: endereço da vaga original. Se faltar, o cartão mostra o aviso de candidatura por e-mail.
//   prazoInscricao (opcional): depois dessa data a vaga some sozinha do site.
//   exemplo: true (opcional, só para vagas de teste): mostra o selo "EXEMPLO".
//   Datas sempre no formato AAAA-MM-DD (ex.: 2026-10-15).
// ============================================================
const vagas = [
  {
    titulo: "Estágio em Investment Banking",
    empresa: "Bank of America",
    area: "Investment Banking",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "Site da empresa",
    link: "https://careers.bankofamerica.com/en-us/students/job-detail/13192/2026-brazil-investment-banking-internship-program-sao-paulo-brazil",
    dataPublicacao: "2026-10-01",
    prazoInscricao: "2027-01-01"
  },
  {
    titulo: "Programa de Estágio XTAG 2027",
    empresa: "XP Inc.",
    area: "Diversas (Investment Banking, Research, Risco, Asset)",
    cidade: "São Paulo",
    tipoEmpresa: "Corretora",
    fonte: "Site da empresa",
    link: "https://lp.xpi.com.br/programa_de_estagio",
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
    titulo: "Estágio de Férias (jan-fev/2027)",
    empresa: "BTG Pactual",
    area: "Diversas",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "Site da empresa",
    link: "https://conteudo.btgpactual.com/estagio-de-ferias",
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
    dataPublicacao: "2026-09-29"
  },
  {
    titulo: "Estágio em Investment Banking",
    empresa: "Banco Safra",
    area: "Investment Banking",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-29"
  },
  {
    titulo: "Estágio ou Estágio de Férias em DCM",
    empresa: "BR Partners",
    area: "DCM",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-29"
  },
  {
    titulo: "Estágio em Asset Management",
    empresa: "GCB Investimentos",
    area: "Asset Management",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-28"
  },
  {
    titulo: "Estágio em Middle Office",
    empresa: "Lakewood Investment Management",
    area: "Middle Office",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-28"
  },
  {
    titulo: "Estágio em Operações",
    empresa: "Sinai Asset",
    area: "Operações",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-28"
  },
  {
    titulo: "Estágio em Mesa de Operações",
    empresa: "WHG",
    area: "Tesouraria",
    cidade: "São Paulo",
    tipoEmpresa: "Outro",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-25"
  },
  {
    titulo: "Estágio em Project Finance",
    empresa: "Banco BV",
    area: "Project Finance",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-25"
  },
  {
    titulo: "Estágio em Risco",
    empresa: "Ativa Investimentos",
    area: "Risco",
    cidade: "São Paulo",
    tipoEmpresa: "Corretora",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-25"
  },
  {
    titulo: "Estágio em Special Situations",
    empresa: "Alinea Capital",
    area: "Special Situations",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-24"
  },
  {
    titulo: "Estágio em Infraestrutura",
    empresa: "Kinea Investimentos",
    area: "Infraestrutura",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-24"
  },
  {
    titulo: "Estágio ou Analista Jr. em Asset Management",
    empresa: "Verde Asset Management",
    area: "Asset Management",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-24"
  },
  {
    titulo: "Estágio em Investimentos",
    empresa: "H2 Kapital",
    area: "Investimentos",
    cidade: "São Paulo",
    tipoEmpresa: "Outro",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-23"
  },
  {
    titulo: "Estágio em Equities",
    empresa: "AZ Quest",
    area: "Research",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-23"
  },
  {
    titulo: "Estágio em Asset Management",
    empresa: "Kapitalo Investimentos",
    area: "Asset Management",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-23"
  },
  {
    titulo: "Estágio em Investment Solutions",
    empresa: "SulAmérica Investimentos",
    area: "Investimentos",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-23"
  },
  {
    titulo: "Estágio em Operations",
    empresa: "Sten Multi-Family Office",
    area: "Operações",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-22"
  },
  {
    titulo: "Estágio em Crédito",
    empresa: "V8 Capital",
    area: "Crédito",
    cidade: "São Paulo",
    tipoEmpresa: "Gestora",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-21"
  },
  {
    titulo: "Estágio em M&A",
    empresa: "Agibank",
    area: "M&A",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "Polifinance",
    dataPublicacao: "2026-09-21"
  }
];
