// Gera o texto de uma vaga no formato certo para colar em data/vagas.js.

const formulario = document.getElementById("formulario");
const erro = document.getElementById("erro");
const resultado = document.getElementById("resultado");
const textoGerado = document.getElementById("texto-gerado");
const botaoCopiar = document.getElementById("botao-copiar");
const avisoCopiado = document.getElementById("aviso-copiado");

// Lê um campo do formulário, sem espaços sobrando nas pontas
function ler(id) {
  return document.getElementById(id).value.trim();
}

// Data de hoje (AAAA-MM-DD), para já deixar a data de publicação preenchida
function hojeIso() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return agora.getFullYear() + "-" + mes + "-" + dia;
}

document.getElementById("dataPublicacao").value = hojeIso();

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();
  erro.textContent = "";
  avisoCopiado.textContent = "";

  const vaga = {
    titulo: ler("titulo"),
    empresa: ler("empresa"),
    area: ler("area"),
    cidade: ler("cidade"),
    tipoEmpresa: ler("tipoEmpresa"),
    modalidade: ler("modalidade"),
    fonte: ler("fonte"),
    link: ler("link"),
    emailCandidatura: ler("emailCandidatura"),
    assuntoEmail: ler("assuntoEmail"),
    dataPublicacao: ler("dataPublicacao"),
    prazoInscricao: ler("prazoInscricao")
  };

  if (vaga.modalidade !== "" && modalidadePadrao(vaga.modalidade) === "") {
    erro.textContent = "Modalidade inválida. Use Presencial, Híbrido ou Remoto (ou deixe em branco).";
    return;
  }
  if (vaga.link !== "" && !/^https?:\/\//i.test(vaga.link)) {
    erro.textContent = "O link precisa começar com http:// ou https://";
    return;
  }
  // Vários e-mails: separados por vírgula, ponto e vírgula ou espaço. Cada um é validado.
  const digitados = vaga.emailCandidatura.split(/[,;\s]+/).filter(function (item) { return item !== ""; });
  const invalidos = digitados.filter(function (item) { return !emailValido(item); });
  if (invalidos.length > 0) {
    erro.textContent = "E-mail inválido: " + invalidos.slice(0, 3).join(", ") + ". Use o formato nome@empresa.com, sem espaços.";
    return;
  }
  // Um e-mail vira texto; vários viram uma lista (repetidos são descartados)
  const emails = emailsValidos(digitados);
  vaga.emailCandidatura = emails.length === 0 ? "" : (emails.length === 1 ? emails[0] : emails);
  if (vaga.assuntoEmail !== "" && vaga.emailCandidatura === "") {
    erro.textContent = "O assunto só faz sentido junto com o e-mail. Preencha o e-mail ou apague o assunto.";
    return;
  }
  if (vaga.prazoInscricao && vaga.prazoInscricao < vaga.dataPublicacao) {
    erro.textContent = "O prazo de inscrição não pode ser antes da data de publicação.";
    return;
  }

  // JSON.stringify coloca aspas e protege caracteres especiais, evitando erro de sintaxe
  const linhas = [];
  Object.keys(vaga).forEach(function (campo) {
    if (vaga[campo] !== "") {  // (uma lista de e-mails também é escrita por JSON.stringify: ["a@x.com","b@x.com"])
      linhas.push("    " + campo + ": " + JSON.stringify(vaga[campo]));
    }
  });

  textoGerado.value = "  {\n" + linhas.join(",\n") + "\n  },";
  resultado.hidden = false;
  resultado.scrollIntoView({ behavior: "smooth", block: "start" });
});

botaoCopiar.addEventListener("click", function () {
  textoGerado.select();
  // Tenta o jeito moderno; se o navegador bloquear, usa o jeito antigo
  const moderno = navigator.clipboard
    ? navigator.clipboard.writeText(textoGerado.value)
    : Promise.reject();
  moderno.catch(function () {
    document.execCommand("copy");
  }).then(function () {
    avisoCopiado.textContent = "Texto copiado!";
  });
});
