// Nome e frase do site, definidos AQUI e só aqui. Para trocar o nome, mude o valor de "nome" abaixo
// (e rode `node --test`: um teste confere se os textos de reserva do HTML continuam iguais a estes).
// O JavaScript preenche título da aba, cabeçalho, rodapé e meta tags a partir destes valores.
const MARCA = {
  nome: "Largada Fin",
  frase: "Estágios no mercado financeiro, num só lugar",
  descricao: "Vagas de estágio em bancos, corretoras, gestoras, fintechs e consultorias, com link direto para se candidatar."
};

// Título da aba: "Largada Fin — Estágios no mercado financeiro, num só lugar" (ou "Página — Largada Fin")
function tituloDaAba(pagina) {
  return pagina ? pagina + " — " + MARCA.nome : MARCA.nome + " — " + MARCA.frase;
}

// Escreve a marca na página: título da aba, textos com data-marca e meta tags. Só texto puro.
function aplicarMarca(pagina) {
  document.title = tituloDaAba(pagina);
  document.querySelectorAll("[data-marca]").forEach(function (elemento) {
    const valor = MARCA[elemento.getAttribute("data-marca")];
    if (typeof valor === "string") {
      elemento.textContent = valor;
    }
  });
  const metas = {
    'meta[name="description"]': MARCA.descricao,
    'meta[property="og:title"]': tituloDaAba(pagina),
    'meta[property="og:description"]': MARCA.descricao,
    'meta[property="og:site_name"]': MARCA.nome
  };
  Object.keys(metas).forEach(function (seletor) {
    const meta = document.querySelector(seletor);
    if (meta) {
      meta.setAttribute("content", metas[seletor]);
    }
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { MARCA, tituloDaAba };
}
