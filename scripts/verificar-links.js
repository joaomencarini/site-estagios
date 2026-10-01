// Confere se os links das vagas (manuais e automáticas) ainda funcionam.
// Uso: node scripts/verificar-links.js        (sem dependências, precisa do Node 18 ou mais novo)
// Grava o histórico em data/status-links.json (e uma cópia em data/status-links.js para o site ler).
// NUNCA apaga vagas: quem esconde a vaga é o site, lendo este histórico.
const fs = require("fs");
const path = require("path");
const { FALHAS_PARA_INATIVAR, vagaVencida } = require("../js/regras");
const { PASTA_DADOS, hoje, NAVEGADOR, lerLista, gravarSeMudou } = require("./util");

const TEMPO_LIMITE_MS = Number(process.env.TEMPO_LIMITE_MS) || 15000;
const CONTROLE_URL = process.env.CONTROLE_URL || "https://github.com";  // site que sempre deve abrir
const SIMULTANEOS = 5;

// Frases que indicam vaga encerrada, mesmo com a página abrindo normalmente (sem acentos e minúsculas)
const FRASES_ENCERRADA = ["expirad", "encerrad", "nao esta mais disponivel", "no longer available", "page not found", "job not found"];

function simplificar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Faz um GET e classifica o resultado: { resultado: "ok" | "falha" | "nao-verificado", motivo }
async function verificar(link) {
  const controle = new AbortController();
  const relogio = setTimeout(function () { controle.abort(); }, TEMPO_LIMITE_MS);
  try {
    const resposta = await fetch(link, {
      redirect: "follow",
      signal: controle.signal,
      headers: { "User-Agent": NAVEGADOR, Accept: "text/html,application/xhtml+xml,*/*", "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8" }
    });
    const status = resposta.status;
    if (status === 404 || status === 410) {
      return { resultado: "falha", motivo: "HTTP " + status };
    }
    if (status === 403 || status === 429 || status >= 500) {
      return { resultado: "nao-verificado", motivo: "HTTP " + status + " (o site pode estar bloqueando o teste)" };
    }
    if (status < 200 || status >= 300) {
      return { resultado: "nao-verificado", motivo: "HTTP " + status + " (resposta inesperada)" };
    }
    // Greenhouse manda vagas encerradas para a página do quadro com "error=true"
    if (/[?&]error=true\b/.test(resposta.url)) {
      return { resultado: "falha", motivo: "redirecionou para a página de erro do Greenhouse" };
    }
    // Status 200: procura frases de "vaga encerrada" no texto da página (ignora scripts e estilos)
    const html = (await resposta.text()).slice(0, 1000000);
    const texto = simplificar(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " "));
    const frase = FRASES_ENCERRADA.find(function (f) { return texto.includes(f); });
    if (frase) {
      return { resultado: "falha", motivo: "a página contém \"" + frase + "\"" };
    }
    return { resultado: "ok", motivo: "HTTP " + status };
  } catch (erro) {
    if (erro.name === "AbortError") {
      return { resultado: "nao-verificado", motivo: "tempo esgotado (" + TEMPO_LIMITE_MS / 1000 + "s)" };
    }
    const codigo = (erro.cause && erro.cause.code) || erro.message;
    if (codigo === "ENOTFOUND") {
      return { resultado: "falha", motivo: "endereço (DNS) não existe" };
    }
    return { resultado: "nao-verificado", motivo: "erro de rede: " + codigo };
  } finally {
    clearTimeout(relogio);
  }
}

// Confere se a internet do servidor funciona. Sem isso, todo link pareceria quebrado.
async function redeFunciona() {
  const controle = new AbortController();
  const relogio = setTimeout(function () { controle.abort(); }, TEMPO_LIMITE_MS);
  try {
    await fetch(CONTROLE_URL, { headers: { "User-Agent": NAVEGADOR }, signal: controle.signal });
    return true;  // qualquer resposta HTTP já prova que há rede
  } catch (erro) {
    return false;
  } finally {
    clearTimeout(relogio);
  }
}

// Roda a função "tarefa" para cada item, SIMULTANEOS de cada vez
async function emLotes(itens, tarefa) {
  const resultados = new Array(itens.length);
  let proximo = 0;
  async function trabalhador() {
    while (proximo < itens.length) {
      const indice = proximo++;
      resultados[indice] = await tarefa(itens[indice]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(SIMULTANEOS, itens.length) }, trabalhador));
  return resultados;
}

async function principal() {
  const todas = lerLista("vagas.js", "vagas").concat(lerLista("vagas-auto.js", "vagasAuto"));
  const caminhoJson = path.join(PASTA_DADOS, "status-links.json");
  const antigo = fs.existsSync(caminhoJson) ? JSON.parse(fs.readFileSync(caminhoJson, "utf8")) : {};

  // Só vagas com link, que não são de exemplo e que ainda não venceram
  const vagasParaVerificar = [];
  const vistos = new Set();
  todas.forEach(function (vaga) {
    if (vaga.link && !vaga.exemplo && !vagaVencida(vaga, hoje) && !vistos.has(vaga.link)) {
      vistos.add(vaga.link);
      vagasParaVerificar.push(vaga);
    }
  });
  console.log("Verificando " + vagasParaVerificar.length + " links (data de hoje: " + hoje + ")...\n");

  if (vagasParaVerificar.length > 0 && !(await redeFunciona())) {
    console.log("SEM REDE: não consegui abrir " + CONTROLE_URL + ". Nada foi verificado e o histórico não foi alterado.");
    console.log("::warning::verificar-links: sem acesso à internet, nada foi verificado");
    return;
  }

  const respostas = await emLotes(vagasParaVerificar, function (vaga) { return verificar(vaga.link); });

  const novo = {};
  const contagem = { ok: 0, falha: 0, "nao-verificado": 0 };
  const falhas = [];
  const mudancas = [];
  vagasParaVerificar.forEach(function (vaga, i) {
    const { resultado, motivo } = respostas[i];
    const anterior = antigo[vaga.link] || { falhasConsecutivas: 0, ultimaFalhaEm: null };
    let falhas_ = anterior.falhasConsecutivas || 0;
    let ultimaFalhaEm = anterior.ultimaFalhaEm || null;
    const estavaInativa = falhas_ >= FALHAS_PARA_INATIVAR;

    if (resultado === "falha") {
      if (ultimaFalhaEm !== hoje) {  // duas checagens no mesmo dia contam como uma falha só
        falhas_ += 1;
        ultimaFalhaEm = hoje;
      }
    } else if (resultado === "ok") {
      falhas_ = 0;
      ultimaFalhaEm = null;
    }
    // "nao-verificado" não muda a contagem de falhas

    novo[vaga.link] = { ultimaChecagem: hoje, ultimoResultado: resultado, motivo: motivo, falhasConsecutivas: falhas_, ultimaFalhaEm: ultimaFalhaEm };
    contagem[resultado] += 1;
    const rotulo = vaga.empresa + " | " + vaga.titulo + " | " + vaga.link;
    if (resultado === "falha") {
      falhas.push(rotulo + "  -> " + motivo + " (falhas seguidas: " + falhas_ + ")");
    }
    if (!estavaInativa && falhas_ >= FALHAS_PARA_INATIVAR) {
      mudancas.push("INATIVA (deixa de aparecer no site): " + rotulo);
    }
    if (estavaInativa && falhas_ < FALHAS_PARA_INATIVAR) {
      mudancas.push("REATIVADA (voltou a aparecer): " + rotulo);
    }
    console.log(resultado.toUpperCase().padEnd(15) + " " + vaga.empresa + " | " + vaga.titulo + "  [" + motivo + "]");
  });

  // Chaves em ordem fixa, para o arquivo só mudar quando algo mudar de verdade
  const ordenado = {};
  Object.keys(novo).sort().forEach(function (link) { ordenado[link] = novo[link]; });
  const json = JSON.stringify(ordenado, null, 2) + "\n";
  const js = "// GERADO por scripts/verificar-links.js (cópia de status-links.json para o site conseguir ler). Não edite.\n" +
    "const statusLinks = " + JSON.stringify(ordenado, null, 2) + ";\n";
  const mudou1 = gravarSeMudou(caminhoJson, json);
  const mudou2 = gravarSeMudou(path.join(PASTA_DADOS, "status-links.js"), js);

  console.log("\n===== RESUMO =====");
  console.log(contagem.ok + " ok, " + contagem.falha + " com falha, " + contagem["nao-verificado"] + " não verificados");
  if (falhas.length > 0) {
    console.log("\nVagas com falha:");
    falhas.forEach(function (linha) { console.log("  - " + linha); });
  }
  if (mudancas.length > 0) {
    console.log("\nMudanças de situação:");
    mudancas.forEach(function (linha) { console.log("  - " + linha); });
  }
  console.log("\nHistórico " + (mudou1 || mudou2 ? "ATUALIZADO" : "sem mudanças") + " em data/status-links.json.");
}

principal().catch(function (erro) {
  console.error("Erro inesperado:", erro);
  process.exit(1);
});
