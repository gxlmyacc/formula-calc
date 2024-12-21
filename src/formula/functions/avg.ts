import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { nextWithPrimise } from '../utils';
import { sumExecute } from './sum';

class FormulaFunctionAVG extends AbsFormulaFunction {

  public arithmetic = true;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    let paramCount = this.params.length;
    let value = sumExecute(
      this.params,
      dataSource,
      options,
      (itemValue, i, isArray) => {
        if (isArray) paramCount += (itemValue.length - 1);
      },
      true
    );
    return nextWithPrimise(value, a => (paramCount ? a.div(paramCount) : a));
  }

}

export default FormulaFunctionAVG;
