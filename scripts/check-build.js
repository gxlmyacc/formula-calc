const fs = require('fs');
const path = require('path');
const assert = require('assert');
const babel = require('@babel/core');
const esbuild = require('esbuild');
const ts = require('typescript');
const Module = require('module');
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
      assert.strictEqual(calc('abs(pmt(6% / 12, 360, 1000000))', { precision: 2 }), 5995.51);
      assert.strictEqual(calc('npv(10%, flows)', { params: { flows: [110, 121] } }), 200);
      assert.deepStrictEqual(calc('$1 + (a)', { params: [{ a: 1 }, { a: 2 }] }), [2, 4]);
      assert.strictEqual(await calc('(a) + $1', { params: { a: Promise.resolve(2) } }), 4);
      assert.strictEqual(formulaUtils.toFixed('9007199254740993', { precision: 0 }), '9007199254740993');
    }
    const packageInfo = require('../package.json');
    assert(fs.existsSync(path.join(projectRoot, packageInfo.typings)), 'Missing declaration entry');
    assert(!fs.existsSync(path.join(projectRoot, 'types/src/index.d.ts')), 'Unexpected nested declarations');
    for (const [specifier, directory] of [['formula-calc', 'esm'], ['formula-calc/es', 'es'], ['formula-calc/esm', 'esm']]) {
      assert.strictEqual(require.resolve(specifier), path.join(projectRoot, directory, 'index.js'));
      const declaration = ts.resolveModuleName(specifier, path.join(projectRoot, 'temp/consumer.ts'), {
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        module: ts.ModuleKind.ESNext,
      }, ts.sys).resolvedModule;
      assert.strictEqual(declaration && declaration.resolvedFileName, path.join(projectRoot, 'types/index.d.ts').replace(/\\/g, '/'));
      const bundle = await esbuild.build({
        stdin: { contents: `module.exports = import('${specifier}').then(({ default: calc }) => calc('0.1 + 0.2'));`, resolveDir: projectRoot },
        bundle: true, platform: 'browser', format: 'cjs', write: false, metafile: true,
      });
      assert(Object.keys(bundle.metafile.inputs).includes(`${directory}/index.js`), `Wrong entry for ${specifier}`);
      const consumerFile = path.join(projectRoot, 'temp/consumer.js');
      const consumer = new Module(consumerFile, module);
      consumer._compile(bundle.outputFiles[0].text, consumerFile);
      assert.strictEqual(await consumer.exports, 0.3);
    }
    assert.strictEqual(require.resolve('formula-calc/package.json'), path.join(projectRoot, 'package.json'));
    assert.strictEqual(require.resolve('formula-calc/es/index.js'), path.join(projectRoot, 'es/index.js'));
    console.log(`Both builds and package exports passed; ${polyfills.size} polyfill imports resolved; declaration entries verified.`);
  } finally {
    require.extensions['.js'] = originalLoader;
  }
}

checkBuilds().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
