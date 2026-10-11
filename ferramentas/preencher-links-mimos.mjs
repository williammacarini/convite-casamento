#!/usr/bin/env node
/*
 * Preenche os links de WhatsApp dos mimos direto no HTML, para a página
 * funcionar mesmo sem JavaScript. Lê o número e o fecho do CONFIG em presentes/script.js.
 *
 * Uso: node ferramentas/preencher-links-mimos.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const arquivoHtml = path.join(raiz, 'presentes/index.html');
const arquivoJs = path.join(raiz, 'presentes/script.js');

const js = fs.readFileSync(arquivoJs, 'utf8');
const numeroWilliam = js.match(/whatsMimos:\s*'(\d+)'/)[1];
const numeroCamila = js.match(/whatsAlternativo:\s*'(\d+)'/)[1];
const numeros = { william: numeroWilliam, camila: numeroCamila };
const fecho = js.match(/fecho:\s*'([^']+)'/)[1];
const reais = valor => 'R$ ' + Number(valor).toLocaleString('pt-BR');

function mensagem(nome, valor, sugerido) {
  const valorTexto = Number(valor) === Number(sugerido)
    ? 'no valor sugerido de ' + reais(sugerido)
    : 'no valor de ' + reais(valor);
  return `Oi, noivos! Quero presentear vocês com *${nome}*, ${valorTexto}. ${fecho}`;
}

let html = fs.readFileSync(arquivoHtml, 'utf8');
let cartoes = 0;
let links = 0;

html = html.replace(
  /<article class="mimo[^"]*" data-categoria="[^"]*" data-nome="([^"]+)" data-valor="(\d+)"[\s\S]*?<\/article>/g,
  (bloco, nome, valor) => {
    cartoes++;
    return bloco.replace(
      /(<a class="btn btn--mimo[^"]*" data-wa data-destino="(william|camila)" href=")[^"]*(")/g,
      (trecho, inicio, destino, fim) => {
        links++;
        const url = 'https://wa.me/' + numeros[destino] + '?text=' + encodeURIComponent(mensagem(nome, valor, valor));
        return inicio + url.replace(/&/g, '&amp;') + fim;
      }
    );
  }
);

fs.writeFileSync(arquivoHtml, html);
console.log(`${links} links gravados em ${cartoes} mimos (William ${numeroWilliam}, Camila ${numeroCamila}).`);
if (cartoes === 0 || links !== cartoes * 2) {
  console.error('Esperava dois links por mimo: confira os cards em presentes/index.html.');
  process.exit(1);
}
