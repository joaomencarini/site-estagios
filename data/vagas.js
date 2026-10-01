// Vagas FICTÍCIAS de exemplo. Empresas e links não existem de verdade.
// Usamos um arquivo .js (e não .json) porque o navegador bloqueia a leitura
// de arquivos JSON quando abrimos o index.html direto, sem servidor.
const vagas = [
  { id: 1,  titulo: "Estágio em Análise de Investimentos",   empresa: "Banco Horizonte",         area: "Investimentos", cidade: "São Paulo",      tipoEmpresa: "Banco",       dataPublicacao: "2026-09-29" },
  { id: 2,  titulo: "Estágio em Gestão de Portfólio",        empresa: "Atlas Gestão de Recursos", area: "Investimentos", cidade: "Rio de Janeiro", tipoEmpresa: "Gestora",     dataPublicacao: "2026-09-22" },
  { id: 3,  titulo: "Estágio em Risco de Mercado",           empresa: "Banco Horizonte",         area: "Risco",         cidade: "São Paulo",      tipoEmpresa: "Banco",       dataPublicacao: "2026-09-27" },
  { id: 4,  titulo: "Estágio em Risco Operacional",          empresa: "Seguradora Prisma",       area: "Risco",         cidade: "Belo Horizonte", tipoEmpresa: "Seguradora",  dataPublicacao: "2026-09-18" },
  { id: 5,  titulo: "Estágio em Análise de Crédito",         empresa: "Fintech Nuvem Azul",      area: "Crédito",       cidade: "São Paulo",      tipoEmpresa: "Fintech",     dataPublicacao: "2026-09-30" },
  { id: 6,  titulo: "Estágio em Crédito Corporativo",        empresa: "Banco Meridional",        area: "Crédito",       cidade: "Porto Alegre",   tipoEmpresa: "Banco",       dataPublicacao: "2026-09-15" },
  { id: 7,  titulo: "Estágio em Controladoria",              empresa: "Consultoria Vértice",     area: "Controladoria", cidade: "Curitiba",       tipoEmpresa: "Consultoria", dataPublicacao: "2026-09-25" },
  { id: 8,  titulo: "Estágio em Contabilidade Financeira",   empresa: "Corretora Bússola",       area: "Controladoria", cidade: "Rio de Janeiro", tipoEmpresa: "Corretora",   dataPublicacao: "2026-09-10" },
  { id: 9,  titulo: "Estágio em Tesouraria",                 empresa: "Banco Meridional",        area: "Tesouraria",    cidade: "Porto Alegre",   tipoEmpresa: "Banco",       dataPublicacao: "2026-09-26" },
  { id: 10, titulo: "Estágio em Fluxo de Caixa e Liquidez",  empresa: "Fintech Nuvem Azul",      area: "Tesouraria",    cidade: "Belo Horizonte", tipoEmpresa: "Fintech",     dataPublicacao: "2026-09-20" },
  { id: 11, titulo: "Estágio em Research de Ações",          empresa: "Corretora Bússola",       area: "Research",      cidade: "São Paulo",      tipoEmpresa: "Corretora",   dataPublicacao: "2026-09-28" },
  { id: 12, titulo: "Estágio em Research Macroeconômico",    empresa: "Atlas Gestão de Recursos", area: "Research",      cidade: "Rio de Janeiro", tipoEmpresa: "Gestora",     dataPublicacao: "2026-09-12" }
];
