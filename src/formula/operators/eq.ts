
import { TokenType, FormulaValues } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { nextWithPrimise } from '../utils';

function eqExecute(params: FormulaValues, dataSource: IFormulaDataSource, options: FormulaValueOptions) {
  const forArithmetic = params.some(v => v.arithmetic);
  const result = nextWithPrimise(
    [
      params[0].execute(dataSource, options, forArithmetic),
      params[1].execute(dataSource, options, forArithmetic),
    ],
    args => {
      (args as any[]).forEach((arg, index) => {
        if (arg === undefined) args[index] = null;
        else if (Object.is(arg, -0)) args[index] = 0;
      });
      return String(args[0]) === String(args[1]);
    },
    false,
  );
  return result;
}

class FormulaOperatorLE extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttLE;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    return eqExecute(this.params, dataSource, options);
  }

}

export {
  eqExecute
};

export default FormulaOperatorLE;
