import {
  activePairAt, analyze, calculate, completionAt, DEFAULT_WORKSPACE, EXAMPLES, getFunctions, lookup, nodeRange, optionsFor, parameterCandidates,
  parseDraft, parseParams, restoreWorkspace, signatureAt, snapshot, traceCalculation, traceContext, traceConversions,
} from '../src/model';
import type { Workspace } from '../src/model';
import { preferredLocale, translate } from '../src/i18n';
import { getApiEntries, searchApi } from '../src/api';

const workspace = (overrides: Partial<Workspace> = {}): Workspace => ({ ...DEFAULT_WORKSPACE, ...overrides });

test('execution steps show substitutions and exact conversion chains without reevaluating lazy branches', async () => {
  const settings = { ...DEFAULT_WORKSPACE.settings, nullAsZero: true, step: 'custom' as const, stepPlaces: '1' };
  const state = workspace({ expression: 'sum(a, b) + round(c, 1)', mode: 'json', json: '{"a":null,"b":2,"c":2.01}', settings });
  const traces = (await calculate(state))[0].traces;
  expect(traces.find((trace) => trace.expression === 'a')?.conversions).toEqual(['null', '0']);
  expect(traces.find((trace) => trace.expression === 'sum(a, b)')).toMatchObject({ calculation: 'sum(0, 2)', value: '2' });
  expect(traces.find((trace) => trace.expression === 'round(c, 1)')).toMatchObject({
    calculation: 'round(2.01, 1)', conversions: ['2.01', '2.0'],
  });
  expect(traces[traces.length - 1].calculation).toBe('2 + 2');
  const batch = await calculate(workspace({ expression: 'a + b', mode: 'json', json: '[{"a":1,"b":2},{"a":10,"b":20}]' }));
  expect(batch.map((row) => row.traces[row.traces.length - 1].calculation)).toEqual(['1 + 2', '10 + 20']);
  const stepped = await calculate(workspace({ expression: 'a * 1', settings, mode: 'json', json: '{"a":2.01}' }));
  expect(stepped[0].traces[2]).toMatchObject({ calculation: '2.01 * 1', conversions: ['2.01', '2.0'] });
  const drafts = { missing: { type: 'number' as const, text: '99' } };
  const lazy = await calculate(workspace({ expression: 'if(true, 1, missing)', drafts }));
  expect(lazy[0].traces.some((trace) => trace.expression === 'missing')).toBe(false);
  expect(lazy[0].traces[lazy[0].traces.length - 1].calculation).toBe('if(true, 1, …)');
  const ternary = await calculate(workspace({ expression: 'true ? 1 : missing', drafts }));
  expect(ternary[0].traces[ternary[0].traces.length - 1].calculation).toBe('true ? 1 : …');
  const negative = await calculate(workspace({ expression: '1 - -2' }));
  expect(negative[0].traces[2].calculation).toBe('1 - (-2)');
  const percent = await calculate(workspace({ expression: '2.01%', settings }));
  expect(percent[0].traces[1]).toMatchObject({ calculation: '2.01%', conversions: ['0.0201', '0.020'] });
  const not = await calculate(workspace({ expression: '!true' }));
  expect(not[0].traces[1].calculation).toBe('!true');
  const final = await calculate(workspace({
    expression: 'a + b',
    mode: 'json',
    json: '{"a":1,"b":1.01}',
    settings: { ...DEFAULT_WORKSPACE.settings, precision: '1' }
  }));
  expect(final[0].traces[2]).toMatchObject({ calculation: '1 + 1.01', value: '2.01' });
  expect(final[0].traces[3]).toMatchObject({ finalPrecision: true, conversions: ['2.01', '2.0'], value: '2' });
  const noChange = await calculate(workspace({ expression: '2', settings: { ...DEFAULT_WORKSPACE.settings, precision: '1' } }));
  expect(noChange[0].traces).toHaveLength(1);
  expect(traceConversions()).toBeUndefined();
  expect(traceCalculation(analyze('a').formula.formulas[0], new Map())).toBeUndefined();
});

test('financial functions expose individual completion, argument help, API descriptions and working examples', async () => {
  const names = ['fv', 'pv', 'pmt', 'nper', 'ipmt', 'ppmt', 'npv'];
  const definitions = getFunctions('en').filter((entry) => names.includes(entry.name));
  expect(definitions).toHaveLength(7);
  expect(definitions.every((entry) => !/[\u4e00-\u9fff]/.test(entry.description))).toBe(true);
  expect(completionAt('pm', 2, [], 0).entries.map((entry) => entry.text)).toEqual(['pmt()']);
  expect(signatureAt('ipmt(0.01, 2, ', 14)).toMatchObject({ name: 'ipmt', argument: 2, argMin: 4, argMax: 6 });
  expect(signatureAt('pv(0.01, 12, 100, 0, ', 21)?.args).toEqual(['rate', 'nper', 'pmt', 'fv?', 'type?']);
  expect(searchApi(getApiEntries('functions', 'zh'), '金融').map((entry) => entry.name)).toEqual(names);
  expect(searchApi(getApiEntries('functions', 'en'), 'financial').map((entry) => entry.name)).toEqual(names);
  for (const [name, expected] of [['贷款月供', '5995.51'], ['投资净现值', '1307.2877535687453043']]) {
    const example = EXAMPLES.find((entry) => entry.name === name)!;
    const rows = await calculate(workspace({ expression: example.expression, json: example.json, mode: 'json' }));
    if (name === '贷款月供') {
      expect(rows[0].value).toBe(expected);
    } else {
      expect(Number(rows[0].value)).toBeCloseTo(1307.2877535687453, 10);
    }
    expect(rows[0].traces.some((trace) => trace.expression.includes(name === '贷款月供' ? 'pmt(' : 'npv('))).toBe(true);
  }
});

test('null as zero allows missing, nested, blank and disabled parameters in form and batch modes', async () => {
  const settings = { ...DEFAULT_WORKSPACE.settings, nullAsZero: true };
  const state = workspace({ settings, expression: 'a.b + c + 1', mode: 'json', json: '[{}, {"a":{},"c":2}, {"a":{"b":3},"c":4}]' });
  expect((await calculate(state)).map((row) => row.value)).toEqual(['1', '3', '8']);
  expect((await calculate({ ...state, enabled: { c: false } })).map((row) => row.value)).toEqual(['1', '1', '4']);
  expect((await calculate(workspace({ settings, expression: 'a + b + 1', drafts: { a: { type: 'number', text: '  ' } } })))[0].value).toBe('1');
  const disabled = workspace({ settings, expression: 'a + 1', enabled: { a: false }, drafts: { a: { type: 'number', text: '99' } } });
  expect((await calculate(disabled))[0].value).toBe('1');
  const invalid = await calculate(workspace({ settings, expression: 'a + 1', drafts: { a: { type: 'number', text: 'bad' } } }));
  expect(invalid[0]).toMatchObject({ waiting: true });
  expect(invalid[0].value).toBeUndefined();
  const dynamic = workspace({ expression: 'eval("missing + 1")', mode: 'json', json: '{}' });
  expect((await calculate(dynamic))[0].error).toContain('require param');
  expect((await calculate({ ...dynamic, settings }))[0].value).toBe('1');
});

test('trace context highlights the correct occurrence in the full original formula', async () => {
  const expression = '\n (a + a) * 2 \n';
  const rows = await calculate(workspace({ expression, drafts: { a: { type: 'number', text: '3' } } }));
  const occurrences = rows[0].traces.filter((trace) => trace.expression === 'a');
  expect(occurrences).toHaveLength(2);
  expect(occurrences[0].from).not.toBe(occurrences[1].from);
  rows[0].traces.forEach((trace) => {
    const context = traceContext(expression, trace);
    expect(context.before + context.active + context.after).toBe(expression);
    expect(context.active).toBe(trace.expression);
  });
  const dynamic = 'eval("1 + 2") + 1';
  const nested = await calculate(workspace({ expression: dynamic }));
  expect(nested[0].value).toBe('4');
  const internal = nested[0].traces.filter((trace) => !trace.inFormula);
  expect(internal.length).toBeGreaterThan(0);
  internal.forEach((trace) => expect(traceContext(dynamic, trace)).toEqual({ before: dynamic, active: '', after: '' }));
});

test('API catalog covers the function registry and supports localized category and description searches', () => {
  const functions = getApiEntries('functions', 'zh');
  expect(functions.map((entry) => entry.name)).toEqual(getFunctions().map((entry) => entry.name));
  expect(functions.every((entry) => !entry.description.includes('数值函数或类型转换'))).toBe(true);
  expect(searchApi(functions, '平方根').map((entry) => entry.name)).toEqual(expect.arrayContaining(['sqrt', 'hypot']));
  expect(searchApi(getApiEntries('functions', 'en'), 'ROUND').map((entry) => entry.name)).toContain('round');
  expect(searchApi(functions, '三角 正弦').map((entry) => entry.name)).toContain('sin');
  expect(searchApi(functions, 'not-a-real-api')).toEqual([]);
  expect(searchApi(functions, '   ')).toHaveLength(functions.length);
  const operators = getApiEntries('operators', 'en');
  expect(searchApi(operators, '>=').map((entry) => entry.name)).toEqual(['>=']);
  expect(searchApi(operators, 'percentage').map((entry) => entry.signature)).toContain('value%');
  expect(searchApi(operators, '//')[0].description).toContain('truncate');
  expect(searchApi(operators, 'logical and')[0].name).toBe('& / &&');
});

test('the innermost containing parentheses are active, including function calls and multiline formulas', () => {
  const expression = 'max((a +\n (b * 2)), 0) + $1 + $9';
  const model = analyze(expression);
  const rangeText = (cursor: number) => {
    const pair = activePairAt(model, cursor);
    return pair && expression.slice(pair.from, pair.to);
  };
  expect(rangeText(expression.indexOf('b'))).toBe('(b * 2)');
  expect(rangeText(expression.indexOf('a +'))).toBe('(a +\n (b * 2))');
  expect(rangeText(expression.indexOf('0'))).toBe('((a +\n (b * 2)), 0)');
  expect(rangeText(expression.indexOf('(b'))).toBe('(b * 2)');
  expect(rangeText(expression.indexOf(')),') + 1)).toBe('(a +\n (b * 2))');
  expect(rangeText(expression.indexOf('$1') + 1)).toBe('(a +\n (b * 2))');
  expect(rangeText(expression.indexOf('$9') + 1)).toBeUndefined();
  expect(rangeText(0)).toBeUndefined();
  const text = '("(string)")';
  expect(activePairAt(analyze(text), text.indexOf('string'))?.from).toBe(0);
  expect(activePairAt(analyze('(a)'), 3)?.from).toBe(0);
  expect(activePairAt(analyze('(a +'), 2)).toBeUndefined();
});

test('language selection, interpolation and English function help preserve user data', async () => {
  expect(preferredLocale(null, 'zh-CN')).toBe('zh');
  expect(preferredLocale(null, 'en-US')).toBe('en');
  expect(preferredLocale('zh', 'en-US')).toBe('zh');
  expect(preferredLocale('invalid', 'zh-TW')).toBe('zh');
  expect(translate('en', '缺少 {name}', { name: '金额' })).toBe('Missing 金额');
  expect(translate('zh', '缺少 {name}', { name: 'amount' })).toBe('缺少 amount');
  expect(translate('en', 'constructor')).toBe('constructor');
  expect(translate('en', '未知 {value}')).toBe('未知 {value}');
  expect(signatureAt('round(', 6, 'en')?.description).toBe('Round to the specified decimal places');
  expect(completionAt('$', 1, [], 1, 'en').entries[0].label).toBe('$1 · Parenthesis reference');
  expect(completionAt('a', 1, [{ name: 'a', partial: true }], 0, 'en').entries.find((entry) => entry.name === 'a')?.label)
    .toBe('a · Missing in some rows');
  expect(getFunctions('en').every((entry) => !/[\u4e00-\u9fff]/.test(entry.description))).toBe(true);
  expect(() => parseParams('1', 'en')).toThrow('Parameter JSON must be an object');
  expect(() => parseDraft({ type: 'number', text: '' }, 'en')).toThrow('Enter a value');
  expect(() => optionsFor({ ...DEFAULT_WORKSPACE.settings, precision: '-1' }, 'en')).toThrow('Precision must be an integer');
  const state = workspace({ mode: 'json', expression: '(amount) + $1', json: '[{"amount":2},{}]' });
  const rows = await calculate(state, 'en');
  expect(rows[0].value).toBe('4');
  expect(rows[0].traces[0].expression).toBe('amount');
  expect(rows[1].error).toBe('Missing amount');
  expect((await calculate({ ...state, enabled: { amount: false } }, 'en'))[0].error).toBe('amount is disabled');
});

test('parameters are deduplicated while names and valid reference indices match the parser', () => {
  const model = analyze("max((a.b), ('带 空格')) + a.b + $1");
  expect(model.error).toBe('');
  expect(model.names).toEqual(['a.b', '带 空格']);
  expect(model.pairs.filter((pair) => pair.ref).map((pair) => pair.ref)).toEqual([1, 2]);
  expect(model.pairs.find((pair) => !pair.ref)?.depth).toBe(0);
  expect(analyze('("( $1 )")').formula.refs).toHaveLength(1);
  expect(analyze('(a +').pairs.some((pair) => pair.ref)).toBe(false);
  expect(analyze('a +').error).not.toBe('');
});

test('reference preview ranges preserve nested formulas, spaces and blank lines', () => {
  const expression = '$1 + $2 + max((  a +\r\n\r\n (b * 2)  ), 0) + $9';
  const model = analyze(expression);
  expect(model.error).toBe('');
  const referenced = model.pairs.filter((pair) => pair.ref).sort((a, b) => a.ref! - b.ref!);
  expect(referenced.map((pair) => expression.slice(pair.from, pair.to)))
    .toEqual(['(  a +\r\n\r\n (b * 2)  )', '(b * 2)']);
  expect(model.pairs.some((pair) => pair.ref === 9)).toBe(false);
  expect(analyze('(a +').pairs.some((pair) => pair.ref)).toBe(false);
});

test('JSON accepts objects or arrays of objects, with arrays inside objects preserved', () => {
  expect(parseParams('{"values":[1,2]}')).toEqual([{ values: [1, 2] }]);
  expect(parseParams('[{"a":1},{"a":2}]')).toHaveLength(2);
  expect(parseParams('[]')).toEqual([]);
  ['null', '1', 'true', '[1]', '[[]]', '[null]', '{'].forEach((value) => expect(() => parseParams(value)).toThrow());
  expect(lookup({ a: { b: null } }, 'a.b')).toEqual({ found: true, value: null });
  expect(lookup({ a: {} }, 'a.b').found).toBe(false);
});

test('form types preserve raw numbers, strings, booleans, null and JSON data', () => {
  expect(String(parseDraft({ type: 'number', text: '123456789.123456789' }))).toBe('123456789.123456789');
  expect(parseDraft({ type: 'string', text: '' })).toBe('');
  expect(parseDraft({ type: 'boolean', text: 'false' })).toBe(false);
  expect(parseDraft({ type: 'boolean', text: 'true' })).toBe(true);
  expect(parseDraft({ type: 'null', text: '' })).toBeNull();
  expect(parseDraft({ type: 'json', text: '[1,2]' })).toEqual([1, 2]);
  ['Infinity', 'NaN', '', 'bad'].forEach((text) => expect(() => parseDraft({ type: 'number', text })).toThrow());
  expect(() => parseDraft({ type: 'json', text: '1' })).toThrow();
});

test('precision blank, zero and flags are passed to the library independently', () => {
  expect(optionsFor(DEFAULT_WORKSPACE.settings).precision).toBeUndefined();
  expect(optionsFor({ ...DEFAULT_WORKSPACE.settings, precision: '0', step: 'custom', stepPlaces: '0' }))
    .toMatchObject({ precision: 0, stepPrecision: 0, ignoreRoundingParams: true, ignoreRoundingOriginalValue: true });
  expect(optionsFor({ ...DEFAULT_WORKSPACE.settings, step: 'precision' }).stepPrecision).toBe(true);
  ['-1', '1.5', '101', 'x'].forEach((precision) => expect(() => optionsFor({ ...DEFAULT_WORKSPACE.settings, precision })).toThrow());
});

test('form calculation preserves path names, clears disabled values and waits for missing input', async () => {
  const state = workspace({
    expression: "'带 空格' + a.b",
    drafts: {
      '带 空格': { type: 'number', text: '1.234' }, 'a.b': { type: 'number', text: '2' },
    },
  });
  expect((await calculate(state))[0].value).toBe('3.234');
  expect((await calculate({ ...state, enabled: { 'a.b': false } }))[0]).toMatchObject({ waiting: true, traces: [] });
  expect((await calculate({ ...state, drafts: {} }))[0].error).toContain('请输入值');
});

test('reserved property names remain user parameters and do not read object prototypes', async () => {
  expect((await calculate(workspace({ expression: 'constructor', drafts: {} })))[0]).toMatchObject({ waiting: true });
  const drafts = JSON.parse('{"__proto__":{"type":"number","text":"2"}}');
  expect((await calculate(workspace({ expression: "'__proto__' + 1", drafts })))[0].value).toBe('3');
});

test('batch rows have independent results, references and logs, with missing rows waiting', async () => {
  const rows = await calculate(workspace({ mode: 'json', expression: '$1 + (a)', json: '[{"a":1},{"a":2},{}]' }));
  expect(rows.map((row) => row.value)).toEqual(['2', '4', undefined]);
  expect(rows[2]).toMatchObject({ waiting: true, traces: [], error: '缺少 a' });
  expect(rows[0].traces.find((trace) => trace.expression === 'a')?.value).toBe('1');
  expect(rows[1].traces.find((trace) => trace.expression === 'a')?.value).toBe('2');
  expect(await calculate(workspace({ mode: 'json', json: '[]' }))).toEqual([]);
});

test('errors and trace ranges are preserved, with full decimal snapshots', async () => {
  const expression = '\n max(1.234 * 100, 0) \n';
  const rows = await calculate(workspace({ expression }));
  rows[0].traces.forEach((trace) => expect(expression.slice(trace.from, trace.to)).toBe(trace.expression));
  expect(rows[0].value).toBe('123.4');
  expect(nodeRange(analyze('(1 + 2)').formula.refs[0])).toEqual({ from: 0, to: 7 });
  const failed = await calculate(workspace({ expression: '$9 + (1)' }));
  expect(failed[0].error).toContain('can not find');
  await expect(calculate(workspace({ expression: '1 +' }))).rejects.toThrow();
  await expect(calculate(workspace({ mode: 'json', json: 'invalid' }))).rejects.toThrow();
  expect(snapshot(undefined).value).toBe('undefined');
  expect(snapshot(Infinity).value).toBe('Infinity');
  expect(snapshot(null).type).toBe('null');
});

test('function argument help understands nested parentheses, strings and optional arguments', () => {
  const text = 'if(a, round(max(a, b), 2), c)';
  expect(signatureAt(text, text.indexOf('2') + 1)).toMatchObject({ name: 'round', argument: 1 });
  expect(signatureAt('concat("a,b)", ', 14)).toMatchObject({ name: 'concat', argument: 0 });
  expect(signatureAt('round(', 6)).toMatchObject({ name: 'round', argMin: 1, argMax: 2 });
  expect(signatureAt('unknown(', 8)).toBeUndefined();
});

test('completion offers real functions, nested JSON names and only valid refs', () => {
  const candidates = parameterCandidates('[{"user":{"discount":0.9}},{"user":{}}]', ['price']);
  expect(candidates).toContainEqual({ name: 'user.discount', partial: true });
  expect(completionAt('ro', 2, candidates, 2).entries.map((entry) => entry.text)).toEqual(['round()']);
  expect(completionAt('user.d', 6, candidates, 2).entries[0].text).toBe('user.discount');
  expect(completionAt('$', 1, candidates, 2).entries.map((entry) => entry.text)).toEqual(['$1', '$2']);
  expect(completionAt('"ro', 3, candidates, 2).entries).toEqual([]);
  expect(completionAt("'ro", 3, candidates, 2).entries).toEqual([]);
  expect(parameterCandidates('{', ['a'])).toEqual([{ name: 'a', partial: false }]);
});

test('local restoration rejects invalid versions and repairs malformed drafts/settings', () => {
  expect(restoreWorkspace('bad')).toBe(DEFAULT_WORKSPACE);
  expect(restoreWorkspace('{"version":2}')).toBe(DEFAULT_WORKSPACE);
  const saved = workspace({ drafts: { a: { type: 'number', text: '10' } }, enabled: { a: false } });
  expect(restoreWorkspace(JSON.stringify({ version: 1, workspace: saved }))).toEqual(saved);
  expect(restoreWorkspace(JSON.stringify({ version: 1, workspace: { ...saved, drafts: { a: null }, settings: { step: 'invalid' } } })))
    .toMatchObject({ drafts: {}, settings: { step: 'off' } });
});
