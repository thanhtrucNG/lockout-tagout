// Lists every t('…') string in src/ that has no Vietnamese entry in src/lib/locale.js.
// Usage: node scripts/check-translations.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const locale = fs.readFileSync(path.join(root, 'src/lib/locale.js'), 'utf8');
const dictionary = locale.slice(locale.indexOf('const vi = {'), locale.indexOf('\n};') + 3);
const vi = new Function(`${dictionary}; return vi;`)();

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.js')) files.push(full);
  }
})(path.join(root, 'src'));

const missing = [];
for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  for (const match of code.matchAll(/\bt\('((?:[^'\\]|\\.)+)'\)/g)) {
    const key = match[1].replace(/\\'/g, "'");
    if (/[a-z]/i.test(key) && !(key in vi)) missing.push(`${path.relative(root, file)}: ${key}`);
  }
}
console.log(missing.length ? missing.join('\n') : 'Every t() string has a Vietnamese entry.');
process.exitCode = missing.length ? 1 : 0;
