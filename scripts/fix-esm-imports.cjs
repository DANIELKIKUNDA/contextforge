// Fixe les imports ESM locaux (./ ou ../) en ajoutant .js
// Exécuté avec Node.js CommonJS (pas de "type": "module")
const fs = require('node:fs');
const path = require('node:path');

function walkDir(dir, exts = ['.ts', '.tsx']) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (
      e.isDirectory() &&
      !e.name.startsWith('.') &&
      e.name !== 'node_modules' &&
      e.name !== 'dist'
    ) {
      results.push(...walkDir(full, exts));
    } else if (e.isFile() && exts.includes(path.extname(e.name))) {
      results.push(full);
    }
  }
  return results;
}

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Regex: from '...' or from "..." — local imports only (./ ou ../)
  // Ne touche pas les imports de packages (ex: '@contextforge/...') ou les node:*
  const regex = /from\s+(['"])(\.\.?\/[^'"]+)(['"])/g;
  content = content.replace(regex, (match, q1, importPath, q2) => {
    // Ne pas ajouter .js si déjà présent ou si c'est un .json/.css/etc
    if (
      importPath.endsWith('.js') ||
      importPath.endsWith('.json') ||
      importPath.endsWith('.css') ||
      importPath.endsWith('.mjs') ||
      importPath.endsWith('.cjs')
    ) {
      return match;
    }
    modified = true;
    return `from ${q1}${importPath}.js${q2}`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', filePath);
  }
}

const roots = ['packages', 'apps'];
for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  const files = walkDir(root);
  for (const f of files) {
    fixImports(f);
  }
}
console.log('Done.');
