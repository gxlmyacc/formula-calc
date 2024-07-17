import Formula, { registorFormulaFunction, TokenType } from './formula';
import { getValueByPath, hasOwnProp, isFunction, isNumber, isPlainObject, isString, nextWithPrimise, toRound } from './formula/utils';
import type { FormulaOptions, IFormulaDataSource, FormulaCustomFunctionItem } from './formula';
import { FormulaValueOptions } from './formula/type';

export * from './formula/utils';


interface FormulaCalcOptions extends FormulaOptions {
  params?: Record<string, any>|((name: string, options: FormulaValueOptions) => any),
  customFunctions?: Record<string, FormulaCustomFunctionItem>,
  dataSource?: IFormulaDataSource,
}

function createParamsDataSource(params: FormulaCalcOptions['params']): IFormulaDataSource {
  return {
    getParam(name, options) {
      if (!params) {
        if (options.nullAsZero) return 0;
        throw new Error(`require param: "${name}" !`);
      }
      if (isFunction(params)) return params(name, options);
      return getValueByPath(params, name, (path, paresedPath) => {
        if (options.nullAsZero) return 0;
        throw new Error(
          paresedPath
            ? `param "${paresedPath}.${path}" is not exist!`
            : `require param: "${path}" !`
        );
      });
    },
  };
}

function createFormulaEval(_options?: FormulaCalcOptions): FormulaOptions['eval'] {
  return (expr, dataSource, options) => {
    if (expr === '') {
      return null;
    }
    if (!isString(expr)) {
      return expr;
    }
    return formulaCalc(expr, { ..._options, ...options });
  };
}

function formulaCalc(
  expression: string,
  options: FormulaCalcOptions = {}
) {
  let { params, customFunctions, dataSource, ...restOptions } = options;

  if (!dataSource) {
    dataSource = createParamsDataSource(params);
  }

  if (!hasOwnProp(restOptions, 'eval')) {
    restOptions.eval = createFormulaEval(options);
  }

  const formula = new Formula();

  if (isPlainObject(customFunctions)) {
    Object.keys(customFunctions).forEach(name => {
      customFunctions && formula.registorFunction(name, customFunctions[name], { force: true });
    });
  }

  formula.parse(expression, restOptions);
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

export {
  Formula,
  TokenType,
  createParamsDataSource,
  createFormulaEval,
  registorFormulaFunction,
};

export type {
  FormulaOptions,
  FormulaCalcOptions,
  IFormulaDataSource
};

export default formulaCalc;
