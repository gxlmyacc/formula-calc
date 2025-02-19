
import Decimal from 'decimal.js';
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { nextWithPromise } from '../utils';

class FormulaOperatorDIVINT extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttDivInt;

  public arithmetic = true;

  public mayChange = true;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPromise(
      [
        this.params[0].execute(dataSource, options, true),
        this.params[1].execute(dataSource, options, true),
      ],
      (a, b) => new (options.Decimal || Decimal)(a).dividedToIntegerBy(b)
    );
    return result;
  }

}

export default FormulaOperatorDIVINT;
