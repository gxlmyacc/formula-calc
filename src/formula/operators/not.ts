
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { isDecimalTrue, nextWithPrimise } from '../utils';

class FormulaOperatorNOT extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttNot;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPrimise(
      [
        this.params[0].execute(dataSource, options),
      ],
      a => !isDecimalTrue(a, options)
    );
    return result;
  }

}

export default FormulaOperatorNOT;
