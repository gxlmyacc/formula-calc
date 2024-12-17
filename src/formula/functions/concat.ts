

import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { flatten, nextWithPrimise } from '../utils';


class FormulaFunctionCONCAT extends AbsFormulaFunction {

  public arithmetic = false;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPrimise(
      this.params.map(v => v.execute(dataSource, options, true)),
      params => flatten(params).join(''),
      false
    );
    return result;
  }

}

export default FormulaFunctionCONCAT;
