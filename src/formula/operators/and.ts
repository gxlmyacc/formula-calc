
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { isDecimalTrue, nextWithPrimise } from '../utils';

class FormulaOperatorAND extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttAnd;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) {
    return nextWithPrimise(
      this.params[0].execute(dataSource, options, forArithmetic),
      a => (
        isDecimalTrue(a, options)
          ? nextWithPrimise(this.params[1].execute(dataSource, options, forArithmetic))
          : a
      )
    );
  }

}

export default FormulaOperatorAND;
