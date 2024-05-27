
import Decimal from 'decimal.js';
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { nextWithPrimise } from '../utils';

class FormulaOperatorMOD extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttDiv;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPrimise(
      [
        this.params[0].execute(dataSource, options),
        this.params[1].execute(dataSource, options),
      ],
      (a, b) => (options.Decimal || Decimal).mod(a, b)
    );
    return result;
  }

}

export default FormulaOperatorMOD;
