// Tela principal: lista de vagas, busca, filtros, cartões e painel "Meu perfil".
// As listas "vagas" (manuais) e "vagasAuto" (automáticas) vêm dos arquivos em data/, carregados antes deste.
// A janela de candidatura em passos fica em js/candidatura.js.

aplicarMarca();

// ----- Elementos da tela -----
const campoBusca = document.getElementById("busca");
const selectCategoria = document.getElementById("filtro-categoria");
const selectCidade = document.getElementById("filtro-cidade");
const selectModalidade = document.getElementById("filtro-modalidade");
const selectTipo = document.getElementById("filtro-tipo");
const selectFonte = document.getElementById("filtro-fonte");
const campoPalavras = document.getElementById("filtro-palavras");
const botaoMaisFiltros = document.getElementById("botao-mais-filtros");
const blocoMaisFiltros = document.getElementById("mais-filtros");
const listaVagas = document.getElementById("lista-vagas");
const mensagemVazio = document.getElementById("mensagem-vazio");
const textoVazio = document.getElementById("mensagem-vazio-texto");
const linhaChips = document.getElementById("chips");
const listaChips = document.getElementById("chips-lista");
const contador = document.getElementById("contador");
const selectOrdenar = document.getElementById("ordenar");
const saudacao = document.getElementById("saudacao");

const painelPerfil = document.getElementById("painel-perfil");
const abas = [document.getElementById("aba-busco"), document.getElementById("aba-curriculo")];
const paineisAbas = [document.getElementById("painel-busco"), document.getElementById("painel-curriculo")];
const caixaNome = document.getElementById("perfil-nome");
const caixaModalidades = document.getElementById("perfil-modalidades");
const caixaPalavras = document.getElementById("perfil-palavras");
const caixaCurriculo = document.getElementById("perfil-curriculo");
const contadorCurriculo = document.getElementById("curriculo-contador");
const detalhesManual = document.getElementById("curriculo-manual");
const resumoManual = document.getElementById("curriculo-manual-resumo");
const estadoCurriculo = document.getElementById("curriculo-estado");
const mensagemPerfil = document.getElementById("perfil-mensagem");
const botaoExportar = document.getElementById("botao-exportar-perfil");
const botaoImportar = document.getElementById("botao-importar-perfil");
const arquivoPerfil = document.getElementById("arquivo-perfil");
const botaoAnexar = document.getElementById("botao-anexar-curriculo");
const arquivoCurriculo = document.getElementById("arquivo-curriculo");
const botaoRemoverArquivo = document.getElementById("botao-remover-arquivo");
const avisoBanco = document.getElementById("arquivo-aviso-banco");
const botaoLimparPerfil = document.getElementById("botao-limpar-perfil");
const avisoPerfil = document.getElementById("aviso-perfil");
const estadoPerfil = document.getElementById("perfil-estado");
const caixasPerfil = {
  categorias: document.getElementById("perfil-categorias"),
  cidades: document.getElementById("perfil-cidades"),
  tipos: document.getElementById("perfil-tipos")
};

// ----- Estado (também usado por js/candidatura.js) -----
let arquivoGuardado = null;  // currículo em arquivo: { nome, tipo, tamanho, data, conteudo (ArrayBuffer) } ou null
let arquivoNoBanco = false;  // true se esse arquivo também está guardado no IndexedDB

// O localStorage pode estar bloqueado pelo navegador: nesse caso o perfil só vale nesta visita
function obterArmazenamento() {
  try {
    return window.localStorage || null;
  } catch (erro) {
    return null;
  }
}
const armazenamento = obterArmazenamento();
let perfil = lerPerfil(armazenamento);  // regras.js: nunca dá erro, devolve perfil vazio se algo falhar
let modoOrdem = "relevancia";
let filtroPerfilPausado = false;  // "Mostrar todas as vagas": desliga o filtro do perfil sem apagá-lo (só nesta visita)

// Transforma "2026-09-29" em "29/09/2026"
function formatarData(dataIso) {
  const [ano, mes, dia] = dataIso.split("-");
  return dia + "/" + mes + "/" + ano;
}

// Junta as vagas manuais (data/vagas.js) com as automáticas (data/vagas-auto.js).
// Se o mesmo link existir nas duas, vale a vaga manual.
const linksManuais = vagas.filter(function (vaga) { return vaga.link; }).map(function (vaga) { return vaga.link; });
const automaticas = (typeof vagasAuto !== "undefined" ? vagasAuto : []).filter(function (vaga) {
  return !vaga.link || !linksManuais.includes(vaga.link);
});
const todasVagas = vagas.concat(automaticas);
const situacaoLinks = typeof statusLinks !== "undefined" ? statusLinks : {};

// Só aparecem vagas que não venceram (regras em js/regras.js) e cujo link não está quebrado.
// Nada é apagado dos arquivos: a vaga só deixa de ser mostrada.
const hoje = hojeIso();
const vagasAtivas = todasVagas.filter(function (vaga) {
  return !vagaVencida(vaga, hoje) && !linkInativo(vaga, situacaoLinks);
});

// Só aceita links que começam com http:// ou https:// (evita links perigosos)
function linkSeguro(link) {
  return typeof link === "string" && /^https?:\/\//i.test(link);
}

// Valores de um campo (cidade, tipo ou fonte) nas vagas ativas, sem repetir e em ordem alfabética
function valoresUnicos(campo) {
  const valores = [];
  vagasAtivas.forEach(function (vaga) {
    if (!valores.includes(vaga[campo])) {
      valores.push(vaga[campo]);
    }
  });
  return valores.sort(function (a, b) {
    return a.localeCompare(b, "pt-BR");
  });
}

// Acrescenta opções a um <select>. "pares" = lista de { valor, rotulo } (texto sempre como texto puro)
function preencherSelect(select, pares) {
  pares.forEach(function (par) {
    const opcao = document.createElement("option");
    opcao.value = par.valor;
    opcao.textContent = par.rotulo;
    select.appendChild(opcao);
  });
}

function paresIguais(valores) {
  return valores.map(function (valor) { return { valor: valor, rotulo: valor }; });
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

// Copia um texto para a área de transferência. Devolve uma promessa com true (deu certo) ou false.
function copiarTexto(texto) {
  // Plano B para navegadores que bloqueiam a cópia moderna (ex.: página aberta direto do computador)
  function copiarAntigo() {
    try {
      const campo = document.createElement("textarea");
      campo.value = texto;
      campo.setAttribute("readonly", "");
      campo.style.position = "fixed";
      campo.style.opacity = "0";
      // dentro da janela aberta (se houver), para o foco preso nela não impedir a cópia
      (document.querySelector("dialog[open]") || document.body).appendChild(campo);
      campo.select();
      const copiou = document.execCommand("copy");
      campo.remove();
      return copiou;
    } catch (erro) {
      return false;
    }
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(texto).then(function () { return true; }, copiarAntigo);
  }
  return Promise.resolve(copiarAntigo());
}

// Liga um botão a "copiar este texto" (o texto é pedido na hora do clique) e avisa "Copiado!" por 2 segundos
function ligarBotaoCopiar(botao, obterTexto) {
  botao.dataset.rotulo = botao.textContent;
  botao.addEventListener("click", function () {
    copiarTexto(obterTexto()).then(function (deuCerto) {
      botao.textContent = deuCerto ? "Copiado!" : "Não foi possível copiar";
      setTimeout(function () { botao.textContent = botao.dataset.rotulo; }, 2000);
    });
  });
}

// Foco preso na janela aberta: Tab no último campo volta ao primeiro, e Shift+Tab no primeiro vai ao último
// (o <dialog> já deixa o resto da página inerte, mas o Tab ainda escapava para a barra do navegador).
function prenderFoco(caixa) {
  caixa.addEventListener("keydown", function (evento) {
    if (evento.key !== "Tab") {
      return;
    }
    const focaveis = Array.from(caixa.querySelectorAll("a[href], button, input, select, textarea, summary, [tabindex]")).filter(function (elemento) {
      if (elemento.tabIndex < 0 || elemento.disabled) {
        return false;
      }
      const estilo = getComputedStyle(elemento);
      return estilo.visibility !== "hidden" && elemento.getClientRects().length > 0 && !elemento.closest("[hidden]");
    });
    if (focaveis.length === 0) {
      return;
    }
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    const atual = document.activeElement;
    if (evento.shiftKey && (atual === primeiro || !caixa.contains(atual))) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && (atual === ultimo || !caixa.contains(atual))) {
      evento.preventDefault();
      primeiro.focus();
    }
  });
}

// ===== Cartões de vaga =====

// Monta o cartão de uma vaga. "combina" = true mostra a etiqueta "Combina com você";
// "avisarSemModalidade" = true (filtro de modalidade em ação) mostra "Modalidade não informada" nas vagas sem esse dado.
// Um único botão principal: "Ver vaga" (tem link) ou "Candidatar-se" (só e-mail). Tudo o mais fica na janela de candidatura.
function criarCartao(vaga, combina, avisarSemModalidade) {
  const cartao = criar("article", "vaga");
  cartao.appendChild(criar("h2", "", vaga.titulo));
  cartao.appendChild(criar("p", "vaga-empresa", vaga.empresa));

  // Etiquetas: área, cidade, modalidade (só se a vaga informar) e "Combina com você"
  const etiquetas = criar("div", "vaga-etiquetas");
  if (vaga.exemplo) {
    etiquetas.appendChild(criar("span", "etiqueta etiqueta-exemplo", "EXEMPLO"));
  }
  const varias = classificarArea(vaga.area).varias;
  const etiquetaArea = criar("span", "etiqueta", varias ? "Várias áreas" : vaga.area);
  if (varias) {
    etiquetaArea.title = vaga.area;
  }
  etiquetas.appendChild(etiquetaArea);
  etiquetas.appendChild(criar("span", "etiqueta", vaga.cidade));
  const modalidade = modalidadeDaVaga(vaga);
  if (modalidade !== "") {
    etiquetas.appendChild(criar("span", "etiqueta", ROTULOS_MODALIDADE[modalidade]));
  }
  if (combina) {
    etiquetas.appendChild(criar("span", "etiqueta etiqueta-combina", "Combina com você"));
  }
  cartao.appendChild(etiquetas);

  // Prazo em destaque (vermelho ou âmbar só quando falta pouco)
  const prazo = situacaoPrazo(vaga, hoje);
  if (prazo.texto !== "") {
    cartao.appendChild(criar("p", "vaga-prazo vaga-prazo-" + prazo.nivel, prazo.texto));
  }

  // Fonte (sempre indicada) e, se o filtro de modalidade estiver em ação, o aviso de "não informada"
  const legenda = "Fonte: " + vaga.fonte + (avisarSemModalidade && modalidade === "" ? " · Modalidade não informada" : "");
  cartao.appendChild(criar("p", "vaga-legenda", legenda));

  // Forma de candidatura. Sem link e sem e-mail válido: sem botão e sem aviso.
  const tipo = tipoCandidatura(vaga);
  if (tipo !== "") {
    const acoes = criar("div", "vaga-acoes");
    if (linkSeguro(vaga.link)) {
      const ver = criar("a", "botao botao-primario", "Ver vaga");
      ver.href = vaga.link;
      ver.target = "_blank";
      ver.rel = "noopener noreferrer";
      ver.setAttribute("aria-label", "Ver vaga: " + vaga.titulo + ", " + vaga.empresa + " (abre em nova aba)");
      acoes.appendChild(ver);
      const preparar = criar("button", "botao-link", "Preparar candidatura");
      preparar.type = "button";
      preparar.setAttribute("aria-haspopup", "dialog");
      preparar.setAttribute("aria-label", "Preparar candidatura: " + vaga.titulo + ", " + vaga.empresa);
      preparar.addEventListener("click", function () { abrirJanelaCandidatura(vaga); });
      acoes.appendChild(preparar);
    } else {
      const candidatar = criar("button", "botao botao-primario", "Candidatar-se");
      candidatar.type = "button";
      candidatar.setAttribute("aria-haspopup", "dialog");
      candidatar.setAttribute("aria-label", "Candidatar-se: " + vaga.titulo + ", " + vaga.empresa);
      candidatar.addEventListener("click", function () { abrirJanelaCandidatura(vaga); });
      acoes.appendChild(candidatar);
    }
    cartao.appendChild(acoes);
  }
  return cartao;
}

// ===== Filtros, chips e lista =====

// "1 vaga" / "5 vagas"
function textoVagas(quantidade) {
  return quantidade + (quantidade === 1 ? " vaga" : " vagas");
}

// O filtro do perfil só age se o perfil tiver algo para filtrar e não estiver desligado ("Mostrar todas as vagas")
function filtroPerfilLigado() {
  return perfilTemFiltro(perfil) && !filtroPerfilPausado;
}

// O que está escolhido nos filtros da tela
function lerFiltrosPagina() {
  return {
    busca: campoBusca.value,
    categoria: selectCategoria.value,
    cidade: selectCidade.value,
    modalidade: selectModalidade.value,
    tipo: selectTipo.value,
    fonte: selectFonte.value,
    palavras: campoPalavras.value
  };
}

// Cada filtro da página: rótulo da etiqueta e como limpar
function descreverFiltrosPagina(f) {
  const lista = [];
  const itens = [
    ["busca", "Busca: " + f.busca.trim(), campoBusca],
    ["categoria", "Área: " + f.categoria, selectCategoria],
    ["cidade", "Cidade: " + f.cidade, selectCidade],
    ["modalidade", "Modalidade: " + (ROTULOS_MODALIDADE[f.modalidade] || f.modalidade), selectModalidade],
    ["tipo", "Tipo: " + f.tipo, selectTipo],
    ["fonte", "Fonte: " + f.fonte, selectFonte],
    ["palavras", "Palavras-chave: " + f.palavras.trim(), campoPalavras]
  ];
  itens.forEach(function (item) {
    if (f[item[0]] !== "" && f[item[0]].trim() !== "") {
      lista.push({ rotulo: item[1], controle: item[2] });
    }
  });
  return lista;
}

// Etiquetas dos filtros ativos (cada uma remove o seu filtro) + "Limpar tudo"
function mostrarChips(filtros) {
  listaChips.replaceChildren();
  const itens = descreverFiltrosPagina(filtros);
  itens.forEach(function (item) {
    const li = document.createElement("li");
    const botao = criar("button", "chip");
    botao.type = "button";
    botao.setAttribute("aria-label", "Remover filtro " + item.rotulo);
    botao.appendChild(document.createTextNode(item.rotulo));
    botao.appendChild(criar("span", "chip-x", "×"));
    botao.lastChild.setAttribute("aria-hidden", "true");
    botao.addEventListener("click", function () {
      item.controle.value = "";
      mostrarVagas();
      campoBusca.focus();
    });
    li.appendChild(botao);
    listaChips.appendChild(li);
  });
  // Filtro do perfil: uma etiqueta que desliga (ou volta a ligar) sem apagar o perfil
  if (perfilTemFiltro(perfil)) {
    const li = document.createElement("li");
    const botao = criar("button", "chip chip-perfil");
    botao.type = "button";
    if (filtroPerfilPausado) {
      botao.appendChild(document.createTextNode("Filtro do perfil desligado · Voltar a filtrar"));
    } else {
      botao.setAttribute("aria-label", "Mostrar todas as vagas (desligar o filtro do perfil: " + descreverFiltroPerfil(perfil).join(", ") + ")");
      botao.appendChild(document.createTextNode("Meu perfil: " + descreverFiltroPerfil(perfil).join(", ")));
      botao.appendChild(criar("span", "chip-x", "×"));
      botao.lastChild.setAttribute("aria-hidden", "true");
    }
    botao.addEventListener("click", function () {
      filtroPerfilPausado = !filtroPerfilPausado;
      mostrarVagas();
    });
    li.appendChild(botao);
    listaChips.appendChild(li);
  }
  linhaChips.hidden = listaChips.children.length === 0;
}

// "Limpar tudo": limpa busca e filtros e mostra todas as vagas (o perfil não é apagado)
function limparTudo() {
  [campoBusca, selectCategoria, selectCidade, selectModalidade, selectTipo, selectFonte, campoPalavras].forEach(function (controle) {
    controle.value = "";
  });
  if (perfilTemFiltro(perfil)) {
    filtroPerfilPausado = true;
  }
  mostrarVagas();
}

// Aplica os filtros e redesenha a lista. Ordem: 1) filtros da página (busca, área, cidade, modalidade, tipo, fonte,
// palavras-chave); 2) filtro do perfil (categorias, cidades, tipos, modalidade); 3) ordenação; 4) selos.
function mostrarVagas() {
  const filtros = lerFiltrosPagina();
  const perfilFiltrando = filtroPerfilLigado();
  const filtradas = filtrarVagas(vagasAtivas, filtros, perfil, perfilFiltrando);

  // Ordem escolhida (relevância, mais recentes ou prazo). A pontuação do perfil ordena o que sobrou.
  const ordenadas = ordenarVagas(filtradas, modoOrdem, perfil);

  listaVagas.replaceChildren();
  ordenadas.forEach(function (vaga) {
    // "Modalidade não informada" aparece quando algum filtro de modalidade está em ação (da página ou do perfil)
    const avisarSemModalidade = filtros.modalidade !== "" || (perfilFiltrando && perfil.modalidades.length > 0);
    listaVagas.appendChild(criarCartao(vaga, combinaComPerfil(vaga, perfil), avisarSemModalidade));
  });

  // Mensagem de lista vazia (cada causa tem a sua)
  const botaoLimparFiltros = document.getElementById("botao-limpar-filtros");
  botaoLimparFiltros.hidden = false;
  if (vagasAtivas.length === 0) {
    textoVazio.textContent = "Ainda não há vagas abertas cadastradas. Volte em breve!";
    botaoLimparFiltros.hidden = true;
  } else if (perfilFiltrando) {
    textoVazio.textContent = "Mude o que está marcado em Meu perfil ou limpe os filtros para ver todas as vagas.";
  } else {
    textoVazio.textContent = "Tente limpar os filtros ou buscar por outra palavra.";
  }
  mensagemVazio.hidden = filtradas.length > 0;
  const filtrado = filtradas.length !== vagasAtivas.length;
  contador.textContent = filtrado ? filtradas.length + " de " + textoVagas(vagasAtivas.length) : textoVagas(filtradas.length);
  mostrarChips(filtros);
}

// ===== Meu perfil: painel lateral com duas abas =====

// Abre o painel (opcionalmente já na aba "curriculo" ou "busco")
function abrirPerfil(aba) {
  selecionarAba(aba === "curriculo" ? 1 : 0, false);
  if (typeof painelPerfil.showModal === "function") {
    if (!painelPerfil.open) {
      painelPerfil.showModal();
    }
  } else {
    painelPerfil.setAttribute("open", "");
  }
}

function fecharPerfil() {
  if (typeof painelPerfil.close === "function") {
    painelPerfil.close();
  } else {
    painelPerfil.removeAttribute("open");
  }
  document.getElementById("abrir-perfil").focus();
}

// Mostra uma aba (0 = "O que busco", 1 = "Meu currículo"). Setas, Home e End movem entre as abas.
function selecionarAba(indice, moverFoco) {
  abas.forEach(function (aba, i) {
    const ativa = i === indice;
    aba.setAttribute("aria-selected", ativa ? "true" : "false");
    aba.tabIndex = ativa ? 0 : -1;
    paineisAbas[i].hidden = !ativa;
  });
  if (moverFoco) {
    abas[indice].focus();
  }
}

function aoTeclarNaAba(evento) {
  const atual = abas.indexOf(evento.currentTarget);
  let novo = -1;
  if (evento.key === "ArrowRight") {
    novo = (atual + 1) % abas.length;
  } else if (evento.key === "ArrowLeft") {
    novo = (atual - 1 + abas.length) % abas.length;
  } else if (evento.key === "Home") {
    novo = 0;
  } else if (evento.key === "End") {
    novo = abas.length - 1;
  }
  if (novo >= 0) {
    evento.preventDefault();
    selecionarAba(novo, true);
  }
}

// Cria uma caixinha de marcar dentro de um grupo do painel (texto sempre como texto puro)
function criarOpcao(caixa, valor, rotulo, marcada) {
  const etiqueta = document.createElement("label");
  etiqueta.className = "opcao";
  const marcador = document.createElement("input");
  marcador.type = "checkbox";
  marcador.value = valor;
  marcador.checked = marcada;
  const texto = document.createElement("span");
  texto.textContent = rotulo;
  etiqueta.append(marcador, texto);
  caixa.appendChild(etiqueta);
}

// Valores das caixinhas de um grupo: os que existem nas vagas MAIS os que já estão no perfil salvo
// (assim uma opção salva nunca fica invisível e presa: sempre dá para desmarcar)
function opcoesDoGrupo(valoresDasVagas, valoresSalvos, ordenar) {
  const todos = valoresDasVagas.slice();
  valoresSalvos.forEach(function (valor) {
    if (!todos.some(function (existente) { return normalizarTexto(existente) === normalizarTexto(valor); })) {
      todos.push(valor);
    }
  });
  return ordenar(todos);
}

// Caixinhas de categorias, cidades ou tipos, já marcadas conforme o perfil salvo
function criarOpcoesPerfil(campoPerfil, valores) {
  valores.forEach(function (valor) {
    const marcada = perfil[campoPerfil].some(function (item) {
      return normalizarTexto(item) === normalizarTexto(valor);
    });
    criarOpcao(caixasPerfil[campoPerfil], valor, valor, marcada);
  });
}

// Caixinhas de modalidade: lista fixa (nenhuma vaga é obrigada a ter esse dado)
function criarOpcoesModalidade() {
  MODALIDADES.forEach(function (valor) {
    criarOpcao(caixaModalidades, valor, ROTULOS_MODALIDADE[valor], perfil.modalidades.includes(valor));
  });
}

// Monta o perfil a partir do que está marcado e escrito na tela
function lerPerfilDaTela() {
  const novo = novoPerfil();
  Object.keys(caixasPerfil).forEach(function (campo) {
    caixasPerfil[campo].querySelectorAll("input:checked").forEach(function (marcador) {
      novo[campo].push(marcador.value);
    });
  });
  caixaModalidades.querySelectorAll("input:checked").forEach(function (marcador) {
    novo.modalidades.push(marcador.value);
  });
  novo.nome = caixaNome.value;
  novo.palavras = caixaPalavras.value;
  novo.curriculo = caixaCurriculo.value;
  return sanitizarPerfil(novo);
}

// Monta (ou remonta) as caixinhas e os campos do painel a partir do perfil atual
function montarPainelPerfil() {
  [caixasPerfil.categorias, caixasPerfil.cidades, caixasPerfil.tipos, caixaModalidades].forEach(function (caixa) {
    caixa.replaceChildren();
  });
  const porTextoPtBr = function (lista) {
    return lista.sort(function (a, b) { return a.localeCompare(b, "pt-BR"); });
  };
  criarOpcoesPerfil("categorias", opcoesDoGrupo(categoriasDasVagas(vagasAtivas), perfil.categorias, function (lista) {
    return NOMES_CATEGORIAS.filter(function (nome) { return lista.includes(nome); });  // ordem do mapa
  }));
  criarOpcoesPerfil("cidades", opcoesDoGrupo(valoresUnicos("cidade"), perfil.cidades, porTextoPtBr));
  criarOpcoesPerfil("tipos", opcoesDoGrupo(valoresUnicos("tipoEmpresa"), perfil.tipos, porTextoPtBr));
  criarOpcoesModalidade();
  caixaNome.value = perfil.nome;
  caixaPalavras.value = perfil.palavras;
  caixaCurriculo.value = perfil.curriculo;
  detalhesManual.open = perfil.curriculo.trim() !== "";
  mostrarContadorCurriculo();
  mostrarEstadoCurriculo();
}

// ===== Meu currículo =====

// Contador "1.234 / 15.000 caracteres" (com ponto de milhar)
function mostrarContadorCurriculo() {
  const comPonto = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  const usados = caixaCurriculo.value.length;
  contadorCurriculo.textContent = usados > TAMANHO_MAXIMO_CURRICULO
    ? "Passou do limite: só os primeiros " + comPonto(TAMANHO_MAXIMO_CURRICULO) + " caracteres serão usados."
    : comPonto(usados) + " / " + comPonto(TAMANHO_MAXIMO_CURRICULO) + " caracteres";
  contadorCurriculo.classList.toggle("no-limite", usados >= TAMANHO_MAXIMO_CURRICULO);
}

// Estado em uma linha: "Currículo salvo: nome.pdf, 120 KB", "Currículo salvo: texto, N caracteres" ou "Nenhum currículo salvo."
function mostrarEstadoCurriculo() {
  const temTexto = caixaCurriculo.value.trim() !== "";
  if (arquivoGuardado !== null) {
    estadoCurriculo.textContent = "Currículo salvo: " + arquivoGuardado.nome + ", " + formatarTamanho(arquivoGuardado.tamanho);
  } else if (temTexto) {
    estadoCurriculo.textContent = "Currículo salvo: só o texto, " + Math.min(caixaCurriculo.value.trim().length, TAMANHO_MAXIMO_CURRICULO) + " caracteres";
  } else {
    estadoCurriculo.textContent = "Nenhum currículo salvo.";
  }
  botaoRemoverArquivo.hidden = arquivoGuardado === null;
  avisoBanco.hidden = arquivoGuardado === null || arquivoNoBanco;
  resumoManual.textContent = temTexto ? "Conferir e editar o texto do currículo" : "Colar texto manualmente";
}

// Digitou ou colou o currículo: guarda (se o navegador deixar) e atualiza o contador.
// (Não precisa redesenhar a lista: o currículo não muda filtro nem ordem.)
function aoMudarCurriculo() {
  perfil = lerPerfilDaTela();
  avisoPerfil.hidden = salvarPerfil(armazenamento, perfil);
  mostrarContadorCurriculo();
  mostrarEstadoCurriculo();
}

// Mensagem curta no painel (importar, exportar, limpar, anexar). Sempre texto puro.
function mostrarMensagemPerfil(texto, ehErro) {
  mensagemPerfil.hidden = false;
  mensagemPerfil.textContent = texto;
  mensagemPerfil.className = ehErro === true ? "mensagem mensagem-erro" : "mensagem";
}

// "Exportar perfil": baixa um JSON com o perfil e o currículo (tudo gerado aqui, nada é enviado)
function exportarPerfil() {
  const texto = montarExportacao(lerPerfilDaTela());
  const url = URL.createObjectURL(new Blob([texto], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "perfil-estagios.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  mostrarMensagemPerfil("Perfil exportado (perfil-estagios.json). O arquivo contém seu currículo: guarde-o com cuidado.", false);
}

// "Importar perfil": lê o arquivo escolhido, valida (tamanho e formato) e troca o perfil atual
function importarPerfil(arquivo) {
  if (!arquivo) {
    return;
  }
  if (arquivo.size > 3 * TAMANHO_MAXIMO_IMPORTACAO) {
    mostrarMensagemPerfil("Arquivo grande demais para ser um perfil deste site.", true);
    return;
  }
  const leitor = new FileReader();
  leitor.onerror = function () { mostrarMensagemPerfil("Não consegui ler o arquivo.", true); };
  leitor.onload = function () {
    const resultado = validarImportacao(String(leitor.result));
    if (!resultado.ok) {
      mostrarMensagemPerfil("Não importei: " + resultado.erro, true);
      return;
    }
    perfil = resultado.perfil;
    filtroPerfilPausado = false;
    avisoPerfil.hidden = salvarPerfil(armazenamento, perfil);
    montarPainelPerfil();
    mostrarEstadoPerfil();
    mostrarSaudacao();
    mostrarVagas();
    mostrarMensagemPerfil("Perfil importado.", false);
  };
  leitor.readAsText(arquivo);
}

// ===== Currículo em arquivo (PDF ou Word) =====

const TIPO_ARQUIVO = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

// Lê o arquivo escolhido como bytes (só na memória do navegador)
function lerBytes(arquivo) {
  return new Promise(function (resolver, rejeitar) {
    const leitor = new FileReader();
    leitor.onload = function () { resolver(leitor.result); };
    leitor.onerror = function () { rejeitar(leitor.error); };
    leitor.readAsArrayBuffer(arquivo);
  });
}

// Confere um registro vindo do IndexedDB (que pode estar estragado) e o devolve limpo, ou null
function registroValido(bruto) {
  if (!bruto || typeof bruto !== "object" || !(bruto.conteudo instanceof ArrayBuffer)) {
    return null;
  }
  const formato = detectarFormatoArquivo(bruto.conteudo);
  if ((formato !== "pdf" && formato !== "docx") || bruto.conteudo.byteLength > TAMANHO_MAXIMO_ARQUIVO) {
    return null;
  }
  return {
    nome: limparNomeArquivo(bruto.nome, formato),
    tipo: TIPO_ARQUIVO[formato],
    tamanho: bruto.conteudo.byteLength,
    data: typeof bruto.data === "number" ? bruto.data : Date.now(),
    conteudo: bruto.conteudo
  };
}

// Ao abrir o site: pega o arquivo que ficou guardado na visita anterior (se o navegador deixar)
function carregarArquivoGuardado() {
  return lerArquivoCurriculo(bancoDoNavegador()).then(function (resultado) {
    const registro = resultado.ok ? registroValido(resultado.registro) : null;
    if (registro !== null && arquivoGuardado === null) {
      arquivoGuardado = registro;
      arquivoNoBanco = true;
      mostrarEstadoCurriculo();
    }
  });
}

// "Anexar PDF ou Word": valida, tira o texto, preenche o campo (perguntando antes de trocar um texto existente)
// e guarda o arquivo original no navegador. Nunca inventa texto: se não der para ler, avisa.
async function anexarArquivo(arquivo) {
  if (!arquivo) {
    return;
  }
  const validacao = validarArquivoCurriculo(arquivo);
  if (!validacao.ok) {
    mostrarMensagemPerfil("Não anexei: " + validacao.erro, true);
    return;
  }
  botaoAnexar.disabled = true;
  mostrarMensagemPerfil("Lendo o arquivo...", false);
  try {
    let conteudo;
    try {
      conteudo = await lerBytes(arquivo);
    } catch (erro) {
      mostrarMensagemPerfil("Não consegui ler o arquivo. Cole o texto do currículo manualmente.", true);
      return;
    }
    const problema = conferirConteudoArquivo(validacao.formato, conteudo);
    if (problema !== "") {
      mostrarMensagemPerfil("Não anexei: " + problema, true);
      return;
    }
    const extracao = await extrairTextoArquivo(validacao.formato, conteudo);
    if (!extracao.ok) {
      const mensagens = {
        senha: "Este PDF está protegido por senha e não consegui abri-lo. Salve uma cópia sem senha e anexe de novo, ou cole o texto do currículo manualmente.",
        indisponivel: "Não consegui carregar o leitor de arquivos. Se você abriu o site direto do computador, o PDF só funciona pelo endereço publicado do site. Cole o texto do currículo manualmente.",
        erro: "Não consegui ler o texto deste arquivo (ele pode estar danificado). Cole o texto do currículo manualmente."
      };
      mostrarMensagemPerfil(mensagens[extracao.motivo] || mensagens.erro, true);
      return;
    }
    const preparado = prepararTextoExtraido(extracao.texto);
    let aviso = "";
    let ehErro = false;
    if (preparado.vazio) {
      aviso = "Guardei o arquivo, mas não encontrei texto nele (PDF escaneado ou só com imagens?). Cole o texto do currículo manualmente.";
      ehErro = true;
      detalhesManual.open = true;
    } else if (caixaCurriculo.value.trim() !== ""
      && !window.confirm("O campo do currículo já tem texto. Substituir pelo texto tirado do arquivo?\n\nOK = substituir. Cancelar = manter o texto atual (o arquivo é guardado do mesmo jeito).")) {
      aviso = "Mantive o texto que já estava no campo. O arquivo foi guardado.";
    } else {
      caixaCurriculo.value = preparado.texto;
      detalhesManual.open = true;
      aoMudarCurriculo();
      aviso = "Texto tirado do arquivo. Confira e edite abaixo o que precisar." + (preparado.cortado ? " Ele passou de 15.000 caracteres, então usei só o começo." : "");
    }
    arquivoGuardado = {
      nome: limparNomeArquivo(arquivo.name, validacao.formato),
      tipo: TIPO_ARQUIVO[validacao.formato],
      tamanho: conteudo.byteLength,
      data: Date.now(),
      conteudo: conteudo
    };
    const gravou = await guardarArquivoCurriculo(bancoDoNavegador(), arquivoGuardado);
    arquivoNoBanco = gravou.ok;
    mostrarEstadoCurriculo();
    mostrarMensagemPerfil(aviso, ehErro);
  } finally {
    botaoAnexar.disabled = false;
  }
}

// "Remover arquivo": tira da memória e do IndexedDB (o texto do currículo continua)
function removerArquivoGuardado() {
  arquivoGuardado = null;
  arquivoNoBanco = false;
  mostrarEstadoCurriculo();
  return removerArquivoCurriculo(bancoDoNavegador()).then(function (resultado) {
    mostrarMensagemPerfil(resultado.ok ? "Arquivo removido deste navegador. O texto do currículo continua." : "Arquivo removido desta página.", false);
    return resultado.ok;
  });
}

// ===== Estado do perfil na tela =====

// Selo "ativo" ao lado do botão "Meu perfil"
function mostrarEstadoPerfil() {
  estadoPerfil.hidden = perfilVazio(perfil) && perfil.nome === "";
}

// Saudação no topo do site (só com nome). O nome entra sempre como texto puro (textContent), nunca como HTML.
function mostrarSaudacao() {
  saudacao.hidden = perfil.nome === "";
  saudacao.textContent = perfil.nome !== "" ? "Olá, " + perfil.nome + "! Estas são as vagas com mais a ver com você." : "";
}

// Chamado a cada mudança no perfil: guarda (se o navegador deixar) e redesenha a lista
function aoMudarPerfil() {
  perfil = lerPerfilDaTela();
  avisoPerfil.hidden = salvarPerfil(armazenamento, perfil);
  mostrarEstadoPerfil();
  mostrarSaudacao();
  mostrarVagas();
}

// Mudou uma escolha que filtra (categoria, cidade, tipo ou modalidade): o filtro volta a valer
function aoMudarFiltroPerfil() {
  filtroPerfilPausado = false;
  aoMudarPerfil();
}

// "Limpar meu perfil": desmarca tudo, esvazia os campos (inclusive o currículo) e APAGA o que estava guardado no navegador
function limparPerfil() {
  document.querySelectorAll("#painel-perfil input[type=checkbox]").forEach(function (marcador) {
    marcador.checked = false;
  });
  caixaNome.value = "";
  caixaPalavras.value = "";
  caixaCurriculo.value = "";  // o currículo também é apagado
  detalhesManual.open = false;
  mostrarContadorCurriculo();
  filtroPerfilPausado = false;
  perfil = novoPerfil();
  const apagou = apagarPerfil(armazenamento);
  avisoPerfil.hidden = apagou;
  mostrarMensagemPerfil(apagou ? "Perfil e currículo apagados deste navegador." : "Perfil e currículo limpos nesta página.", false);
  // o arquivo anexado também sai da memória e do IndexedDB
  const tinhaArquivo = arquivoGuardado !== null;
  arquivoGuardado = null;
  arquivoNoBanco = false;
  mostrarEstadoCurriculo();
  removerArquivoCurriculo(bancoDoNavegador()).then(function (resultado) {
    if (tinhaArquivo && resultado.ok && apagou) {
      mostrarMensagemPerfil("Perfil, currículo e arquivo apagados deste navegador.", false);
    }
  });
  mostrarEstadoPerfil();
  mostrarSaudacao();
  mostrarVagas();
}

// ===== Ligações (eventos) =====

[campoBusca, campoPalavras].forEach(function (campo) { campo.addEventListener("input", mostrarVagas); });
[selectCategoria, selectCidade, selectModalidade, selectTipo, selectFonte].forEach(function (select) {
  select.addEventListener("change", mostrarVagas);
});
botaoMaisFiltros.addEventListener("click", function () {
  const abrir = blocoMaisFiltros.hidden;
  blocoMaisFiltros.hidden = !abrir;
  botaoMaisFiltros.setAttribute("aria-expanded", abrir ? "true" : "false");
});
document.getElementById("limpar-tudo").addEventListener("click", limparTudo);
document.getElementById("botao-limpar-filtros").addEventListener("click", limparTudo);
selectOrdenar.addEventListener("change", function () {
  modoOrdem = selectOrdenar.value;
  mostrarVagas();
});

document.getElementById("abrir-perfil").addEventListener("click", function () { abrirPerfil("busco"); });
document.getElementById("perfil-fechar").addEventListener("click", fecharPerfil);
painelPerfil.addEventListener("click", function (evento) {
  if (evento.target === painelPerfil) {  // clique fora do painel (no fundo escuro)
    fecharPerfil();
  }
});
prenderFoco(painelPerfil);
abas.forEach(function (aba, indice) {
  aba.addEventListener("click", function () { selecionarAba(indice, false); });
  aba.addEventListener("keydown", aoTeclarNaAba);
});

Object.keys(caixasPerfil).forEach(function (campo) {
  caixasPerfil[campo].addEventListener("change", aoMudarFiltroPerfil);
});
caixaModalidades.addEventListener("change", aoMudarFiltroPerfil);
caixaNome.addEventListener("input", aoMudarPerfil);
caixaPalavras.addEventListener("input", aoMudarPerfil);
caixaCurriculo.addEventListener("input", aoMudarCurriculo);
botaoLimparPerfil.addEventListener("click", limparPerfil);
botaoExportar.addEventListener("click", exportarPerfil);
botaoImportar.addEventListener("click", function () { arquivoPerfil.click(); });
arquivoPerfil.addEventListener("change", function () {
  importarPerfil(arquivoPerfil.files[0]);
  arquivoPerfil.value = "";  // permite escolher o mesmo arquivo de novo depois
});
botaoAnexar.addEventListener("click", function () { arquivoCurriculo.click(); });
arquivoCurriculo.addEventListener("change", function () {
  const escolhido = arquivoCurriculo.files[0];
  arquivoCurriculo.value = "";  // permite escolher o mesmo arquivo de novo depois
  anexarArquivo(escolhido);
});
botaoRemoverArquivo.addEventListener("click", removerArquivoGuardado);

// ===== Início =====
preencherSelect(selectCategoria, paresIguais(categoriasDasVagas(vagasAtivas)));
preencherSelect(selectCidade, paresIguais(valoresUnicos("cidade")));
preencherSelect(selectModalidade, MODALIDADES.map(function (m) { return { valor: m, rotulo: ROTULOS_MODALIDADE[m] }; }));
preencherSelect(selectTipo, paresIguais(valoresUnicos("tipoEmpresa")));
preencherSelect(selectFonte, paresIguais(valoresUnicos("fonte")));
montarPainelPerfil();
mostrarSaudacao();
avisoPerfil.hidden = armazenamento !== null;  // sem localStorage, avisa já na entrada
mostrarEstadoPerfil();
mostrarVagas();
iniciarCandidatura();       // js/candidatura.js: liga a janela de candidatura em passos
carregarArquivoGuardado();  // traz de volta o arquivo anexado em visitas anteriores
