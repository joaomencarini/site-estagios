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
//   titulo, empresa, area, cidade, tipoEmpresa, fonte, link, dataPublicacao
//   prazoInscricao (opcional): depois dessa data a vaga some sozinha do site.
//   exemplo: true (só nas vagas de teste abaixo): mostra o selo "EXEMPLO".
//   Datas sempre no formato AAAA-MM-DD (ex.: 2026-10-15).
// ============================================================
const vagas = [
  // ----- VAGAS DE EXEMPLO (fictícias): apague os 3 blocos abaixo ao cadastrar vagas reais -----
  {
    titulo: "Estágio em Análise de Investimentos",
    empresa: "Empresa Exemplo S.A.",
    area: "Investimentos",
    cidade: "São Paulo",
    tipoEmpresa: "Banco",
    fonte: "LinkedIn",
    link: "https://example.com/vaga-exemplo-1",
    dataPublicacao: "2026-09-29",
    prazoInscricao: "2030-12-31",
    exemplo: true
  },
  {
    titulo: "Estágio em Risco de Crédito",
    empresa: "Fintech Exemplo",
    area: "Risco",
    cidade: "Rio de Janeiro",
    tipoEmpresa: "Fintech",
    fonte: "Polifinance",
    link: "https://example.com/vaga-exemplo-2",
    dataPublicacao: "2026-09-25",
    exemplo: true
  },
  {
    titulo: "Estágio em Controladoria",
    empresa: "Consultoria Exemplo",
    area: "Controladoria",
    cidade: "Belo Horizonte",
    tipoEmpresa: "Consultoria",
    fonte: "Site da empresa",
    link: "https://example.com/vaga-exemplo-3",
    dataPublicacao: "2026-09-20",
    prazoInscricao: "2030-06-30",
    exemplo: true
  },
  // ----- FIM DOS EXEMPLOS -----
];
