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

function formulaCalc(
  expression: string,
  options: FormulaCalcOptions = {}
) {
  let { params, customFunctions, dataSource, ...restOptions } = options;

  if (!dataSource) {
    dataSource = {
      getParam(name, options) {
        if (!params) throw new Error('options require params!');
        if (isFunction(params)) return params(name, options);
        return getValueByPath(params, name, (path, paresedPath) => {
          if (options.nullAsZero) return 0;
          throw new Error(`param "${paresedPath}${paresedPath ? '.' : ''}${path}" is not exist!`);
        });
      },
    };
  }

  if (!hasOwnProp(restOptions, 'eval')) {
    restOptions.eval = (expr, dataSource, options) => {
      if (expr === '') {
        return null;
      }
      if (!isString(expr)) {
        return expr;
      }
      return formulaCalc(expr, { params, dataSource, customFunctions, ...options });
    };
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
  registorFormulaFunction,
};

export type {
  FormulaOptions,
  IFormulaDataSource
};

export default formulaCalc;
