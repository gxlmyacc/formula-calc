
import Decimal from 'decimal.js';
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { nextWithPrimise } from '../utils';

class FormulaOperatorMUL extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttMul;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPrimise(
      [
        this.params[0].execute(dataSource, options),
        this.params[1].execute(dataSource, options),
      ],
      (a, b) => (options.Decimal || Decimal).mul(a, b)
    );
    return result;
  }

}

export default FormulaOperatorMUL;
