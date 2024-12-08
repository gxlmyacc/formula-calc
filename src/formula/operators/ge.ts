
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { nextWithPrimise } from '../utils';

class FormulaOperatorGE extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttGE;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const forArithmetic = this.params.some(v => v.arithmetic);
    const result = nextWithPrimise(
      [
        this.params[0].execute(dataSource, options, forArithmetic),
        this.params[1].execute(dataSource, options, forArithmetic),
      ],
      (a, b) => (forArithmetic ? Number(a) >= Number(b) : a >= b)
    );
    return result;
  }

}

export default FormulaOperatorGE;
