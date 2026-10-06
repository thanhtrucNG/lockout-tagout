// Minimal .xlsx reader (first sheet, strings and numbers) using only node:zlib. Returns rows as arrays of strings.
import fs from 'node:fs';
import zlib from 'node:zlib';

function unzip(buffer) {
  // Central directory -> { name: Buffer }
  let eocd = buffer.length - 22;
  while (eocd >= 0 && buffer.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error('Not a zip file');
  const count = buffer.readUInt16LE(eocd + 10);
  let p = buffer.readUInt32LE(eocd + 16);
  const files = {};
  for (let i = 0; i < count; i++) {
    const method = buffer.readUInt16LE(p + 10), csize = buffer.readUInt32LE(p + 20);
    const nameLen = buffer.readUInt16LE(p + 28), extraLen = buffer.readUInt16LE(p + 30), commentLen = buffer.readUInt16LE(p + 32);
    const offset = buffer.readUInt32LE(p + 42), name = buffer.toString('utf8', p + 46, p + 46 + nameLen);
    const lh = offset + 30 + buffer.readUInt16LE(offset + 26) + buffer.readUInt16LE(offset + 28);
    const raw = buffer.subarray(lh, lh + csize);
    files[name] = method === 0 ? raw : zlib.inflateRawSync(raw);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}
const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, '&');
const colIndex = ref => ref.replace(/\d+/g, '').split('').reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
const textOf = xml => [...xml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(m => decode(m[1])).join('');

export function readXlsx(file, { sheet = 1 } = {}) {
  const files = unzip(fs.readFileSync(file));
  const shared = files['xl/sharedStrings.xml'] ? [...files['xl/sharedStrings.xml'].toString('utf8').matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m => textOf(m[1])) : [];
  const xml = files[`xl/worksheets/sheet${sheet}.xml`].toString('utf8');
  const rows = [];
  for (const row of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = [];
    for (const c of row[1].matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1], body = c[2] ?? '';
      const ref = attrs.match(/r="([A-Z]+\d+)"/)?.[1], type = attrs.match(/t="(\w+)"/)?.[1];
      let value = '';
      if (type === 's') value = shared[Number(body.match(/<v>(\d+)<\/v>/)?.[1])] ?? '';
      else if (type === 'inlineStr') value = textOf(body);
      else value = decode(body.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? '');
      if (ref) cells[colIndex(ref)] = value.replace(/\s+/g, ' ').trim();
    }
    rows.push(Array.from(cells, v => v ?? ''));
  }
  return rows;
}
export const rowsToObjects = rows => { const [h, ...body] = rows; return body.map(r => Object.fromEntries(h.map((k, i) => [k, r[i] ?? '']))); };
