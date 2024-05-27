
import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { nextWithPrimise } from '../utils';

class FormulaFunctionEVAL extends AbsFormulaFunction {

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPrimise(
      [
        this.params[0].execute(dataSource, options),
      ],
      expr => {
        if (!this.options.eval) {
          throw new Error('eval function is not supported!');
        }
        return this.options.eval?.(expr, dataSource, options);
      }
    );
    return result;
  }

}

export default FormulaFunctionEVAL;
