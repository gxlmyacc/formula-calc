
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { nextWithPrimise } from '../utils';

class FormulaOperatorAND extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttAnd;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    return nextWithPrimise(
      this.params[0].execute(dataSource, options),
      a => a && nextWithPrimise(this.params[1].execute(dataSource, options))
    );
  }

}

export default FormulaOperatorAND;
