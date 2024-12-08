
import Decimal from 'decimal.js';
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { nextWithPrimise } from '../utils';

class FormulaOperatorPERCENT extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttMul;

  public arithmetic = true;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPrimise(
      [
        this.params[0].execute(dataSource, options, true),
      ],
      a => (options.Decimal || Decimal).div(a, 100)
    );
    return result;
  }

}

export default FormulaOperatorPERCENT;
