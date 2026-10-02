// As listas "vagas" (manuais) e "vagasAuto" (automáticas) vêm dos arquivos em data/, carregados antes deste.

const selectArea = document.getElementById("filtro-area");
const selectCidade = document.getElementById("filtro-cidade");
const selectFonte = document.getElementById("filtro-fonte");
const botaoLimpar = document.getElementById("botao-limpar");
const listaVagas = document.getElementById("lista-vagas");
const mensagemVazio = document.getElementById("mensagem-vazio");
const textoVazio = document.getElementById("mensagem-vazio-texto");
const botaoMostrarTodas = document.getElementById("botao-mostrar-todas");
const faixaFiltro = document.getElementById("faixa-filtro");
const faixaTexto = document.getElementById("faixa-texto");
const faixaBotao = document.getElementById("faixa-botao");
const contador = document.getElementById("contador");
const selectOrdenar = document.getElementById("ordenar");
const saudacao = document.getElementById("saudacao");
const textoPadraoSaudacao = saudacao.textContent;  // texto de sempre, usado quando não há nome
const caixaNome = document.getElementById("perfil-nome");
const caixaModalidades = document.getElementById("perfil-modalidades");
const caixaPalavras = document.getElementById("perfil-palavras");
const botaoLimparPerfil = document.getElementById("botao-limpar-perfil");
const avisoPerfil = document.getElementById("aviso-perfil");
const estadoPerfil = document.getElementById("perfil-estado");
const caixasPerfil = {
  categorias: document.getElementById("perfil-categorias"),
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

// Escreve o e-mail no elemento deixando a linha quebrar só depois de "@" e de pontos (texto puro, sem HTML)
function escreverEmail(elemento, email) {
  (email.match(/[^@.]+[@.]?|[@.]/g) || []).forEach(function (parte, posicao) {
    if (posicao > 0) {
      elemento.appendChild(document.createElement("wbr"));
    }
    elemento.appendChild(document.createTextNode(parte));
  });
}

// Bloco "Enviar CV para: ..." com os e-mails (cada um com "Copiar e-mail") e o botão "Escrever e-mail",
// que abre o programa de e-mail com TODOS os destinatários e o assunto (se houver).
function criarBlocoEmail(vaga, emails) {
  const bloco = criar("div", "email-candidatura");
  const assunto = typeof vaga.assuntoEmail === "string" ? vaga.assuntoEmail.trim() : "";

  if (emails.length === 1) {
    // Um só e-mail: o endereço fica na própria linha
    const linhaEmail = criar("p", "email-linha", "Enviar CV para: ");
    const endereco = criar("strong", "email-endereco");
    escreverEmail(endereco, emails[0]);
    linhaEmail.appendChild(endereco);
    bloco.appendChild(linhaEmail);
    const botoesEmail = criar("div", "email-botoes");
    botoesEmail.appendChild(criarBotaoCopiar("Copiar e-mail", emails[0]));
    botoesEmail.appendChild(criarLinkEscrever(emails, assunto));
    bloco.appendChild(botoesEmail);
  } else {
    // Vários e-mails: uma linha para cada um, com o seu "Copiar e-mail"
    bloco.appendChild(criar("p", "email-linha", "Enviar CV para:"));
    const lista = criar("ul", "email-lista");
    emails.forEach(function (email) {
      const item = criar("li", "email-item");
      const endereco = criar("strong", "email-endereco");
      escreverEmail(endereco, email);
      item.appendChild(endereco);
      const copiar = criarBotaoCopiar("Copiar e-mail", email);
      copiar.setAttribute("aria-label", "Copiar e-mail " + email);
      item.appendChild(copiar);
      lista.appendChild(item);
    });
    bloco.appendChild(lista);
    const botoesEmail = criar("div", "email-botoes");
    botoesEmail.appendChild(criarLinkEscrever(emails, assunto));
    bloco.appendChild(botoesEmail);
  }

  if (assunto !== "") {
    const linhaAssunto = criar("p", "email-linha", "Assunto: ");
    linhaAssunto.appendChild(criar("span", "email-assunto", assunto));
    bloco.appendChild(linhaAssunto);
    const botoesAssunto = criar("div", "email-botoes");
    botoesAssunto.appendChild(criarBotaoCopiar("Copiar assunto", assunto));
    bloco.appendChild(botoesAssunto);
  }
  return bloco;
}

// Link "Escrever e-mail": abre o mailto com todos os destinatários válidos (e o assunto, se houver)
function criarLinkEscrever(emails, assunto) {
  const escrever = criar("a", "botao-email", "Escrever e-mail");
  escrever.href = montarMailto(emails, assunto);
  return escrever;
}

// Monta o cartão de uma vaga. "combina" = true mostra o selo "Combina com você";
// "avisarSemModalidade" = true (filtro de modalidade em ação) mostra "Modalidade não informada" nas vagas sem esse dado.
function criarCartao(vaga, combina, avisarSemModalidade) {
  const cartao = criar("article", "vaga");

  // Selos no alto: EXEMPLO, "Várias áreas" (área "Diversas") e "Combina com você"
  const varias = classificarArea(vaga.area).varias;
  if (vaga.exemplo || varias || combina) {
    const selos = criar("div", "selos");
    if (vaga.exemplo) {
      selos.appendChild(criar("span", "selo-exemplo", "EXEMPLO"));
    }
    if (varias) {
      selos.appendChild(criar("span", "selo-varias", "Várias áreas"));
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
  // emailCandidatura pode ser um e-mail ou uma lista; só os válidos entram (se nenhum for válido, sem bloco)
  const emails = emailsValidos(vaga.emailCandidatura);
  if (emails.length > 0) {
    acoes.appendChild(criarBlocoEmail(vaga, emails));
  }
  if (acoes.children.length > 0) {
    cartao.appendChild(acoes);
  }

  return cartao;
}

// "1 vaga" / "5 vagas"
function textoVagas(quantidade) {
  return quantidade + (quantidade === 1 ? " vaga" : " vagas");
}

// O filtro do perfil só age se o perfil tiver algo para filtrar e não estiver desligado ("Mostrar todas as vagas")
function filtroPerfilLigado() {
  return perfilTemFiltro(perfil) && !filtroPerfilPausado;
}

// Faixa acima da lista: diz o que está filtrando (ou que o filtro está desligado) e tem o botão de alternar
function mostrarFaixa(quantidade) {
  if (!perfilTemFiltro(perfil)) {
    faixaFiltro.hidden = true;
    return;
  }
  faixaFiltro.hidden = false;
  if (filtroPerfilPausado) {
    faixaTexto.textContent = "Filtro do perfil desligado · " + textoVagas(quantidade);
    faixaBotao.textContent = "Voltar a filtrar";
  } else {
    faixaTexto.textContent = "Filtrando por: " + descreverFiltroPerfil(perfil).join(", ") + " · " + textoVagas(quantidade);
    faixaBotao.textContent = "Mostrar todas as vagas";
  }
}

// Aplica os filtros e redesenha a lista. Ordem: 1) filtros da página (área, cidade, fonte);
// 2) filtro do perfil (categorias, cidades, tipos, modalidade); 3) ordenação por relevância/data/prazo; 4) selos.
function mostrarVagas() {
  const filtrosPagina = { area: selectArea.value, cidade: selectCidade.value, fonte: selectFonte.value };
  const perfilFiltrando = filtroPerfilLigado();
  const filtradas = filtrarVagas(vagasAtivas, filtrosPagina, perfil, perfilFiltrando);

  // Ordem escolhida (relevância, mais recentes ou prazo). A pontuação do perfil ordena o que sobrou.
  const ordenadas = ordenarVagas(filtradas, modoOrdem, perfil);

  listaVagas.replaceChildren();
  ordenadas.forEach(function (vaga) {
    // "Modalidade não informada" aparece quando o filtro de modalidade está em ação
    const avisarSemModalidade = perfilFiltrando && perfil.modalidades.length > 0;
    listaVagas.appendChild(criarCartao(vaga, combinaComPerfil(vaga, perfil), avisarSemModalidade));
  });

  // Mensagem de lista vazia (cada causa tem a sua)
  botaoMostrarTodas.hidden = true;
  if (vagasAtivas.length === 0) {
    textoVazio.textContent = "Ainda não há vagas abertas cadastradas. Volte em breve!";
  } else if (perfilFiltrando) {
    textoVazio.textContent = "Nenhuma vaga com esses critérios. Mude o que está marcado em Meu perfil ou mostre todas as vagas.";
    botaoMostrarTodas.hidden = false;
  } else {
    textoVazio.textContent = "Nenhuma vaga encontrada com esses filtros. Tente limpar os filtros.";
  }
  mensagemVazio.hidden = filtradas.length > 0;
  contador.textContent = filtradas.length + " de " + vagasAtivas.length + " vagas";
  mostrarFaixa(filtradas.length);
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

// Mudou uma escolha que filtra (categoria, cidade, tipo ou modalidade): o filtro volta a valer
function aoMudarFiltroPerfil() {
  filtroPerfilPausado = false;
  aoMudarPerfil();
}

// "Limpar meu perfil": desmarca tudo, esvazia os campos e APAGA o que estava guardado no navegador
function limparPerfil() {
  document.querySelectorAll("#perfil input[type=checkbox]").forEach(function (marcador) {
    marcador.checked = false;
  });
  caixaNome.value = "";
  caixaPalavras.value = "";
  filtroPerfilPausado = false;
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
  caixasPerfil[campo].addEventListener("change", aoMudarFiltroPerfil);
});
caixaModalidades.addEventListener("change", aoMudarFiltroPerfil);
// Faixa e mensagem de lista vazia: desligar o filtro do perfil (sem apagar o perfil) ou voltar a filtrar
faixaBotao.addEventListener("click", function () {
  filtroPerfilPausado = !filtroPerfilPausado;
  mostrarVagas();
});
botaoMostrarTodas.addEventListener("click", function () {
  filtroPerfilPausado = true;
  mostrarVagas();
});
caixaNome.addEventListener("input", aoMudarPerfil);
caixaPalavras.addEventListener("input", aoMudarPerfil);
botaoLimparPerfil.addEventListener("click", limparPerfil);

preencherOpcoes(selectArea, "area");
preencherOpcoes(selectCidade, "cidade");
preencherOpcoes(selectFonte, "fonte");
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
mostrarSaudacao();
avisoPerfil.hidden = armazenamento !== null;  // sem localStorage, avisa já na entrada
mostrarEstadoPerfil();
mostrarVagas();
