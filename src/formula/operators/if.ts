
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { ifExecute } from '../functions/if';

class FormulaOperatorIF extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttIf;

  public withElse: boolean = false;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) {
    return ifExecute(this.params, dataSource, options, forArithmetic);
  }

}

export default FormulaOperatorIF;
