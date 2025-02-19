
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { isDecimalTrue, nextWithPromise } from '../utils';

class FormulaOperatorAND extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttAnd;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) {
    return nextWithPromise(
      this.params[0].execute(dataSource, options, forArithmetic),
      a => (
        isDecimalTrue(a, options)
          ? nextWithPromise(this.params[1].execute(dataSource, options, forArithmetic))
          : a
      )
    );
  }

}

export default FormulaOperatorAND;
