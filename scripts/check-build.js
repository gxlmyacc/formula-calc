const fs = require('fs');
const path = require('path');
const assert = require('assert');
const babel = require('@babel/core');
const getCoreJSModules = require('core-js-compat/get-modules-list-for-target-version');

const projectRoot = path.resolve(__dirname, '..');
const roots = ['esm', 'es'].map((dir) => path.join(projectRoot, dir));
const polyfills = new Set();
const minimumPolyfills = new Set(getCoreJSModules('3.0'));

/**
 * Check emitted polyfills against the core-js 3.0 baseline and installed package.
 * @param {string} dir Build output directory.
 * @returns {void}
 */
function checkPolyfills(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkPolyfills(file);
    } else if (file.endsWith('.js')) {
      const code = fs.readFileSync(file, 'utf8');
      Array.from(code.matchAll(/["'](core-js\/[^"']+)["']/g)).forEach((match) => {
        assert(!match[1].includes('/es6.'), `Legacy polyfill: ${match[1]}`);
        const moduleName = match[1].replace('core-js/modules/', '').replace(/\.js$/, '');
        assert(minimumPolyfills.has(moduleName), `Polyfill requires core-js newer than 3.0: ${match[1]}`);
        require.resolve(match[1]);
        polyfills.add(match[1]);
      });
    }
  });
}

/**
 * Execute both ES module builds in Node, changing only module syntax in memory.
 * @returns {Promise<void>}
 */
async function checkBuilds() {
  roots.forEach(checkPolyfills);
  assert(polyfills.size > 0, 'Expected legacy-browser polyfills');
  const originalLoader = require.extensions['.js'];
  require.extensions['.js'] = (mod, file) => {
    if (roots.some((root) => file.startsWith(root + path.sep))) {
      const result = babel.transformFileSync(file, {
        configFile: false,
        babelrc: false,
        plugins: ['@babel/plugin-transform-modules-commonjs'],
      });
      mod._compile(result.code, file);
    } else {
      originalLoader(mod, file);
    }
  };
  try {
    for (const root of roots) {
      const { default: calc, formulaUtils } = require(path.join(root, 'index.js'));
      assert.strictEqual(calc('0.1 + 0.2'), 0.3);
      assert.strictEqual(calc('sum(1, 2, 3)'), 6);
      assert.deepStrictEqual(calc('$1 + (a)', { params: [{ a: 1 }, { a: 2 }] }), [2, 4]);
      assert.strictEqual(await calc('(a) + $1', { params: { a: Promise.resolve(2) } }), 4);
      assert.strictEqual(formulaUtils.toFixed('9007199254740993', { precision: 0 }), '9007199254740993');
    }
    const packageInfo = require('../package.json');
    assert(fs.existsSync(path.join(projectRoot, packageInfo.typings)), 'Missing declaration entry');
    assert(!fs.existsSync(path.join(projectRoot, 'types/src/index.d.ts')), 'Unexpected nested declarations');
    console.log(`Both builds passed; ${polyfills.size} polyfill imports resolved; declaration entry verified.`);
  } finally {
    require.extensions['.js'] = originalLoader;
  }
}

checkBuilds().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
