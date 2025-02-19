
import { TokenType, FormulaValues } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { nextWithPromise } from '../utils';

function eqExecute(params: FormulaValues, dataSource: IFormulaDataSource, options: FormulaValueOptions) {
  const forArithmetic = params.some((v) => v.arithmetic);
  const result = nextWithPromise(
    [
      params[0].execute(dataSource, options, forArithmetic),
      params[1].execute(dataSource, options, forArithmetic),
    ],
    (a, b) => {
      if (a === undefined) a = null;
      if (b === undefined) b = null;
      return String(a) === String(b);
    }
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
