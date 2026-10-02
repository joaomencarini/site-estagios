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
const caixaCurriculo = document.getElementById("perfil-curriculo");
const contadorCurriculo = document.getElementById("curriculo-contador");
const mensagemPerfil = document.getElementById("perfil-mensagem");
const botaoExportar = document.getElementById("botao-exportar-perfil");
const botaoImportar = document.getElementById("botao-importar-perfil");
const arquivoPerfil = document.getElementById("arquivo-perfil");
const janelaRe = document.getElementById("janela-reescrita");
const reVaga = document.getElementById("re-vaga");
const reSemCurriculo = document.getElementById("re-sem-curriculo");
const reComCurriculo = document.getElementById("re-com-curriculo");
const rePrompt = document.getElementById("re-prompt");
const reResposta = document.getElementById("re-resposta");
const reAviso = document.getElementById("re-aviso");
const reOriginal = document.getElementById("re-original");
const reOriginalTexto = document.getElementById("re-original-texto");
const reResultado = document.getElementById("re-resultado");
const rePagina = document.getElementById("re-pagina");
const reAvisoPagina = document.getElementById("re-aviso-pagina");
const reLacunas = document.getElementById("re-lacunas");
const reLacunasLista = document.getElementById("re-lacunas-lista");
const areaImpressao = document.getElementById("area-impressao");
const medidaCv = document.getElementById("medida-cv");
const botaoAnexar = document.getElementById("botao-anexar-curriculo");
const arquivoCurriculo = document.getElementById("arquivo-curriculo");
const blocoArquivo = document.getElementById("arquivo-guardado");
const infoArquivo = document.getElementById("arquivo-guardado-info");
const botaoRemoverArquivo = document.getElementById("botao-remover-arquivo");
const avisoBanco = document.getElementById("arquivo-aviso-banco");
const janela = document.getElementById("janela-candidatura");
const candVaga = document.getElementById("cand-vaga");
const candSemCurriculo = document.getElementById("cand-sem-curriculo");
const candComCurriculo = document.getElementById("cand-com-curriculo");
const candPrompt = document.getElementById("cand-prompt");
const candTituloResposta = document.getElementById("cand-titulo-resposta");
const candResposta = document.getElementById("cand-resposta");
const candAvisoTamanho = document.getElementById("cand-aviso-tamanho");
const candEscrever = document.getElementById("cand-escrever");
const candCopiarResposta = document.getElementById("cand-copiar-resposta");
const candAbrirVaga = document.getElementById("cand-abrir-vaga");
const candAnexo = document.getElementById("cand-anexo");
const candDestinatarios = document.getElementById("cand-destinatarios");
const candDestinatariosTexto = document.getElementById("cand-destinatarios-texto");
const candAssunto = document.getElementById("cand-assunto");
const candAssuntoTexto = document.getElementById("cand-assunto-texto");
const candSemArquivo = document.getElementById("cand-sem-arquivo");
const candBotoesArquivo = document.getElementById("cand-botoes-arquivo");
const candBaixar = document.getElementById("cand-baixar");
const candCompartilhar = document.getElementById("cand-compartilhar");
const candMensagem = document.getElementById("cand-mensagem");
let arquivoGuardado = null;  // currículo em arquivo: { nome, tipo, tamanho, data, conteudo (ArrayBuffer) } ou null
let arquivoNoBanco = false;  // true se esse arquivo também está guardado no IndexedDB
let arquivoParaCompartilhar = null;  // File pronto para navigator.share (só existe se o navegador suportar)
let vagaReescrita = null;  // vaga da janela "Reescrever currículo" aberta agora
let tituloAntesImpressao = null;  // título da página guardado enquanto o PDF é impresso
let vagaEmPreparo = null;  // vaga da janela "Preparar candidatura" aberta agora
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
  // "Preparar candidatura": só em vagas com e-mail válido ou link (abre a janela com o prompt para a IA)
  if (tipoCandidatura(vaga) !== "") {
    const preparar = criar("button", "botao-secundario botao-preparar", "Preparar candidatura");
    preparar.type = "button";
    preparar.setAttribute("aria-haspopup", "dialog");
    preparar.addEventListener("click", function () { abrirJanelaCandidatura(vaga); });
    acoes.appendChild(preparar);
  }
  // "Reescrever currículo para esta vaga": em todas as vagas (a IA usa a área e o tipo da vaga)
  const reescrever = criar("button", "botao-secundario botao-reescrever", "Reescrever currículo para esta vaga");
  reescrever.type = "button";
  reescrever.setAttribute("aria-haspopup", "dialog");
  reescrever.addEventListener("click", function () { abrirJanelaReescrita(vaga); });
  acoes.appendChild(reescrever);
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
  mostrarContadorCurriculo();
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

// Digitou ou colou o currículo: guarda (se o navegador deixar) e atualiza o contador.
// (Não precisa redesenhar a lista: o currículo não muda filtro nem ordem.)
function aoMudarCurriculo() {
  perfil = lerPerfilDaTela();
  avisoPerfil.hidden = salvarPerfil(armazenamento, perfil);
  mostrarContadorCurriculo();
}

// Mensagem curta no painel (importar, exportar, limpar). Sempre texto puro.
function mostrarMensagemPerfil(texto, ehErro) {
  mensagemPerfil.hidden = false;
  mensagemPerfil.textContent = texto;
  mensagemPerfil.classList.toggle("perfil-mensagem-erro", ehErro === true);
}

// "Exportar perfil (arquivo)": baixa um JSON com o perfil e o currículo (tudo gerado aqui, nada é enviado)
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

// "Importar perfil (arquivo)": lê o arquivo escolhido, valida (tamanho e formato) e troca o perfil atual
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

// Mostra (ou esconde) o arquivo guardado: nome, tamanho e data. Tudo como texto puro.
function mostrarArquivoGuardado() {
  blocoArquivo.hidden = arquivoGuardado === null;
  avisoBanco.hidden = arquivoGuardado === null || arquivoNoBanco;
  if (arquivoGuardado !== null) {
    infoArquivo.textContent = "Arquivo guardado: " + arquivoGuardado.nome + " · " + formatarTamanho(arquivoGuardado.tamanho)
      + " · anexado em " + formatarDataArquivo(arquivoGuardado.data);
  }
}

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
      mostrarArquivoGuardado();
    }
  });
}

// "Anexar currículo": valida, tira o texto, preenche o campo (perguntando antes de trocar um texto existente)
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
      aviso = "Guardei o arquivo, mas não encontrei texto nele (PDF escaneado ou só com imagens?). Cole o texto do currículo manualmente no campo acima.";
      ehErro = true;
    } else if (caixaCurriculo.value.trim() !== ""
      && !window.confirm("O campo do currículo já tem texto. Substituir pelo texto tirado do arquivo?\n\nOK = substituir. Cancelar = manter o texto atual (o arquivo é guardado do mesmo jeito).")) {
      aviso = "Mantive o texto que já estava no campo. O arquivo foi guardado.";
    } else {
      caixaCurriculo.value = preparado.texto;
      aoMudarCurriculo();
      aviso = "Texto tirado do arquivo. Revise e edite o que precisar." + (preparado.cortado ? " Ele passou de 15.000 caracteres, então usei só o começo." : "");
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
    mostrarArquivoGuardado();
    mostrarMensagemPerfil(aviso, ehErro);
  } finally {
    botaoAnexar.disabled = false;
  }
}

// "Remover arquivo": tira da memória e do IndexedDB (o texto do currículo continua)
function removerArquivoGuardado() {
  arquivoGuardado = null;
  arquivoNoBanco = false;
  mostrarArquivoGuardado();
  return removerArquivoCurriculo(bancoDoNavegador()).then(function (resultado) {
    mostrarMensagemPerfil(resultado.ok ? "Arquivo removido deste navegador. O texto do currículo continua." : "Arquivo removido desta página.", false);
    return resultado.ok;
  });
}

// ===== Janela "Preparar candidatura" =====

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

// Atualiza o link "Escrever e-mail" com os destinatários, o assunto exigido e o texto colado.
// Se o link passar do limite do mailto, desativa o botão e mostra o aviso (resta "Copiar e-mail").
function atualizarEscrever() {
  if (vagaEmPreparo === null || tipoCandidatura(vagaEmPreparo) !== "email") {
    return;
  }
  const assunto = typeof vagaEmPreparo.assuntoEmail === "string" ? vagaEmPreparo.assuntoEmail.trim() : "";
  const mailto = montarMailtoComCorpo(emailsValidos(vagaEmPreparo.emailCandidatura), assunto, candResposta.value.trim());
  candAvisoTamanho.hidden = !mailto.longo;
  candEscrever.classList.toggle("desativado", mailto.longo);
  if (mailto.longo) {
    candEscrever.removeAttribute("href");
    candEscrever.setAttribute("aria-disabled", "true");
  } else {
    candEscrever.href = mailto.href;
    candEscrever.removeAttribute("aria-disabled");
  }
}

// Mensagem curta dentro da janela (texto puro)
function mostrarMensagemJanela(texto) {
  candMensagem.hidden = false;
  candMensagem.textContent = texto;
}

// Parte "3. Anexe seu currículo": assunto e destinatários para copiar, e os botões do arquivo
function atualizarAnexoJanela(vaga) {
  const emails = tipoCandidatura(vaga) === "email" ? emailsValidos(vaga.emailCandidatura) : [];
  const assunto = emails.length > 0 && typeof vaga.assuntoEmail === "string" ? vaga.assuntoEmail.trim() : "";
  candMensagem.hidden = true;
  candDestinatarios.hidden = emails.length === 0;
  candDestinatariosTexto.textContent = "Para: " + emails.join(", ");
  candAssunto.hidden = assunto === "";
  candAssuntoTexto.textContent = "Assunto: " + assunto;
  candSemArquivo.hidden = arquivoGuardado !== null;
  candBotoesArquivo.hidden = arquivoGuardado === null;
  arquivoParaCompartilhar = null;
  candCompartilhar.hidden = true;
  if (arquivoGuardado !== null) {
    // o File é preparado já, para o clique em "Compartilhar" poder chamar navigator.share na hora
    try {
      const arquivo = new File([arquivoGuardado.conteudo], arquivoGuardado.nome, { type: arquivoGuardado.tipo });
      if (typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [arquivo] })) {
        arquivoParaCompartilhar = arquivo;
        candCompartilhar.hidden = false;
      }
    } catch (erro) {
      arquivoParaCompartilhar = null;
    }
  }
}

// "Baixar meu currículo": baixa o arquivo guardado com o nome original
function baixarArquivoGuardado() {
  if (arquivoGuardado === null) {
    return;
  }
  const url = URL.createObjectURL(new Blob([arquivoGuardado.conteudo], { type: arquivoGuardado.tipo }));
  const link = document.createElement("a");
  link.href = url;
  link.download = arquivoGuardado.nome;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

// "Compartilhar com anexo": menu de compartilhar do aparelho, com o arquivo e o e-mail colado. Cancelar não faz nada.
function compartilharArquivoGuardado() {
  if (arquivoParaCompartilhar === null || vagaEmPreparo === null) {
    return;
  }
  const assunto = typeof vagaEmPreparo.assuntoEmail === "string" ? vagaEmPreparo.assuntoEmail : "";
  navigator.share(dadosCompartilhar(arquivoParaCompartilhar, assunto, candResposta.value)).catch(function (erro) {
    if (erro && erro.name === "AbortError") {
      return;  // a pessoa cancelou: nada acontece
    }
    mostrarMensagemJanela("Não foi possível compartilhar. Use Baixar meu currículo e anexe o arquivo no seu app de e-mail.");
  });
}

// Abre a janela para a vaga. Tudo o que vem da vaga, do currículo e do nome entra como texto puro.
function abrirJanelaCandidatura(vaga) {
  vagaEmPreparo = vaga;
  candVaga.textContent = vaga.titulo + " · " + vaga.empresa;
  const semCurriculo = curriculoVazio(perfil);
  candSemCurriculo.hidden = !semCurriculo;
  candComCurriculo.hidden = semCurriculo;
  if (!semCurriculo) {
    const porEmail = tipoCandidatura(vaga) === "email";
    candPrompt.value = montarPrompt(vaga, perfil);   // só texto, para copiar: nunca é executado
    candResposta.value = "";
    candTituloResposta.textContent = porEmail ? "2. Cole aqui o e-mail que a IA escreveu" : "2. Cole aqui o texto que a IA escreveu";
    candCopiarResposta.dataset.rotulo = porEmail ? "Copiar e-mail" : "Copiar texto";
    candCopiarResposta.textContent = candCopiarResposta.dataset.rotulo;
    candEscrever.hidden = !porEmail;
    candAvisoTamanho.hidden = true;
    candAbrirVaga.hidden = porEmail || !linkSeguro(vaga.link);
    if (!candAbrirVaga.hidden) {
      candAbrirVaga.href = vaga.link;
    }
    atualizarEscrever();
    atualizarAnexoJanela(vaga);
  }
  candAnexo.hidden = semCurriculo;
  if (typeof janela.showModal === "function") {
    janela.showModal();
  } else {
    janela.setAttribute("open", "");
  }
}

function fecharJanelaCandidatura() {
  vagaEmPreparo = null;
  if (typeof janela.close === "function") {
    janela.close();
  } else {
    janela.removeAttribute("open");
  }
}

// ===== Janela "Reescrever currículo para esta vaga" =====

// Muda o texto e o estilo da mensagem da janela: tipo "aviso" (amarelo) ou "erro" (vermelho)
function mostrarAvisoReescrita(texto, tipo) {
  reAviso.hidden = texto === "";
  reAviso.textContent = texto;
  reAviso.className = tipo === "erro" ? "perfil-mensagem perfil-mensagem-erro" : "aviso-perfil";
}

function limparResultadoReescrita() {
  mostrarAvisoReescrita("", "aviso");
  reOriginal.hidden = true;
  reOriginalTexto.textContent = "";
  reResultado.hidden = true;
  rePagina.replaceChildren();
  reLacunas.hidden = true;
  reLacunasLista.replaceChildren();
  reAvisoPagina.hidden = true;
}

// Abre a janela para a vaga. Tudo o que vem da vaga e do currículo entra como texto puro.
function abrirJanelaReescrita(vaga) {
  vagaReescrita = vaga;
  reVaga.textContent = vaga.titulo + " · " + vaga.empresa;
  const semCurriculo = curriculoVazio(perfil);
  reSemCurriculo.hidden = !semCurriculo;
  reComCurriculo.hidden = semCurriculo;
  limparResultadoReescrita();
  reResposta.value = "";
  rePrompt.value = semCurriculo ? "" : montarPromptReescrita(vaga, perfil);   // só texto, para copiar: nunca é executado
  if (typeof janelaRe.showModal === "function") {
    janelaRe.showModal();
  } else {
    janelaRe.setAttribute("open", "");
  }
}

function fecharJanelaReescrita() {
  if (typeof janelaRe.close === "function") {
    janelaRe.close();
  } else {
    janelaRe.removeAttribute("open");
  }
}

// Desenha a "folha" do currículo a partir dos blocos lidos. Só createElement + textContent (nunca innerHTML).
function construirPaginaCurriculo(pagina, leitura, idioma) {
  const s = leitura.secoes;
  pagina.replaceChildren();
  if (s.NOME) {
    pagina.appendChild(criar("h1", "", linhasDeLista(s.NOME).map(function (l) { return l.texto; }).join(" ")));
  }
  if (s.CONTATO) {
    pagina.appendChild(criar("p", "cv-contato", linhasDeLista(s.CONTATO).map(function (l) { return l.texto; }).join(" | ")));
  }
  ["RESUMO", "OBJETIVO", "EDUCACAO", "EXPERIENCIA", "HABILIDADES", "IDIOMAS"].forEach(function (bloco) {
    if (!s[bloco]) {
      return;
    }
    pagina.appendChild(criar("h2", "", rotuloBlocoCurriculo(bloco, idioma)));
    const comTitulos = bloco === "EDUCACAO" || bloco === "EXPERIENCIA";
    let lista = null;
    linhasDeLista(s[bloco]).forEach(function (linha) {
      if (linha.item) {
        if (lista === null) {
          lista = criar("ul", "", "");
          pagina.appendChild(lista);
        }
        lista.appendChild(criar("li", "", linha.texto));
      } else {
        lista = null;
        pagina.appendChild(criar("p", comTitulos ? "cv-subtitulo" : "", linha.texto));
      }
    });
  });
}

// Lê o que está na folha (inclusive o que o usuário editou) como texto simples, com "- " nos itens de lista
function textoDaPagina(pagina) {
  const partes = [];
  Array.from(pagina.children).forEach(function (no) {
    const tag = no.tagName;
    if (tag === "UL" || tag === "OL") {
      Array.from(no.children).forEach(function (li) { partes.push("- " + li.innerText.trim()); });
    } else {
      if (tag === "H2") {
        partes.push("");
      }
      const texto = no.innerText.trim();
      if (texto !== "") {
        partes.push(texto);
      }
    }
  });
  return partes.join("\n").trim();
}

// Cálculo aproximado: a folha impressa (A4 com margens de 15 mm em cima e embaixo) cabe em uma página?
function curriculoCabeEmUmaPagina() {
  const copia = rePagina.cloneNode(true);
  copia.removeAttribute("id");
  const regua = document.createElement("div");
  regua.style.height = "267mm";   // 297 mm da folha - 2 x 15 mm de margem
  medidaCv.replaceChildren(copia, regua);
  const cabe = copia.offsetHeight <= regua.offsetHeight;
  medidaCv.replaceChildren();
  return cabe;
}

function atualizarAvisoPagina() {
  reAvisoPagina.hidden = curriculoCabeEmUmaPagina();
  reAvisoPagina.textContent = "Pelo cálculo aproximado, este currículo pode passar de uma página A4. Corte um pouco do texto (a fonte do seu aparelho também muda isso).";
}

// "Montar currículo": lê a resposta colada com tolerância e mostra a folha editável
function montarCurriculoDaResposta() {
  limparResultadoReescrita();
  const colado = reResposta.value;
  if (colado.trim() === "") {
    mostrarAvisoReescrita("Cole primeiro a resposta da IA no campo acima.", "erro");
    return;
  }
  const leitura = lerRespostaCurriculo(colado);
  if (!leitura.ok) {
    reOriginal.hidden = false;
    reOriginalTexto.textContent = colado;
    mostrarAvisoReescrita("Não consegui encontrar os blocos do currículo (===NOME===, ===RESUMO===, ===EXPERIENCIA=== ...). Confira se você colou a resposta inteira e se a IA seguiu o formato; se precisar, peça de novo.", "erro");
    return;
  }
  const idioma = idiomaDaVaga(vagaReescrita || {});
  construirPaginaCurriculo(rePagina, leitura, idioma);
  reResultado.hidden = false;
  const avisos = [];
  if (leitura.faltando.length > 0) {
    avisos.push("Estes blocos não vieram na resposta: " + leitura.faltando.map(function (b) { return rotuloBlocoCurriculo(b, "pt"); }).join(", ")
      + ". Se o seu currículo tem essa informação, peça à IA para incluí-la; se não tem, está tudo bem.");
  }
  if (leitura.desconhecidos.length > 0) {
    avisos.push("Ignorei blocos que não conheço: " + leitura.desconhecidos.join(", ") + ".");
  }
  mostrarAvisoReescrita(avisos.join(" "), "aviso");
  reLacunasLista.replaceChildren();
  leitura.lacunas.forEach(function (texto) { reLacunasLista.appendChild(criar("li", "", texto)); });
  reLacunas.hidden = leitura.lacunas.length === 0;   // fica FORA da folha: nunca vai para o PDF
  atualizarAvisoPagina();
}

// Prepara a impressão: copia só a folha para a área de impressão e dá ao documento o nome do arquivo
function prepararImpressao() {
  const copia = rePagina.cloneNode(true);
  ["id", "contenteditable", "role", "aria-multiline", "aria-label", "spellcheck"].forEach(function (nome) { copia.removeAttribute(nome); });
  copia.querySelectorAll("script, style, iframe, object, embed, link, meta, img, svg, form, input, button").forEach(function (no) { no.remove(); });
  areaImpressao.replaceChildren(copia);
  const titulo = rePagina.querySelector("h1");
  const nome = titulo !== null ? titulo.innerText.trim() : perfil.nome;
  if (tituloAntesImpressao === null) {
    tituloAntesImpressao = document.title;
  }
  document.title = nomeCurriculoPdf(nome, vagaReescrita !== null ? vagaReescrita.area : "");
  document.body.classList.add("imprimindo-cv");
}

// Depois da impressão (ou de cancelar): volta o site e o título ao normal
function restaurarImpressao() {
  document.body.classList.remove("imprimindo-cv");
  areaImpressao.replaceChildren();
  if (tituloAntesImpressao !== null) {
    document.title = tituloAntesImpressao;
    tituloAntesImpressao = null;
  }
}

// "Baixar PDF": abre a impressão do navegador só com a folha do currículo (o aluno escolhe "Salvar como PDF")
function baixarPdf() {
  if (rePagina.textContent.trim() === "") {
    return;
  }
  atualizarAvisoPagina();
  prepararImpressao();
  window.addEventListener("afterprint", restaurarImpressao, { once: true });
  setTimeout(restaurarImpressao, 120000);   // rede de segurança, se o navegador nunca avisar o fim da impressão
  window.print();
}

// Colar ou arrastar para dentro da folha vira texto simples (nada de HTML vindo de fora)
function colarSoTexto(evento) {
  evento.preventDefault();
  const texto = evento.clipboardData ? evento.clipboardData.getData("text/plain") : "";
  if (texto !== "") {
    document.execCommand("insertText", false, texto);
  }
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

// "Limpar meu perfil": desmarca tudo, esvazia os campos (inclusive o currículo) e APAGA o que estava guardado no navegador
function limparPerfil() {
  document.querySelectorAll("#perfil input[type=checkbox]").forEach(function (marcador) {
    marcador.checked = false;
  });
  caixaNome.value = "";
  caixaPalavras.value = "";
  caixaCurriculo.value = "";  // o currículo também é apagado
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
  mostrarArquivoGuardado();
  removerArquivoCurriculo(bancoDoNavegador()).then(function (resultado) {
    if (tinhaArquivo && resultado.ok && apagou) {
      mostrarMensagemPerfil("Perfil, currículo e arquivo apagados deste navegador.", false);
    }
  });
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

caixaCurriculo.addEventListener("input", aoMudarCurriculo);
botaoExportar.addEventListener("click", exportarPerfil);
botaoImportar.addEventListener("click", function () { arquivoPerfil.click(); });
arquivoPerfil.addEventListener("change", function () {
  importarPerfil(arquivoPerfil.files[0]);
  arquivoPerfil.value = "";  // permite escolher o mesmo arquivo de novo depois
});
document.getElementById("cand-fechar").addEventListener("click", fecharJanelaCandidatura);
janela.addEventListener("click", function (evento) {
  if (evento.target === janela) {  // clique fora da caixa (no fundo escuro)
    fecharJanelaCandidatura();
  }
});
janela.addEventListener("close", function () { vagaEmPreparo = null; });
document.getElementById("cand-ir-curriculo").addEventListener("click", function () {
  fecharJanelaCandidatura();
  document.getElementById("perfil").open = true;
  caixaCurriculo.scrollIntoView({ block: "center" });
  caixaCurriculo.focus();
});
botaoAnexar.addEventListener("click", function () { arquivoCurriculo.click(); });
arquivoCurriculo.addEventListener("change", function () {
  const escolhido = arquivoCurriculo.files[0];
  arquivoCurriculo.value = "";  // permite escolher o mesmo arquivo de novo depois
  anexarArquivo(escolhido);
});
botaoRemoverArquivo.addEventListener("click", removerArquivoGuardado);
candBaixar.addEventListener("click", baixarArquivoGuardado);
candCompartilhar.addEventListener("click", compartilharArquivoGuardado);
ligarBotaoCopiar(document.getElementById("cand-copiar-destinatarios"), function () {
  return vagaEmPreparo === null ? "" : emailsValidos(vagaEmPreparo.emailCandidatura).join(", ");
});
ligarBotaoCopiar(document.getElementById("cand-copiar-assunto"), function () {
  return vagaEmPreparo !== null && typeof vagaEmPreparo.assuntoEmail === "string" ? vagaEmPreparo.assuntoEmail.trim() : "";
});
document.getElementById("cand-reescrever").addEventListener("click", function () {
  const vaga = vagaEmPreparo;
  fecharJanelaCandidatura();
  if (vaga !== null) {
    abrirJanelaReescrita(vaga);
  }
});
document.getElementById("re-fechar").addEventListener("click", fecharJanelaReescrita);
janelaRe.addEventListener("click", function (evento) {
  if (evento.target === janelaRe) {  // clique fora da caixa (no fundo escuro)
    fecharJanelaReescrita();
  }
});
janelaRe.addEventListener("close", function () { vagaReescrita = null; });
document.getElementById("re-ir-curriculo").addEventListener("click", function () {
  fecharJanelaReescrita();
  document.getElementById("perfil").open = true;
  caixaCurriculo.scrollIntoView({ block: "center" });
  caixaCurriculo.focus();
});
document.getElementById("re-montar").addEventListener("click", montarCurriculoDaResposta);
document.getElementById("re-baixar-pdf").addEventListener("click", baixarPdf);
ligarBotaoCopiar(document.getElementById("re-copiar-prompt"), function () { return rePrompt.value; });
ligarBotaoCopiar(document.getElementById("re-copiar-texto"), function () { return textoDaPagina(rePagina); });
rePagina.addEventListener("paste", colarSoTexto);
rePagina.addEventListener("drop", function (evento) { evento.preventDefault(); });
rePagina.addEventListener("input", atualizarAvisoPagina);
candResposta.addEventListener("input", atualizarEscrever);
ligarBotaoCopiar(document.getElementById("cand-copiar-prompt"), function () { return candPrompt.value; });
ligarBotaoCopiar(candCopiarResposta, function () { return candResposta.value.trim(); });
preencherOpcoes(selectArea, "area");
preencherOpcoes(selectCidade, "cidade");
preencherOpcoes(selectFonte, "fonte");
montarPainelPerfil();
mostrarSaudacao();
avisoPerfil.hidden = armazenamento !== null;  // sem localStorage, avisa já na entrada
mostrarEstadoPerfil();
mostrarVagas();
carregarArquivoGuardado();  // traz de volta o arquivo anexado em visitas anteriores
