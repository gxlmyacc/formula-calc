import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { nextWithPrimise } from '../utils';

class FormulaFunctionIF extends AbsFormulaFunction {

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    return nextWithPrimise(
      this.params[0].execute(dataSource, options),
      a => (a
        ? nextWithPrimise(this.params[1].execute(dataSource, options))
        : this.params[2] && nextWithPrimise(this.params[2].execute(dataSource, options))
      )
    );
  }

}

export default FormulaFunctionIF;
