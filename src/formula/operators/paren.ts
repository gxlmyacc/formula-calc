
import { TokenType } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaOperator from '../base/operator';
import { nextWithPromise } from '../utils';

class FormulaOperatorPAREN extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttParenL;

  public closed: boolean = false;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) {
    return nextWithPromise(
      this.params.map((v) => v.execute(dataSource, options, forArithmetic)),
      (params) => (params.length <= 1 ? params[0] : params),
      false
    );
  }

}

export default FormulaOperatorPAREN;
