
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { nextWithPrimise } from '../utils';

class FormulaOperatorPAREN extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttParenL;

  public closed: boolean = false;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) {
    const result = nextWithPrimise(
      this.params.map(v => v.execute(dataSource, options, forArithmetic)),
      params => params,
      false
    );
    return result.length <= 1 ? result[0] : result;
  }

}

export default FormulaOperatorPAREN;
