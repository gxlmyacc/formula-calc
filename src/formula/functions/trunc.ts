import Decimal from 'decimal.js';
import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { nextWithPrimise } from '../utils';

class FormulaFunctionTRUNC extends AbsFormulaFunction {

  public arithmetic = true;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPrimise(
      [
        this.params[0].execute(dataSource, options),
      ],
      a => (options.Decimal || Decimal).trunc(a)
    );
    return result;
  }

}

export default FormulaFunctionTRUNC;
