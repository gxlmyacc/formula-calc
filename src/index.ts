import type Decimal from 'decimal.js';
import Formula, { registorFormulaFunction, TokenType } from './formula';
import { getValueByPath, hasOwnProp, toRound, isFunction, isPlainObject, isString } from './formula/utils';
import type { FormulaOptions, IFormulaDataSource, FormulaCustomFunctionItem } from './formula';
import { FormulaValueOptions } from './formula/type';

export * from './formula/utils';

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


const formulaUtilsNames = ['sum', 'avg', 'max', 'min'] as const;
type FormulaUtils = Record<
(typeof formulaUtilsNames)[number],
(
  params: Array<number|string|null|undefined|Decimal>,
  options?: Omit<FormulaCalcOptions, 'params'>
) => number
> & {
  round: (...args: Parameters<typeof toRound>) => number,
}

const formulaUtils = formulaUtilsNames.reduce(
  (p, name) => {
    p[name] = (params, options) => formulaCalc(`${name}(a)`, {
      nullAsZero: true,
      tryStringToNumber: true,
      nullIfParamNotFound: true,
      cache: true,
      ...options,
      params: {
        a: params,
      }
    });
    return p;
  },
{} as FormulaUtils
);

formulaUtils.round = (...args) => Number(toRound(...args));

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
