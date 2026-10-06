/** @file Verify legacy entrypoints, ES2015 syntax and project-relative assets in the Pages output. */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const acorn = require('acorn');

const directory = path.resolve(__dirname, '../dist-website');
const html = fs.readFileSync(path.join(directory, 'index.html'), 'utf8');
assert(html.includes('vite-legacy-entry') && html.includes('vite-legacy-polyfill'), 'Legacy entrypoint and polyfills are required');
const assets = fs.readdirSync(path.join(directory, 'assets'));
const legacy = assets.filter((file) => file.endsWith('.js') && file.includes('-legacy'));
assert(legacy.length >= 2, 'Expected a legacy application and polyfill bundle');
legacy.forEach((file) => {
  // Chrome 49 allows some ES2015 syntax; Babel targets Chrome 49 for browser-specific transforms.
  // Parsing at this level rejects later syntax such as async/await, optional chaining and object spread.
  acorn.parse(fs.readFileSync(path.join(directory, 'assets', file), 'utf8'), { ecmaVersion: 2015 });
});
const references = Array.from(html.matchAll(/(?:src|href|data-src)="(\/[^" ]+)"/g), (match) => match[1]);
assert(references.length > 0);
references.forEach((url) => {
  assert(url.startsWith('/formula-calc/'), `Unexpected asset base: ${url}`);
  assert(fs.existsSync(path.join(directory, url.slice('/formula-calc/'.length))), `Missing asset: ${url}`);
});
const css = assets.filter((file) => file.endsWith('.css')).map((file) => fs.readFileSync(path.join(directory, 'assets', file), 'utf8')).join('\n');
assert(/\.fc-/.test(css), 'Scoped component styles were not generated');
assert(!/var\(--|display\s*:\s*grid|\bgap\s*:/.test(css), 'CSS uses unsupported Chrome 49 layout features');
console.log(`Pages assets verified; ${legacy.length} legacy bundles parse as ES2015, scoped CSS is present.`);
