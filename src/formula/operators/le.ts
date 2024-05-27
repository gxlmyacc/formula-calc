
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { nextWithPrimise } from '../utils';

class FormulaOperatorLE extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttLE;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPrimise(
      [
        this.params[0].execute(dataSource, options),
        this.params[1].execute(dataSource, options),
      ],
      (a, b) => a <= b
    );
    return result;
  }

}

export default FormulaOperatorLE;
