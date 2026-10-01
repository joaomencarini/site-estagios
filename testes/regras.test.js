// Testes das regras do site (js/regras.js). Como rodar: node --test testes/
// Usa só o que já vem com o Node 18 ou mais novo: sem instalar nada.
const test = require("node:test");
const assert = require("node:assert");
const R = require("../js/regras.js");

const vaga = (extra) => Object.assign({ titulo: "Estágio em Finanças", empresa: "Empresa X", area: "Crédito", cidade: "São Paulo", tipoEmpresa: "Banco", fonte: "Polifinance", dataPublicacao: "2026-09-20" }, extra);
const perfil = (extra) => Object.assign({ areas: [], cidades: [], tipos: [], palavras: "" }, extra);

// ---------------- pontuação ----------------
test("perfil vazio: nenhuma pontuação e nada de selo", () => {
  for (const p of [perfil(), null, undefined, {}, "texto", 5, { areas: "x" }]) {
    assert.strictEqual(R.perfilVazio(p), true);
    assert.strictEqual(R.pontuarVaga(vaga(), p), 0);
    assert.strictEqual(R.pontuacaoMaxima(p), 0);
    assert.strictEqual(R.combinaComPerfil(vaga(), p), false);
  }
});

test("área igual vale +3, cidade +2, tipo +1, palavra-chave +2", () => {
  assert.strictEqual(R.pontuarVaga(vaga(), perfil({ areas: ["Crédito"] })), 3);
  assert.strictEqual(R.pontuarVaga(vaga(), perfil({ cidades: ["São Paulo"] })), 2);
  assert.strictEqual(R.pontuarVaga(vaga(), perfil({ tipos: ["Banco"] })), 1);
  assert.strictEqual(R.pontuarVaga(vaga(), perfil({ palavras: "finanças" })), 2);
});

test("soma tudo: máximo de 8 pontos", () => {
  const p = perfil({ areas: ["Crédito"], cidades: ["São Paulo"], tipos: ["Banco"], palavras: "estágio" });
  assert.strictEqual(R.pontuarVaga(vaga(), p), 8);
  assert.strictEqual(R.pontuacaoMaxima(p), 8);
});

test("quem não combina com nada recebe 0", () => {
  const p = perfil({ areas: ["Risco"], cidades: ["Curitiba"], tipos: ["Gestora"], palavras: "valuation" });
  assert.strictEqual(R.pontuarVaga(vaga(), p), 0);
});

test("vários interesses: basta um bater, e cada critério conta uma vez", () => {
  const p = perfil({ areas: ["Risco", "Crédito", "Tesouraria"], cidades: ["Recife", "São Paulo"] });
  assert.strictEqual(R.pontuarVaga(vaga(), p), 5);
});

test("comparação ignora maiúsculas, acentos e espaços", () => {
  const p = perfil({ areas: ["  CREDITO "], cidades: ["sao paulo"], tipos: ["bAnCo"] });
  assert.strictEqual(R.pontuarVaga(vaga(), p), 6);
});

test("palavra-chave: vale no título ou na empresa, uma vez só, com acento/caixa livres", () => {
  assert.strictEqual(R.pontuarVaga(vaga({ titulo: "Estágio em M&A" }), perfil({ palavras: "m&a" })), 2);
  assert.strictEqual(R.pontuarVaga(vaga({ empresa: "Kapitalo Investimentos" }), perfil({ palavras: "KAPITALO" })), 2);
  assert.strictEqual(R.pontuarVaga(vaga({ titulo: "Estágio em Crédito" }), perfil({ palavras: "CREDITO" })), 2);
  // várias palavras presentes: continua +2, não +4
  assert.strictEqual(R.pontuarVaga(vaga({ titulo: "Estágio em M&A e valuation" }), perfil({ palavras: "M&A, valuation" })), 2);
  // separadores: vírgula, ponto e vírgula, linha nova
  assert.deepStrictEqual(R.palavrasChave(perfil({ palavras: "M&A; Valuation,\n risco ,, M&A" })), ["m&a", "valuation", "risco"]);
});

test("palavra-chave NÃO olha área, cidade, fonte nem tipo", () => {
  const v = vaga({ area: "Research", cidade: "Curitiba", fonte: "LinkedIn", tipoEmpresa: "Gestora" });
  for (const palavra of ["research", "curitiba", "linkedin", "gestora"]) {
    assert.strictEqual(R.pontuarVaga(v, perfil({ palavras: palavra })), 0, palavra);
  }
});

test("selo 'Combina com você': 60% da pontuação máxima do perfil", () => {
  const so_area = perfil({ areas: ["Crédito"] });                          // máximo 3
  assert.strictEqual(R.combinaComPerfil(vaga(), so_area), true);
  assert.strictEqual(R.combinaComPerfil(vaga({ area: "Risco" }), so_area), false);
  const area_cidade = perfil({ areas: ["Crédito"], cidades: ["São Paulo"] }); // máximo 5; área sozinha = 3/5 = 60%
  assert.strictEqual(R.combinaComPerfil(vaga(), area_cidade), true);
  assert.strictEqual(R.combinaComPerfil(vaga({ area: "Risco" }), area_cidade), false);          // só cidade = 2/5
  const completo = perfil({ areas: ["Crédito"], cidades: ["São Paulo"], tipos: ["Banco"], palavras: "estágio" }); // máximo 8
  assert.strictEqual(R.combinaComPerfil(vaga({ area: "Risco", tipoEmpresa: "Gestora" }), completo), false);     // cidade + palavra = 4/8
  assert.strictEqual(R.combinaComPerfil(vaga({ tipoEmpresa: "Gestora", titulo: "Analista" }), completo), true);  // área + cidade = 5/8
});

// ---------------- ordenação ----------------
test("sem perfil: relevância mantém a ordem de sempre (publicação mais recente primeiro)", () => {
  const lista = [vaga({ titulo: "A", dataPublicacao: "2026-09-10" }), vaga({ titulo: "B", dataPublicacao: "2026-09-25", prazoInscricao: "2026-10-30" }), vaga({ titulo: "C", dataPublicacao: "2026-09-20", prazoInscricao: "2026-10-02" })];
  assert.deepStrictEqual(R.ordenarVagas(lista, "relevancia", perfil()).map(v => v.titulo), ["B", "C", "A"]);
  assert.deepStrictEqual(R.ordenarVagas(lista, "relevancia", null).map(v => v.titulo), ["B", "C", "A"]);
});

test("sem perfil e datas iguais: mantém a ordem original (ordenação estável)", () => {
  const lista = ["1", "2", "3", "4"].map(t => vaga({ titulo: t, dataPublicacao: "2026-09-20" }));
  assert.deepStrictEqual(R.ordenarVagas(lista, "relevancia", perfil()).map(v => v.titulo), ["1", "2", "3", "4"]);
});

test("com perfil: maior pontuação primeiro", () => {
  const lista = [vaga({ titulo: "nada", area: "Risco", cidade: "Recife", tipoEmpresa: "Gestora" }), vaga({ titulo: "area", cidade: "Recife", tipoEmpresa: "Gestora" }), vaga({ titulo: "tudo" })];
  const p = perfil({ areas: ["Crédito"], cidades: ["São Paulo"], tipos: ["Banco"] });
  assert.deepStrictEqual(R.ordenarVagas(lista, "relevancia", p).map(v => v.titulo), ["tudo", "area", "nada"]);
});

test("empate de pontos: prazo mais próximo primeiro, depois publicação mais recente", () => {
  const p = perfil({ areas: ["Crédito"] });
  const lista = [
    vaga({ titulo: "sem-prazo-recente", dataPublicacao: "2026-09-29" }),
    vaga({ titulo: "prazo-longe", prazoInscricao: "2026-11-30", dataPublicacao: "2026-09-01" }),
    vaga({ titulo: "prazo-perto", prazoInscricao: "2026-10-05", dataPublicacao: "2026-09-02" }),
    vaga({ titulo: "sem-prazo-antiga", dataPublicacao: "2026-09-10" }),
    vaga({ titulo: "mesmo-prazo-mais-recente", prazoInscricao: "2026-10-05", dataPublicacao: "2026-09-15" }),
  ];
  assert.deepStrictEqual(R.ordenarVagas(lista, "relevancia", p).map(v => v.titulo),
    ["mesmo-prazo-mais-recente", "prazo-perto", "prazo-longe", "sem-prazo-recente", "sem-prazo-antiga"]);
});

test("pontuação pesa mais que o prazo", () => {
  const p = perfil({ areas: ["Crédito"] });
  const lista = [vaga({ titulo: "urgente-sem-match", area: "Risco", prazoInscricao: "2026-10-02" }), vaga({ titulo: "match-sem-prazo" })];
  assert.deepStrictEqual(R.ordenarVagas(lista, "relevancia", p).map(v => v.titulo), ["match-sem-prazo", "urgente-sem-match"]);
});

test("modo 'mais recentes' ignora o perfil", () => {
  const p = perfil({ areas: ["Crédito"] });
  const lista = [vaga({ titulo: "antiga-match", dataPublicacao: "2026-09-01" }), vaga({ titulo: "nova-sem-match", area: "Risco", dataPublicacao: "2026-09-28" })];
  assert.deepStrictEqual(R.ordenarVagas(lista, "recentes", p).map(v => v.titulo), ["nova-sem-match", "antiga-match"]);
});

test("modo 'prazo': prazo mais próximo primeiro, sem prazo por último", () => {
  const lista = [vaga({ titulo: "sem", dataPublicacao: "2026-09-29" }), vaga({ titulo: "longe", prazoInscricao: "2026-12-01" }), vaga({ titulo: "perto", prazoInscricao: "2026-10-03" }), vaga({ titulo: "sem-antiga", dataPublicacao: "2026-09-01" })];
  assert.deepStrictEqual(R.ordenarVagas(lista, "prazo", perfil()).map(v => v.titulo), ["perto", "longe", "sem", "sem-antiga"]);
});

test("ordenar não altera a lista original", () => {
  const lista = [vaga({ titulo: "A", dataPublicacao: "2026-09-01" }), vaga({ titulo: "B", dataPublicacao: "2026-09-28" })];
  const copia = lista.map(v => v.titulo);
  R.ordenarVagas(lista, "recentes", perfil());
  assert.deepStrictEqual(lista.map(v => v.titulo), copia);
});

// ---------------- armazenamento (localStorage) ----------------
const armazenamentoFalso = () => { const dados = {}; return { dados, getItem: k => (k in dados ? dados[k] : null), setItem: (k, v) => { dados[k] = String(v); } }; };

test("salvar e ler o perfil (ida e volta)", () => {
  const a = armazenamentoFalso();
  const p = perfil({ areas: ["Crédito", "Risco"], cidades: ["São Paulo"], tipos: ["Banco"], palavras: "M&A, valuation" });
  assert.strictEqual(R.salvarPerfil(a, p), true);
  assert.deepStrictEqual(R.lerPerfil(a), p);
});

test("localStorage indisponível (null): ler dá perfil vazio e salvar devolve false, sem erro", () => {
  assert.deepStrictEqual(R.lerPerfil(null), perfil());
  assert.deepStrictEqual(R.lerPerfil(undefined), perfil());
  assert.strictEqual(R.salvarPerfil(null, perfil({ areas: ["Risco"] })), false);
});

test("localStorage bloqueado (lança erro ao ler e ao gravar): nada quebra", () => {
  const bloqueado = { getItem() { throw new Error("SecurityError"); }, setItem() { throw new Error("QuotaExceededError"); } };
  assert.deepStrictEqual(R.lerPerfil(bloqueado), perfil());
  assert.strictEqual(R.salvarPerfil(bloqueado, perfil({ areas: ["Risco"] })), false);
});

test("dados quebrados ou estranhos guardados no navegador viram perfil seguro", () => {
  const a = armazenamentoFalso();
  for (const lixo of ["{quebrado", "null", "123", "\"texto\"", "[]", "{\"areas\":\"Risco\"}", "{\"areas\":[1,null,{},\"Risco\",\"  \"],\"palavras\":42}"]) {
    a.dados[R.CHAVE_PERFIL] = lixo;
    const lido = R.lerPerfil(a);
    assert.ok(Array.isArray(lido.areas) && Array.isArray(lido.cidades) && Array.isArray(lido.tipos) && typeof lido.palavras === "string", lixo);
  }
  a.dados[R.CHAVE_PERFIL] = "{\"areas\":[1,null,{},\"Risco\",\"  \"],\"palavras\":42}";
  assert.deepStrictEqual(R.lerPerfil(a), perfil({ areas: ["Risco"] }));
});

test("palavras-chave e listas gigantes são cortadas", () => {
  const p = R.sanitizarPerfil({ areas: Array.from({ length: 500 }, (_, i) => "a" + i), palavras: "x".repeat(5000) });
  assert.strictEqual(p.areas.length, 60);
  assert.strictEqual(p.palavras.length, 200);
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
