
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { isDecimalTrue, nextWithPromise } from '../utils';

class FormulaOperatorNOT extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttNot;

  public mayChange = true;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPromise(
      [
        this.params[0].execute(dataSource, options),
      ],
      (a) => !isDecimalTrue(a, options)
    );
    return result;
  }

}

export default FormulaOperatorNOT;
