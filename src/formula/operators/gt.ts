
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { isDecimal, nextWithPromise, toDecimal } from '../utils';

class FormulaOperatorGT extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttGT;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const forArithmetic = this.params.some((v) => v.arithmetic);
    const result = nextWithPromise(
      [
        this.params[0].execute(dataSource, options, forArithmetic),
        this.params[1].execute(dataSource, options, forArithmetic),
      ],
      (a, b) => {
        if (isDecimal(a, options)) {
          return a.greaterThan(toDecimal(b, options));
        }
        if (isDecimal(b, options)) {
          return b.lessThanOrEqualTo(toDecimal(a, options));
        }
        return a > b;
      }
    );
    return result;
  }

}

export default FormulaOperatorGT;
