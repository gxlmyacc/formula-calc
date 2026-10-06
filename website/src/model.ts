import Decimal from 'decimal.js';
import formulaCalc, { Formula, TokenType, createParamsDataSource, getValueByPath, getFormulaFunctionDefinitions } from '../../src';
import FormulaParam from '../../src/formula/values/param';
import type { IFormulaValue, FormulaTraceDetails, Token } from '../../src/formula/type';
import type { FormulaCalcOptions } from '../../src';
import { translate } from './i18n';
import type { Locale } from './i18n';

export type ValueType = 'number' | 'string' | 'boolean' | 'null' | 'json';
export type Draft = { type: ValueType; text: string };
export type Settings = {
  precision: string; step: 'off' | 'precision' | 'custom'; stepPlaces: string; rounding: string;
  stepPrecisionIgnorePercent: boolean; nullAsZero: boolean; nullIfParamNotFound: boolean;
  tryStringToNumber: boolean; returnDecimal: boolean;
  ignoreRoundingOriginalValue: boolean; ignoreRoundingParams: boolean;
};
export type Workspace = {
  expression: string; mode: 'form' | 'json'; json: string; drafts: Record<string, Draft>;
  enabled: Record<string, boolean>; settings: Settings; showRefs: boolean;
};
export type Range = { from: number; to: number };
export type Pair = Range & { depth: number; ref?: number };
export type Analysis = { formula: Formula; names: string[]; tokens: Token[]; pairs: Pair[]; error: string };
export type Trace = Range & {
  expression: string; value: string; type: string; line: number; column: number; inFormula: boolean;
  calculation?: string; conversions?: string[];
  finalPrecision?: boolean;
};
export type ResultRow = { index: number; value?: string; type?: string; error?: string; waiting?: boolean; traces: Trace[] };

export const DEFAULT_WORKSPACE: Workspace = {
  expression: '(price * quantity) * (1 - discount%) + $1 * tax%',
  mode: 'form',
  json: '[\n  { "price": 100, "quantity": 2, "discount": 5, "tax": 6 },\n  { "price": 200, "quantity": 3, "discount": 10, "tax": 6 }\n]',
  drafts: {
    price: { type: 'number', text: '100' },
    quantity: { type: 'number', text: '2' },
    discount: { type: 'number', text: '5' },
    tax: { type: 'number', text: '6' }
  },
  enabled: {},
  showRefs: true,
  settings: {
    precision: '',
    step: 'off',
    stepPlaces: '2',
    rounding: 'HALF_UP',
    stepPrecisionIgnorePercent: false,
    nullAsZero: false,
    nullIfParamNotFound: false,
    tryStringToNumber: false,
    returnDecimal: false,
    ignoreRoundingOriginalValue: true,
    ignoreRoundingParams: true
  },
};

export const EXAMPLES = [
  { name: '折扣与引用', expression: DEFAULT_WORKSPACE.expression, json: DEFAULT_WORKSPACE.json },
  { name: '百分比精度', expression: 'amount * rate%', json: '{ "amount": 10000, "rate": 2.015 }' },
  { name: '数组聚合', expression: 'sum(values) + avg(values)', json: '{ "values": [1.004, 2.015, 3.126] }' },
  {
    name: '贷款月供',
    expression: 'round(abs(pmt(annualRate% / 12, years * 12, principal)), 2)',
    json: '{ "annualRate": 6, "years": 30, "principal": 1000000 }'
  },
  {
    name: '投资净现值',
    expression: 'initial + npv(rate%, flows)',
    json: '{ "initial": -10000, "rate": 10, "flows": [3000, 4200, 6800] }'
  },
  {
    name: '嵌套参数与条件',
    expression: 'if(user.vip, price * user.discount, price)',
    json: '{ "user": { "vip": true, "discount": 0.9 }, "price": 100 }'
  },
];

export function analyze(expression: string): Analysis {
  const formula = new Formula();
  const names: string[] = [];
  let error = '';
  try {
    formula.parse(expression, {
      onCreateParam(token, options) {
        if (!names.includes(token.token)) {
          names.push(token.token);
        }
        return new FormulaParam(token, options);
      }
    });
  } catch (e) {
    error = (e as Error).message;
  }
  const tokens = formula.tokenizer.items;
  const stack: Pair[] = [];
  const pairs: Pair[] = [];
  tokens.forEach((token) => {
    if (token.tokenType === TokenType.ttParenL) {
      const refIndex = error ? -1 : formula.refs.findIndex((ref) => ref.token.index === token.index);
      stack.push({ from: token.index, to: token.index + 1, depth: stack.length, ref: refIndex < 0 ? undefined : refIndex + 1 });
    } else if (token.tokenType === TokenType.ttParenR) {
      const pair = stack.pop();
      if (pair) {
        pair.to = token.index + 1; pairs.push(pair);
      }
    }
  });
  return { formula, names, tokens, pairs, error };
}

export function activePairAt(model: Analysis, cursor: number): Pair | undefined {
  const reference = model.tokens.find((token) => token.tokenType === TokenType.ttRef
    && cursor >= token.index && cursor <= token.index + token.length);
  if (reference) {
    return model.pairs.find((pair) => pair.ref === Number(reference.token.slice(1)));
  }
  const containing = model.pairs.filter((pair) => pair.from <= cursor && cursor < pair.to);
  const candidates = containing.length ? containing : model.pairs.filter((pair) => pair.to === cursor);
  return candidates.sort((a, b) => (a.to - a.from) - (b.to - b.from))[0];
}

export function parseParams(json: string, locale: Locale = 'zh'): Record<string, unknown>[] {
  const value = JSON.parse(json);
  const rows = Array.isArray(value) ? value : [value];
  if (rows.some((row) => !row || typeof row !== 'object' || Array.isArray(row))) {
    throw new Error(translate(locale, '参数 JSON 必须是对象，或由对象组成的数组。'));
  }
  return rows;
}

export function parseDraft(draft: Draft, locale: Locale = 'zh'): unknown {
  if (draft.type === 'null') {
    return null;
  }
  if (draft.type === 'string') {
    return draft.text;
  }
  if (draft.type === 'boolean') {
    return draft.text === 'true';
  }
  if (!draft.text.trim()) {
    throw new Error(translate(locale, '请输入值'));
  }
  if (draft.type === 'json') {
    const value = JSON.parse(draft.text);
    if (!value || typeof value !== 'object') {
      throw new Error(translate(locale, '请输入 JSON 数组或对象'));
    }
    return value;
  }
  const value = new Decimal(draft.text);
  if (!value.isFinite()) {
    throw new Error(translate(locale, '请输入有限数字'));
  }
  return value;
}

export function optionsFor(settings: Settings, locale: Locale = 'zh'): FormulaCalcOptions {
  const places = (text: string) => {
    if (!/^\d+$/.test(text) || Number(text) > 100) {
      throw new Error(translate(locale, '精度必须是 0 到 100 的整数'));
    }
    return Number(text);
  };
  const { precision, step, stepPlaces, rounding, ...flags } = settings;
  return {
    ...flags,
    rounding: rounding as FormulaCalcOptions['rounding'],
    precision: precision === '' ? undefined : places(precision),
    stepPrecision: step === 'off' ? false : step === 'precision' ? true : places(stepPlaces)
  };
}

export function snapshot(value: unknown): { value: string; type: string } {
  if (Decimal.isDecimal(value)) {
    return { value: value.toString(), type: 'Decimal' };
  }
  if (value === undefined) {
    return { value: 'undefined', type: 'undefined' };
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    return { value: String(value), type: 'number' };
  }
  return { value: JSON.stringify(value, null, 2), type: value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value };
}

/** Format actual conversions only; Decimal construction alone is not a displayed conversion. */
export function traceConversions(details?: FormulaTraceDetails): string[] | undefined {
  const changes = details?.transformations;
  if (!changes?.length) {
    return undefined;
  }
  return [snapshot(changes[0].before).value, ...changes.map((change) => (
    change.precision !== undefined && Decimal.isDecimal(change.after)
      ? change.after.toFixed(change.precision) : snapshot(change.after).value
  ))];
}

/** Read snapshots from this row's trace, leaving lazy arguments unevaluated. */
export function traceCalculation(item: IFormulaValue, values: Map<IFormulaValue, string>): string | undefined {
  const params = (item as IFormulaValue & { params?: IFormulaValue[] }).params;
  if (!params) {
    return undefined;
  }
  const args = params.map((param) => values.get(param) ?? '…');
  if (item.tokenType === TokenType.ttFunc) {
    return `${item.name}(${args.join(', ')})`;
  }
  if (item.tokenType === TokenType.ttParenL) {
    return `(${args.join(', ')})`;
  }
  if (item.tokenType === TokenType.ttIf) {
    return `${args[0]} ? ${args[1]} : ${args[2] ?? '…'}`;
  }
  if (params.length === 2) {
    const right = args[1].startsWith('-') ? `(${args[1]})` : args[1];
    return `${args[0]} ${item.name} ${right}`;
  }
  if (item.tokenType === TokenType.ttPercent) {
    return `${args[0]}%`;
  }
  return `${item.name}${args[0]}`;
}

export function nodeRange(node: IFormulaValue): Range {
  const children = (node as IFormulaValue & { params?: IFormulaValue[] }).params || [];
  const from = Math.min(node.token.index, ...children.map((child) => nodeRange(child).from));
  return { from, to: from + node.origText.length };
}

export function traceContext(expression: string, trace: Trace) {
  const matches = trace.inFormula && expression.slice(trace.from, trace.to) === trace.expression;
  return matches
    ? { before: expression.slice(0, trace.from), active: expression.slice(trace.from, trace.to), after: expression.slice(trace.to) }
    : { before: expression, active: '', after: '' };
}

export function lookup(row: Record<string, unknown>, name: string): { found: boolean; value: unknown } {
  let found = true;
  const value = getValueByPath(row, name, () => {
    found = false;
  });
  return { found, value };
}

/** Each batch row owns its execution and log, including rows that fail or wait for parameters. */
export async function calculate(workspace: Workspace, locale: Locale = 'zh'): Promise<ResultRow[]> {
  const analysis = analyze(workspace.expression);
  if (analysis.error) {
    throw new Error(analysis.error);
  }
  const options = optionsFor(workspace.settings, locale);
  const rows = workspace.mode === 'json' ? parseParams(workspace.json, locale) : [{}];
  return Promise.all(rows.map(async (row, index) => {
    const traces: Trace[] = [];
    const executedValues = new Map<IFormulaValue, string>();
    let lastValue: unknown;
    const rootNodes = new Set<IFormulaValue>();
    const problems: string[] = [];
    const values: Record<string, unknown> = Object.create(null);
    const jsonSource = createParamsDataSource(row);
    analysis.names.forEach((name) => {
      if (workspace.enabled[name] === false) {
        if (!options.nullAsZero) {
          problems.push(translate(locale, '{name} 已禁用', { name }));
        }
        return;
      }
      if (workspace.mode === 'json') {
        if (!options.nullAsZero && !lookup(row, name).found) {
          problems.push(translate(locale, '缺少 {name}', { name }));
        }
      } else {
        try {
          const draft = Object.prototype.hasOwnProperty.call(workspace.drafts, name) ? workspace.drafts[name] : undefined;
          if (options.nullAsZero && (!draft || (draft.type === 'number' && !draft.text.trim()))) {
            values[name] = null; return;
          }
          values[name] = parseDraft(draft || { type: 'number', text: '' }, locale);
        } catch (e) {
          problems.push(`${name}${locale === 'zh' ? '：' : ': '}${(e as Error).message}`);
        }
      }
    });
    if (problems.length) {
      return { index, error: problems.join(locale === 'zh' ? '；' : '; '), waiting: true, traces };
    }
    try {
      const result = await formulaCalc(workspace.expression, {
        ...options,
        params: (name, paramOptions) => (workspace.enabled[name] === false ? null
          : workspace.mode === 'json' ? jsonSource.getParam(name, paramOptions, false) : values[name]),
        onFormulaCreated(formula) {
          const visit = (node: IFormulaValue) => {
            if (rootNodes.has(node)) {
              return;
            }
            rootNodes.add(node);
            ((node as IFormulaValue & { params?: IFormulaValue[] }).params || []).forEach(visit);
          };
          formula.formulas.forEach(visit);
          formula.refs.forEach(visit);
        },
        onTrace(item, value, details) {
          // Decimal traces in the library expose numbers; capture item.value to preserve full precision.
          const display = snapshot(Decimal.isDecimal(item.value) ? item.value : value);
          lastValue = details?.value;
          const calculation = traceCalculation(item, executedValues);
          executedValues.set(item, display.value.replace(/\n\s*/g, ''));
          traces.push({
            ...nodeRange(item),
            expression: item.origText,
            ...display,
            line: item.line,
            column: item.column,
            inFormula: rootNodes.has(item),
            calculation,
            conversions: traceConversions(details),
          });
        },
      });
      // Final precision happens after node execution; show it as a separate step using the actual returned result.
      if (options.precision !== undefined && (Decimal.isDecimal(lastValue) || typeof lastValue === 'number')
        && (Decimal.isDecimal(result) || typeof result === 'number')) {
        const before = new Decimal(lastValue);
        const after = new Decimal(result);
        if (before.isFinite() && after.isFinite() && before.decimalPlaces() > options.precision && !before.eq(after)) {
          traces.push({
            from: 0,
            to: workspace.expression.length,
            expression: workspace.expression,
            ...snapshot(result),
            line: 1,
            column: 1,
            inFormula: true,
            finalPrecision: true,
            conversions: [before.toString(), after.toFixed(options.precision)],
          });
        }
      }
      return { index, ...snapshot(result), traces };
    } catch (e) {
      return { index, error: (e as Error).message, traces };
    }
  }));
}

export function restoreWorkspace(text: string | null): Workspace {
  try {
    const saved = JSON.parse(text || 'null');
    if (saved?.version !== 1) {
      return DEFAULT_WORKSPACE;
    }
    const w = saved.workspace;
    if (typeof w.expression !== 'string' || typeof w.json !== 'string' || !['form', 'json'].includes(w.mode)) {
      return DEFAULT_WORKSPACE;
    }
    const drafts: Record<string, Draft> = Object.create(null);
    Object.keys(w.drafts || {}).forEach((name) => {
      const draft = w.drafts[name];
      if (draft && ['number', 'string', 'boolean', 'null', 'json'].includes(draft.type) && typeof draft.text === 'string') {
        drafts[name] = draft;
      }
    });
    const enabled: Record<string, boolean> = Object.create(null);
    Object.keys(w.enabled || {}).forEach((name) => {
      if (typeof w.enabled[name] === 'boolean') {
        enabled[name] = w.enabled[name];
      }
    });
    const settings = { ...DEFAULT_WORKSPACE.settings };
    Object.keys(settings).forEach((key) => {
      const name = key as keyof Settings;
      if (typeof w.settings?.[name] === typeof settings[name]) {
        (settings as any)[name] = w.settings[name];
      }
    });
    if (!['off', 'precision', 'custom'].includes(settings.step)) {
      settings.step = 'off';
    }
    return { ...w, drafts, enabled, settings, showRefs: w.showRefs !== false };
  } catch {
    return DEFAULT_WORKSPACE;
  }
}

const SIGNATURES: Record<string, { args: string[]; description: string }> = {
  fv: { args: ['rate', 'nper', 'pmt', 'pv?', 'type?'], description: '计算终值；rate 为每期利率，pv 默认 0，type 默认 0（期末），1 表示期初付款；支出为负、收入为正' },
  pv: { args: ['rate', 'nper', 'pmt', 'fv?', 'type?'], description: '计算现值；rate 为每期利率，fv 默认 0，type 默认 0（期末），1 表示期初付款；支出为负、收入为正' },
  pmt: { args: ['rate', 'nper', 'pv', 'fv?', 'type?'], description: '计算每期固定付款额；rate 为每期利率，fv 默认 0，type 默认 0（期末），1 表示期初付款；本金为正时付款通常为负' },
  nper: { args: ['rate', 'pmt', 'pv', 'fv?', 'type?'], description: '反推付款期数；rate 为每期利率，fv 默认 0，type 默认 0（期末），1 表示期初付款；无有限非负解时报错' },
  ipmt: { args: ['rate', 'per', 'nper', 'pv', 'fv?', 'type?'], description: '计算指定期的利息部分；per 为从 1 开始的整数，fv 默认 0，type 默认 0（期末），1 表示期初付款' },
  ppmt: { args: ['rate', 'per', 'nper', 'pv', 'fv?', 'type?'], description: '计算指定期的本金部分；per 为从 1 开始的整数，fv 默认 0，type 默认 0（期末），1 表示期初付款' },
  npv: { args: ['rate', 'values'], description: '计算等间隔现金流的净现值；values 为非空数值数组，第一笔在第一期末，当前时点的初始投入应另行相加' },
  abs: { args: ['value'], description: '取绝对值' },
  acos: { args: ['value'], description: '反余弦，结果为弧度' },
  acosh: { args: ['value'], description: '反双曲余弦' },
  asin: { args: ['value'], description: '反正弦，结果为弧度' },
  asinh: { args: ['value'], description: '反双曲正弦' },
  atan: { args: ['value'], description: '反正切，结果为弧度' },
  atanh: { args: ['value'], description: '反双曲正切' },
  cbrt: { args: ['value'], description: '计算立方根' },
  ceil: { args: ['value'], description: '向正无穷取整' },
  cos: { args: ['radians'], description: '计算余弦，参数为弧度' },
  cosh: { args: ['value'], description: '计算双曲余弦' },
  floor: { args: ['value'], description: '向负无穷取整' },
  ln: { args: ['value'], description: '计算自然对数' },
  log: { args: ['value'], description: '计算以 10 为底的对数' },
  log10: { args: ['value'], description: '计算以 10 为底的对数' },
  log2: { args: ['value'], description: '计算以 2 为底的对数' },
  sign: { args: ['value'], description: '返回数值符号：-1、0 或 1' },
  sin: { args: ['radians'], description: '计算正弦，参数为弧度' },
  sinh: { args: ['value'], description: '计算双曲正弦' },
  sqrt: { args: ['value'], description: '计算平方根' },
  tan: { args: ['radians'], description: '计算正切，参数为弧度' },
  tanh: { args: ['value'], description: '计算双曲正切' },
  trunc: { args: ['value'], description: '截去小数部分，向 0 取整' },
  string: { args: ['value'], description: '转换为字符串，空值转换为空字符串' },
  number: { args: ['value'], description: '转换为数值' },
  boolean: { args: ['value'], description: '转换为布尔值' },
  sum: { args: ['values…'], description: '数值求和，可传入数组' },
  avg: { args: ['values…'], description: '求平均值' },
  max: { args: ['values…'], description: '取最大值，不进行步骤舍入' },
  min: { args: ['values…'], description: '取最小值' },
  round: { args: ['value', 'decimalPlaces?'], description: '按指定小数位舍入' },
  if: { args: ['condition', 'thenValue', 'elseValue?'], description: '根据条件选择结果' },
  clamp: { args: ['value', 'min', 'max'], description: '限制数值范围' },
  exist: { args: ['object', 'path', 'type?'], description: '检查属性是否存在及其类型' },
  random: { args: ['significantDigits?'], description: '生成随机数' },
  concat: { args: ['values…'], description: '连接字符串' },
  eval: { args: ['expression'], description: '计算字符串公式' },
  noref: { args: ['value'], description: '返回参数值，函数调用括号不产生引用' },
  atan2: { args: ['y', 'x'], description: '计算反正切' },
  hypot: { args: ['values…'], description: '平方和的平方根' },
};
export const FUNCTIONS = getFormulaFunctionDefinitions().map((definition) => ({
  ...definition, ...(SIGNATURES[definition.name] || { args: ['value'], description: `${definition.name} 数值函数或类型转换` }),
}));

export function getFunctions(locale: Locale = 'zh') {
  return FUNCTIONS.map((definition) => ({
    ...definition,
    description: SIGNATURES[definition.name]
      ? translate(locale, definition.description)
      : translate(locale, '{name} 数值函数或类型转换', { name: definition.name }),
  }));
}

export function signatureAt(text: string, cursor: number, locale: Locale = 'zh') {
  const stack: { name: string; argument: number }[] = [];
  let quote = '';
  for (let i = 0; i < cursor; i++) {
    const char = text[i];
    if (quote) {
      if (char === '\\') {
        i++;
      } else if (char === quote) {
        quote = '';
      } continue;
    }
    if (char === '"' || char === "'") {
      quote = char; continue;
    }
    if (char === '(') {
      stack.push({ name: (text.slice(0, i).match(/([a-zA-Z][a-zA-Z0-9_]*)\s*$/) || [])[1] || '', argument: 0 });
    } else if (char === ')') {
      stack.pop();
    } else if (char === ',' && stack.length) {
      stack[stack.length - 1].argument++;
    }
  }
  const context = stack.slice().reverse().find((entry) => entry.name);
  const definition = context && getFunctions(locale).find((entry) => entry.name === context.name);
  return definition && context ? { ...definition, argument: Math.min(context.argument, definition.args.length - 1) } : undefined;
}

export function parameterCandidates(json: string, names: string[]) {
  let rows: Record<string, unknown>[] = [];
  try {
    rows = parseParams(json);
  } catch { /* Retain formula candidates while JSON is incomplete. */ }
  const paths = new Set(names);
  const visit = (row: unknown, prefix = '', depth = 0) => {
    if (!row || typeof row !== 'object' || depth > 10) {
      return;
    }
    Object.keys(row).forEach((key) => {
      const path = prefix ? `${prefix}.${key}` : key;
      paths.add(path);
      visit((row as Record<string, unknown>)[key], path, depth + 1);
    });
  };
  rows.forEach((row) => visit(row));
  return Array.from(paths).map((name) => ({ name, partial: rows.some((row) => !lookup(row, name).found) }));
}

export function completionAt(text: string, cursor: number, candidates: ReturnType<typeof parameterCandidates>, refs: number, locale: Locale = 'zh') {
  const before = text.slice(0, cursor);
  // Avoid completion inside strings and quoted names; those values may contain formula-like text.
  let quote = '';
  for (let i = 0; i < before.length; i++) {
    if (quote && before[i] === '\\') {
      i++;
    } else if (quote && before[i] === quote) {
      quote = '';
    } else if (!quote && (before[i] === '"' || before[i] === "'")) {
      quote = before[i];
    }
  }
  if (quote) {
    return { from: cursor, entries: [] };
  }
  const prefix = (before.match(/[^\s()+\-*/%^<>=!&,?:"']*$/) || [''])[0];
  const entries = [
    ...getFunctions(locale).map((f) => ({
      label: `${f.name}(${f.args.join(', ')}) · ${f.description}`, text: `${f.name}()`, inside: true, name: f.name,
    })),
    ...candidates.map((p) => ({
      label: `${p.name}${p.partial ? ` · ${translate(locale, '部分组缺失')}` : ''}`,
      name: p.name,
      text: /[\s()+\-*/%^<>=!&,?:"']/.test(p.name) ? `'${p.name.replace(/'/g, "\\'")}'` : p.name,
      inside: false
    })),
    ...Array.from({ length: refs }, (_, i) => ({
      label: `$${i + 1} · ${translate(locale, '括号引用')}`, name: `$${i + 1}`, text: `$${i + 1}`, inside: false,
    })),
  ].filter((entry) => entry.name.startsWith(prefix));
  return { from: cursor - prefix.length, entries };
}
