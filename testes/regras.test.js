// Testes das regras do site (js/regras.js). Como rodar: node --test
// Usa só o que já vem com o Node 18 ou mais novo: sem instalar nada.
const test = require("node:test");
const assert = require("node:assert");
const R = require("../js/regras.js");

const vaga = (extra) => Object.assign({ titulo: "Estágio em Finanças", empresa: "Empresa X", area: "Crédito", cidade: "São Paulo", tipoEmpresa: "Banco", fonte: "Polifinance", dataPublicacao: "2026-09-20" }, extra);
const perfil = (extra) => Object.assign({ nome: "", categorias: [], cidades: [], tipos: [], modalidades: [], palavras: "" }, extra);
const RC = "Risco e Crédito", INV = "Investimentos e Gestão", BIM = "Banco de Investimento e M&A", OPS = "Operações e Backoffice";
const titulos = (lista) => lista.map(v => v.titulo);

// ---------------- categorias de área ----------------
test("cada termo do mapa leva à sua categoria", () => {
  for (const categoria of R.CATEGORIAS_AREA) {
    for (const termo of categoria.termos) {
      assert.strictEqual(R.classificarArea(termo).categoria, categoria.nome, termo);
    }
  }
});

test("mapa: as categorias pedidas existem, na ordem, mais 'Outras'", () => {
  assert.deepStrictEqual(R.NOMES_CATEGORIAS, [INV, BIM, RC, OPS, "Research", "Comercial e Wealth", "Outras"]);
});

test("casamento ignora acentos e maiúsculas e usa 'contém'", () => {
  assert.strictEqual(R.classificarArea("CRÉDITO").categoria, RC);
  assert.strictEqual(R.classificarArea("operações").categoria, OPS);
  assert.strictEqual(R.classificarArea("Mesa de Operações").categoria, OPS);
  assert.strictEqual(R.classificarArea("Gestão de Risco de Mercado").categoria, RC);          // contém "risco"
  assert.strictEqual(R.classificarArea("Venture Capital & Private Equity").categoria, INV);
  assert.strictEqual(R.classificarArea("  Wealth Management  ").categoria, "Comercial e Wealth");
  assert.strictEqual(R.classificarArea("Equity Research").categoria, "Research");
});

test("área que casa com mais de uma categoria vai para a PRIMEIRA na ordem do mapa", () => {
  assert.strictEqual(R.classificarArea("Risco e Investimentos").categoria, INV);
  assert.strictEqual(R.classificarArea("M&A e Risco").categoria, BIM);
});

test("'Diversas', 'Diversas Áreas' e 'Diversas (...)' são 'várias áreas', sem categoria própria", () => {
  for (const a of ["Diversas", "DIVERSAS", "Diversas Áreas", "diversas areas", "Diversas (Investment Banking, Research, Risco, Asset)"]) {
    assert.deepStrictEqual(R.classificarArea(a), { categoria: "", varias: true }, a);
    assert.strictEqual(R.ehAreaVaria(a), true, a);
  }
  assert.strictEqual(R.ehAreaVaria("Diversidade e Inclusão"), false);   // outra palavra
  assert.strictEqual(R.ehAreaVaria("Outras áreas diversas"), false);    // só vale no começo
});

test("área desconhecida, vazia ou estranha cai em 'Outras'", () => {
  for (const a of ["Tesouraria", "Mercado de Capitais", "Tecnologia", "", "   ", null, undefined, 5]) {
    assert.deepStrictEqual(R.classificarArea(a), { categoria: "Outras", varias: false }, String(a));
  }
});

test("as áreas atuais das vagas (01/10/2026) e onde caem", () => {
  const esperado = {
    "Asset Management": INV, "Investimentos": INV, "Special Situations": INV, "Infraestrutura": INV,
    "Investment Banking": BIM, "M&A": BIM, "DCM": BIM, "Project Finance": BIM, "Capital Solutions": BIM,
    "Risco": RC, "Crédito": RC,
    "Operações": OPS, "Middle Office": OPS,
    "Research": "Research",
    "Tesouraria": "Outras", "Mercado de Capitais": "Outras",
  };
  for (const [area, categoria] of Object.entries(esperado)) assert.strictEqual(R.classificarArea(area).categoria, categoria, area);
  assert.strictEqual(R.classificarArea("Diversas").varias, true);
  assert.strictEqual(R.classificarArea("Diversas (Investment Banking, Research, Risco, Asset)").varias, true);
});

test("categoriasDasVagas: só as que existem, na ordem do mapa, sem as 'Diversas'", () => {
  const lista = [vaga({ area: "Tesouraria" }), vaga({ area: "Diversas" }), vaga({ area: "M&A" }), vaga({ area: "Crédito" }), vaga({ area: "Risco" })];
  assert.deepStrictEqual(R.categoriasDasVagas(lista), [BIM, RC, "Outras"]);
  assert.deepStrictEqual(R.categoriasDasVagas([vaga({ area: "Diversas" })]), []);
  assert.deepStrictEqual(R.categoriasDasVagas([]), []);
});

test("categoriaOficial devolve o nome certo ou vazio", () => {
  assert.strictEqual(R.categoriaOficial("risco e credito"), RC);
  assert.strictEqual(R.categoriaOficial("  OUTRAS "), "Outras");
  assert.strictEqual(R.categoriaOficial("Crédito"), "");        // área, não categoria
  assert.strictEqual(R.categoriaOficial(null), "");
});

// ---------------- formato do perfil ----------------
test("perfil novo tem o formato esperado", () => {
  assert.deepStrictEqual(R.novoPerfil(), perfil());
});

test("categorias do perfil: só nomes que existem, nome oficial, sem repetir", () => {
  assert.deepStrictEqual(R.sanitizarPerfil({ categorias: ["risco e credito", RC, "Inexistente", 5, null, "outras"] }).categorias, [RC, "Outras"]);
  assert.deepStrictEqual(R.sanitizarPerfil({ categorias: "Research" }).categorias, []);
});

test("perfil antigo (guardava áreas cruas): vira categorias; 'Diversas' e desconhecidas não viram categoria útil", () => {
  const p = R.sanitizarPerfil({ areas: ["Risco", "Crédito", "Diversas", "Asset Management", "Tesouraria"], cidades: ["São Paulo"] });
  assert.deepStrictEqual(p.categorias, [RC, INV, "Outras"]);
  assert.deepStrictEqual(p.cidades, ["São Paulo"]);
  assert.strictEqual("areas" in p, false);
  assert.strictEqual("soCompativeis" in p, false);                                  // o antigo botão de modalidade não existe mais
  assert.deepStrictEqual(R.sanitizarPerfil({ categorias: [BIM], areas: ["Risco"] }).categorias, [BIM]);   // categorias novas vencem
});

// ---------------- pontuação ----------------
test("perfil vazio: nenhuma pontuação e nada de selo", () => {
  for (const p of [perfil(), null, undefined, {}, "texto", 5, { categorias: "x" }]) {
    assert.strictEqual(R.perfilVazio(p), true);
    assert.strictEqual(R.perfilTemFiltro(p), false);
    assert.strictEqual(R.pontuarVaga(vaga(), p), 0);
    assert.strictEqual(R.pontuacaoMaxima(p), 0);
    assert.strictEqual(R.combinaComPerfil(vaga(), p), false);
  }
});

test("categoria igual vale +3, cidade +2, tipo +1, palavra-chave +2, modalidade +2", () => {
  assert.strictEqual(R.pontuarVaga(vaga(), perfil({ categorias: [RC] })), 3);
  assert.strictEqual(R.pontuarVaga(vaga(), perfil({ cidades: ["São Paulo"] })), 2);
  assert.strictEqual(R.pontuarVaga(vaga(), perfil({ tipos: ["Banco"] })), 1);
  assert.strictEqual(R.pontuarVaga(vaga(), perfil({ palavras: "finanças" })), 2);
  assert.strictEqual(R.pontuarVaga(vaga({ modalidade: "remoto" }), perfil({ modalidades: ["remoto"] })), 2);
});

test("a pontuação por categoria vale para qualquer área da categoria", () => {
  const p = perfil({ categorias: [BIM] });
  for (const a of ["M&A", "Investment Banking", "DCM", "Project Finance", "Capital Solutions"]) assert.strictEqual(R.pontuarVaga(vaga({ area: a }), p), 3, a);
  assert.strictEqual(R.pontuarVaga(vaga({ area: "Risco" }), p), 0);
});

test("vaga 'Diversas' NÃO ganha os +3 de categoria (ela só passa no filtro)", () => {
  assert.strictEqual(R.pontuarVaga(vaga({ area: "Diversas" }), perfil({ categorias: [RC] })), 0);
  assert.strictEqual(R.pontuarVaga(vaga({ area: "Diversas (Investment Banking, Research)" }), perfil({ categorias: [BIM] })), 0);
});

test("soma tudo: máximo de 10 pontos", () => {
  const p = perfil({ categorias: [RC], cidades: ["São Paulo"], tipos: ["Banco"], palavras: "estágio", modalidades: ["remoto"] });
  assert.strictEqual(R.pontuarVaga(vaga({ modalidade: "remoto" }), p), 10);
  assert.strictEqual(R.pontuacaoMaxima(p), 10);
});

test("comparação ignora maiúsculas, acentos e espaços", () => {
  const p = perfil({ categorias: ["  risco e credito "], cidades: ["sao paulo"], tipos: ["bAnCo"] });
  assert.strictEqual(R.pontuarVaga(vaga(), p), 6);
});

test("palavra-chave: título ou empresa, uma vez só, acento/caixa livres; não olha área, cidade, fonte nem tipo", () => {
  assert.strictEqual(R.pontuarVaga(vaga({ titulo: "Estágio em M&A" }), perfil({ palavras: "m&a" })), 2);
  assert.strictEqual(R.pontuarVaga(vaga({ empresa: "Kapitalo Investimentos" }), perfil({ palavras: "KAPITALO" })), 2);
  assert.strictEqual(R.pontuarVaga(vaga({ titulo: "Estágio em M&A e valuation" }), perfil({ palavras: "M&A, valuation" })), 2);
  assert.deepStrictEqual(R.palavrasChave(perfil({ palavras: "M&A; Valuation,\n risco ,, M&A" })), ["m&a", "valuation", "risco"]);
  const v = vaga({ area: "Research", cidade: "Curitiba", fonte: "LinkedIn", tipoEmpresa: "Gestora" });
  for (const palavra of ["research", "curitiba", "linkedin", "gestora"]) assert.strictEqual(R.pontuarVaga(v, perfil({ palavras: palavra })), 0, palavra);
});

test("modalidade: diferente ou ausente vale 0; 'home office' é desconhecida", () => {
  const p = perfil({ modalidades: ["remoto"] });
  assert.strictEqual(R.pontuarVaga(vaga({ modalidade: "presencial" }), p), 0);
  for (const v of [vaga(), vaga({ modalidade: "" }), vaga({ modalidade: null }), vaga({ modalidade: "home office" }), vaga({ modalidade: 7 })]) assert.strictEqual(R.pontuarVaga(v, p), 0);
  assert.strictEqual(R.modalidadeDaVaga(vaga({ modalidade: "Híbrido" })), "hibrido");
});

test("só preferir modalidade é perfil preenchido; só o nome, não", () => {
  assert.strictEqual(R.perfilVazio(perfil({ modalidades: ["remoto"] })), false);
  assert.strictEqual(R.perfilVazio(perfil({ nome: "Maria" })), true);
});

test("palavras-chave NÃO são filtro (só pontuam)", () => {
  const p = perfil({ palavras: "valuation, m&a" });
  assert.strictEqual(R.perfilTemFiltro(p), false);
  assert.strictEqual(R.perfilVazio(p), false);                       // mas é perfil preenchido para ordenar
  assert.strictEqual(R.passaFiltroPerfil(vaga({ titulo: "Estágio sem nada a ver" }), p), true);
});

test("o nome nunca muda pontuação, ordem nem filtro", () => {
  const lista = [vaga({ titulo: "A", dataPublicacao: "2026-09-10" }), vaga({ titulo: "B", dataPublicacao: "2026-09-25" })];
  const sem = R.ordenarVagas(lista, "relevancia", perfil({ categorias: [RC] })).map(v => v.titulo);
  const com = R.ordenarVagas(lista, "relevancia", perfil({ categorias: [RC], nome: "Crédito São Paulo Banco" })).map(v => v.titulo);
  assert.deepStrictEqual(com, sem);
  assert.strictEqual(R.pontuarVaga(vaga(), perfil({ nome: "Estágio Crédito" })), 0);
  assert.strictEqual(R.perfilTemFiltro(perfil({ nome: "Maria" })), false);
});

test("selo 'Combina com você': 60% da pontuação máxima possível", () => {
  const so_cat = perfil({ categorias: [RC] });                                         // máximo 3
  assert.strictEqual(R.combinaComPerfil(vaga(), so_cat), true);
  assert.strictEqual(R.combinaComPerfil(vaga({ area: "Research" }), so_cat), false);
  const cat_cidade = perfil({ categorias: [RC], cidades: ["São Paulo"] });             // máximo 5; categoria sozinha = 3/5 = 60%
  assert.strictEqual(R.combinaComPerfil(vaga(), cat_cidade), true);
  assert.strictEqual(R.combinaComPerfil(vaga({ area: "Research" }), cat_cidade), false); // só cidade = 2/5
  const completo = perfil({ categorias: [RC], cidades: ["São Paulo"], tipos: ["Banco"], palavras: "estágio" }); // máximo 8
  assert.strictEqual(R.combinaComPerfil(vaga({ area: "Research", tipoEmpresa: "Gestora" }), completo), false);   // cidade + palavra = 4/8
  assert.strictEqual(R.combinaComPerfil(vaga({ tipoEmpresa: "Gestora", titulo: "Analista" }), completo), true);   // categoria + cidade = 5/8
});

test("selo: vaga sem modalidade e vaga 'Diversas' não são prejudicadas (o critério impossível sai do máximo)", () => {
  const p = perfil({ categorias: [RC], cidades: ["São Paulo"], modalidades: ["remoto"] });
  assert.strictEqual(R.pontuacaoMaxima(p, vaga()), 5);                                 // sem modalidade: só categoria + cidade
  assert.strictEqual(R.combinaComPerfil(vaga(), p), true);
  assert.strictEqual(R.pontuacaoMaxima(p, vaga({ modalidade: "presencial" })), 7);
  // "Diversas": sem categoria própria, só conta o que ela pode cumprir (cidade)
  const so = perfil({ categorias: [RC], cidades: ["São Paulo"] });
  assert.strictEqual(R.pontuacaoMaxima(so, vaga({ area: "Diversas" })), 2);
  assert.strictEqual(R.combinaComPerfil(vaga({ area: "Diversas" }), so), true);        // 2/2
  assert.strictEqual(R.combinaComPerfil(vaga({ area: "Diversas", cidade: "Recife" }), so), false);
  // preferir só categoria: "Diversas" não tem como combinar (máximo 0)
  assert.strictEqual(R.combinaComPerfil(vaga({ area: "Diversas" }), perfil({ categorias: [RC] })), false);
});

// ---------------- filtro do perfil ----------------
const catalogo = () => [
  vaga({ titulo: "credito-sp-banco", area: "Crédito", cidade: "São Paulo", tipoEmpresa: "Banco" }),
  vaga({ titulo: "risco-rj-gestora", area: "Risco", cidade: "Rio de Janeiro", tipoEmpresa: "Gestora", modalidade: "remoto" }),
  vaga({ titulo: "ma-sp-banco", area: "M&A", cidade: "São Paulo", tipoEmpresa: "Banco", modalidade: "presencial" }),
  vaga({ titulo: "diversas-sp-corretora", area: "Diversas (Investment Banking, Research, Risco, Asset)", cidade: "São Paulo", tipoEmpresa: "Corretora" }),
  vaga({ titulo: "diversas-rj-banco", area: "Diversas", cidade: "Rio de Janeiro", tipoEmpresa: "Banco", modalidade: "hibrido" }),
  vaga({ titulo: "tesouraria-sp-outro", area: "Tesouraria", cidade: "São Paulo", tipoEmpresa: "Outro" }),
  vaga({ titulo: "ops-bh-gestora", area: "Operações", cidade: "Belo Horizonte", tipoEmpresa: "Gestora", modalidade: "hibrido" }),
];
const passam = (p, lista = catalogo()) => titulos(R.filtrarVagas(lista, {}, p, true));

test("sem nenhum grupo marcado nada é filtrado (palavras-chave também não filtram)", () => {
  assert.strictEqual(passam(perfil()).length, 7);
  assert.strictEqual(passam(perfil({ palavras: "inexistente", nome: "Ana" })).length, 7);
  assert.strictEqual(passam(null).length, 7);
});

test("grupo categorias: vaga da categoria passa; 'Diversas' passa em qualquer categoria; as outras saem", () => {
  assert.deepStrictEqual(passam(perfil({ categorias: [RC] })), ["credito-sp-banco", "risco-rj-gestora", "diversas-sp-corretora", "diversas-rj-banco"]);
  assert.deepStrictEqual(passam(perfil({ categorias: [BIM] })), ["ma-sp-banco", "diversas-sp-corretora", "diversas-rj-banco"]);
  assert.deepStrictEqual(passam(perfil({ categorias: ["Outras"] })), ["diversas-sp-corretora", "diversas-rj-banco", "tesouraria-sp-outro"]);
});

test("dentro de um grupo vale 'ou' (basta uma opção)", () => {
  assert.deepStrictEqual(passam(perfil({ categorias: [RC, OPS] })), ["credito-sp-banco", "risco-rj-gestora", "diversas-sp-corretora", "diversas-rj-banco", "ops-bh-gestora"]);
  assert.deepStrictEqual(passam(perfil({ cidades: ["Rio de Janeiro", "Belo Horizonte"] })), ["risco-rj-gestora", "diversas-rj-banco", "ops-bh-gestora"]);
});

test("grupo cidades e grupo tipos filtram sozinhos (acento e caixa livres)", () => {
  assert.deepStrictEqual(passam(perfil({ cidades: ["são paulo"] })), ["credito-sp-banco", "ma-sp-banco", "diversas-sp-corretora", "tesouraria-sp-outro"]);
  assert.deepStrictEqual(passam(perfil({ tipos: ["GESTORA"] })), ["risco-rj-gestora", "ops-bh-gestora"]);
  assert.deepStrictEqual(passam(perfil({ tipos: ["Outro", "Corretora"] })), ["diversas-sp-corretora", "tesouraria-sp-outro"]);
});

test("grupo modalidade: igual passa; diferente sai; SEM modalidade informada continua aparecendo", () => {
  const resultado = passam(perfil({ modalidades: ["remoto"] }));
  assert.ok(resultado.includes("risco-rj-gestora"));                                       // remoto
  assert.ok(!resultado.includes("ma-sp-banco"));                                           // presencial: sai
  assert.ok(!resultado.includes("diversas-rj-banco") && !resultado.includes("ops-bh-gestora")); // híbrido: sai
  for (const semDado of ["credito-sp-banco", "diversas-sp-corretora", "tesouraria-sp-outro"]) assert.ok(resultado.includes(semDado), semDado);
  assert.deepStrictEqual(passam(perfil({ modalidades: ["remoto", "hibrido"] })).filter(t => /rj|bh/.test(t)), ["risco-rj-gestora", "diversas-rj-banco", "ops-bh-gestora"]);
});

test("entre grupos vale 'e' (precisa bater em pelo menos uma opção de CADA grupo marcado)", () => {
  assert.deepStrictEqual(passam(perfil({ categorias: [RC], cidades: ["São Paulo"] })), ["credito-sp-banco", "diversas-sp-corretora"]);
  assert.deepStrictEqual(passam(perfil({ categorias: [RC], cidades: ["São Paulo"], tipos: ["Banco"] })), ["credito-sp-banco"]);
  // "Diversas" passa na categoria, mas continua precisando bater nos outros grupos marcados
  assert.deepStrictEqual(passam(perfil({ categorias: [BIM], cidades: ["Rio de Janeiro"] })), ["diversas-rj-banco"]);
  assert.deepStrictEqual(passam(perfil({ categorias: [BIM], modalidades: ["remoto"] })), ["diversas-sp-corretora"]);   // M&A é presencial (sai); Diversas sem dado passa
});

test("estado vazio: nenhum critério bate; 'Mostrar todas' (filtro desligado) devolve tudo", () => {
  const impossivel = perfil({ categorias: ["Research"], cidades: ["Belo Horizonte"] });
  assert.deepStrictEqual(passam(impossivel), []);
  assert.strictEqual(R.perfilTemFiltro(impossivel), true);
  assert.strictEqual(R.filtrarVagas(catalogo(), {}, impossivel, false).length, 7);       // aplicarPerfil = false
});

test("descreverFiltroPerfil: categorias, cidades, tipos e modalidades (com rótulos)", () => {
  assert.deepStrictEqual(R.descreverFiltroPerfil(perfil({ categorias: [RC, INV], cidades: ["São Paulo"], tipos: ["Banco"], modalidades: ["hibrido", "remoto"], palavras: "m&a", nome: "Ana" })),
    [RC, INV, "São Paulo", "Banco", "Híbrido", "Remoto"]);
  assert.deepStrictEqual(R.descreverFiltroPerfil(perfil({ palavras: "m&a" })), []);
});

// ---------------- combinação com os filtros da página ----------------
test("filtros da página (área, cidade, fonte): vazios não filtram; valem juntos", () => {
  const lista = catalogo();
  assert.strictEqual(R.filtrarVagas(lista, {}, perfil(), true).length, 7);
  assert.strictEqual(R.filtrarVagas(lista, { area: "", cidade: "", fonte: "" }, perfil(), true).length, 7);
  assert.deepStrictEqual(titulos(R.filtrarVagas(lista, { cidade: "São Paulo" }, perfil(), false)), ["credito-sp-banco", "ma-sp-banco", "diversas-sp-corretora", "tesouraria-sp-outro"]);
  assert.deepStrictEqual(titulos(R.filtrarVagas(lista, { area: "Risco", cidade: "Rio de Janeiro", fonte: "Polifinance" }, perfil(), false)), ["risco-rj-gestora"]);
  assert.deepStrictEqual(R.filtrarVagas(lista, { fonte: "LinkedIn" }, perfil(), false), []);
});

test("filtros da página + filtro do perfil = interseção (a ordem de aplicação não muda o resultado)", () => {
  const lista = catalogo();
  const p = perfil({ categorias: [RC], tipos: ["Banco", "Gestora"] });
  const pagina = { cidade: "Rio de Janeiro" };
  const combinado = titulos(R.filtrarVagas(lista, pagina, p, true));
  const soPagina = titulos(R.filtrarVagas(lista, pagina, p, false));
  const soPerfil = titulos(R.filtrarVagas(lista, {}, p, true));
  assert.deepStrictEqual(combinado, soPagina.filter(t => soPerfil.includes(t)));
  assert.deepStrictEqual(combinado, ["risco-rj-gestora", "diversas-rj-banco"]);
  // o filtro de página "Área" usa a área CRUA da vaga, não a categoria
  assert.deepStrictEqual(titulos(R.filtrarVagas(lista, { area: "Risco" }, perfil({ categorias: [RC] }), true)), ["risco-rj-gestora"]);
  assert.deepStrictEqual(titulos(R.filtrarVagas(lista, { area: "Crédito" }, perfil({ categorias: [BIM] }), true)), []);   // Crédito não é da categoria BIM
});

test("a pontuação ordena dentro do que sobrou do filtro (a palavra-chave sobe a vaga, mas não filtra)", () => {
  // Filtro: só categoria Risco e Crédito (+ "Diversas", que passa em qualquer categoria) = 4 vagas.
  const p = perfil({ categorias: [RC], palavras: "risco-rj" });
  const sobrou = R.filtrarVagas(catalogo(), {}, p, true);
  assert.deepStrictEqual(titulos(sobrou), ["credito-sp-banco", "risco-rj-gestora", "diversas-sp-corretora", "diversas-rj-banco"]);
  // risco-rj: 3 (categoria) + 2 (palavra no título) = 5; credito: 3; "Diversas": 0 (sem categoria própria)
  assert.deepStrictEqual(titulos(R.ordenarVagas(sobrou, "relevancia", p)), ["risco-rj-gestora", "credito-sp-banco", "diversas-sp-corretora", "diversas-rj-banco"]);
  assert.strictEqual(R.pontuarVaga(sobrou[1], p), 5);
  assert.strictEqual(R.pontuarVaga(sobrou[0], p), 3);
  assert.strictEqual(R.pontuarVaga(sobrou[2], p), 0);
  // mesma lista sem a palavra-chave: continuam as mesmas 4 vagas (palavra não filtra)
  assert.deepStrictEqual(titulos(R.filtrarVagas(catalogo(), {}, perfil({ categorias: [RC] }), true)), titulos(sobrou));
});

// ---------------- ordenação ----------------
test("sem perfil: relevância mantém a ordem de sempre (publicação mais recente primeiro)", () => {
  const lista = [vaga({ titulo: "A", dataPublicacao: "2026-09-10" }), vaga({ titulo: "B", dataPublicacao: "2026-09-25", prazoInscricao: "2026-10-30" }), vaga({ titulo: "C", dataPublicacao: "2026-09-20", prazoInscricao: "2026-10-02" })];
  assert.deepStrictEqual(titulos(R.ordenarVagas(lista, "relevancia", perfil())), ["B", "C", "A"]);
  assert.deepStrictEqual(titulos(R.ordenarVagas(lista, "relevancia", null)), ["B", "C", "A"]);
});

test("sem perfil e datas iguais: mantém a ordem original (ordenação estável)", () => {
  const lista = ["1", "2", "3", "4"].map(t => vaga({ titulo: t, dataPublicacao: "2026-09-20" }));
  assert.deepStrictEqual(titulos(R.ordenarVagas(lista, "relevancia", perfil())), ["1", "2", "3", "4"]);
});

test("com perfil: maior pontuação primeiro", () => {
  const lista = [vaga({ titulo: "nada", area: "Research", cidade: "Recife", tipoEmpresa: "Gestora" }), vaga({ titulo: "cat", cidade: "Recife", tipoEmpresa: "Gestora" }), vaga({ titulo: "tudo" })];
  const p = perfil({ categorias: [RC], cidades: ["São Paulo"], tipos: ["Banco"] });
  assert.deepStrictEqual(titulos(R.ordenarVagas(lista, "relevancia", p)), ["tudo", "cat", "nada"]);
});

test("empate de pontos: prazo mais próximo primeiro, depois publicação mais recente", () => {
  const p = perfil({ categorias: [RC] });
  const lista = [
    vaga({ titulo: "sem-prazo-recente", dataPublicacao: "2026-09-29" }),
    vaga({ titulo: "prazo-longe", prazoInscricao: "2026-11-30", dataPublicacao: "2026-09-01" }),
    vaga({ titulo: "prazo-perto", prazoInscricao: "2026-10-05", dataPublicacao: "2026-09-02" }),
    vaga({ titulo: "sem-prazo-antiga", dataPublicacao: "2026-09-10" }),
    vaga({ titulo: "mesmo-prazo-mais-recente", prazoInscricao: "2026-10-05", dataPublicacao: "2026-09-15" }),
  ];
  assert.deepStrictEqual(titulos(R.ordenarVagas(lista, "relevancia", p)), ["mesmo-prazo-mais-recente", "prazo-perto", "prazo-longe", "sem-prazo-recente", "sem-prazo-antiga"]);
});

test("pontuação pesa mais que o prazo", () => {
  const p = perfil({ categorias: [RC] });
  const lista = [vaga({ titulo: "urgente-sem-match", area: "Research", prazoInscricao: "2026-10-02" }), vaga({ titulo: "match-sem-prazo" })];
  assert.deepStrictEqual(titulos(R.ordenarVagas(lista, "relevancia", p)), ["match-sem-prazo", "urgente-sem-match"]);
});

test("modo 'mais recentes' ignora o perfil; modo 'prazo' põe prazo mais próximo primeiro e sem prazo no fim", () => {
  const p = perfil({ categorias: [RC] });
  const lista = [vaga({ titulo: "antiga-match", dataPublicacao: "2026-09-01" }), vaga({ titulo: "nova-sem-match", area: "Research", dataPublicacao: "2026-09-28" })];
  assert.deepStrictEqual(titulos(R.ordenarVagas(lista, "recentes", p)), ["nova-sem-match", "antiga-match"]);
  const l2 = [vaga({ titulo: "sem", dataPublicacao: "2026-09-29" }), vaga({ titulo: "longe", prazoInscricao: "2026-12-01" }), vaga({ titulo: "perto", prazoInscricao: "2026-10-03" }), vaga({ titulo: "sem-antiga", dataPublicacao: "2026-09-01" })];
  assert.deepStrictEqual(titulos(R.ordenarVagas(l2, "prazo", perfil())), ["perto", "longe", "sem", "sem-antiga"]);
});

test("ordenar não altera a lista original", () => {
  const lista = [vaga({ titulo: "A", dataPublicacao: "2026-09-01" }), vaga({ titulo: "B", dataPublicacao: "2026-09-28" })];
  const copia = titulos(lista);
  R.ordenarVagas(lista, "recentes", perfil());
  assert.deepStrictEqual(titulos(lista), copia);
});

// ---------------- nome ----------------
test("nome: tira espaços sobrando, junta espaços repetidos e limita a 60 caracteres", () => {
  assert.strictEqual(R.limparNome("   Ana    Maria \t\n Silva  "), "Ana Maria Silva");
  assert.strictEqual(R.limparNome("   "), "");
  assert.strictEqual(R.limparNome("x".repeat(100)).length, 60);
  assert.strictEqual(Array.from(R.limparNome("😀".repeat(100))).length, 60);
  assert.strictEqual(R.limparNome("a".repeat(58) + " b"), "a".repeat(58) + " b");
  assert.strictEqual(R.limparNome("a".repeat(59) + " b"), "a".repeat(59));
});

test("nome com <script>, aspas e HTML continua sendo só texto (quem exibe usa textContent)", () => {
  const perigoso = "<script>alert(1)</script> \"O'Brien\" <img src=x onerror=alert(2)>";
  const limpo = R.limparNome(perigoso);
  assert.ok(limpo.startsWith("<script>alert(1)</script>"));
  assert.ok(limpo.length <= 60);
  assert.strictEqual(R.sanitizarPerfil({ nome: perigoso }).nome, limpo);
  for (const ruim of [null, undefined, 5, {}, [], true]) assert.strictEqual(R.limparNome(ruim), "", String(ruim));
  assert.strictEqual(R.limparNome("Ana\u0000\u0007Maria"), "Ana Maria");
});

// ---------------- armazenamento (localStorage) ----------------
const armazenamentoFalso = () => { const dados = {}; return { dados, getItem: k => (k in dados ? dados[k] : null), setItem: (k, v) => { dados[k] = String(v); }, removeItem: k => { delete dados[k]; } }; };

test("salvar e ler o perfil (ida e volta, com todos os campos)", () => {
  const a = armazenamentoFalso();
  const p = perfil({ nome: "Maria Clara", categorias: [RC, "Research"], cidades: ["São Paulo"], tipos: ["Banco"], modalidades: ["remoto", "hibrido"], palavras: "M&A, valuation" });
  assert.strictEqual(R.salvarPerfil(a, p), true);
  assert.deepStrictEqual(R.lerPerfil(a), p);
});

test("perfil guardado na versão anterior (áreas cruas, filtro antigo) é aproveitado", () => {
  const a = armazenamentoFalso();
  a.dados[R.CHAVE_PERFIL] = JSON.stringify({ nome: "Ana", areas: ["Risco", "M&A"], cidades: [], tipos: ["Banco"], modalidades: ["remoto"], soCompativeis: true, palavras: "valuation" });
  // "Risco" => Risco e Crédito; "M&A" => Banco de Investimento e M&A (na ordem em que estavam guardadas)
  assert.deepStrictEqual(R.lerPerfil(a), perfil({ nome: "Ana", categorias: [RC, BIM], tipos: ["Banco"], modalidades: ["remoto"], palavras: "valuation" }));
});

test("localStorage indisponível (null) ou bloqueado (lança erro): nada quebra", () => {
  const bloqueado = { getItem() { throw new Error("SecurityError"); }, setItem() { throw new Error("Quota"); }, removeItem() { throw new Error("SecurityError"); } };
  for (const arm of [null, undefined, bloqueado]) {
    assert.deepStrictEqual(R.lerPerfil(arm), perfil());
    assert.strictEqual(R.salvarPerfil(arm, perfil({ nome: "Ana", modalidades: ["remoto"] })), false);
    assert.strictEqual(R.apagarPerfil(arm), false);
  }
  // o perfil em memória segue funcionando (filtro incluso)
  const p = R.sanitizarPerfil({ nome: "  Ana  ", categorias: [RC], modalidades: ["remoto"] });
  assert.strictEqual(R.passaFiltroPerfil(vaga({ area: "Research" }), p), false);
  assert.strictEqual(R.passaFiltroPerfil(vaga(), p), true);
});

test("dados quebrados ou estranhos guardados no navegador viram perfil seguro", () => {
  const a = armazenamentoFalso();
  for (const lixo of ["{quebrado", "null", "123", "\"texto\"", "[]", "{\"categorias\":\"Risco\"}", "{\"cidades\":[1,null,{},\"Recife\",\"  \"],\"palavras\":42}"]) {
    a.dados[R.CHAVE_PERFIL] = lixo;
    const lido = R.lerPerfil(a);
    assert.ok(Array.isArray(lido.categorias) && Array.isArray(lido.cidades) && Array.isArray(lido.tipos) && Array.isArray(lido.modalidades) && typeof lido.palavras === "string" && typeof lido.nome === "string", lixo);
  }
  a.dados[R.CHAVE_PERFIL] = "{\"cidades\":[1,null,{},\"Recife\",\"  \"],\"palavras\":42}";
  assert.deepStrictEqual(R.lerPerfil(a), perfil({ cidades: ["Recife"] }));
  const gigante = R.sanitizarPerfil({ cidades: Array.from({ length: 500 }, (_, i) => "c" + i), palavras: "x".repeat(5000), nome: "N".repeat(5000) });
  assert.strictEqual(gigante.cidades.length, 60);
  assert.strictEqual(gigante.palavras.length, 200);
  assert.strictEqual(gigante.nome.length, 60);
});

test("apagar perfil remove tudo do armazenamento", () => {
  const a = armazenamentoFalso();
  R.salvarPerfil(a, perfil({ nome: "Ana", categorias: [RC], modalidades: ["remoto"] }));
  assert.ok(R.CHAVE_PERFIL in a.dados);
  assert.strictEqual(R.apagarPerfil(a), true);
  assert.strictEqual(R.CHAVE_PERFIL in a.dados, false);
  assert.deepStrictEqual(R.lerPerfil(a), perfil());
});

test("perfil guardado não vira código: texto estranho é só texto", () => {
  const a = armazenamentoFalso();
  R.salvarPerfil(a, perfil({ palavras: "<img src=x onerror=alert(1)>" }));
  assert.strictEqual(R.lerPerfil(a).palavras, "<img src=x onerror=alert(1)>");
});

// ---------------- regras que já existiam (rede de segurança) ----------------
test("expiração: com prazo, sem prazo manual (45 dias) e automática", () => {
  assert.strictEqual(R.vagaVencida({ prazoInscricao: "2026-10-01" }, "2026-10-01"), false);
  assert.strictEqual(R.vagaVencida({ prazoInscricao: "2026-09-30" }, "2026-10-01"), true);
  assert.strictEqual(R.vagaVencida({ dataPublicacao: "2026-09-01" }, "2026-10-15"), false);   // 44 dias
  assert.strictEqual(R.vagaVencida({ dataPublicacao: "2026-09-01" }, "2026-10-16"), true);    // 45 dias
  assert.strictEqual(R.vagaVencida({ dataPublicacao: "2025-01-01", origem: "greenhouse:x" }, "2026-10-16"), false);
});

test("e-mail de candidatura: formato seguro", () => {
  assert.strictEqual(R.emailValido("corp.dev@agi.com.br"), true);
  for (const ruim of ["", "a@b", "a b@c.com", "a@b.c?bcc=x@y.z", "a&b@c.com", "<a>@b.c", null]) assert.strictEqual(R.emailValido(ruim), false, String(ruim));
});

test("link inativo: só com 2 ou mais falhas", () => {
  assert.strictEqual(R.linkInativo({ link: "https://a" }, { "https://a": { falhasConsecutivas: 1 } }), false);
  assert.strictEqual(R.linkInativo({ link: "https://a" }, { "https://a": { falhasConsecutivas: 2 } }), true);
  assert.strictEqual(R.linkInativo({}, {}), false);
});
