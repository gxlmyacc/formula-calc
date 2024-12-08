
import Decimal from 'decimal.js';
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { nextWithPrimise } from '../utils';

class FormulaOperatorADD extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttAdd;

  public arithmetic = true;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPrimise(
      [
        this.params[0].execute(dataSource, options, true),
        this.params[1].execute(dataSource, options, true),
      ],
      (a, b) => (options.Decimal || Decimal).add(a, b),
    );
    return result;
  }

}

export default FormulaOperatorADD;
