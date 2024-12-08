
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { nextWithPrimise } from '../utils';

class FormulaOperatorOR extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttOr;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic: boolean) {
    return nextWithPrimise(
      this.params[0].execute(dataSource, options, forArithmetic),
      a => a || nextWithPrimise(this.params[1].execute(dataSource, options, forArithmetic))
    );
  }

}

export default FormulaOperatorOR;
