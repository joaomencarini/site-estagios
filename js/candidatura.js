// Janela de candidatura em 3 passos (currículo, e-mail ou resumo, enviar), que reúne tudo o que antes
// ficava espalhado no cartão: copiar e-mail/assunto, prompt para a IA, reescrever o currículo (folha A4 + PDF),
// escrever e-mail, baixar o currículo e compartilhar com anexo.
// Tudo roda no navegador: nada é enviado a servidor e todo texto entra como texto puro.
// Este arquivo só define funções; js/app.js chama iniciarCandidatura() no fim.

const janela = document.getElementById("janela-candidatura");
const candVaga = document.getElementById("cand-vaga");
const candPassos = Array.from(document.querySelectorAll("#cand-passos .passo-item"));
const candSecoes = [document.getElementById("passo-1"), document.getElementById("passo-2"), document.getElementById("passo-3")];
const candVoltar = document.getElementById("cand-voltar");
const candProximo = document.getElementById("cand-proximo");
const candPrompt = document.getElementById("cand-prompt");
const candResposta = document.getElementById("cand-resposta");
const candAvisoTamanho = document.getElementById("cand-aviso-tamanho");
const candEscrever = document.getElementById("cand-escrever");
const candCopiarResposta = document.getElementById("cand-copiar-resposta");
const candBaixar = document.getElementById("cand-baixar");
const candCompartilhar = document.getElementById("cand-compartilhar");
const candMensagem = document.getElementById("cand-mensagem");
const candResumo = document.getElementById("cand-resumo");
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

let vagaEmPreparo = null;         // vaga da janela aberta agora
let passoAtual = 1;               // 1, 2 ou 3
let arquivoParaCompartilhar = null;  // File pronto para navigator.share (só existe se o navegador suportar)
let tituloAntesImpressao = null;  // título da página guardado enquanto o PDF é impresso

// Dados da vaga aberta, já tratados
function emailsDaVaga() {
  return vagaEmPreparo === null ? [] : emailsValidos(vagaEmPreparo.emailCandidatura);
}
function assuntoDaVaga() {
  return vagaEmPreparo !== null && emailsDaVaga().length > 0 && typeof vagaEmPreparo.assuntoEmail === "string" ? vagaEmPreparo.assuntoEmail.trim() : "";
}
function vagaPorEmail() {
  return vagaEmPreparo !== null && tipoCandidatura(vagaEmPreparo) === "email";
}

// ===== Abrir, fechar e navegar entre os passos =====

// Abre a janela para a vaga. Tudo o que vem da vaga e do currículo entra como texto puro.
function abrirJanelaCandidatura(vaga) {
  vagaEmPreparo = vaga;
  candVaga.textContent = vaga.titulo + " · " + vaga.empresa;
  document.getElementById("passo-nome-2").textContent = vagaPorEmail() ? "E-mail" : "Resumo";
  candResposta.value = "";
  reResposta.value = "";
  limparResultadoReescrita();
  candMensagem.hidden = true;
  document.querySelector('input[name="modo-curriculo"][value="como-esta"]').checked = true;
  mostrarPasso(1);
  if (typeof janela.showModal === "function") {
    janela.showModal();
  } else {
    janela.setAttribute("open", "");
  }
  document.getElementById("passo-1-titulo").focus();
}

function fecharJanelaCandidatura() {
  if (typeof janela.close === "function") {
    janela.close();
  } else {
    janela.removeAttribute("open");
  }
}

// Mostra um passo: atualiza o indicador, os botões Voltar/Próximo e o conteúdo daquele passo
function mostrarPasso(numero) {
  passoAtual = numero;
  candSecoes.forEach(function (secao, i) { secao.hidden = i + 1 !== numero; });
  candPassos.forEach(function (item, i) {
    if (i + 1 === numero) {
      item.setAttribute("aria-current", "step");
    } else {
      item.removeAttribute("aria-current");
    }
    item.classList.toggle("feito", i + 1 < numero);
  });
  candVoltar.hidden = numero === 1;
  candProximo.textContent = numero === 3 ? "Concluir" : "Próximo";
  if (numero === 1) {
    atualizarPasso1();
  } else if (numero === 2) {
    atualizarPasso2();
  } else {
    atualizarPasso3();
  }
  document.querySelector(".janela-corpo").scrollTop = 0;
  document.getElementById("passo-" + numero + "-titulo").focus();
}

function irParaProximoPasso() {
  if (passoAtual === 3) {
    fecharJanelaCandidatura();
  } else {
    mostrarPasso(passoAtual + 1);
  }
}

// ===== Passo 1: currículo (usar como está ou adaptar para a vaga) =====

function modoCurriculo() {
  return document.querySelector('input[name="modo-curriculo"]:checked').value;
}

function atualizarPasso1() {
  const semCurriculo = curriculoVazio(perfil);
  document.getElementById("re-sem-curriculo").hidden = !semCurriculo;
  document.getElementById("re-com-curriculo").hidden = semCurriculo;
  if (semCurriculo) {
    return;
  }
  document.getElementById("cand-estado-curriculo").textContent = arquivoGuardado !== null
    ? "Currículo salvo: " + arquivoGuardado.nome + ", " + formatarTamanho(arquivoGuardado.tamanho)
    : "Currículo salvo: só o texto";
  const adaptar = modoCurriculo() === "adaptar";
  document.getElementById("modo-como-esta").hidden = adaptar;
  document.getElementById("modo-adaptar").hidden = !adaptar;
  document.getElementById("cand-baixar-1").hidden = arquivoGuardado === null;
  document.getElementById("cand-sem-arquivo-1").hidden = arquivoGuardado !== null;
  if (adaptar && rePrompt.value === "") {
    rePrompt.value = montarPromptReescrita(vagaEmPreparo, perfil);   // só texto, para copiar: nunca é executado
  }
}

// Muda o texto e o estilo da mensagem da área "Adaptar": tipo "aviso" ou "erro"
function mostrarAvisoReescrita(texto, tipo) {
  reAviso.hidden = texto === "";
  reAviso.textContent = texto;
  reAviso.className = tipo === "erro" ? "mensagem mensagem-erro" : "aviso";
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
  rePrompt.value = "";
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
  const prompt = rePrompt.value;
  limparResultadoReescrita();
  rePrompt.value = prompt;
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
  const idioma = idiomaDaVaga(vagaEmPreparo || {});
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
  document.title = nomeCurriculoPdf(nome, vagaEmPreparo !== null ? vagaEmPreparo.area : "");
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

// ===== Passo 2: e-mail (ou resumo para o formulário) =====

// Uma linha "Para: x@y.com [Copiar]" ou "Assunto: ... [Copiar]". O texto é sempre texto puro.
function criarLinhaCopiar(rotulo, texto, rotuloAcessivel) {
  const linha = criar("div", "linha-copiar");
  const p = criar("p", "linha-copiar-texto");
  p.appendChild(criar("small", "", rotulo));
  p.appendChild(document.createTextNode(texto));
  linha.appendChild(p);
  const botao = criar("button", "botao botao-contorno botao-pequeno", "Copiar");
  botao.type = "button";
  botao.setAttribute("aria-label", rotuloAcessivel);
  ligarBotaoCopiar(botao, function () { return texto; });
  linha.appendChild(botao);
  return linha;
}

function atualizarPasso2() {
  const porEmail = vagaPorEmail();
  const semCurriculo = curriculoVazio(perfil);
  document.getElementById("passo-2-titulo").textContent = porEmail ? "2. E-mail" : "2. Resumo para o formulário";
  document.getElementById("cand-instrucao-2").textContent = porEmail
    ? "Copie o destinatário e o assunto, peça o texto à IA e cole a resposta abaixo."
    : "Peça à IA um resumo do seu perfil para o formulário e cole a resposta abaixo (opcional).";
  // Destinatários e assunto exigido, cada um com "Copiar"
  const dados = document.getElementById("cand-email-dados");
  dados.hidden = !porEmail;
  const destinatarios = document.getElementById("cand-destinatarios");
  destinatarios.replaceChildren();
  const emails = emailsDaVaga();
  if (porEmail) {
    emails.forEach(function (email) {
      destinatarios.appendChild(criarLinhaCopiar("Para", email, "Copiar e-mail " + email));
    });
  }
  const assunto = assuntoDaVaga();
  document.getElementById("cand-assunto").hidden = assunto === "";
  const textoAssunto = document.getElementById("cand-assunto-texto");
  textoAssunto.replaceChildren(criar("small", "", "Assunto exigido"), document.createTextNode(assunto));
  // Prompt (só com currículo salvo)
  document.getElementById("cand-sem-curriculo-2").hidden = !semCurriculo;
  document.getElementById("cand-prompt-bloco").hidden = semCurriculo;
  candPrompt.value = semCurriculo ? "" : montarPrompt(vagaEmPreparo, perfil);   // só texto, para copiar: nunca é executado
  document.getElementById("cand-titulo-resposta").textContent = porEmail ? "Cole aqui o e-mail escrito pela IA" : "Cole aqui o texto escrito pela IA";
}

// ===== Passo 3: enviar =====

// Atualiza o link "Escrever e-mail" com os destinatários, o assunto exigido e o texto colado.
// Se o link passar do limite do mailto, desativa o botão e mostra o aviso (resta "Copiar e-mail").
function atualizarEscrever() {
  if (!vagaPorEmail()) {
    return;
  }
  const mailto = montarMailtoComCorpo(emailsDaVaga(), assuntoDaVaga(), candResposta.value.trim());
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

function atualizarPasso3() {
  const porEmail = vagaPorEmail();
  candMensagem.hidden = true;
  document.getElementById("cand-instrucao-3").textContent = porEmail
    ? "Abra o e-mail, anexe o currículo e envie."
    : "Abra a vaga, copie o texto (se tiver) e envie o currículo no formulário da empresa.";
  document.getElementById("cand-enviar-email").hidden = !porEmail;
  atualizarEscrever();
  candCopiarResposta.dataset.rotulo = "Copiar e-mail";
  // Vaga só com link: o texto/resumo do passo 2 fica aqui para copiar
  const resumo = candResposta.value.trim();
  document.getElementById("cand-enviar-resumo").hidden = porEmail;
  candResumo.value = resumo;
  candResumo.hidden = resumo === "";
  document.getElementById("cand-copiar-resumo").hidden = resumo === "";
  document.getElementById("cand-sem-resumo").hidden = resumo !== "";
  // Link da vaga
  const temLink = linkSeguro(vagaEmPreparo.link);
  document.getElementById("cand-enviar-link").hidden = !temLink;
  if (temLink) {
    document.getElementById("cand-abrir-vaga").href = vagaEmPreparo.link;
  }
  // Arquivo do currículo: baixar e (se o navegador suportar) compartilhar com anexo
  document.getElementById("cand-sem-arquivo").hidden = arquivoGuardado !== null;
  document.getElementById("cand-botoes-arquivo").hidden = arquivoGuardado === null;
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

// ===== Ligações (eventos) =====

function iniciarCandidatura() {
  prenderFoco(janela);
  document.getElementById("cand-fechar").addEventListener("click", fecharJanelaCandidatura);
  janela.addEventListener("click", function (evento) {
    if (evento.target === janela) {  // clique fora da caixa (no fundo escuro)
      fecharJanelaCandidatura();
    }
  });
  janela.addEventListener("close", function () { restaurarImpressao(); });
  candVoltar.addEventListener("click", function () { if (passoAtual > 1) { mostrarPasso(passoAtual - 1); } });
  candProximo.addEventListener("click", irParaProximoPasso);
  document.getElementById("re-ir-curriculo").addEventListener("click", function () {
    fecharJanelaCandidatura();
    abrirPerfil("curriculo");
    botaoAnexar.focus();
  });
  document.querySelectorAll('input[name="modo-curriculo"]').forEach(function (opcao) {
    opcao.addEventListener("change", atualizarPasso1);
  });
  document.getElementById("cand-baixar-1").addEventListener("click", baixarArquivoGuardado);
  document.getElementById("re-montar").addEventListener("click", montarCurriculoDaResposta);
  document.getElementById("re-baixar-pdf").addEventListener("click", baixarPdf);
  ligarBotaoCopiar(document.getElementById("re-copiar-prompt"), function () { return rePrompt.value; });
  ligarBotaoCopiar(document.getElementById("re-copiar-texto"), function () { return textoDaPagina(rePagina); });
  rePagina.addEventListener("paste", colarSoTexto);
  rePagina.addEventListener("drop", function (evento) { evento.preventDefault(); });
  rePagina.addEventListener("input", atualizarAvisoPagina);
  ligarBotaoCopiar(document.getElementById("cand-copiar-assunto"), assuntoDaVaga);
  ligarBotaoCopiar(document.getElementById("cand-copiar-prompt"), function () { return candPrompt.value; });
  ligarBotaoCopiar(candCopiarResposta, function () { return candResposta.value.trim(); });
  ligarBotaoCopiar(document.getElementById("cand-copiar-resumo"), function () { return candResumo.value; });
  candResposta.addEventListener("input", atualizarEscrever);
  candBaixar.addEventListener("click", baixarArquivoGuardado);
  candCompartilhar.addEventListener("click", compartilharArquivoGuardado);
}
