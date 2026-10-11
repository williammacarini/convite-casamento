#!/usr/bin/env node
/*
 * Gerador de QR Code em SVG, sem dependências externas.
 *
 * Uso:
 *   node ferramentas/gerar-qrcode.mjs --url "https://exemplo/pagina/" --out presentes/assets/qr-mimos.svg
 *
 * Opções:
 *   --url    conteúdo do QR Code (obrigatório)
 *   --out    arquivo .svg de saída (obrigatório)
 *   --ecc    nível de correção: L (7%) ou M (15%) — padrão M
 *   --dark   cor dos módulos (padrão #254a3c, o verde do convite)
 *   --light  cor do fundo (padrão #fffaf1, o papel do convite)
 *   --label  texto alternativo da imagem
 *
 * Modo byte, versões 1 a 10, com escolha automática da menor versão que couber.
 */
import fs from 'node:fs';
import path from 'node:path';

const ALIGNMENT = [
  [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
  [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]
];
const ECC_PER_BLOCK = {
  L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18],
  M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26]
};
const ECC_BLOCKS = {
  L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4],
  M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5]
};
const ECC_FORMAT_BITS = { L: 1, M: 0, Q: 3, H: 2 };

function rawDataModules(version) {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const align = Math.floor(version / 7) + 2;
    result -= (25 * align - 10) * align - 55;
    if (version >= 7) result -= 36;
  }
  return result;
}
const rawCodewords = version => Math.floor(rawDataModules(version) / 8);
const dataCodewords = (version, ecc) => rawCodewords(version) - ECC_PER_BLOCK[ecc][version] * ECC_BLOCKS[ecc][version];

/* ---------- Galois Field 256 (polinômio primitivo 0x11D) ---------- */
function multiply(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}
function divisor(degree) {
  const result = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = multiply(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = multiply(root, 0x02);
  }
  return result;
}
function remainder(data, div) {
  const result = div.map(() => 0);
  for (const byte of data) {
    const factor = byte ^ result.shift();
    result.push(0);
    div.forEach((coef, i) => { result[i] ^= multiply(coef, factor); });
  }
  return result;
}

/* ---------- Codewords finais, com blocos e intercalação ---------- */
function addEccAndInterleave(data, version, ecc) {
  const numBlocks = ECC_BLOCKS[ecc][version];
  const blockEccLen = ECC_PER_BLOCK[ecc][version];
  const raw = rawCodewords(version);
  const numShortBlocks = numBlocks - (raw % numBlocks);
  const shortBlockLen = Math.floor(raw / numBlocks);
  const div = divisor(blockEccLen);

  const blocks = [];
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
    k += dat.length;
    const ecc_cw = remainder(dat, div);
    if (i < numShortBlocks) dat.push(0);
    blocks.push(dat.concat(ecc_cw));
  }
  const result = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i]);
    });
  }
  return result;
}

/* ---------- Matriz ---------- */
function buildMatrix(version, ecc, dataCodewordBytes) {
  const size = version * 4 + 17;
  const modules = Array.from({ length: size }, () => new Array(size).fill(false));
  const isFunction = Array.from({ length: size }, () => new Array(size).fill(false));

  const setFunction = (x, y, dark) => { modules[y][x] = dark; isFunction[y][x] = true; };

  // Marcadores de posição e separadores
  for (const [dx, dy] of [[0, 0], [size - 7, 0], [0, size - 7]]) {
    for (let y = -1; y <= 7; y++) {
      for (let x = -1; x <= 7; x++) {
        const xx = dx + x, yy = dy + y;
        if (xx < 0 || xx >= size || yy < 0 || yy >= size) continue;
        const dark = (x >= 0 && x <= 6 && (y === 0 || y === 6)) ||
          (y >= 0 && y <= 6 && (x === 0 || x === 6)) ||
          (x >= 2 && x <= 4 && y >= 2 && y <= 4);
        setFunction(xx, yy, dark);
      }
    }
  }
  // Faixas de sincronismo
  for (let i = 8; i < size - 8; i++) {
    setFunction(6, i, i % 2 === 0);
    setFunction(i, 6, i % 2 === 0);
  }
  // Padrões de alinhamento
  const positions = ALIGNMENT[version - 1];
  for (let i = 0; i < positions.length; i++) {
    for (let j = 0; j < positions.length; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === positions.length - 1) || (i === positions.length - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const dark = Math.max(Math.abs(dx), Math.abs(dy)) !== 1;
          setFunction(positions[j] + dx, positions[i] + dy, dark);
        }
      }
    }
  }
  // Informação de versão (obrigatória a partir da versão 7)
  if (version >= 7) {
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const dark = ((bits >>> i) & 1) !== 0;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunction(a, b, dark);
      setFunction(b, a, dark);
    }
  }
  // Reserva da informação de formato
  for (let i = 0; i <= 8; i++) {
    if (!isFunction[i][8]) setFunction(8, i, false);
    if (!isFunction[8][i]) setFunction(i, 8, false);
  }
  for (let i = 0; i < 8; i++) {
    if (!isFunction[size - 1 - i][8]) setFunction(8, size - 1 - i, false);
    if (!isFunction[8][size - 1 - i]) setFunction(size - 1 - i, 8, false);
  }
  setFunction(8, size - 8, true); // módulo sempre escuro

  // Dados em ziguezague
  const bits = [];
  dataCodewordBytes.forEach(byte => {
    for (let i = 7; i >= 0; i--) bits.push(((byte >>> i) & 1) !== 0);
  });
  let index = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x] && index < bits.length) {
          modules[y][x] = bits[index];
          index++;
        }
      }
    }
  }

  // Máscara: escolhe a de menor penalidade
  let bestMask = -1, bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(modules, isFunction, mask);
    drawFormat(modules, ecc, mask, size);
    const penalty = penaltyScore(modules, size);
    if (penalty < bestPenalty) { bestPenalty = penalty; bestMask = mask; }
    applyMask(modules, isFunction, mask); // desfaz (XOR é inverso)
  }
  applyMask(modules, isFunction, bestMask);
  drawFormat(modules, ecc, bestMask, size);
  return { modules, size, mask: bestMask };
}
function maskBit(mask, x, y) {
  switch (mask) {
    case 0: return (x + y) % 2 === 0;
    case 1: return y % 2 === 0;
    case 2: return x % 3 === 0;
    case 3: return (x + y) % 3 === 0;
    case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5: return (x * y) % 2 + (x * y) % 3 === 0;
    case 6: return ((x * y) % 2 + (x * y) % 3) % 2 === 0;
    default: return ((x + y) % 2 + (x * y) % 3) % 2 === 0;
  }
}
function applyMask(modules, isFunction, mask) {
  for (let y = 0; y < modules.length; y++) {
    for (let x = 0; x < modules.length; x++) {
      if (!isFunction[y][x] && maskBit(mask, x, y)) modules[y][x] = !modules[y][x];
    }
  }
}
function drawFormat(modules, ecc, mask, size) {
  const data = (ECC_FORMAT_BITS[ecc] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  const bit = i => ((bits >>> i) & 1) !== 0;
  for (let i = 0; i <= 5; i++) modules[i][8] = bit(i);
  modules[7][8] = bit(6);
  modules[8][8] = bit(7);
  modules[8][7] = bit(8);
  for (let i = 9; i < 15; i++) modules[8][14 - i] = bit(i);
  for (let i = 0; i < 8; i++) modules[8][size - 1 - i] = bit(i);
  for (let i = 8; i < 15; i++) modules[size - 15 + i][8] = bit(i);
  modules[size - 8][8] = true;
}
function penaltyScore(modules, size) {
  let score = 0;
  // Regra 1: sequências de cinco ou mais módulos iguais
  for (let y = 0; y < size; y++) {
    let runColor = false, runLen = 0;
    for (let x = 0; x < size; x++) {
      if (modules[y][x] === runColor) {
        runLen++;
        if (runLen === 5) score += 3;
        else if (runLen > 5) score++;
      } else { runColor = modules[y][x]; runLen = 1; }
    }
  }
  for (let x = 0; x < size; x++) {
    let runColor = false, runLen = 0;
    for (let y = 0; y < size; y++) {
      if (modules[y][x] === runColor) {
        runLen++;
        if (runLen === 5) score += 3;
        else if (runLen > 5) score++;
      } else { runColor = modules[y][x]; runLen = 1; }
    }
  }
  // Regra 2: blocos 2x2 da mesma cor
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const c = modules[y][x];
      if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) score += 3;
    }
  }
  // Regra 3: padrão 1:1:3:1:1 com quatro módulos claros de um lado
  const pattern = [true, false, true, true, true, false, true];
  const hasPattern = (get, len, start) => {
    for (let i = 0; i < 7; i++) if (get(start + i) !== pattern[i]) return false;
    let before = true, after = true;
    for (let i = 1; i <= 4; i++) { if (start - i < 0) break; if (get(start - i)) { before = false; break; } }
    for (let i = 7; i < 11; i++) { if (start + i >= len) break; if (get(start + i)) { after = false; break; } }
    return before || after;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x <= size - 7; x++) if (hasPattern(i => modules[y][i], size, x)) score += 40;
  }
  for (let x = 0; x < size; x++) {
    for (let y = 0; y <= size - 7; y++) if (hasPattern(i => modules[i][x], size, y)) score += 40;
  }
  // Regra 4: proporção de módulos escuros
  let dark = 0;
  modules.forEach(row => row.forEach(cell => { if (cell) dark++; }));
  const total = size * size;
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  score += k * 10;
  return score;
}

/* ---------- Codificação dos dados ---------- */
function encodeText(text, ecc) {
  const bytes = Array.from(Buffer.from(text, 'utf8'));
  let version = 0;
  for (let v = 1; v <= 10; v++) {
    const capacityBits = dataCodewords(v, ecc) * 8;
    const neededBits = 4 + (v <= 9 ? 8 : 16) + bytes.length * 8;
    if (neededBits <= capacityBits) { version = v; break; }
  }
  if (!version) throw new Error('Conteúdo grande demais: use uma URL mais curta (até ~270 caracteres).');

  const bits = [];
  const push = (value, length) => { for (let i = length - 1; i >= 0; i--) bits.push(((value >>> i) & 1) !== 0); };
  push(0b0100, 4);                                  // modo byte
  push(bytes.length, version <= 9 ? 8 : 16);        // contador de caracteres
  bytes.forEach(byte => push(byte, 8));
  const capacity = dataCodewords(version, ecc) * 8;
  push(0, Math.min(4, capacity - bits.length));     // terminador
  while (bits.length % 8 !== 0) bits.push(false);   // alinhamento
  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j++) value = (value << 1) | (bits[i + j] ? 1 : 0);
    codewords.push(value);
  }
  for (let pad = 0xec; codewords.length < dataCodewords(version, ecc); pad ^= 0xec ^ 0x11) codewords.push(pad);
  return { version, codewords };
}

/* ---------- SVG ---------- */
function toSvg(modules, size, options) {
  const quiet = 4;
  const d = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules[y][x]) d.push(`M${x + quiet} ${y + quiet}h1v1h-1z`);
    }
  }
  const dimension = size + quiet * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dimension} ${dimension}" width="${dimension}" height="${dimension}" role="img" aria-label="${options.label}">\n` +
    `  <rect width="${dimension}" height="${dimension}" fill="${options.light}"/>\n` +
    `  <path d="${d.join('')}" fill="${options.dark}"/>\n` +
    `</svg>\n`;
}

/* ---------- CLI ---------- */
const args = process.argv.slice(2);
const option = name => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
};
const url = option('url');
const out = option('out');
const ecc = (option('ecc') || 'M').toUpperCase();
if (!url || !out) {
  console.error('Uso: node ferramentas/gerar-qrcode.mjs --url "https://..." --out caminho/qr.svg [--ecc M] [--dark #254a3c] [--light #fffaf1] [--label "texto"]');
  process.exit(1);
}
if (!ECC_PER_BLOCK[ecc]) {
  console.error('Nível de correção inválido: use L ou M.');
  process.exit(1);
}
const { version, codewords } = encodeText(url, ecc);
const finalCodewords = addEccAndInterleave(codewords, version, ecc);
const { modules, size, mask } = buildMatrix(version, ecc, finalCodewords);
const svg = toSvg(modules, size, {
  dark: option('dark') || '#254a3c',
  light: option('light') || '#fffaf1',
  label: option('label') || 'QR Code'
});
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, svg);
console.log(`QR Code gerado: ${out}`);
console.log(`  conteúdo : ${url}`);
console.log(`  versão   : ${version} (${size}×${size} módulos), correção ${ecc}, máscara ${mask}`);
console.log(`  arquivo  : ${(svg.length / 1024).toFixed(1)} KB de SVG`);
