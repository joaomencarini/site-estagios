// Busca vagas de estágio na API pública do Greenhouse e grava em data/vagas-auto.js.
// Uso: node scripts/atualizar-vagas.js        (sem dependências, precisa do Node 18 ou mais novo)
// Só guarda título, empresa, cidade, link e data. A descrição da vaga NUNCA é lida nem salva.
const fs = require("fs");
const path = require("path");
const { PASTA_DADOS, ARQUIVO_FONTES, hoje, NAVEGADOR, lerLista, gravarSeMudou } = require("./util");

const API = process.env.GREENHOUSE_API || "https://boards-api.greenhouse.io/v1/boards";
const TEMPO_LIMITE_MS = Number(process.env.TEMPO_LIMITE_MS) || 20000;

// Título tem "estágio", "estagiário", "internship" ou "summer job"? (ignora maiúsculas e acentos)
function ehEstagio(titulo) {
  const texto = String(titulo).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return /estagi|internship|summer job/.test(texto);
}

// Vagas que não queremos: ciclo antigo ("2026.1" no título) ou ID listado em "ignorarIds" no fontes.json
function deveIgnorar(job, fonte) {
  const ids = (fonte.ignorarIds || []).map(String);
  return String(job.title).includes("2026.1") || ids.includes(String(job.id));
}

// "São Paulo, Brazil" vira "São Paulo"
function extrairCidade(local) {
  const nome = local && local.name ? String(local.name).split(",")[0].trim() : "";
  return nome || "Não informada";
}

const ehData = function (texto) { return /^\d{4}-\d{2}-\d{2}$/.test(texto); };

// Busca uma empresa na API. Se der qualquer erro, lança exceção (quem chama decide o que fazer).
async function buscarEmpresa(fonte) {
  const controle = new AbortController();
  const relogio = setTimeout(function () { controle.abort(); }, TEMPO_LIMITE_MS);
  try {
    // Sem "?content=true": a API nem envia a descrição das vagas
    const resposta = await fetch(API + "/" + encodeURIComponent(fonte.greenhouse) + "/jobs", {
      headers: { "User-Agent": NAVEGADOR, Accept: "application/json" },
      signal: controle.signal
    });
    if (!resposta.ok) {
      throw new Error("a API respondeu HTTP " + resposta.status);
    }
    const dados = await resposta.json();
    if (!dados || !Array.isArray(dados.jobs)) {
      throw new Error("resposta inesperada da API (sem lista \"jobs\")");
    }
    return dados.jobs;
  } finally {
    clearTimeout(relogio);
  }
}

// Transforma o texto de uma vaga no formato do site, usando só os campos permitidos
function montarVaga(job, fonte, origem, existente) {
  // Se a vaga já era conhecida, mantém a data de publicação antiga (updated_at muda a cada edição)
  const dataApi = String(job.first_published || job.updated_at || "").slice(0, 10);
  const dataPublicacao = existente ? existente.dataPublicacao : (ehData(dataApi) ? dataApi : hoje);
  return {
    titulo: String(job.title).trim(),
    empresa: fonte.empresa,
    area: fonte.area || "Diversas",
    cidade: extrairCidade(job.location),
    tipoEmpresa: fonte.tipoEmpresa || "Outro",
    fonte: fonte.fonte || "Site da empresa",
    link: job.absolute_url,
    dataPublicacao: dataPublicacao,
    origem: origem
  };
}

function textoDoArquivo(lista) {
  const blocos = lista.map(function (vaga) {
    const linhas = Object.keys(vaga).map(function (campo) {
      return "    " + campo + ": " + JSON.stringify(vaga[campo]);
    });
    return "  {\n" + linhas.join(",\n") + "\n  }";
  });
  return "// ============================================================\n" +
    "// VAGAS AUTOMÁTICAS: arquivo GERADO por scripts/atualizar-vagas.js.\n" +
    "// NÃO edite à mão (as mudanças seriam apagadas na próxima atualização).\n" +
    "// Para vagas manuais, use data/vagas.js.\n" +
    "// ============================================================\n" +
    "const vagasAuto = [\n" + blocos.map(function (b) { return b + ",\n"; }).join("") + "];\n";
}

async function principal() {
  const fontes = JSON.parse(fs.readFileSync(ARQUIVO_FONTES, "utf8"));
  const existentes = lerLista("vagas-auto.js", "vagasAuto");
  const resultado = [];
  const linksVistos = new Set();
  const avisos = [];

  for (const fonte of fontes) {
    const nome = fonte.empresa || "(sem nome)";
    const origem = "greenhouse:" + fonte.greenhouse;
    const dessaFonte = existentes.filter(function (vaga) { return vaga.origem === origem; });
    let novas;
    try {
      if (!fonte.greenhouse || !fonte.empresa) {
        throw new Error("fontes.json: cada empresa precisa de \"empresa\" e \"greenhouse\"");
      }
      const jobs = await buscarEmpresa(fonte);
      // Lista vazia quando já tínhamos vagas desta empresa parece defeito da API: não confiamos
      if (jobs.length === 0 && dessaFonte.length > 0) {
        throw new Error("a API devolveu 0 vagas (suspeito); mantendo as que já existiam");
      }
      novas = jobs
        .filter(function (job) { return job.title && job.absolute_url && ehEstagio(job.title) && !deveIgnorar(job, fonte); })
        .map(function (job) {
          const antiga = dessaFonte.find(function (vaga) { return vaga.link === job.absolute_url; });
          return montarVaga(job, fonte, origem, antiga);
        })
        .filter(function (vaga, posicao, todas) {  // tira duplicata de link dentro da mesma empresa
          return todas.findIndex(function (outra) { return outra.link === vaga.link; }) === posicao;
        });
      const adicionadas = novas.filter(function (n) { return !dessaFonte.some(function (v) { return v.link === n.link; }); }).length;
      const sumiram = dessaFonte.filter(function (v) { return !novas.some(function (n) { return n.link === v.link; }); }).length;
      console.log("OK    " + nome + ": " + jobs.length + " vagas na API, " + novas.length + " de estágio (+" + adicionadas + " novas, -" + sumiram + " que sumiram)");
    } catch (erro) {
      // Fonte falhou: não apaga nada, mantém o que já existia desta empresa
      const causa = erro.name === "AbortError" ? "tempo esgotado (" + TEMPO_LIMITE_MS / 1000 + "s)" : (erro.cause && erro.cause.code) || erro.message;
      console.log("FALHA " + nome + ": " + causa + " -> mantidas " + dessaFonte.length + " vagas existentes");
      avisos.push(nome + ": " + causa);
      novas = dessaFonte;
    }
    novas.forEach(function (vaga) {
      if (!linksVistos.has(vaga.link)) {  // evita duplicata pelo link
        linksVistos.add(vaga.link);
        resultado.push(vaga);
      }
    });
  }

  // Mais recentes primeiro; ordem fixa para o arquivo só mudar quando as vagas mudarem
  resultado.sort(function (a, b) {
    return b.dataPublicacao.localeCompare(a.dataPublicacao) || a.empresa.localeCompare(b.empresa) || a.titulo.localeCompare(b.titulo);
  });

  const gravou = gravarSeMudou(path.join(PASTA_DADOS, "vagas-auto.js"), textoDoArquivo(resultado));
  console.log("\nResumo: " + resultado.length + " vagas automáticas; arquivo " + (gravou ? "ATUALIZADO" : "sem mudanças") + ".");
  if (avisos.length > 0) {
    // No GitHub Actions esta linha vira um aviso amarelo na página da execução
    console.log("::warning::Fontes com falha (vagas antigas mantidas): " + avisos.join("; "));
  }
}

principal().catch(function (erro) {
  console.error("Erro inesperado:", erro);
  process.exit(1);
});
