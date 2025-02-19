

import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { flatten, nextWithPromise } from '../utils';


class FormulaFunctionCONCAT extends AbsFormulaFunction {

  public arithmetic = false;

  public mayChange = true;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPromise(
      this.params.map((v) => v.execute(dataSource, options, true)),
      (params) => flatten(params).join(''),
      false
    );
    return result;
  }

}

export default FormulaFunctionCONCAT;
