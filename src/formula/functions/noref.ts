
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';

class FormulaFunctionNOREF extends AbsFormulaFunction {

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic: boolean) {
    return this.params[0].execute(dataSource, options, forArithmetic);
  }

}


export default FormulaFunctionNOREF;
