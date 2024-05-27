import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { nextWithPrimise } from '../utils';
import { sumExecute } from './sum';

class FormulaFunctionAVG extends AbsFormulaFunction {

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    let paramCount = this.params.length;
    let value = sumExecute(
      this.params,
      dataSource,
      options,
      (itemValue, i, isArray) => {
        if (isArray) paramCount += (itemValue.length - 1);
      }
    );
    return nextWithPrimise(value, a => a.div(paramCount));
  }

}

export default FormulaFunctionAVG;
