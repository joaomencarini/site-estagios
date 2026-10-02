// Guarda o arquivo do currículo (PDF ou Word) no IndexedDB do navegador.
// Fica só neste aparelho: nada é enviado a servidor. Se o IndexedDB não existir ou falhar
// (modo privado, bloqueio...), tudo aqui devolve { ok: false } e o site segue só com o texto.

const NOME_BANCO = "estagiosArquivo";
const NOME_LOJA = "arquivos";
const CHAVE_ARQUIVO = "curriculo";   // só existe um arquivo guardado por vez

// Abre o banco. Devolve uma Promise que sempre termina em { ok: true, banco } ou { ok: false }.
function abrirBancoArquivo(fabrica) {
  return new Promise(function (resolver) {
    try {
      if (!fabrica || typeof fabrica.open !== "function") {
        resolver({ ok: false });
        return;
      }
      const pedido = fabrica.open(NOME_BANCO, 1);
      pedido.onupgradeneeded = function () {
        pedido.result.createObjectStore(NOME_LOJA);
      };
      pedido.onsuccess = function () { resolver({ ok: true, banco: pedido.result }); };
      pedido.onerror = function () { resolver({ ok: false }); };
      pedido.onblocked = function () { resolver({ ok: false }); };
    } catch (erro) {
      resolver({ ok: false });
    }
  });
}

// Faz uma operação ("readonly"/"readwrite") na loja e devolve { ok, valor }.
function operarArquivo(fabrica, modo, operacao) {
  return abrirBancoArquivo(fabrica).then(function (aberto) {
    if (!aberto.ok) {
      return { ok: false };
    }
    return new Promise(function (resolver) {
      let valor;
      try {
        const transacao = aberto.banco.transaction(NOME_LOJA, modo);
        const pedido = operacao(transacao.objectStore(NOME_LOJA));
        pedido.onsuccess = function () { valor = pedido.result; };
        transacao.oncomplete = function () { aberto.banco.close(); resolver({ ok: true, valor: valor }); };
        transacao.onerror = function () { aberto.banco.close(); resolver({ ok: false }); };
        transacao.onabort = function () { aberto.banco.close(); resolver({ ok: false }); };
      } catch (erro) {
        try { aberto.banco.close(); } catch (e) { /* já fechado */ }
        resolver({ ok: false });
      }
    });
  });
}

// registro = { nome, tipo, tamanho, data, conteudo (ArrayBuffer) }
function guardarArquivoCurriculo(fabrica, registro) {
  return operarArquivo(fabrica, "readwrite", function (loja) { return loja.put(registro, CHAVE_ARQUIVO); });
}

// Devolve { ok: true, registro } (registro pode ser undefined se não há arquivo) ou { ok: false }
function lerArquivoCurriculo(fabrica) {
  return operarArquivo(fabrica, "readonly", function (loja) { return loja.get(CHAVE_ARQUIVO); })
    .then(function (r) { return r.ok ? { ok: true, registro: r.valor } : { ok: false }; });
}

function removerArquivoCurriculo(fabrica) {
  return operarArquivo(fabrica, "readwrite", function (loja) { return loja.delete(CHAVE_ARQUIVO); });
}

// O IndexedDB do navegador (ou undefined se não existir / se o acesso lançar erro)
function bancoDoNavegador() {
  try {
    return window.indexedDB;
  } catch (erro) {
    return undefined;
  }
}
