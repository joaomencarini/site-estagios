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
    fonte: ler("fonte"),
    link: ler("link"),
    dataPublicacao: ler("dataPublicacao"),
    prazoInscricao: ler("prazoInscricao")
  };

  if (!/^https?:\/\//i.test(vaga.link)) {
    erro.textContent = "O link precisa começar com http:// ou https://";
    return;
  }
  if (vaga.prazoInscricao && vaga.prazoInscricao < vaga.dataPublicacao) {
    erro.textContent = "O prazo de inscrição não pode ser antes da data de publicação.";
    return;
  }

  // JSON.stringify coloca aspas e protege caracteres especiais, evitando erro de sintaxe
  const linhas = [];
  Object.keys(vaga).forEach(function (campo) {
    if (vaga[campo] !== "") {
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
