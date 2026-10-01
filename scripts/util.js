// Funções pequenas usadas pelos dois scripts. Sem dependências: só o que já vem com o Node.
const fs = require("fs");
const path = require("path");
const { hojeIso } = require("../js/regras");

const RAIZ = path.join(__dirname, "..");
// As variáveis de ambiente abaixo existem só para testar os scripts sem mexer nos dados reais
const PASTA_DADOS = process.env.DADOS_DIR || path.join(RAIZ, "data");
const ARQUIVO_FONTES = process.env.FONTES_JSON || path.join(__dirname, "fontes.json");

// "Hoje" no horário de Brasília (os scripts rodam em servidores no horário UTC)
const hoje = process.env.HOJE || hojeIso("America/Sao_Paulo");

const NAVEGADOR = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Lê um arquivo de dados .js (ex.: vagas.js) e devolve a lista que ele define (ex.: "vagas")
function lerLista(arquivo, nomeDaLista) {
  const caminho = path.join(PASTA_DADOS, arquivo);
  if (!fs.existsSync(caminho)) {
    return [];
  }
  return new Function(fs.readFileSync(caminho, "utf8") + "\nreturn " + nomeDaLista + ";")();
}

// Só grava se o conteúdo mudou (assim o workflow não faz commit à toa). Devolve true se gravou.
function gravarSeMudou(caminho, conteudo) {
  if (fs.existsSync(caminho) && fs.readFileSync(caminho, "utf8") === conteudo) {
    return false;
  }
  fs.writeFileSync(caminho, conteudo);
  return true;
}

module.exports = { RAIZ, PASTA_DADOS, ARQUIVO_FONTES, hoje, NAVEGADOR, lerLista, gravarSeMudou };
