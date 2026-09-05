import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const portArg = Number(process.argv[2] ?? 4173);
const port = Number.isInteger(portArg) && portArg >= 1024 && portArg <= 65535 ? portArg : 4173;
const types = new Map([['.html','text/html; charset=utf-8'],['.css','text/css; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.webmanifest','application/manifest+json; charset=utf-8'],['.json','application/json; charset=utf-8'],['.png','image/png'],['.svg','image/svg+xml']]);

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const decoded = decodeURIComponent(url.pathname);
    const safe = normalize(decoded).replace(/^([/\\])+/, '');
    const candidate = resolve(root, safe || 'index.html');
    if (candidate !== root && !candidate.startsWith(root + sep)) throw new Error('Caminho inválido');
    let target = candidate;
    const info = await stat(target).catch(() => null);
    if (info?.isDirectory()) target = join(target, 'index.html');
    const body = await readFile(target);
    res.writeHead(200, {
      'Content-Type': types.get(extname(target)) ?? 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-cache'
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
    res.end('404 — ficheiro não encontrado');
  }
}).listen(port, '127.0.0.1', () => console.log(`Pixel Vault: http://127.0.0.1:${port}`));
