// A lista "vagas" vem do arquivo data/vagas.js (carregado antes deste).

const selectArea = document.getElementById("filtro-area");
const selectCidade = document.getElementById("filtro-cidade");
const selectFonte = document.getElementById("filtro-fonte");
const botaoLimpar = document.getElementById("botao-limpar");
const listaVagas = document.getElementById("lista-vagas");
const mensagemVazio = document.getElementById("mensagem-vazio");
const contador = document.getElementById("contador");

// Transforma "2026-09-29" em "29/09/2026"
function formatarData(dataIso) {
  const [ano, mes, dia] = dataIso.split("-");
  return dia + "/" + mes + "/" + ano;
}

// Data de hoje no formato AAAA-MM-DD, no fuso do computador de quem abre o site
function hojeIso() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return agora.getFullYear() + "-" + mes + "-" + dia;
}

// Só aparecem vagas sem prazo ou com prazo de hoje em diante (prazo vencido some sozinho)
const hoje = hojeIso();
const vagasAtivas = vagas.filter(function (vaga) {
  return !vaga.prazoInscricao || vaga.prazoInscricao >= hoje;
});

// Só aceita links que começam com http:// ou https:// (evita links perigosos)
function linkSeguro(link) {
  return typeof link === "string" && /^https?:\/\//i.test(link);
}

// Cria as opções de um filtro (cidade ou fonte) a partir das vagas ativas, sem repetir
function preencherOpcoes(select, campo) {
  const valores = [];
  vagasAtivas.forEach(function (vaga) {
    if (!valores.includes(vaga[campo])) {
      valores.push(vaga[campo]);
    }
  });
  valores.sort(function (a, b) {
    return a.localeCompare(b, "pt-BR");
  });
  valores.forEach(function (valor) {
    const opcao = document.createElement("option");
    opcao.textContent = valor;
    select.appendChild(opcao);
  });
}

// Cria um elemento com classe e texto (atalho para deixar o código mais curto)
function criar(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) {
    elemento.className = classe;
  }
  if (texto) {
    elemento.textContent = texto;
  }
  return elemento;
}

// Monta o cartão de uma vaga
function criarCartao(vaga) {
  const cartao = criar("article", "vaga");

  if (vaga.exemplo) {
    cartao.appendChild(criar("span", "selo-exemplo", "EXEMPLO"));
  }

  cartao.appendChild(criar("h2", "", vaga.titulo));
  cartao.appendChild(criar("p", "empresa", vaga.empresa));

  // Etiquetas (área e tipo de empresa) e cidade
  const detalhes = criar("div", "detalhes");
  detalhes.appendChild(criar("span", "etiqueta", vaga.area));
  detalhes.appendChild(criar("span", "etiqueta", vaga.tipoEmpresa));
  detalhes.appendChild(criar("span", "local", vaga.cidade));
  cartao.appendChild(detalhes);

  // Data, fonte e prazo (se houver)
  const meta = criar("div", "meta");
  meta.appendChild(criar("span", "", "Publicada em " + formatarData(vaga.dataPublicacao)));
  meta.appendChild(criar("span", "", "Fonte: " + vaga.fonte));
  if (vaga.prazoInscricao) {
    meta.appendChild(criar("span", "prazo", "Inscrições até " + formatarData(vaga.prazoInscricao)));
  }
  cartao.appendChild(meta);

  // Botão que abre a vaga original em outra aba
  if (linkSeguro(vaga.link)) {
    const botao = criar("a", "botao-vaga", "Ver vaga e se candidatar");
    botao.href = vaga.link;
    botao.target = "_blank";
    botao.rel = "noopener noreferrer";
    cartao.appendChild(botao);
  }

  return cartao;
}

// Aplica os filtros escolhidos e redesenha a lista
function mostrarVagas() {
  const area = selectArea.value;
  const cidade = selectCidade.value;
  const fonte = selectFonte.value;

  // Vaga passa se o filtro estiver vazio OU combinar com a vaga
  const filtradas = vagasAtivas.filter(function (vaga) {
    const passaArea = area === "" || vaga.area === area;
    const passaCidade = cidade === "" || vaga.cidade === cidade;
    const passaFonte = fonte === "" || vaga.fonte === fonte;
    return passaArea && passaCidade && passaFonte;
  });

  // Mais recentes primeiro (datas ISO podem ser comparadas como texto)
  filtradas.sort(function (a, b) {
    return b.dataPublicacao.localeCompare(a.dataPublicacao);
  });

  listaVagas.replaceChildren();
  filtradas.forEach(function (vaga) {
    listaVagas.appendChild(criarCartao(vaga));
  });

  // Mensagem diferente se não há nenhuma vaga cadastrada ou se só os filtros esvaziaram a lista
  if (vagasAtivas.length === 0) {
    mensagemVazio.textContent = "Ainda não há vagas abertas cadastradas. Volte em breve!";
  } else {
    mensagemVazio.textContent = "Nenhuma vaga encontrada com esses filtros. Tente limpar os filtros.";
  }
  mensagemVazio.hidden = filtradas.length > 0;
  contador.textContent = filtradas.length + " de " + vagasAtivas.length + " vagas";
}

function limparFiltros() {
  selectArea.value = "";
  selectCidade.value = "";
  selectFonte.value = "";
  mostrarVagas();
}

selectArea.addEventListener("change", mostrarVagas);
selectCidade.addEventListener("change", mostrarVagas);
selectFonte.addEventListener("change", mostrarVagas);
botaoLimpar.addEventListener("click", limparFiltros);

preencherOpcoes(selectCidade, "cidade");
preencherOpcoes(selectFonte, "fonte");
mostrarVagas();
