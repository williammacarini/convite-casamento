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
const numero = js.match(/whatsMimos:\s*'(\d+)'/)[1];
const fecho = js.match(/fecho:\s*'([^']+)'/)[1];
const reais = valor => 'R$ ' + Number(valor).toLocaleString('pt-BR');

function mensagem(nome, valor, sugerido) {
  const valorTexto = Number(valor) === Number(sugerido)
    ? 'no valor sugerido de ' + reais(sugerido)
    : 'no valor de ' + reais(valor);
  return `Oi, noivos! Quero presentear vocês com *${nome}*, ${valorTexto}. ${fecho}`;
}

let html = fs.readFileSync(arquivoHtml, 'utf8');
let total = 0;

html = html.replace(
  /<article class="mimo[^"]*" data-categoria="[^"]*" data-nome="([^"]+)" data-valor="(\d+)"[^>]*>[\s\S]*?<a class="btn btn--mimo" data-wa href="[^"]*"/g,
  (trecho, nome, valor) => {
    total++;
    const link = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(mensagem(nome, valor, valor));
    return trecho.replace(/href="[^"]*"$/, `href="${link.replace(/&/g, '&amp;')}"`);
  }
);

fs.writeFileSync(arquivoHtml, html);
console.log(`${total} links de WhatsApp gravados no HTML (número ${numero}).`);
if (total === 0) {
  console.error('Nenhum mimo encontrado: confira o formato dos cards em presentes/index.html.');
  process.exit(1);
}
