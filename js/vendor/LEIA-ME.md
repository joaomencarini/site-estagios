# Bibliotecas de terceiros (js/vendor)

Servem só para **ler o texto de um currículo anexado**, dentro do navegador. Ficam copiadas aqui (versões fixas)
e são carregadas **só quando alguém anexa um arquivo**. Nada vem de CDN e nada é enviado a servidor.

| Pasta | Biblioteca | Versão | Licença | Arquivos copiados |
|---|---|---|---|---|
| `pdfjs/` | [pdf.js](https://github.com/mozilla/pdf.js) (pacote npm `pdfjs-dist`, build `legacy`) | 4.10.38 | Apache-2.0 (`pdfjs/LICENSE`) | `pdf.min.mjs`, `pdf.worker.min.mjs` |
| `mammoth/` | [mammoth](https://github.com/mwilliamson/mammoth.js) (pacote npm `mammoth`) | 1.13.0 | BSD-2-Clause (`mammoth/LICENSE`) | `mammoth.browser.min.js` |

O `mammoth.browser.min.js` já traz embutidas as dependências do mammoth: jszip 3.10.2 (MIT OR GPL-3.0-or-later,
usada sob a MIT), underscore 1.13.8 (MIT), @xmldom/xmldom 0.8.15 (MIT), base64-js 1.5.1 (MIT), argparse 1.0.10 (MIT),
xmlbuilder 10.1.1 (MIT), lop 0.4.2 e dingbat-to-unicode 1.0.2 (BSD-2-Clause), pako 1.0.11 (MIT e Zlib),
readable-stream 2.3.8 (MIT) e outras pequenas (MIT/ISC).

**Por que o pdf.js 4.10.38 e não uma versão 3.x:** as versões do pdf.js até a 4.1 têm uma falha de segurança conhecida
(CVE-2024-4367: um PDF malicioso pode executar código). A 4.10.38 já corrige isso, e o site ainda liga `isEvalSupported: false`.
Por ser a linha 4.x, o pdf.js é um módulo (`.mjs`): funciona pelo endereço publicado (GitHub Pages) ou Live Server,
mas **não** abrindo o `index.html` direto do disco (`file://`); nesse caso o site avisa e o `.docx` continua funcionando.

## Como atualizar (em uma pasta temporária, nunca dentro do projeto)
```
npm init -y
npm i pdfjs-dist@VERSAO mammoth@VERSAO
npm audit
```
Copie para cá `node_modules/pdfjs-dist/legacy/build/pdf.min.mjs` e `pdf.worker.min.mjs`,
`node_modules/mammoth/mammoth.browser.min.js` e os arquivos `LICENSE` de cada pacote; atualize esta tabela e
teste anexando um PDF e um .docx **fictícios** (nunca um currículo de verdade).
