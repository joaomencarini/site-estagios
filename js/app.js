// A lista "vagas" vem do arquivo data/vagas.js (carregado antes deste).

const selectArea = document.getElementById("filtro-area");
const selectCidade = document.getElementById("filtro-cidade");
const botaoLimpar = document.getElementById("botao-limpar");
const listaVagas = document.getElementById("lista-vagas");
const mensagemVazio = document.getElementById("mensagem-vazio");
const contador = document.getElementById("contador");

// Transforma "2026-09-29" em "29/09/2026"
function formatarData(dataIso) {
  const [ano, mes, dia] = dataIso.split("-");
  return dia + "/" + mes + "/" + ano;
}

// Cria as opções do filtro de cidade a partir das vagas (sem repetir)
function preencherCidades() {
  const cidades = [];
  vagas.forEach(function (vaga) {
    if (!cidades.includes(vaga.cidade)) {
      cidades.push(vaga.cidade);
    }
  });
  cidades.sort();
  cidades.forEach(function (cidade) {
    const opcao = document.createElement("option");
    opcao.textContent = cidade;
    selectCidade.appendChild(opcao);
  });
}

// Monta o cartão de uma vaga
function criarCartao(vaga) {
  const cartao = document.createElement("article");
  cartao.className = "vaga";

  const titulo = document.createElement("h2");
  titulo.textContent = vaga.titulo;

  const empresa = document.createElement("p");
  empresa.className = "empresa";
  empresa.textContent = vaga.empresa;

  const detalhes = document.createElement("div");
  detalhes.className = "detalhes";
  [vaga.area, vaga.tipoEmpresa].forEach(function (texto) {
    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta";
    etiqueta.textContent = texto;
    detalhes.appendChild(etiqueta);
  });
  const local = document.createElement("span");
  local.textContent = vaga.cidade + " • Publicada em " + formatarData(vaga.dataPublicacao);
  detalhes.appendChild(local);

  cartao.append(titulo, empresa, detalhes);
  return cartao;
}

// Aplica os filtros escolhidos e redesenha a lista
function mostrarVagas() {
  const area = selectArea.value;
  const cidade = selectCidade.value;

  // Vaga passa se o filtro estiver vazio OU combinar com a vaga
  const filtradas = vagas.filter(function (vaga) {
    const passaArea = area === "" || vaga.area === area;
    const passaCidade = cidade === "" || vaga.cidade === cidade;
    return passaArea && passaCidade;
  });

  // Mais recentes primeiro (datas ISO podem ser comparadas como texto)
  filtradas.sort(function (a, b) {
    return b.dataPublicacao.localeCompare(a.dataPublicacao);
  });

  listaVagas.replaceChildren();
  filtradas.forEach(function (vaga) {
    listaVagas.appendChild(criarCartao(vaga));
  });

  mensagemVazio.hidden = filtradas.length > 0;
  contador.textContent = filtradas.length + " de " + vagas.length + " vagas";
}

function limparFiltros() {
  selectArea.value = "";
  selectCidade.value = "";
  mostrarVagas();
}

selectArea.addEventListener("change", mostrarVagas);
selectCidade.addEventListener("change", mostrarVagas);
botaoLimpar.addEventListener("click", limparFiltros);

preencherCidades();
mostrarVagas();
