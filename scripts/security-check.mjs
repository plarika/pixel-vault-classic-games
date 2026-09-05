import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlFiles = ['index.html', 'play.html'];
const requiredCsp = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  'upgrade-insecure-requests'
];

for (const file of htmlFiles) {
  const html = await readFile(join(root, file), 'utf8');
  const csp = html.match(/Content-Security-Policy" content="([^"]+)"/i)?.[1] ?? '';
  if (!csp) throw new Error(`CSP em falta: ${file}`);
  for (const directive of requiredCsp) {
    if (!csp.includes(directive)) throw new Error(`CSP sem ${directive}: ${file}`);
  }
  if (/<script(?![^>]*type="module"[^>]*src=)/i.test(html)) throw new Error(`Script inline/não modular: ${file}`);
}

const playHtml = await readFile(join(root, 'play.html'), 'utf8');
const iframe = playHtml.match(/<iframe[^>]+id="gameFrame"[^>]*>/i)?.[0] ?? '';
for (const token of ['sandbox=', 'allow-scripts', 'allow-same-origin', 'allow-pointer-lock', 'referrerpolicy="no-referrer"']) {
  if (!iframe.includes(token)) throw new Error(`Hardening do iframe em falta: ${token}`);
}
for (const forbidden of ['allow-popups', 'allow-forms', 'allow-top-navigation']) {
  if (iframe.includes(forbidden)) throw new Error(`Permissão excessiva no iframe: ${forbidden}`);
}

async function listJs(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listJs(full));
    else if (entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

const dangerousSinks = [
  /\.innerHTML\s*=/,
  /\.outerHTML\s*=/,
  /insertAdjacentHTML\s*\(/,
  /document\.write\s*\(/,
  /\beval\s*\(/,
  /new\s+Function\s*\(/
];

for (const file of await listJs(join(root, 'assets', 'js'))) {
  const source = await readFile(file, 'utf8');
  for (const pattern of dangerousSinks) {
    if (pattern.test(source)) throw new Error(`Sink perigoso em ${file}: ${pattern}`);
  }
}

for (const workflow of ['ci.yml', 'pages.yml']) {
  const yaml = await readFile(join(root, '.github', 'workflows', workflow), 'utf8');
  for (const match of yaml.matchAll(/uses:\s*([^\s#]+)/g)) {
    if (!/@[0-9a-f]{40}$/i.test(match[1])) {
      throw new Error(`Action não fixada por SHA em ${workflow}: ${match[1]}`);
    }
  }
  if (!/^permissions:/m.test(yaml) || /write-all/i.test(yaml)) {
    throw new Error(`Permissões inseguras em ${workflow}`);
  }
}

console.log('SECURITY_OK: CSP, iframe, JS sinks e supply-chain checks passaram.');
