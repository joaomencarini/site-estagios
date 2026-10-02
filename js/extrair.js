// Tira o texto de um PDF ou de um Word (.docx) dentro do navegador.
// As bibliotecas (pdf.js e mammoth) ficam em js/vendor/ e só são carregadas quando alguém anexa um arquivo.
// Nada vem de CDN e nada é enviado a servidor. Nunca inventamos texto: se não der para ler, avisamos.

const MAXIMO_PAGINAS_PDF = 40;        // lê no máximo 40 páginas
const PARAR_COM_CARACTERES = 30000;   // e para cedo se já passou muito do limite do currículo
const TEMPO_MAXIMO_PDF_MS = 30000;

let promessaPdfjs = null;
let promessaMammoth = null;

// Carrega o pdf.js (módulo local). Em file:// o navegador não deixa carregar módulos: avisamos.
function carregarPdfjs() {
  if (promessaPdfjs === null) {
    promessaPdfjs = import("./vendor/pdfjs/pdf.min.mjs").then(function (modulo) {
      modulo.GlobalWorkerOptions.workerSrc = new URL("js/vendor/pdfjs/pdf.worker.min.mjs", document.baseURI).href;
      return modulo;
    });
    promessaPdfjs.catch(function () { promessaPdfjs = null; });
  }
  return promessaPdfjs;
}

// Carrega o mammoth (script local)
function carregarMammoth() {
  if (promessaMammoth === null) {
    promessaMammoth = new Promise(function (resolver, rejeitar) {
      if (window.mammoth) {
        resolver(window.mammoth);
        return;
      }
      const script = document.createElement("script");
      script.src = "js/vendor/mammoth/mammoth.browser.min.js";
      script.onload = function () { window.mammoth ? resolver(window.mammoth) : rejeitar(new Error("mammoth ausente")); };
      script.onerror = function () { rejeitar(new Error("mammoth não carregou")); };
      document.head.appendChild(script);
    });
    promessaMammoth.catch(function () { promessaMammoth = null; });
  }
  return promessaMammoth;
}

// PDF -> { ok: true, texto } ou { ok: false, motivo: "senha" | "erro" | "indisponivel" }
async function extrairTextoPdf(conteudo) {
  let pdfjs;
  try {
    pdfjs = await carregarPdfjs();
  } catch (erro) {
    return { ok: false, motivo: "indisponivel" };
  }
  let tarefa = null;
  let relogio = null;
  try {
    // o pdf.js "consome" o buffer que recebe, então damos uma cópia
    tarefa = pdfjs.getDocument({ data: new Uint8Array(conteudo.slice(0)), isEvalSupported: false, enableXfa: false, verbosity: 0 });
    const leitura = (async function () {
      const documento = await tarefa.promise;
      let texto = "";
      const paginas = Math.min(documento.numPages, MAXIMO_PAGINAS_PDF);
      for (let i = 1; i <= paginas && texto.length < PARAR_COM_CARACTERES; i++) {
        const pagina = await documento.getPage(i);
        const conteudoPagina = await pagina.getTextContent();
        conteudoPagina.items.forEach(function (item) {
          if (typeof item.str === "string") {
            texto += item.str + (item.hasEOL ? "\n" : " ");
          }
        });
        texto += "\n\n";
      }
      return texto;
    })();
    const limite = new Promise(function (resolver, rejeitar) {
      relogio = setTimeout(function () { rejeitar(new Error("tempo esgotado")); }, TEMPO_MAXIMO_PDF_MS);
    });
    const texto = await Promise.race([leitura, limite]);
    return { ok: true, texto: texto };
  } catch (erro) {
    return { ok: false, motivo: erro && erro.name === "PasswordException" ? "senha" : "erro" };
  } finally {
    clearTimeout(relogio);
    if (tarefa !== null) {
      try { tarefa.destroy(); } catch (e) { /* já destruída */ }
    }
  }
}

// DOCX -> { ok: true, texto } ou { ok: false, motivo: "erro" | "indisponivel" }
async function extrairTextoDocx(conteudo) {
  let mammoth;
  try {
    mammoth = await carregarMammoth();
  } catch (erro) {
    return { ok: false, motivo: "indisponivel" };
  }
  try {
    const resultado = await mammoth.extractRawText({ arrayBuffer: conteudo.slice(0) });
    return { ok: true, texto: resultado.value };
  } catch (erro) {
    return { ok: false, motivo: "erro" };
  }
}

function extrairTextoArquivo(formato, conteudo) {
  return formato === "pdf" ? extrairTextoPdf(conteudo) : extrairTextoDocx(conteudo);
}
