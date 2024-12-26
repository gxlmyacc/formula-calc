import Decimal from 'decimal.js';
import Formula, { registorFormulaFunction, TokenType } from './formula';
import { getValueByPath, hasOwnProp, toRound, toFixed, isFunction, isPlainObject, isString } from './formula/utils';
import type { FormulaOptions, IFormulaDataSource, FormulaCustomFunctionItem } from './formula';
import { FormulaValueOptions } from './formula/type';

export {
  getValueByPath,
  removeFormArray
} from './formula/utils';

const formulaCache: Record<string, Formula> = {};

type FormulaCalcParams = Record<string, any>|((name: string, options: FormulaValueOptions) => any);

interface FormulaCreateOptions extends FormulaOptions {
  customFunctions?: Record<string, FormulaCustomFunctionItem>,
}

interface FormulaCalcCommonOptions extends FormulaCreateOptions {
  dataSource?: IFormulaDataSource
}

interface FormulaCalcOptions extends FormulaCalcCommonOptions {
  params?: FormulaCalcParams|Array<FormulaCalcParams>,
  onFormulaCreated?: (formula: Formula) => void,
  cache?: boolean,
}

function createParamsDataSource(params: FormulaCalcOptions['params']): IFormulaDataSource {
  return {

    getParam(name, options) {
      const { nullAsZero, nullIfParamNotFound } = options;
      if (isFunction(params)) return params(name, options);
      return getValueByPath(
        params || {},
        name,
        (path, { paresedPath, isLeaf }) => {
          if (nullAsZero
          || ((nullIfParamNotFound || paresedPath) && isLeaf)
          ) {
            return (nullIfParamNotFound || nullAsZero) ? null : undefined;
          }
          throw new Error(`require param: "${path}" !`);
        },
        nullIfParamNotFound ? null : undefined
      );
    },
  };
}

function createFormulaEval(params: FormulaCalcParams|undefined, _options?: FormulaCalcOptions): FormulaOptions['eval'] {
  return (expr, dataSource, options) => {
    if (expr === '') {
      return null;
    }
    if (!isString(expr)) {
      return expr;
    }
    return formulaCalc(expr, { params, ..._options, ...options });
  };
}

function createFormula(expression: string,  options: FormulaCreateOptions = {}) {
  let { customFunctions, ...restOptions } = options;
  const formula = new Formula();

  if (isPlainObject(customFunctions)) {
    Object.keys(customFunctions).forEach(name => {
      customFunctions && formula.registorFunction(name, customFunctions[name], { force: true });
    });
  }

  formula.parse(expression, restOptions);

  return formula;
}

function formulaCalcWithParams<T = any>(
  formula: Formula,
  params: FormulaCalcParams|undefined,
  options: FormulaCalcCommonOptions
): T {
  let { customFunctions, dataSource, ...restOptions } = options;

  if (!dataSource) {
    dataSource = createParamsDataSource(params);
  }

  if (!hasOwnProp(restOptions, 'eval')) {
    restOptions.eval = createFormulaEval(params, options);
  }

  return formula.execute(dataSource, restOptions);
}

function formulaCalc<T extends any = any>(
  expressionOrFormula: string|Formula,
  options: FormulaCalcOptions = {},
  returnReferenceType?: T|((result: any) => T)
): T {
  const { onFormulaCreated, params, ...restOptions } = options;

  let formula: Formula = null as any;
  if (isString(expressionOrFormula)) {
    if (restOptions.cache) formula = formulaCache[expressionOrFormula];
    if (!formula) {
      formula = createFormula(expressionOrFormula, restOptions);
      if (restOptions.cache) formulaCache[expressionOrFormula] = formula;
    }
    if (onFormulaCreated) onFormulaCreated(formula);
  } else {
    formula = expressionOrFormula;
  }

  let result = (
    Array.isArray(params)
      ? params.map(item => formulaCalcWithParams(formula, item, restOptions)) as T
      : formulaCalcWithParams<T>(formula, params, restOptions)
  );
  if (isFunction(returnReferenceType)) {
    result = returnReferenceType(result);
  }
  return result;
}


const UTILS_ARRAY_NAMES = ['sum', 'avg', 'max', 'min'] as const;
const UTILS_OPERATOR_NAMES = [
  { name: 'add', operator: '+' },
  { name: 'sub', operator: '-' },
  { name: 'mul', operator: '*' },
  { name: 'div', operator: '/' },
  { name: 'divToInt', operator: '//' },
  { name: 'mod', operator: '%' },
  { name: 'pow', operator: '^' },
] as const;
const UTILS_ONE_PARAMS_NAMES = ['abs', 'ceil', 'floor', 'trunc', 'sqrt', 'cbrt'] as const;

type FormulaUtilsParam = number|string|null|undefined|Decimal;

type FormulaUtils = Record<
(typeof UTILS_ARRAY_NAMES)[number],
(
  params: Array<FormulaUtilsParam>,
  options?: Omit<FormulaCalcOptions, 'params'>
) => number
> & Record<
 (typeof UTILS_OPERATOR_NAMES)[number]['name'],
 (a: FormulaUtilsParam, b: FormulaUtilsParam, options?: Omit<FormulaCalcOptions, 'params'>) => number
> & Record<
 (typeof UTILS_ONE_PARAMS_NAMES)[number],
 (a: FormulaUtilsParam, options?: Omit<FormulaCalcOptions, 'params'>) => number
> &{
  round: (...args: Parameters<typeof toRound>) => number,
  toFixed: (...args: Parameters<typeof toFixed>) => string,
  abs: (a: FormulaUtilsParam, options?: Omit<FormulaCalcOptions, 'params'>) => number,
  clamp: (a: FormulaUtilsParam, min: FormulaUtilsParam, max: FormulaUtilsParam, options?: Omit<FormulaCalcOptions, 'params'>) => number,
}

function createUtilMethod(expression: string, paramNames: string[]) {
  return (...args: any[]) => {
    const params = paramNames.reduce((p, v, i) => {
      p[v] = args[i];
      return p;
    }, {} as Record<string, Decimal.Value>);
    const options = args[paramNames.length] as Omit<FormulaCalcOptions, 'params'>;
    let formula: Formula|null = null;
    return formulaCalc(formula || expression, {
      onFormulaCreated: f => formula = f,
      nullAsZero: true,
      tryStringToNumber: true,
      nullIfParamNotFound: true,
      ...options,
      params
    });
  };
}

const formulaUtils = {} as FormulaUtils;

UTILS_ARRAY_NAMES.forEach(name => {
  formulaUtils[name] = createUtilMethod(`${name}(a)`, ['a']);
});
UTILS_OPERATOR_NAMES.forEach(item => {
  formulaUtils[item.name] = createUtilMethod(`a ${item.operator} b`, ['a', 'b']);
});
UTILS_ONE_PARAMS_NAMES.forEach(name => {
  formulaUtils[name] = createUtilMethod(`${name}(a)`, ['a']);
});
formulaUtils.clamp = createUtilMethod('clamp(a, min, max)', ['a', 'min', 'max']);
formulaUtils.round = (...args) => Number(toRound(...args));
formulaUtils.toFixed = toFixed;

export {
  Formula,
  TokenType,
  createFormula,
  createParamsDataSource,
  createFormulaEval,
  registorFormulaFunction,
  formulaUtils,
};

export type {
  FormulaOptions,
  FormulaCalcOptions,
  IFormulaDataSource,
  FormulaCalcParams,
  FormulaCreateOptions,
};

export default formulaCalc;
