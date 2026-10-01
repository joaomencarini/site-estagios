// Regras compartilhadas: o site (navegador) e os scripts (Node) usam este mesmo arquivo,
// assim as regras ficam iguais nos dois lugares.

const DIAS_SEM_PRAZO = 45;       // vaga MANUAL sem prazo some 45 dias depois da data de publicação
const FALHAS_PARA_INATIVAR = 2;  // falhas de link em dias diferentes para esconder a vaga

// Data de hoje no formato AAAA-MM-DD.
// Sem argumento usa o fuso do computador; com fuso (ex.: "America/Sao_Paulo") usa esse fuso.
function hojeIso(fuso) {
  const agora = new Date();
  if (fuso) {
    return new Intl.DateTimeFormat("sv-SE", { timeZone: fuso }).format(agora);
  }
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return agora.getFullYear() + "-" + mes + "-" + dia;
}

// Quantos dias se passaram entre duas datas AAAA-MM-DD
function diasEntre(inicio, fim) {
  const [a1, m1, d1] = inicio.split("-").map(Number);
  const [a2, m2, d2] = fim.split("-").map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000);
}

// Vaga vencida:
// - com prazo: some no dia seguinte ao prazo;
// - automática (tem "origem") sem prazo: nunca vence por idade. Enquanto a fonte listar a vaga ela está
//   aberta, e quando some da fonte o script a tira de data/vagas-auto.js;
// - manual sem prazo: some quando completa DIAS_SEM_PRAZO dias desde a publicação.
function vagaVencida(vaga, hoje) {
  if (vaga.prazoInscricao) {
    return vaga.prazoInscricao < hoje;
  }
  if (vaga.origem) {
    return false;
  }
  if (!vaga.dataPublicacao) {
    return false;
  }
  return diasEntre(vaga.dataPublicacao, hoje) >= DIAS_SEM_PRAZO;
}

// Vaga inativa: o link falhou em dias diferentes (histórico em data/status-links.json)
function linkInativo(vaga, statusLinks) {
  const situacao = vaga.link && statusLinks ? statusLinks[vaga.link] : null;
  return Boolean(situacao) && situacao.falhasConsecutivas >= FALHAS_PARA_INATIVAR;
}

// E-mail simples e seguro para usar em "mailto:": uma arroba, um ponto no domínio, sem espaços
// e sem símbolos que poderiam adicionar campos ao link (< > " ' , ; ? & # ( ) / \)
function emailValido(texto) {
  return typeof texto === "string" && /^[^\s@<>"',;?&#()/\\]+@[^\s@<>"',;?&#()/\\]+\.[^\s@<>"',;?&#()/\\]+$/.test(texto);
}

// ================= Personalização por interesses ("Meu perfil") =================
// Tudo roda no navegador: nada é enviado a servidor algum e nada pessoal é coletado.

// Pontos de cada coincidência entre a vaga e o perfil
const PESOS = { area: 3, cidade: 2, tipo: 1, palavra: 2 };
// "Combina com você": a vaga precisa de pelo menos 60% da pontuação máxima possível para o perfil
const LIMITE_COMBINA = 0.6;
const CHAVE_PERFIL = "estagiosPerfil";

// Texto sem acentos, em minúsculas e sem espaços nas pontas (para comparar "Crédito" com "credito")
function normalizarTexto(texto) {
  return String(texto == null ? "" : texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Perfil vazio: nada escolhido
function novoPerfil() {
  return { areas: [], cidades: [], tipos: [], palavras: "" };
}

// Garante que o perfil tenha o formato certo (também protege contra dados estranhos guardados no navegador)
function sanitizarPerfil(bruto) {
  const perfil = novoPerfil();
  if (!bruto || typeof bruto !== "object") {
    return perfil;
  }
  ["areas", "cidades", "tipos"].forEach(function (campo) {
    if (Array.isArray(bruto[campo])) {
      perfil[campo] = bruto[campo]
        .filter(function (item) { return typeof item === "string" && item.trim() !== ""; })
        .map(function (item) { return item.trim().slice(0, 100); })
        .slice(0, 60);
    }
  });
  if (typeof bruto.palavras === "string") {
    perfil.palavras = bruto.palavras.slice(0, 200);
  }
  return perfil;
}

// "M&A, valuation" vira ["m&a", "valuation"] (separa por vírgula, ponto e vírgula ou linha nova)
function palavrasChave(perfil) {
  const texto = perfil && typeof perfil.palavras === "string" ? perfil.palavras : "";
  const lista = [];
  texto.split(/[,;\n]/).forEach(function (parte) {
    const palavra = normalizarTexto(parte);
    if (palavra !== "" && !lista.includes(palavra)) {
      lista.push(palavra);
    }
  });
  return lista;
}

// Sem nenhuma área, cidade, tipo ou palavra-chave
function perfilVazio(perfil) {
  const p = sanitizarPerfil(perfil);
  return p.areas.length === 0 && p.cidades.length === 0 && p.tipos.length === 0 && palavrasChave(p).length === 0;
}

function estaNaLista(lista, valor) {
  const alvo = normalizarTexto(valor);
  return alvo !== "" && lista.some(function (item) { return normalizarTexto(item) === alvo; });
}

// Pontuação de uma vaga para um perfil:
// área igual a um interesse +3, cidade +2, tipo de empresa +1, palavra-chave no título ou na empresa +2
// (a palavra-chave vale uma vez só, mesmo que várias apareçam).
function pontuarVaga(vaga, perfil) {
  const p = sanitizarPerfil(perfil);
  let pontos = 0;
  if (estaNaLista(p.areas, vaga.area)) {
    pontos += PESOS.area;
  }
  if (estaNaLista(p.cidades, vaga.cidade)) {
    pontos += PESOS.cidade;
  }
  if (estaNaLista(p.tipos, vaga.tipoEmpresa)) {
    pontos += PESOS.tipo;
  }
  const alvo = normalizarTexto(vaga.titulo) + " | " + normalizarTexto(vaga.empresa);
  if (palavrasChave(p).some(function (palavra) { return alvo.includes(palavra); })) {
    pontos += PESOS.palavra;
  }
  return pontos;
}

// Maior pontuação que uma vaga poderia ter, considerando só o que o usuário preencheu
function pontuacaoMaxima(perfil) {
  const p = sanitizarPerfil(perfil);
  return (p.areas.length > 0 ? PESOS.area : 0) + (p.cidades.length > 0 ? PESOS.cidade : 0) +
    (p.tipos.length > 0 ? PESOS.tipo : 0) + (palavrasChave(p).length > 0 ? PESOS.palavra : 0);
}

// Mostra o selo "Combina com você"? Só com perfil preenchido e pontuação alta.
function combinaComPerfil(vaga, perfil) {
  const maximo = pontuacaoMaxima(perfil);
  const pontos = pontuarVaga(vaga, perfil);
  return maximo > 0 && pontos > 0 && pontos >= maximo * LIMITE_COMBINA;
}

// Prazo mais próximo primeiro; vaga sem prazo vai depois das que têm prazo
function compararPrazo(a, b) {
  if (a.prazoInscricao && b.prazoInscricao) {
    return a.prazoInscricao.localeCompare(b.prazoInscricao);
  }
  if (a.prazoInscricao) {
    return -1;
  }
  return b.prazoInscricao ? 1 : 0;
}

// Publicação mais recente primeiro
function compararDataRecente(a, b) {
  return String(b.dataPublicacao || "").localeCompare(String(a.dataPublicacao || ""));
}

// Ordena (sem alterar a lista original). Modos:
// "relevancia": pontuação maior primeiro; empate: prazo mais próximo, depois publicação mais recente.
//               Sem perfil preenchido, mantém a ordem de sempre (mais recentes primeiro).
// "recentes":   publicação mais recente primeiro.
// "prazo":      prazo mais próximo primeiro (sem prazo no fim), depois publicação mais recente.
// Empates totais mantêm a ordem em que as vagas chegaram.
function ordenarVagas(vagas, modo, perfil) {
  const comPerfil = !perfilVazio(perfil);
  const itens = vagas.map(function (vaga, posicao) {
    return { vaga: vaga, posicao: posicao, pontos: comPerfil ? pontuarVaga(vaga, perfil) : 0 };
  });
  itens.sort(function (x, y) {
    let resultado = 0;
    if (modo === "prazo") {
      resultado = compararPrazo(x.vaga, y.vaga) || compararDataRecente(x.vaga, y.vaga);
    } else if (modo === "relevancia" && comPerfil) {
      resultado = (y.pontos - x.pontos) || compararPrazo(x.vaga, y.vaga) || compararDataRecente(x.vaga, y.vaga);
    } else {
      resultado = compararDataRecente(x.vaga, y.vaga);
    }
    return resultado || (x.posicao - y.posicao);
  });
  return itens.map(function (item) { return item.vaga; });
}

// Lê o perfil guardado. "armazenamento" é o localStorage (ou null se o navegador o bloqueia).
// Qualquer problema (bloqueado, vazio, texto quebrado) devolve um perfil vazio, sem erro.
function lerPerfil(armazenamento) {
  try {
    const texto = armazenamento ? armazenamento.getItem(CHAVE_PERFIL) : null;
    return sanitizarPerfil(texto ? JSON.parse(texto) : null);
  } catch (erro) {
    return novoPerfil();
  }
}

// Guarda o perfil. Devolve true se conseguiu e false se o navegador não deixou (sem lançar erro).
function salvarPerfil(armazenamento, perfil) {
  try {
    armazenamento.setItem(CHAVE_PERFIL, JSON.stringify(sanitizarPerfil(perfil)));
    return true;
  } catch (erro) {
    return false;
  }
}

// No Node (scripts) exporta as funções; no navegador elas já ficam disponíveis direto
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DIAS_SEM_PRAZO, FALHAS_PARA_INATIVAR, hojeIso, diasEntre, vagaVencida, linkInativo, emailValido,
    PESOS, LIMITE_COMBINA, CHAVE_PERFIL, normalizarTexto, novoPerfil, sanitizarPerfil, palavrasChave, perfilVazio,
    pontuarVaga, pontuacaoMaxima, combinaComPerfil, ordenarVagas, lerPerfil, salvarPerfil };
}
