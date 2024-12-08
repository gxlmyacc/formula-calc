
import { TokenType, } from '../type';
import type { IFormulaDataSource, FormulaValueOptions  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { eqExecute } from './eq';

class FormulaOperatorNE extends AbsFormulaOperator {

  public tokenType: TokenType = TokenType.ttNE;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    return !eqExecute(this.params, dataSource, options);
  }

}

export default FormulaOperatorNE;
