
import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { nextWithPromise } from '../utils';

class FormulaFunctionEVAL extends AbsFormulaFunction {

  public mayChange = true;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) {
    const result = nextWithPromise(
      [
        this.params[0].execute(dataSource, options),
      ],
      (expr) => {
        const _eval = options.eval || this.options.eval;
        if (!_eval) {
          throw new Error('eval function is not supported!');
        }
        return _eval?.(expr, dataSource, options, forArithmetic);
      }
    );
    return result;
  }

}

export default FormulaFunctionEVAL;
