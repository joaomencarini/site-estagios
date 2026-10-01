// As listas "vagas" (manuais) e "vagasAuto" (automáticas) vêm dos arquivos em data/, carregados antes deste.

const selectArea = document.getElementById("filtro-area");
const selectCidade = document.getElementById("filtro-cidade");
const selectFonte = document.getElementById("filtro-fonte");
const botaoLimpar = document.getElementById("botao-limpar");
const listaVagas = document.getElementById("lista-vagas");
const mensagemVazio = document.getElementById("mensagem-vazio");
const contador = document.getElementById("contador");
const selectOrdenar = document.getElementById("ordenar");
const saudacao = document.getElementById("saudacao");
const textoPadraoSaudacao = saudacao.textContent;  // texto de sempre, usado quando não há nome
const caixaNome = document.getElementById("perfil-nome");
const caixaModalidades = document.getElementById("perfil-modalidades");
const caixaSoCompativeis = document.getElementById("perfil-so-compativeis");
const caixaPalavras = document.getElementById("perfil-palavras");
const botaoLimparPerfil = document.getElementById("botao-limpar-perfil");
const avisoPerfil = document.getElementById("aviso-perfil");
const estadoPerfil = document.getElementById("perfil-estado");
const caixasPerfil = {
  areas: document.getElementById("perfil-areas"),
  cidades: document.getElementById("perfil-cidades"),
  tipos: document.getElementById("perfil-tipos")
};

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

// Valores de um campo (área, cidade, tipo ou fonte) nas vagas ativas, sem repetir e em ordem alfabética
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

// Cria as opções de um filtro (área, cidade ou fonte) a partir das vagas ativas, sem repetir
function preencherOpcoes(select, campo) {
  valoresUnicos(campo).forEach(function (valor) {
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
      document.body.appendChild(campo);
      campo.select();
      const copiou = document.execCommand("copy");
      document.body.removeChild(campo);
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

// Botão "Copiar ...": copia o texto e avisa "Copiado!" por 2 segundos
function criarBotaoCopiar(rotulo, texto) {
  const botao = criar("button", "botao-secundario", rotulo);
  botao.type = "button";
  botao.setAttribute("aria-live", "polite");
  botao.addEventListener("click", function () {
    copiarTexto(texto).then(function (deuCerto) {
      botao.textContent = deuCerto ? "Copiado!" : "Não foi possível copiar";
      setTimeout(function () { botao.textContent = rotulo; }, 2000);
    });
  });
  return botao;
}

// Link "mailto:" com o assunto codificado (acentos, espaços, "|" e "&" viram códigos %XX)
function montarMailto(email, assunto) {
  return "mailto:" + email + (assunto ? "?subject=" + encodeURIComponent(assunto) : "");
}

// Escreve o e-mail no elemento deixando a linha quebrar só depois de "@" e de pontos (texto puro, sem HTML)
function escreverEmail(elemento, email) {
  (email.match(/[^@.]+[@.]?|[@.]/g) || []).forEach(function (parte, posicao) {
    if (posicao > 0) {
      elemento.appendChild(document.createElement("wbr"));
    }
    elemento.appendChild(document.createTextNode(parte));
  });
}

// Bloco "Enviar CV para: ..." com os botões de copiar e de escrever o e-mail
function criarBlocoEmail(vaga) {
  const bloco = criar("div", "email-candidatura");

  const linhaEmail = criar("p", "email-linha", "Enviar CV para: ");
  const endereco = criar("strong", "email-endereco");
  escreverEmail(endereco, vaga.emailCandidatura);
  linhaEmail.appendChild(endereco);
  bloco.appendChild(linhaEmail);

  const botoesEmail = criar("div", "email-botoes");
  botoesEmail.appendChild(criarBotaoCopiar("Copiar e-mail", vaga.emailCandidatura));
  const escrever = criar("a", "botao-email", "Escrever e-mail");
  escrever.href = montarMailto(vaga.emailCandidatura, vaga.assuntoEmail);
  botoesEmail.appendChild(escrever);
  bloco.appendChild(botoesEmail);

  if (vaga.assuntoEmail) {
    const linhaAssunto = criar("p", "email-linha", "Assunto: ");
    linhaAssunto.appendChild(criar("span", "email-assunto", vaga.assuntoEmail));
    bloco.appendChild(linhaAssunto);
    const botoesAssunto = criar("div", "email-botoes");
    botoesAssunto.appendChild(criarBotaoCopiar("Copiar assunto", vaga.assuntoEmail));
    bloco.appendChild(botoesAssunto);
  }
  return bloco;
}

// Monta o cartão de uma vaga. "combina" = true mostra o selo "Combina com você";
// "avisarSemModalidade" = true (filtro de modalidade ligado) mostra "Modalidade não informada" nas vagas sem esse dado.
function criarCartao(vaga, combina, avisarSemModalidade) {
  const cartao = criar("article", "vaga");

  if (vaga.exemplo || combina) {
    const selos = criar("div", "selos");
    if (vaga.exemplo) {
      selos.appendChild(criar("span", "selo-exemplo", "EXEMPLO"));
    }
    if (combina) {
      selos.appendChild(criar("span", "selo-combina", "Combina com você"));
    }
    cartao.appendChild(selos);
  }

  cartao.appendChild(criar("h2", "", vaga.titulo));
  cartao.appendChild(criar("p", "empresa", vaga.empresa));

  // Etiquetas (área e tipo de empresa) e cidade
  const detalhes = criar("div", "detalhes");
  detalhes.appendChild(criar("span", "etiqueta", vaga.area));
  detalhes.appendChild(criar("span", "etiqueta", vaga.tipoEmpresa));
  // Selo de modalidade só aparece se a vaga tiver o dado (nunca se presume)
  const modalidade = modalidadeDaVaga(vaga);
  if (modalidade !== "") {
    detalhes.appendChild(criar("span", "etiqueta etiqueta-modalidade", ROTULOS_MODALIDADE[modalidade]));
  }
  detalhes.appendChild(criar("span", "local", vaga.cidade));
  cartao.appendChild(detalhes);

  // Data, fonte e prazo (se houver)
  const meta = criar("div", "meta");
  meta.appendChild(criar("span", "", "Publicada em " + formatarData(vaga.dataPublicacao)));
  meta.appendChild(criar("span", "", "Fonte: " + vaga.fonte));
  if (vaga.prazoInscricao) {
    meta.appendChild(criar("span", "prazo", "Inscrições até " + formatarData(vaga.prazoInscricao)));
  }
  if (avisarSemModalidade && modalidade === "") {
    meta.appendChild(criar("span", "sem-modalidade", "Modalidade não informada"));
  }
  cartao.appendChild(meta);

  // Formas de candidatura: botão do link e/ou bloco de e-mail. Sem nenhuma das duas, o cartão fica sem botão.
  const acoes = criar("div", "acoes");
  if (linkSeguro(vaga.link)) {
    const botao = criar("a", "botao-vaga", "Ver vaga e se candidatar");
    botao.href = vaga.link;
    botao.target = "_blank";
    botao.rel = "noopener noreferrer";
    acoes.appendChild(botao);
  }
  if (emailValido(vaga.emailCandidatura)) {
    acoes.appendChild(criarBlocoEmail(vaga));
  }
  if (acoes.children.length > 0) {
    cartao.appendChild(acoes);
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
    return passaArea && passaCidade && passaFonte && passaFiltroModalidade(vaga, perfil);
  });

  // Ordem escolhida (relevância, mais recentes ou prazo). Sem perfil preenchido, relevância = mais recentes.
  const ordenadas = ordenarVagas(filtradas, modoOrdem, perfil);

  listaVagas.replaceChildren();
  ordenadas.forEach(function (vaga) {
    listaVagas.appendChild(criarCartao(vaga, combinaComPerfil(vaga, perfil), perfil.soCompativeis));
  });

  // Mensagem diferente se não há nenhuma vaga cadastrada ou se só os filtros esvaziaram a lista
  if (vagasAtivas.length === 0) {
    mensagemVazio.textContent = "Ainda não há vagas abertas cadastradas. Volte em breve!";
  } else {
    mensagemVazio.textContent = perfil.soCompativeis
      ? "Nenhuma vaga encontrada com esses filtros. Tente limpar os filtros ou desligar o filtro de modalidade no seu perfil."
      : "Nenhuma vaga encontrada com esses filtros. Tente limpar os filtros.";
  }
  mensagemVazio.hidden = filtradas.length > 0;
  contador.textContent = filtradas.length + " de " + vagasAtivas.length + " vagas";
}

// ===== Meu perfil =====

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

// Caixinhas de áreas, cidades ou tipos: vêm das vagas, já marcadas conforme o perfil salvo
function criarOpcoesPerfil(campoPerfil, campoVaga) {
  valoresUnicos(campoVaga).forEach(function (valor) {
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

// O filtro de modalidade só pode ficar ligado se houver pelo menos uma modalidade marcada
function sincronizarFiltroModalidade() {
  const temModalidade = caixaModalidades.querySelectorAll("input:checked").length > 0;
  caixaSoCompativeis.disabled = !temModalidade;
  if (!temModalidade) {
    caixaSoCompativeis.checked = false;
  }
}

// Monta o perfil a partir do que está marcado e escrito na tela
function lerPerfilDaTela() {
  sincronizarFiltroModalidade();
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
  novo.soCompativeis = caixaSoCompativeis.checked;
  novo.palavras = caixaPalavras.value;
  return sanitizarPerfil(novo);
}

// Texto ao lado de "Meu perfil": mostra se o perfil está ativo
function mostrarEstadoPerfil() {
  const ativo = !perfilVazio(perfil) || perfil.nome !== "";
  estadoPerfil.textContent = ativo ? "· ativo" : "· defina o que você procura";
}

// Saudação no topo do site. O nome entra sempre como texto puro (textContent), nunca como HTML.
function mostrarSaudacao() {
  saudacao.textContent = perfil.nome !== ""
    ? "Olá, " + perfil.nome + "! Estas são as vagas com mais a ver com você."
    : textoPadraoSaudacao;
}

// Chamado a cada mudança no perfil: guarda (se o navegador deixar) e redesenha a lista
function aoMudarPerfil() {
  perfil = lerPerfilDaTela();
  avisoPerfil.hidden = salvarPerfil(armazenamento, perfil);
  mostrarEstadoPerfil();
  mostrarSaudacao();
  mostrarVagas();
}

// "Limpar meu perfil": desmarca tudo, esvazia os campos e APAGA o que estava guardado no navegador
function limparPerfil() {
  document.querySelectorAll("#perfil input[type=checkbox]").forEach(function (marcador) {
    marcador.checked = false;
  });
  caixaNome.value = "";
  caixaPalavras.value = "";
  sincronizarFiltroModalidade();
  perfil = novoPerfil();
  avisoPerfil.hidden = apagarPerfil(armazenamento);
  mostrarEstadoPerfil();
  mostrarSaudacao();
  mostrarVagas();
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
selectOrdenar.addEventListener("change", function () {
  modoOrdem = selectOrdenar.value;
  mostrarVagas();
});
Object.keys(caixasPerfil).forEach(function (campo) {
  caixasPerfil[campo].addEventListener("change", aoMudarPerfil);
});
caixaModalidades.addEventListener("change", aoMudarPerfil);
caixaSoCompativeis.addEventListener("change", aoMudarPerfil);
caixaNome.addEventListener("input", aoMudarPerfil);
caixaPalavras.addEventListener("input", aoMudarPerfil);
botaoLimparPerfil.addEventListener("click", limparPerfil);

preencherOpcoes(selectArea, "area");
preencherOpcoes(selectCidade, "cidade");
preencherOpcoes(selectFonte, "fonte");
criarOpcoesPerfil("areas", "area");
criarOpcoesPerfil("cidades", "cidade");
criarOpcoesPerfil("tipos", "tipoEmpresa");
criarOpcoesModalidade();
caixaNome.value = perfil.nome;
caixaSoCompativeis.checked = perfil.soCompativeis;
sincronizarFiltroModalidade();
caixaPalavras.value = perfil.palavras;
mostrarSaudacao();
avisoPerfil.hidden = armazenamento !== null;  // sem localStorage, avisa já na entrada
mostrarEstadoPerfil();
mostrarVagas();
