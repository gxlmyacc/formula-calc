import Formula, { registorFormulaFunction, TokenType } from './formula';
import { getValueByPath, hasOwnProp, isFunction, isNumber, isPlainObject, isString, nextWithPrimise, toRound } from './formula/utils';
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

  const result = formula.execute(dataSource, restOptions);

  return nextWithPrimise(
    result,
    result => {
      if (isNumber(restOptions.precision)
      && isNumber(result)
      && !isNaN(result)) {
        result = toRound(result, restOptions.precision, restOptions.rounding);
      }
      return result;
    },
    false
  );
}


function formulaCalc<T extends any = any>(
  expressionOrFormula: string|Formula,
  options: FormulaCalcOptions = {}
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

  return Array.isArray(params)
    ? params.map(item => formulaCalcWithParams(formula, item, restOptions)) as T
    : formulaCalcWithParams<T>(formula, params, restOptions);
}


export {
  Formula,
  TokenType,
  createFormula,
  createParamsDataSource,
  createFormulaEval,
  registorFormulaFunction,
};

export type {
  FormulaOptions,
  FormulaCalcOptions,
  IFormulaDataSource,
  FormulaCalcParams,
  FormulaCreateOptions,
};

export default formulaCalc;
